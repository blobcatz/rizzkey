/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { $i } from '@/account.js';

export function isFollowingVisibleForMe(user: rizzkey.entities.UserDetailed): boolean {
	if ($i && $i.id === user.id) return true;

	if (user.followingVisibility === 'private') return false;
	if (user.followingVisibility === 'followers' && !user.isFollowing) return false;

	return true;
}
export function isFollowersVisibleForMe(user: rizzkey.entities.UserDetailed): boolean {
	if ($i && $i.id === user.id) return true;

	if (user.followersVisibility === 'private') return false;
	if (user.followersVisibility === 'followers' && !user.isFollowing) return false;

	return true;
}
