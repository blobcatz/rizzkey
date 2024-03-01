<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="{ [$style.center]: page.alignCenter, [$style.serif]: page.font === 'serif' }" class="_gaps_s">
	<XBlock v-for="child in page.content" :key="child.id" :page="page" :block="child" :h="2"/>
</div>
</template>

<script lang="ts" setup>
import * as rizzkey from 'rizzkey-js';
import XBlock from './page.block.vue';

defineProps<{
	page: rizzkey.entities.Page,
}>();
</script>

<style lang="scss" module>
.serif {
	font-family: serif;
}

.center {
	text-align: center;
}
</style>
