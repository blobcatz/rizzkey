<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component :is="getComponent(block.type)" :key="block.id" :page="page" :block="block" :h="h"/>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as rizzkey from 'rizzkey-js';
import XText from './page.text.vue';
import XSection from './page.section.vue';
import XImage from './page.image.vue';
import XNote from './page.note.vue';

function getComponent(type: string) {
	switch (type) {
		case 'text': return XText;
		case 'section': return XSection;
		case 'image': return XImage;
		case 'note': return XNote;
		default: return null;
	}
}

defineProps<{
	block: rizzkey.entities.PageBlock,
	h: number,
	page: rizzkey.entities.Page,
}>();
</script>
