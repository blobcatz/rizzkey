<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="user" :class="$style.root">
	<i class="ti ti-plane-departure" style="margin-right: 8px;"></i>
	{{ i18n.ts.accountMoved }}
	<MkMention :class="$style.link" :username="user.username" :host="user.host ?? localHost"/>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkMention from './MkMention.vue';
import { i18n } from '@/i18n.js';
import { host as localHost } from '@/config.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';

const user = ref<rizzkey.entities.UserLite>();

const props = defineProps<{
	movedTo: string; // user id
}>();

rizzkeyApi('users/show', { userId: props.movedTo }).then(u => user.value = u);
</script>

<style lang="scss" module>
.root {
	padding: 16px;
	font-size: 90%;
	background: var(--infoWarnBg);
	color: var(--error);
	border-radius: var(--radius);
}

.link {
	margin-left: 4px;
}
</style>
