<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800">
		<div ref="rootEl">
			<div v-if="queue > 0" :class="$style.new"><button class="_buttonPrimary" :class="$style.newButton" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
			<div :class="$style.tl">
				<MkTimeline
					ref="tlEl" :key="listId"
					src="list"
					:list="listId"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, ref, shallowRef } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkTimeline from '@/components/MkTimeline.vue';
import { scroll } from '@/scripts/scroll.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';
import { useRouter } from '@/router/supplier.js';

const router = useRouter();

const props = defineProps<{
	listId: string;
}>();

const list = ref<rizzkey.entities.UserList | null>(null);
const queue = ref(0);
const tlEl = shallowRef<InstanceType<typeof MkTimeline>>();
const rootEl = shallowRef<HTMLElement>();

watch(() => props.listId, async () => {
	list.value = await rizzkeyApi('users/lists/show', {
		listId: props.listId,
	});
}, { immediate: true });

function queueUpdated(q) {
	queue.value = q;
}

function top() {
	scroll(rootEl.value, { top: 0 });
}

function settings() {
	router.push(`/my/lists/${props.listId}`);
}

const headerActions = computed(() => list.value ? [{
	icon: 'ti ti-settings',
	text: i18n.ts.settings,
	handler: settings,
}] : []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: list.value ? list.value.name : i18n.ts.lists,
	icon: 'ti ti-list',
}));
</script>

<style lang="scss" module>
.new {
	position: sticky;
	top: calc(var(--stickyTop, 0px) + 16px);
	z-index: 1000;
	width: 100%;
	margin: calc(-0.675em - 8px) 0;

	&:first-child {
		margin-top: calc(-0.675em - 8px - var(--margin));
	}
}

.newButton {
	display: block;
	margin: var(--margin) auto 0 auto;
	padding: 8px 16px;
	border-radius: 32px;
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
