/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { QueueService } from '@/core/QueueService.js';

export const meta = {
	secure: true,
	requireCredential: true,
	limit: {
		duration: ms('1day'),
		max: 1,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private queueService: QueueService,
	) {
		super(meta, paramDef, async (ps, me) => {
			this.queueService.createExportFavoritesJob(me);
		});
	}
}
