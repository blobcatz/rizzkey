<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSpacer :contentMax="700">
	<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
		<MkFlashPreview v-for="flash in items" :key="flash.id" :flash="flash" class="_margin"/>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkFlashPreview from '@/components/MkFlashPreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: rizzkey.entities.User;
}>();

const pagination = {
	endpoint: 'users/flashs' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>
