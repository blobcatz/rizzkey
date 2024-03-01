/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';

export async function lookupUser() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.usernameOrUserId,
	});
	if (canceled) return;

	const show = (user) => {
		os.pageWindow(`/admin/user/${user.id}`);
	};

	const usernamePromise = rizzkeyApi('users/show', rizzkey.acct.parse(result));
	const idPromise = rizzkeyApi('users/show', { userId: result });
	let _notFound = false;
	const notFound = () => {
		if (_notFound) {
			os.alert({
				type: 'error',
				text: i18n.ts.noSuchUser,
			});
		} else {
			_notFound = true;
		}
	};
	usernamePromise.then(show).catch(err => {
		if (err.code === 'NO_SUCH_USER') {
			notFound();
		}
	});
	idPromise.then(show).catch(err => {
		notFound();
	});
}

export async function lookupUserByEmail() {
	const { canceled, result } = await os.inputText({
		title: i18n.ts.emailAddress,
		type: 'email',
	});
	if (canceled) return;

	try {
		const user = await os.apiWithDialog('admin/accounts/find-by-email', { email: result });

		os.pageWindow(`/admin/user/${user.id}`);
	} catch (err) {
		if (err.code === 'USER_NOT_FOUND') {
			os.alert({
				type: 'error',
				text: i18n.ts.noSuchUser,
			});
		} else {
			throw err;
		}
	}
}
