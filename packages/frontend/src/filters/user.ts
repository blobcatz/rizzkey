/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { url } from '@/config.js';

export const acct = (user: rizzkey.Acct) => {
	return rizzkey.acct.toString(user);
};

export const userName = (user: rizzkey.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: rizzkey.Acct, path?, absolute = false) => {
	return `${absolute ? url : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
};
