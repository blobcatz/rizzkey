<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div v-for="user in users.slice(0, limit)" :key="user.id" style="display:inline-block;width:32px;height:32px;margin-right:8px;">
		<MkAvatar :user="user" style="width:32px; height:32px;" indicator link preview/>
	</div>
	<div v-if="users.length > limit" style="display: inline-block;">...</div>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';

const props = withDefaults(defineProps<{
	userIds: string[];
	limit?: number;
}>(), {
	limit: Infinity,
});

const users = ref<rizzkey.entities.UserLite[]>([]);

onMounted(async () => {
	users.value = await rizzkeyApi('users/show', {
		userIds: props.userIds,
	}) as unknown as rizzkey.entities.UserLite[];
});
</script>
