<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<Mfm :text="block.text ?? ''" :isNote="false"/>
	<MkUrlPreview v-for="url in urls" :key="url" :url="url"/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as mfm from 'mfm-js';
import * as rizzkey from 'rizzkey-js';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm.js';

const MkUrlPreview = defineAsyncComponent(() => import('@/components/MkUrlPreview.vue'));

const props = defineProps<{
	block: rizzkey.entities.PageBlock,
	page: rizzkey.entities.Page,
}>();

const urls = props.block.text ? extractUrlFromMfm(mfm.parse(props.block.text)) : [];
</script>
