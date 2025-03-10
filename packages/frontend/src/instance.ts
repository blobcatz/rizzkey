/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed, reactive } from 'vue';
import * as rizzkey from 'rizzkey-js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { miLocalStorage } from '@/local-storage.js';
import { DEFAULT_INFO_IMAGE_URL, DEFAULT_NOT_FOUND_IMAGE_URL, DEFAULT_SERVER_ERROR_IMAGE_URL } from '@/const.js';

// TODO: 他のタブと永続化されたstateを同期

//#region loader
const providedMetaEl = document.getElementById('rizzkey_meta');

let cachedMeta = miLocalStorage.getItem('instance') ? JSON.parse(miLocalStorage.getItem('instance')!) : null;
let cachedAt = miLocalStorage.getItem('instanceCachedAt') ? parseInt(miLocalStorage.getItem('instanceCachedAt')!) : 0;
const providedMeta = providedMetaEl && providedMetaEl.textContent ? JSON.parse(providedMetaEl.textContent) : null;
const providedAt = providedMetaEl && providedMetaEl.dataset.generatedAt ? parseInt(providedMetaEl.dataset.generatedAt) : 0;
if (providedAt > cachedAt) {
	miLocalStorage.setItem('instance', JSON.stringify(providedMeta));
	miLocalStorage.setItem('instanceCachedAt', providedAt.toString());
	cachedMeta = providedMeta;
	cachedAt = providedAt;
}
//#endregion

// TODO: instanceをリアクティブにするかは再考の余地あり

export const instance: rizzkey.entities.MetaResponse = reactive(cachedMeta ?? {});

export const serverErrorImageUrl = computed(() => instance.serverErrorImageUrl ?? DEFAULT_SERVER_ERROR_IMAGE_URL);

export const infoImageUrl = computed(() => instance.infoImageUrl ?? DEFAULT_INFO_IMAGE_URL);

export const notFoundImageUrl = computed(() => instance.notFoundImageUrl ?? DEFAULT_NOT_FOUND_IMAGE_URL);

export async function fetchInstance(force = false): Promise<void> {
	if (!force) {
		const cachedAt = miLocalStorage.getItem('instanceCachedAt') ? parseInt(miLocalStorage.getItem('instanceCachedAt')!) : 0;

		if (Date.now() - cachedAt < 1000 * 60 * 60) {
			return;
		}
	}

	const meta = await rizzkeyApi('meta', {
		detail: false,
	});

	for (const [k, v] of Object.entries(meta)) {
		instance[k] = v;
	}

	miLocalStorage.setItem('instance', JSON.stringify(instance));
	miLocalStorage.setItem('instanceCachedAt', Date.now().toString());
}
