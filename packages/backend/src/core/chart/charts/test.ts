/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppLockService } from '@/core/AppLockService.js';
import { DI } from '@/di-symbols.js';
import Logger from '@/logger.js';
import { bindThis } from '@/decorators.js';
import Chart from '../core.js';
import { name, schema } from './entities/test.js';
import type { KVs } from '../core.js';

/**
 * For testing
 */
@Injectable()
export default class TestChart extends Chart<typeof schema> { // eslint-disable-line import/no-default-export
	public total = 0; // publicにするのはテストのため

	constructor(
		@Inject(DI.db)
		private db: DataSource,

		private appLockService: AppLockService,
		logger: Logger,
	) {
		super(db, (k) => appLockService.getChartInsertLock(k), logger, name, schema);
	}

	protected async tickMajor(): Promise<Partial<KVs<typeof schema>>> {
		return {
			'foo.total': this.total,
		};
	}

	protected async tickMinor(): Promise<Partial<KVs<typeof schema>>> {
		return {};
	}

	@bindThis
	public async increment(): Promise<void> {
		this.total++;

		await this.commit({
			'foo.total': 1,
			'foo.inc': 1,
		});
	}

	@bindThis
	public async decrement(): Promise<void> {
		this.total--;

		await this.commit({
			'foo.total': -1,
			'foo.dec': 1,
		});
	}
}
