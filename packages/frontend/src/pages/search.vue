<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>

	<MkHorizontalSwipe v-model:tab="tab" :tabs="headerTabs">
		<MkSpacer v-if="tab === 'note'" key="note" :contentMax="800">
			<div v-if="notesSearchAvailable">
				<XNote/>
			</div>
			<div v-else>
				<MkInfo warn>{{ i18n.ts.notesSearchNotAvailable }}</MkInfo>
			</div>
		</MkSpacer>

		<MkSpacer v-else-if="tab === 'user'" key="user" :contentMax="800">
			<XUser/>
		</MkSpacer>
	</MkHorizontalSwipe>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { $i } from '@/account.js';
import { instance } from '@/instance.js';
import MkInfo from '@/components/MkInfo.vue';
import MkHorizontalSwipe from '@/components/MkHorizontalSwipe.vue';

const XNote = defineAsyncComponent(() => import('./search.note.vue'));
const XUser = defineAsyncComponent(() => import('./search.user.vue'));

const tab = ref('note');

const notesSearchAvailable = (($i == null && instance.policies.canSearchNotes) || ($i != null && $i.policies.canSearchNotes));

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'note',
	title: i18n.ts.notes,
	icon: 'ti ti-pencil',
}, {
	key: 'user',
	title: i18n.ts.users,
	icon: 'ti ti-users',
}]);

definePageMetadata(() => ({
	title: i18n.ts.search,
	icon: 'ti ti-search',
}));
</script>
