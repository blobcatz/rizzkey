<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_panel">
	<div :class="$style.container" :style="{ backgroundImage: instance.bannerUrl ? `url(${ instance.bannerUrl })` : null }">
		<div :class="$style.iconContainer">
			<img :src="instance.iconUrl ?? instance.faviconUrl ?? '/favicon.ico'" alt="" :class="$style.icon"/>
		</div>
		<div :class="$style.bodyContainer">
			<div :class="$style.body">
				<MkA :class="$style.name" to="/about" behavior="window">{{ instance.name }}</MkA>
				<div :class="$style.host">{{ host }}</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import { GetFormResultType } from '@/scripts/form.js';
import { host } from '@/config.js';
import { instance } from '@/instance.js';

const name = 'instanceInfo';

const widgetPropsDef = {
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" module>
.container {
	position: relative;
	background-size: cover;
	background-position: center;
	display: flex;
}

.iconContainer {
	display: inline-block;
	text-align: center;
	padding: 16px;
}

.icon {
	display: inline-block;
	width: 60px;
	height: 60px;
	border-radius: 8px;
	box-sizing: border-box;
	border: solid 3px #fff;
}

.bodyContainer {
	display: flex;
	align-items: center;
	min-width: 0;
	padding: 0 16px 0 0;
}

.body {
	text-overflow: ellipsis;
	overflow: clip;
}

.name {
	color: #fff;
	filter: drop-shadow(0 0 4px #000);
	font-weight: bold;
}

.host {
	color: #fff;
	filter: drop-shadow(0 0 4px #000);
}
</style>
