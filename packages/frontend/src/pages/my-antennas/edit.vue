<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="">
	<XAntenna v-if="antenna" :antenna="antenna" @updated="onAntennaUpdated"/>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import XAntenna from './editor.vue';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { antennasCache } from '@/cache.js';
import { useRouter } from '@/router/supplier.js';

const router = useRouter();

const antenna = ref<rizzkey.entities.Antenna | null>(null);

const props = defineProps<{
	antennaId: string
}>();

function onAntennaUpdated() {
	antennasCache.delete();
	router.push('/my/antennas');
}

rizzkeyApi('antennas/show', { antennaId: props.antennaId }).then((antennaResponse) => {
	antenna.value = antennaResponse;
});

definePageMetadata(() => ({
	title: i18n.ts.manageAntennas,
	icon: 'ti ti-antenna',
}));
</script>
