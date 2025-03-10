<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="game == null || (!game.isEnded && connection == null)"><MkLoading/></div>
<GameSetting v-else-if="!game.isStarted" v-model:shareWhenStart="shareWhenStart" :game="game" :connection="connection!"/>
<GameBoard v-else :game="game" :connection="connection"/>
</template>

<script lang="ts" setup>
import { computed, watch, ref, onMounted, shallowRef, onUnmounted } from 'vue';
import * as rizzkey from 'rizzkey-js';
import GameSetting from './game.setting.vue';
import GameBoard from './game.board.vue';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { useStream } from '@/stream.js';
import { signinRequired } from '@/account.js';
import { useRouter } from '@/router/supplier.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { useInterval } from '@/scripts/use-interval.js';

const $i = signinRequired();

const router = useRouter();

const props = defineProps<{
	gameId: string;
}>();

const game = shallowRef<rizzkey.entities.ReversiGameDetailed | null>(null);
const connection = shallowRef<rizzkey.ChannelConnection | null>(null);
const shareWhenStart = ref(false);

watch(() => props.gameId, () => {
	fetchGame();
});

function start(_game: rizzkey.entities.ReversiGameDetailed) {
	if (game.value?.isStarted) return;

	if (shareWhenStart.value) {
		rizzkeyApi('notes/create', {
			text: i18n.ts._reversi.iStartedAGame + '\n' + location.href,
			visibility: 'home',
		});
	}

	game.value = _game;
}

async function fetchGame() {
	const _game = await rizzkeyApi('reversi/show-game', {
		gameId: props.gameId,
	});

	game.value = _game;
	shareWhenStart.value = false;

	if (connection.value) {
		connection.value.dispose();
	}
	if (!game.value.isEnded) {
		connection.value = useStream().useChannel('reversiGame', {
			gameId: game.value.id,
		});
		connection.value.on('started', x => {
			start(x.game);
		});
		connection.value.on('canceled', x => {
			connection.value?.dispose();

			if (x.userId !== $i.id) {
				os.alert({
					type: 'warning',
					text: i18n.ts._reversi.gameCanceled,
				});
				router.push('/reversi');
			}
		});
	}
}

// 通信を取りこぼした場合の救済
useInterval(async () => {
	if (game.value == null) return;
	if (game.value.isStarted) return;

	const _game = await rizzkeyApi('reversi/show-game', {
		gameId: props.gameId,
	});

	if (_game.isStarted) {
		start(_game);
	} else {
		game.value = _game;
	}
}, 1000 * 10, {
	immediate: false,
	afterMounted: true,
});

onMounted(() => {
	fetchGame();
});

onUnmounted(() => {
	if (connection.value) {
		connection.value.dispose();
	}
});

definePageMetadata(() => ({
	title: 'Reversi',
	icon: 'ti ti-device-gamepad',
}));
</script>
