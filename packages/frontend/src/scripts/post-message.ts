/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const postMessageEventTypes = [
	'rizzkey:shareForm:shareCompleted',
] as const;

export type PostMessageEventType = typeof postMessageEventTypes[number];

export type MiPostMessageEvent = {
	type: PostMessageEventType;
	payload?: any;
};

/**
 * 親フレームにイベントを送信
 */
export function postMessageToParentWindow(type: PostMessageEventType, payload?: any): void {
	window.postMessage({
		type,
		payload,
	}, '*');
}
