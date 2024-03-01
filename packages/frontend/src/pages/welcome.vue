<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta">
	<XSetup v-if="meta.requireSetup"/>
	<XEntrance v-else/>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import XSetup from './welcome.setup.vue';
import XEntrance from './welcome.entrance.a.vue';
import { instanceName } from '@/config.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const meta = ref<rizzkey.entities.MetaResponse | null>(null);

rizzkeyApi('meta', { detail: true }).then(res => {
	meta.value = res;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: instanceName,
	icon: null,
}));
</script>
