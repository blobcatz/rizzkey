<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn :menu="menu" :column="column" :isStacked="isStacked" :refresher="() => timeline.reloadTimeline()">
	<template #header>
		<i class="ti ti-device-tv"></i><span style="margin-left: 8px;">{{ column.name }}</span>
	</template>

	<template v-if="column.channelId">
		<div style="padding: 8px; text-align: center;">
			<MkButton primary gradate rounded inline small @click="post"><i class="ti ti-pencil"></i></MkButton>
		</div>
		<MkTimeline ref="timeline" src="channel" :channel="column.channelId"/>
	</template>
</XColumn>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue';
import * as rizzkey from 'rizzkey-js';
import XColumn from './column.vue';
import { updateColumn, Column } from './deck-store.js';
import MkTimeline from '@/components/MkTimeline.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const timeline = shallowRef<InstanceType<typeof MkTimeline>>();
const channel = shallowRef<rizzkey.entities.Channel>();

if (props.column.channelId == null) {
	setChannel();
}

async function setChannel() {
	const channels = await rizzkeyApi('channels/my-favorites', {
		limit: 100,
	});
	const { canceled, result: channel } = await os.select({
		title: i18n.ts.selectChannel,
		items: channels.map(x => ({
			value: x, text: x.name,
		})),
		default: props.column.channelId,
	});
	if (canceled) return;
	updateColumn(props.column.id, {
		channelId: channel.id,
		name: channel.name,
	});
}

async function post() {
	if (!channel.value || channel.value.id !== props.column.channelId) {
		channel.value = await rizzkeyApi('channels/show', {
			channelId: props.column.channelId,
		});
	}

	os.post({
		channel: channel.value,
	});
}

const menu = [{
	icon: 'ti ti-pencil',
	text: i18n.ts.selectChannel,
	action: setChannel,
}];
</script>
