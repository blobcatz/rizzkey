/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createApp, defineAsyncComponent, markRaw } from 'vue';
import { common } from './common.js';
import { ui } from '@/config.js';
import { i18n } from '@/i18n.js';
import { alert, confirm, popup, post, toast } from '@/os.js';
import { useStream } from '@/stream.js';
import * as sound from '@/scripts/sound.js';
import { $i, signout, updateAccount } from '@/account.js';
import { instance } from '@/instance.js';
import { ColdDeviceStorage, defaultStore } from '@/store.js';
import { makeHotkey } from '@/scripts/hotkey.js';
import { reactionPicker } from '@/scripts/reaction-picker.js';
import { miLocalStorage } from '@/local-storage.js';
import { claimAchievement, claimedAchievements } from '@/scripts/achievements.js';
import { initializeSw } from '@/scripts/initialize-sw.js';
import { deckStore } from '@/ui/deck/deck-store.js';
import { emojiPicker } from '@/scripts/emoji-picker.js';
import { mainRouter } from '@/router/main.js';

export async function mainBoot() {
	const { isClientUpdated } = await common(() => createApp(
		new URLSearchParams(window.location.search).has('zen') || (ui === 'deck' && deckStore.state.useSimpleUiForNonRootPages && location.pathname !== '/') ? defineAsyncComponent(() => import('@/ui/zen.vue')) :
		!$i ? defineAsyncComponent(() => import('@/ui/visitor.vue')) :
		ui === 'deck' ? defineAsyncComponent(() => import('@/ui/deck.vue')) :
		ui === 'classic' ? defineAsyncComponent(() => import('@/ui/classic.vue')) :
		defineAsyncComponent(() => import('@/ui/universal.vue')),
	));

	reactionPicker.init();
	emojiPicker.init();

	if (isClientUpdated && $i) {
		popup(defineAsyncComponent(() => import('@/components/MkUpdated.vue')), {}, {}, 'closed');
	}

	const stream = useStream();

	let reloadDialogShowing = false;
	stream.on('_disconnected_', async () => {
		if (defaultStore.state.serverDisconnectedBehavior === 'reload') {
			location.reload();
		} else if (defaultStore.state.serverDisconnectedBehavior === 'dialog') {
			if (reloadDialogShowing) return;
			reloadDialogShowing = true;
			const { canceled } = await confirm({
				type: 'warning',
				title: i18n.ts.disconnectedFromServer,
				text: i18n.ts.reloadConfirm,
			});
			reloadDialogShowing = false;
			if (!canceled) {
				location.reload();
			}
		}
	});

	for (const plugin of ColdDeviceStorage.get('plugins').filter(p => p.active)) {
		import('@/plugin.js').then(async ({ install }) => {
			// Workaround for https://bugs.webkit.org/show_bug.cgi?id=242740
			await new Promise(r => setTimeout(r, 0));
			install(plugin);
		});
	}

	const hotkeys = {
		'd': (): void => {
			defaultStore.set('darkMode', !defaultStore.state.darkMode);
		},
		's': (): void => {
			mainRouter.push('/search');
		},
	};

	if (defaultStore.state.enableSeasonalScreenEffect) {
		const month = new Date().getMonth() + 1;
		if (defaultStore.state.hemisphere === 'S') {
			// ▼南半球
			if (month === 7 || month === 8) {
				const SnowfallEffect = (await import('@/scripts/snowfall-effect.js')).SnowfallEffect;
				new SnowfallEffect({}).render();
			}
		} else {
			// ▼北半球
			if (month === 12 || month === 1) {
				const SnowfallEffect = (await import('@/scripts/snowfall-effect.js')).SnowfallEffect;
				new SnowfallEffect({}).render();
			} else if (month === 3 || month === 4) {
				const SakuraEffect = (await import('@/scripts/snowfall-effect.js')).SnowfallEffect;
				new SakuraEffect({
					sakura: true,
				}).render();
			}
		}
	}

	if ($i) {
		// only add post shortcuts if logged in
		hotkeys['p|n'] = post;

		defaultStore.loaded.then(() => {
			if (defaultStore.state.accountSetupWizard !== -1) {
				popup(defineAsyncComponent(() => import('@/components/MkUserSetupDialog.vue')), {}, {}, 'closed');
			}
		});

		for (const announcement of ($i.unreadAnnouncements ?? []).filter(x => x.display === 'dialog')) {
			popup(defineAsyncComponent(() => import('@/components/MkAnnouncementDialog.vue')), {
				announcement,
			}, {}, 'closed');
		}

		stream.on('announcementCreated', (ev) => {
			const announcement = ev.announcement;
			if (announcement.display === 'dialog') {
				popup(defineAsyncComponent(() => import('@/components/MkAnnouncementDialog.vue')), {
					announcement,
				}, {}, 'closed');
			}
		});

		if ($i.isDeleted) {
			alert({
				type: 'warning',
				text: i18n.ts.accountDeletionInProgress,
			});
		}

		const now = new Date();
		const m = now.getMonth() + 1;
		const d = now.getDate();

		if ($i.birthday) {
			const bm = parseInt($i.birthday.split('-')[1]);
			const bd = parseInt($i.birthday.split('-')[2]);
			if (m === bm && d === bd) {
				claimAchievement('loggedInOnBirthday');
			}
		}

		if (m === 1 && d === 1) {
			claimAchievement('loggedInOnNewYearsDay');
		}

		if ($i.loggedInDays >= 3) claimAchievement('login3');
		if ($i.loggedInDays >= 7) claimAchievement('login7');
		if ($i.loggedInDays >= 15) claimAchievement('login15');
		if ($i.loggedInDays >= 30) claimAchievement('login30');
		if ($i.loggedInDays >= 60) claimAchievement('login60');
		if ($i.loggedInDays >= 100) claimAchievement('login100');
		if ($i.loggedInDays >= 200) claimAchievement('login200');
		if ($i.loggedInDays >= 300) claimAchievement('login300');
		if ($i.loggedInDays >= 400) claimAchievement('login400');
		if ($i.loggedInDays >= 500) claimAchievement('login500');
		if ($i.loggedInDays >= 600) claimAchievement('login600');
		if ($i.loggedInDays >= 700) claimAchievement('login700');
		if ($i.loggedInDays >= 800) claimAchievement('login800');
		if ($i.loggedInDays >= 900) claimAchievement('login900');
		if ($i.loggedInDays >= 1000) claimAchievement('login1000');

		if ($i.notesCount > 0) claimAchievement('notes1');
		if ($i.notesCount >= 10) claimAchievement('notes10');
		if ($i.notesCount >= 100) claimAchievement('notes100');
		if ($i.notesCount >= 500) claimAchievement('notes500');
		if ($i.notesCount >= 1000) claimAchievement('notes1000');
		if ($i.notesCount >= 5000) claimAchievement('notes5000');
		if ($i.notesCount >= 10000) claimAchievement('notes10000');
		if ($i.notesCount >= 20000) claimAchievement('notes20000');
		if ($i.notesCount >= 30000) claimAchievement('notes30000');
		if ($i.notesCount >= 40000) claimAchievement('notes40000');
		if ($i.notesCount >= 50000) claimAchievement('notes50000');
		if ($i.notesCount >= 60000) claimAchievement('notes60000');
		if ($i.notesCount >= 70000) claimAchievement('notes70000');
		if ($i.notesCount >= 80000) claimAchievement('notes80000');
		if ($i.notesCount >= 90000) claimAchievement('notes90000');
		if ($i.notesCount >= 100000) claimAchievement('notes100000');

		if ($i.followersCount > 0) claimAchievement('followers1');
		if ($i.followersCount >= 10) claimAchievement('followers10');
		if ($i.followersCount >= 50) claimAchievement('followers50');
		if ($i.followersCount >= 100) claimAchievement('followers100');
		if ($i.followersCount >= 300) claimAchievement('followers300');
		if ($i.followersCount >= 500) claimAchievement('followers500');
		if ($i.followersCount >= 1000) claimAchievement('followers1000');

		if (Date.now() - new Date($i.createdAt).getTime() > 1000 * 60 * 60 * 24 * 365) {
			claimAchievement('passedSinceAccountCreated1');
		}
		if (Date.now() - new Date($i.createdAt).getTime() > 1000 * 60 * 60 * 24 * 365 * 2) {
			claimAchievement('passedSinceAccountCreated2');
		}
		if (Date.now() - new Date($i.createdAt).getTime() > 1000 * 60 * 60 * 24 * 365 * 3) {
			claimAchievement('passedSinceAccountCreated3');
		}

		if (claimedAchievements.length >= 30) {
			claimAchievement('collectAchievements30');
		}

		window.setInterval(() => {
			if (Math.floor(Math.random() * 20000) === 0) {
				claimAchievement('justPlainLucky');
			}
		}, 1000 * 10);

		window.setTimeout(() => {
			claimAchievement('client30min');
		}, 1000 * 60 * 30);

		window.setTimeout(() => {
			claimAchievement('client60min');
		}, 1000 * 60 * 60);

		const lastUsed = miLocalStorage.getItem('lastUsed');
		if (lastUsed) {
			const lastUsedDate = parseInt(lastUsed, 10);
			// 二時間以上前なら
			if (Date.now() - lastUsedDate > 1000 * 60 * 60 * 2) {
				toast(i18n.tsx.welcomeBackWithName({
					name: $i.name || $i.username,
				}));
			}
		}
		miLocalStorage.setItem('lastUsed', Date.now().toString());

		const latestDonationInfoShownAt = miLocalStorage.getItem('latestDonationInfoShownAt');
		const neverShowDonationInfo = miLocalStorage.getItem('neverShowDonationInfo');
		if (neverShowDonationInfo !== 'true' && (new Date($i.createdAt).getTime() < (Date.now() - (1000 * 60 * 60 * 24 * 3))) && !location.pathname.startsWith('/miauth')) {
			if (latestDonationInfoShownAt == null || (new Date(latestDonationInfoShownAt).getTime() < (Date.now() - (1000 * 60 * 60 * 24 * 30)))) {
				popup(defineAsyncComponent(() => import('@/components/MkDonation.vue')), {}, {}, 'closed');
			}
		}

		const modifiedVersionMustProminentlyOfferInAgplV3Section13Read = miLocalStorage.getItem('modifiedVersionMustProminentlyOfferInAgplV3Section13Read');
		if (modifiedVersionMustProminentlyOfferInAgplV3Section13Read !== 'true' && instance.repositoryUrl !== 'https://github.com/misskey-dev/misskey') {
			popup(defineAsyncComponent(() => import('@/components/MkSourceCodeAvailablePopup.vue')), {}, {}, 'closed');
		}

		if ('Notification' in window) {
			// 許可を得ていなかったらリクエスト
			if (Notification.permission === 'default') {
				Notification.requestPermission();
			}
		}

		const main = markRaw(stream.useChannel('main', null, 'System'));

		// 自分の情報が更新されたとき
		main.on('meUpdated', i => {
			updateAccount(i);
		});

		main.on('readAllNotifications', () => {
			updateAccount({
				hasUnreadNotification: false,
				unreadNotificationsCount: 0,
			});
		});

		main.on('unreadNotification', () => {
			const unreadNotificationsCount = ($i?.unreadNotificationsCount ?? 0) + 1;
			updateAccount({
				hasUnreadNotification: true,
				unreadNotificationsCount,
			});
		});

		main.on('unreadMention', () => {
			updateAccount({ hasUnreadMentions: true });
		});

		main.on('readAllUnreadMentions', () => {
			updateAccount({ hasUnreadMentions: false });
		});

		main.on('unreadSpecifiedNote', () => {
			updateAccount({ hasUnreadSpecifiedNotes: true });
		});

		main.on('readAllUnreadSpecifiedNotes', () => {
			updateAccount({ hasUnreadSpecifiedNotes: false });
		});

		main.on('readAllAntennas', () => {
			updateAccount({ hasUnreadAntenna: false });
		});

		main.on('unreadAntenna', () => {
			updateAccount({ hasUnreadAntenna: true });
			sound.playrizzkeySfx('antenna');
		});

		main.on('readAllAnnouncements', () => {
			updateAccount({ hasUnreadAnnouncement: false });
		});

		// トークンが再生成されたとき
		// このままではrizzkeyが利用できないので強制的にサインアウトさせる
		main.on('myTokenRegenerated', () => {
			signout();
		});
	}

	// shortcut
	document.addEventListener('keydown', makeHotkey(hotkeys));

	initializeSw();
}
