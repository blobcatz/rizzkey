<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions"/></template>
	<MkSpacer :contentMax="800">
		<div v-if="clip" class="_gaps">
			<div class="_panel">
				<div v-if="clip.description" :class="$style.description">
					<Mfm :text="clip.description" :isNote="false"/>
				</div>
				<MkButton v-if="favorited" v-tooltip="i18n.ts.unfavorite" asLike rounded primary @click="unfavorite()"><i class="ti ti-heart"></i><span v-if="clip.favoritedCount > 0" style="margin-left: 6px;">{{ clip.favoritedCount }}</span></MkButton>
				<MkButton v-else v-tooltip="i18n.ts.favorite" asLike rounded @click="favorite()"><i class="ti ti-heart"></i><span v-if="clip.favoritedCount > 0" style="margin-left: 6px;">{{ clip.favoritedCount }}</span></MkButton>
				<div :class="$style.user">
					<MkAvatar :user="clip.user" :class="$style.avatar" indicator link preview/> <MkUserName :user="clip.user" :nowrap="false"/>
				</div>
			</div>

			<MkNotes :pagination="pagination" :detail="true"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, provide, ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MkNotes from '@/components/MkNotes.vue';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { url } from '@/config.js';
import MkButton from '@/components/MkButton.vue';
import { clipsCache } from '@/cache.js';
import { isSupportShare } from '@/scripts/navigator.js';
import copyToClipboard from '@/scripts/copy-to-clipboard.js';

const props = defineProps<{
	clipId: string,
}>();

const clip = ref<rizzkey.entities.Clip | null>(null);
const favorited = ref(false);
const pagination = {
	endpoint: 'clips/notes' as const,
	limit: 10,
	params: computed(() => ({
		clipId: props.clipId,
	})),
};

const isOwned = computed<boolean | null>(() => $i && clip.value && ($i.id === clip.value.userId));

watch(() => props.clipId, async () => {
	clip.value = await rizzkeyApi('clips/show', {
		clipId: props.clipId,
	});
	favorited.value = clip.value.isFavorited;
}, {
	immediate: true,
});

provide('currentClip', clip);

function favorite() {
	os.apiWithDialog('clips/favorite', {
		clipId: props.clipId,
	}).then(() => {
		favorited.value = true;
	});
}

async function unfavorite() {
	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.ts.unfavoriteConfirm,
	});
	if (confirm.canceled) return;
	os.apiWithDialog('clips/unfavorite', {
		clipId: props.clipId,
	}).then(() => {
		favorited.value = false;
	});
}

const headerActions = computed(() => clip.value && isOwned.value ? [{
	icon: 'ti ti-pencil',
	text: i18n.ts.edit,
	handler: async (): Promise<void> => {
		const { canceled, result } = await os.form(clip.value.name, {
			name: {
				type: 'string',
				label: i18n.ts.name,
				default: clip.value.name,
			},
			description: {
				type: 'string',
				required: false,
				multiline: true,
				treatAsMfm: true,
				label: i18n.ts.description,
				default: clip.value.description,
			},
			isPublic: {
				type: 'boolean',
				label: i18n.ts.public,
				default: clip.value.isPublic,
			},
		});
		if (canceled) return;

		os.apiWithDialog('clips/update', {
			clipId: clip.value.id,
			...result,
		});

		clipsCache.delete();
	},
}, ...(clip.value.isPublic ? [{
	icon: 'ti ti-link',
	text: i18n.ts.copyUrl,
	handler: async (): Promise<void> => {
		copyToClipboard(`${url}/clips/${clip.value.id}`);
		os.success();
	},
}] : []), ...(clip.value.isPublic && isSupportShare() ? [{
	icon: 'ti ti-share',
	text: i18n.ts.share,
	handler: async (): Promise<void> => {
		navigator.share({
			title: clip.value.name,
			text: clip.value.description,
			url: `${url}/clips/${clip.value.id}`,
		});
	},
}] : []), {
	icon: 'ti ti-trash',
	text: i18n.ts.delete,
	danger: true,
	handler: async (): Promise<void> => {
		const { canceled } = await os.confirm({
			type: 'warning',
			text: i18n.tsx.deleteAreYouSure({ x: clip.value.name }),
		});
		if (canceled) return;

		await os.apiWithDialog('clips/delete', {
			clipId: clip.value.id,
		});

		clipsCache.delete();
	},
}] : null);

definePageMetadata(() => ({
	title: clip.value ? clip.value.name : i18n.ts.clip,
	icon: 'ti ti-paperclip',
}));
</script>

<style lang="scss" module>
.description {
	padding: 16px;
}

.user {
	--height: 32px;
	padding: 16px;
	border-top: solid 0.5px var(--divider);
	line-height: var(--height);
}

.avatar {
	width: var(--height);
	height: var(--height);
}
</style>
