<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSpacer :contentMax="700">
	<div>
		<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
			<MkA v-for="item in items" :key="item.id" :to="`/clips/${item.id}`" :class="$style.item" class="_panel _margin">
				<b>{{ item.name }}</b>
				<div v-if="item.description" :class="$style.description">{{ item.description }}</div>
			</MkA>
		</MkPagination>
	</div>
</MkSpacer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: rizzkey.entities.User;
}>();

const pagination = {
	endpoint: 'users/clips' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" module>
.item {
	display: block;
	padding: 16px;
}

.description {
	margin-top: 8px;
	padding-top: 8px;
	border-top: solid 0.5px var(--divider);
}
</style>
