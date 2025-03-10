/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

// Set i18n
import locales from '../../../locales/index.js';
import { updateI18n } from '@/i18n.js';
updateI18n(locales['en-US']);

// XXX: rizzkey-js panics if WebSocket is not defined
vi.stubGlobal('WebSocket', class WebSocket extends EventTarget { static CLOSING = 2; });

export const defaultStoreState: Record<string, unknown> = {

	// なんかtestがうまいこと動かないのでここに書く
	dataSaver: {
		media: false,
		avatar: false,
		urlPreview: false,
		code: false,
	},

};

// XXX: defaultStore somehow becomes undefined in vitest?
vi.mock('@/store.js', () => {
	return {
		defaultStore: {
			state: defaultStoreState,
		},
	};
});

// Add mocks for Web Audio API
const AudioNodeMock = vi.fn(() => ({
	connect: vi.fn(() => ({ connect: vi.fn() })),
	start: vi.fn(),
}));

const GainNodeMock = vi.fn(() => ({
	gain: vi.fn(),
}));

const AudioContextMock = vi.fn(() => ({
	createBufferSource: vi.fn(() => new AudioNodeMock()),
	createGain: vi.fn(() => new GainNodeMock()),
	decodeAudioData: vi.fn(),
}));

vi.stubGlobal('AudioContext', AudioContextMock);
