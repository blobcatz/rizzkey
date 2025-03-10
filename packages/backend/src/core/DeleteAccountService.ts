/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository } from '@/models/_.js';
import { QueueService } from '@/core/QueueService.js';
import { UserSuspendService } from '@/core/UserSuspendService.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';

@Injectable()
export class DeleteAccountService {
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private userSuspendService: UserSuspendService,
		private queueService: QueueService,
		private globalEventService: GlobalEventService,
	) {
	}

	@bindThis
	public async deleteAccount(user: {
		id: string;
		host: string | null;
	}): Promise<void> {
		const _user = await this.usersRepository.findOneByOrFail({ id: user.id });
		if (_user.isRoot) throw new Error('cannot delete a root account');

		// 物理削除する前にDelete activityを送信する
		await this.userSuspendService.doPostSuspend(user).catch(e => {});

		this.queueService.createDeleteAccountJob(user, {
			soft: false,
		});

		await this.usersRepository.update(user.id, {
			isDeleted: true,
		});

		this.globalEventService.publishInternalEvent('userChangeDeletedState', { id: user.id, isDeleted: true });
	}
}
