<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>

	<MkSpacer :contentMax="1200">
		<div class="_gaps_s">
			<MkUserList :pagination="tagUsers"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkUserList from '@/components/MkUserList.vue';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const props = defineProps<{
	tag: string;
}>();

const tagUsers = computed(() => ({
	endpoint: 'hashtags/users' as const,
	limit: 30,
	params: {
		tag: props.tag,
		origin: 'combined',
		sort: '+follower',
	},
}));

definePageMetadata(() => ({
	title: props.tag,
	icon: 'ti ti-user-search',
}));
</script>

