<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow
	ref="window"
	:initialWidth="800"
	:initialHeight="500"
	:canResize="true"
	@closed="emit('closed')"
>
	<template #header>
		{{ i18n.ts.drive }}
	</template>
	<XDrive :initialFolder="initialFolder"/>
</MkWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as rizzkey from 'rizzkey-js';
import XDrive from '@/components/MkDrive.vue';
import MkWindow from '@/components/MkWindow.vue';
import { i18n } from '@/i18n.js';

defineProps<{
	initialFolder?: rizzkey.entities.DriveFolder;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();
</script>
