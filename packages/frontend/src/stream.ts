/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { markRaw } from 'vue';
import { $i } from '@/account.js';
import { wsOrigin } from '@/config.js';

let stream: rizzkey.Stream | null = null;

export function useStream(): rizzkey.Stream {
	if (stream) return stream;

	stream = markRaw(new rizzkey.Stream(wsOrigin, $i ? {
		token: $i.token,
	} : null));

	window.setTimeout(heartbeat, 1000 * 60);

	return stream;
}

function heartbeat(): void {
	if (stream != null && document.visibilityState === 'visible') {
		stream.heartbeat();
	}
	window.setTimeout(heartbeat, 1000 * 60);
}
