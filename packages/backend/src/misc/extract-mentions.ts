/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// test is located in test/extract-mentions

import * as mfm from 'mfm-js';

export function extractMentions(nodes: mfm.MfmNode[]): mfm.MfmMention['props'][] {
	// TODO: 重複を削除
	const mentionNodes = mfm.extract(nodes, (node) => node.type === 'mention') as mfm.MfmMention[];
	const mentions = mentionNodes.map(x => x.props);

	return mentions;
}
