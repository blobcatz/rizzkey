<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSpacer :contentMax="700">
	<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
		<MkPagePreview v-for="page in items" :key="page.id" :page="page" class="_margin"/>
	</MkPagination>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkPagePreview from '@/components/MkPagePreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: rizzkey.entities.User;
}>();

const pagination = {
	endpoint: 'users/pages' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>
