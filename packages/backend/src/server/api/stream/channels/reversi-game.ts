/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { MiReversiGame } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import { ReversiService } from '@/core/ReversiService.js';
import { ReversiGameEntityService } from '@/core/entities/ReversiGameEntityService.js';
import Channel, { type MiChannelService } from '../channel.js';

class ReversiGameChannel extends Channel {
	public readonly chName = 'reversiGame';
	public static shouldShare = false;
	public static requireCredential = false as const;
	private gameId: MiReversiGame['id'] | null = null;

	constructor(
		private reversiService: ReversiService,
		private reversiGameEntityService: ReversiGameEntityService,

		id: string,
		connection: Channel['connection'],
	) {
		super(id, connection);
	}

	@bindThis
	public async init(params: any) {
		this.gameId = params.gameId as string;

		this.subscriber.on(`reversiGameStream:${this.gameId}`, this.send);
	}

	@bindThis
	public onMessage(type: string, body: any) {
		switch (type) {
			case 'ready': this.ready(body); break;
			case 'updateSettings': this.updateSettings(body.key, body.value); break;
			case 'cancel': this.cancelGame(); break;
			case 'putStone': this.putStone(body.pos, body.id); break;
			case 'claimTimeIsUp': this.claimTimeIsUp(); break;
		}
	}

	@bindThis
	private async updateSettings(key: string, value: any) {
		if (this.user == null) return;

		this.reversiService.updateSettings(this.gameId!, this.user, key, value);
	}

	@bindThis
	private async ready(ready: boolean) {
		if (this.user == null) return;

		this.reversiService.gameReady(this.gameId!, this.user, ready);
	}

	@bindThis
	private async cancelGame() {
		if (this.user == null) return;

		this.reversiService.cancelGame(this.gameId!, this.user);
	}

	@bindThis
	private async putStone(pos: number, id: string) {
		if (this.user == null) return;

		this.reversiService.putStoneToGame(this.gameId!, this.user, pos, id);
	}

	@bindThis
	private async claimTimeIsUp() {
		if (this.user == null) return;

		this.reversiService.checkTimeout(this.gameId!);
	}

	@bindThis
	public dispose() {
		// Unsubscribe events
		this.subscriber.off(`reversiGameStream:${this.gameId}`, this.send);
	}
}

@Injectable()
export class ReversiGameChannelService implements MiChannelService<false> {
	public readonly shouldShare = ReversiGameChannel.shouldShare;
	public readonly requireCredential = ReversiGameChannel.requireCredential;
	public readonly kind = ReversiGameChannel.kind;

	constructor(
		private reversiService: ReversiService,
		private reversiGameEntityService: ReversiGameEntityService,
	) {
	}

	@bindThis
	public create(id: string, connection: Channel['connection']): ReversiGameChannel {
		return new ReversiGameChannel(
			this.reversiService,
			this.reversiGameEntityService,
			id,
			connection,
		);
	}
}
