import * as assert from 'assert';
import { Test } from '@nestjs/testing';

import { CoreModule } from '@/core/CoreModule.js';
import { ApMfmService } from '@/core/activitypub/ApMfmService.js';
import { GlobalModule } from '@/GlobalModule.js';
import { MiNote } from '@/models/Note.js';

describe('ApMfmService', () => {
	let apMfmService: ApMfmService;

	beforeAll(async () => {
		const app = await Test.createTestingModule({
			imports: [GlobalModule, CoreModule],
		}).compile();
		apMfmService = app.get<ApMfmService>(ApMfmService);
	});

	describe('getNoteHtml', () => {
		test('Do not provide _rizzkey_content for simple text', () => {
			const note: MiNote = {
				text: 'テキスト #タグ @mention 🍊 :emoji: https://example.com',
				mentionedRemoteUsers: '[]',
			} as any;

			const { content, norizzkeyContent } = apMfmService.getNoteHtml(note);

			assert.equal(norizzkeyContent, true, 'norizzkeyContent');
			assert.equal(content, '<p>テキスト <a href="http://rizzkey.local/tags/タグ" rel="tag">#タグ</a> <a href="http://rizzkey.local/@mention" class="u-url mention">@mention</a> 🍊 ​:emoji:​ <a href="https://example.com">https://example.com</a></p>', 'content');
		});

		test('Provide _rizzkey_content for MFM', () => {
			const note: MiNote = {
				text: '$[tada foo]',
				mentionedRemoteUsers: '[]',
			} as any;

			const { content, norizzkeyContent } = apMfmService.getNoteHtml(note);

			assert.equal(norizzkeyContent, false, 'norizzkeyContent');
			assert.equal(content, '<p><i>foo</i></p>', 'content');
		});
	});
});
