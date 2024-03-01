<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta" :class="$style.root" :style="{ backgroundImage: `url(${ meta.backgroundImageUrl })` }"></div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';

const meta = ref<rizzkey.entities.MetaResponse>();

rizzkeyApi('meta', { detail: true }).then(gotMeta => {
	meta.value = gotMeta;
});
</script>

<style lang="scss" module>
.root {
	background-position: center;
	background-size: cover;
}
</style>
