<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkCustomEmoji v-if="reaction[0] === ':'" ref="elRef" :name="reaction" :normal="true" :noStyle="noStyle" :url="emojiUrl"/>
<MkEmoji v-else ref="elRef" :emoji="reaction" :normal="true" :noStyle="noStyle"/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef } from 'vue';
import { useTooltip } from '@/scripts/use-tooltip.js';
import * as os from '@/os.js';

const props = defineProps<{
	reaction: string;
	noStyle?: boolean;
	emojiUrl?: string;
	withTooltip?: boolean;
}>();

const elRef = shallowRef();

if (props.withTooltip) {
	useTooltip(elRef, (showing) => {
		os.popup(defineAsyncComponent(() => import('@/components/MkReactionTooltip.vue')), {
			showing,
			reaction: props.reaction.replace(/^:(\w+):$/, ':$1@.:'),
			targetElement: elRef.value.$el,
		}, {}, 'closed');
	});
}
</script>
