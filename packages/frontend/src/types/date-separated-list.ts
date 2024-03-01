/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type rizzkeyEntity = {
	id: string;
	createdAt: string;
	_shouldInsertAd_?: boolean;
	[x: string]: any;
};
