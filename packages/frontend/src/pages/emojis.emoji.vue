<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button class="_button" :class="$style.root" @click="menu">
	<img :src="emoji.url" :class="$style.img" loading="lazy"/>
	<div :class="$style.body">
		<div :class="$style.name" class="_monospace">{{ emoji.name }}</div>
		<div :class="$style.info">{{ emoji.aliases.join(' ') }}</div>
	</div>
</button>
</template>

<script lang="ts" setup>
import * as os from '@/os.js';
import * as rizzkey from 'rizzkey-js';
import { rizzkeyApiGet } from '@/scripts/rizzkey-api.js';
import copyToClipboard from '@/scripts/copy-to-clipboard.js';
import { i18n } from '@/i18n.js';
import MkCustomEmojiDetailedDialog from '@/components/MkCustomEmojiDetailedDialog.vue';

const props = defineProps<{
  emoji: rizzkey.entities.EmojiSimple;
}>();

function menu(ev) {
	os.popupMenu([{
		type: 'label',
		text: ':' + props.emoji.name + ':',
	}, {
		text: i18n.ts.copy,
		icon: 'ti ti-copy',
		action: () => {
			copyToClipboard(`:${props.emoji.name}:`);
			os.success();
		},
	}, {
		text: i18n.ts.info,
		icon: 'ti ti-info-circle',
		action: async () => {
			os.popup(MkCustomEmojiDetailedDialog, {
				emoji: await rizzkeyApiGet('emoji', {
					name: props.emoji.name,
				})
			}, {
				anchor: ev.target,
			});
		},
	}], ev.currentTarget ?? ev.target);
}
</script>

<style lang="scss" module>
.root {
	display: flex;
	align-items: center;
	padding: 12px;
	text-align: left;
	background: var(--panel);
	border-radius: 8px;

	&:hover {
		border-color: var(--accent);
	}
}

.img {
	width: 42px;
	height: 42px;
	object-fit: contain;
}

.body {
	padding: 0 0 0 8px;
	white-space: nowrap;
	overflow: hidden;
}

.name {
	text-overflow: ellipsis;
	overflow: hidden;
}

.info {
	opacity: 0.5;
	font-size: 0.9em;
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
