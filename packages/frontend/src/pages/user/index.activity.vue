<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer>
	<template #icon><i class="ti ti-chart-line"></i></template>
	<template #header>{{ i18n.ts.activity }}</template>
	<template #func="{ buttonStyleClass }">
		<button class="_button" :class="buttonStyleClass" @click="showMenu">
			<i class="ti ti-dots"></i>
		</button>
	</template>

	<div style="padding: 8px;">
		<MkChart :src="chartSrc" :args="{ user, withoutAll: true }" span="day" :limit="limit" :bar="true" :stacked="true" :detailed="false" :aspectRatio="5"/>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkContainer from '@/components/MkContainer.vue';
import MkChart from '@/components/MkChart.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';

const props = withDefaults(defineProps<{
	user: rizzkey.entities.User;
	limit?: number;
}>(), {
	limit: 50,
});

const chartSrc = ref('per-user-notes');

function showMenu(ev: MouseEvent) {
	os.popupMenu([{
		text: i18n.ts.notes,
		active: chartSrc.value === 'per-user-notes',
		action: () => {
			chartSrc.value = 'per-user-notes';
		},
	}, {
		text: i18n.ts.numberOfProfileView,
		active: chartSrc.value === 'per-user-pv',
		action: () => {
			chartSrc.value = 'per-user-pv';
		},
	}, /*, {
		text: i18n.ts.following,
		action: () => {
			chartSrc = 'per-user-following';
		}
	}, {
		text: i18n.ts.followers,
		action: () => {
			chartSrc = 'per-user-followers';
		}
	}*/], ev.currentTarget ?? ev.target);
}
</script>
