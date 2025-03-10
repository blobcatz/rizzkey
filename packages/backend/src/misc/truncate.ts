/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { substring } from 'stringz';

export function truncate(input: string, size: number): string;
export function truncate(input: string | undefined, size: number): string | undefined;
export function truncate(input: string | undefined, size: number): string | undefined {
	if (!input) {
		return input;
	} else {
		return substring(input, 0, size);
	}
}
