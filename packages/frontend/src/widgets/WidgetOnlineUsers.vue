<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div data-cy-mkw-onlineUsers :class="[$style.root, { _panel: !widgetProps.transparent, [$style.pad]: !widgetProps.transparent }]">
	<span :class="$style.text">
		<I18n v-if="onlineUsersCount" :src="i18n.ts.onlineUsersCount" textTag="span">
			<template #n><b style="color: #41b781;">{{ number(onlineUsersCount) }}</b></template>
		</I18n>
	</span>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useWidgetPropsManager, WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import { GetFormResultType } from '@/scripts/form.js';
import { rizzkeyApi, rizzkeyApiGet } from '@/scripts/rizzkey-api.js';
import { useInterval } from '@/scripts/use-interval.js';
import { i18n } from '@/i18n.js';
import number from '@/filters/number.js';

const name = 'onlineUsers';

const widgetPropsDef = {
	transparent: {
		type: 'boolean' as const,
		default: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

const onlineUsersCount = ref(0);

const tick = () => {
	rizzkeyApiGet('get-online-users-count').then(res => {
		onlineUsersCount.value = res.count;
	});
};

useInterval(tick, 1000 * 15, {
	immediate: true,
	afterMounted: true,
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" module>
.root {
	text-align: center;

	&.pad {
		padding: 16px 0;
	}
}

.text {
	color: var(--fgTransparentWeak);
}
</style>
