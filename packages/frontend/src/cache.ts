/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { Cache } from '@/scripts/cache.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';

export const clipsCache = new Cache<rizzkey.entities.Clip[]>(1000 * 60 * 30, () => rizzkeyApi('clips/list'));
export const rolesCache = new Cache(1000 * 60 * 30, () => rizzkeyApi('admin/roles/list'));
export const userListsCache = new Cache<rizzkey.entities.UserList[]>(1000 * 60 * 30, () => rizzkeyApi('users/lists/list'));
export const antennasCache = new Cache<rizzkey.entities.Antenna[]>(1000 * 60 * 30, () => rizzkeyApi('antennas/list'));
