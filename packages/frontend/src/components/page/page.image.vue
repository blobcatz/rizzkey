<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MediaImage
		v-if="image"
		:image="image"
		:disableImageLink="true"
	/>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as rizzkey from 'rizzkey-js';
import MediaImage from '@/components/MkMediaImage.vue';

const props = defineProps<{
	block: rizzkey.entities.PageBlock,
	page: rizzkey.entities.Page,
}>();

const image = ref<rizzkey.entities.DriveFile | null>(null);

onMounted(() => {
	image.value = props.page.attachedFiles.find(x => x.id === props.block.fileId) ?? null;
});

</script>
