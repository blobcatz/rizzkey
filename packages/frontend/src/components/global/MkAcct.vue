<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkCondensedLine v-if="defaultStore.state.enableCondensedLineForAcct" :minScale="2 / 3">
	<span>@{{ user.username }}</span>
	<span v-if="user.host || detail || defaultStore.state.showFullAcct" style="opacity: 0.5;">@{{ user.host || host }}</span>
</MkCondensedLine>
<span v-else>
	<span>@{{ user.username }}</span>
	<span v-if="user.host || detail || defaultStore.state.showFullAcct" style="opacity: 0.5;">@{{ user.host || host }}</span>
</span>
</template>

<script lang="ts" setup>
import * as rizzkey from 'rizzkey-js';
import { toUnicode } from 'punycode/';
import { host as hostRaw } from '@/config.js';
import { defaultStore } from '@/store.js';

defineProps<{
	user: rizzkey.entities.User;
	detail?: boolean;
}>();

const host = toUnicode(hostRaw);
</script>
