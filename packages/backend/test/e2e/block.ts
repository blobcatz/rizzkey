/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import { api, post, signup } from '../utils.js';
import type * as rizzkey from 'rizzkey-js';

describe('Block', () => {
	// alice blocks bob
	let alice: rizzkey.entities.SignupResponse;
	let bob: rizzkey.entities.SignupResponse;
	let carol: rizzkey.entities.SignupResponse;

	beforeAll(async () => {
		alice = await signup({ username: 'alice' });
		bob = await signup({ username: 'bob' });
		carol = await signup({ username: 'carol' });
	}, 1000 * 60 * 2);

	test('Block作成', async () => {
		const res = await api('/blocking/create', {
			userId: bob.id,
		}, alice);

		assert.strictEqual(res.status, 200);
	});

	test('ブロックされているユーザーをフォローできない', async () => {
		const res = await api('/following/create', { userId: alice.id }, bob);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.id, 'c4ab57cc-4e41-45e9-bfd9-584f61e35ce0');
	});

	test('ブロックされているユーザーにリアクションできない', async () => {
		const note = await post(alice, { text: 'hello' });

		const res = await api('/notes/reactions/create', { noteId: note.id, reaction: '👍' }, bob);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.id, '20ef5475-9f38-4e4c-bd33-de6d979498ec');
	});

	test('ブロックされているユーザーに返信できない', async () => {
		const note = await post(alice, { text: 'hello' });

		const res = await api('/notes/create', { replyId: note.id, text: 'yo' }, bob);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.id, 'b390d7e1-8a5e-46ed-b625-06271cafd3d3');
	});

	test('ブロックされているユーザーのノートをRenoteできない', async () => {
		const note = await post(alice, { text: 'hello' });

		const res = await api('/notes/create', { renoteId: note.id, text: 'yo' }, bob);

		assert.strictEqual(res.status, 400);
		assert.strictEqual(res.body.error.id, 'b390d7e1-8a5e-46ed-b625-06271cafd3d3');
	});

	// TODO: ユーザーリストに入れられないテスト

	// TODO: ユーザーリストから除外されるテスト

	test('タイムライン(LTL)にブロックされているユーザーの投稿が含まれない', async () => {
		const aliceNote = await post(alice, { text: 'hi' });
		const bobNote = await post(bob, { text: 'hi' });
		const carolNote = await post(carol, { text: 'hi' });

		const res = await api('/notes/local-timeline', {}, bob);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.some((note: any) => note.id === aliceNote.id), false);
		assert.strictEqual(res.body.some((note: any) => note.id === bobNote.id), true);
		assert.strictEqual(res.body.some((note: any) => note.id === carolNote.id), true);
	});
});
