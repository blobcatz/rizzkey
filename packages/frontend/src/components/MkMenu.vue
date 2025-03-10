<!--
SPDX-FileCopyrightText: syuilo and rizzkey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div role="menu">
	<div
		ref="itemsEl" v-hotkey="keymap"
		class="_popup _shadow"
		:class="[$style.root, { [$style.center]: align === 'center', [$style.asDrawer]: asDrawer }]"
		:style="{ width: (width && !asDrawer) ? width + 'px' : '', maxHeight: maxHeight ? maxHeight + 'px' : '' }"
		@contextmenu.self="e => e.preventDefault()"
	>
		<template v-for="(item, i) in (items2 ?? [])">
			<div v-if="item.type === 'divider'" role="separator" :class="$style.divider"></div>
			<span v-else-if="item.type === 'label'" role="menuitem" :class="[$style.label, $style.item]">
				<span style="opacity: 0.7;">{{ item.text }}</span>
			</span>
			<span v-else-if="item.type === 'pending'" role="menuitem" :tabindex="i" :class="[$style.pending, $style.item]">
				<span><MkEllipsis/></span>
			</span>
			<MkA v-else-if="item.type === 'link'" role="menuitem" :to="item.to" :tabindex="i" class="_button" :class="$style.item" @click.passive="close(true)" @mouseenter.passive="onItemMouseEnter(item)" @mouseleave.passive="onItemMouseLeave(item)">
				<i v-if="item.icon" class="ti-fw" :class="[$style.icon, item.icon]"></i>
				<MkAvatar v-if="item.avatar" :user="item.avatar" :class="$style.avatar"/>
				<div :class="$style.item_content">
					<span :class="$style.item_content_text">{{ item.text }}</span>
					<span v-if="item.indicate" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
				</div>
			</MkA>
			<a v-else-if="item.type === 'a'" role="menuitem" :href="item.href" :target="item.target" :download="item.download" :tabindex="i" class="_button" :class="$style.item" @click="close(true)" @mouseenter.passive="onItemMouseEnter(item)" @mouseleave.passive="onItemMouseLeave(item)">
				<i v-if="item.icon" class="ti-fw" :class="[$style.icon, item.icon]"></i>
				<div :class="$style.item_content">
					<span :class="$style.item_content_text">{{ item.text }}</span>
					<span v-if="item.indicate" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
				</div>
			</a>
			<button v-else-if="item.type === 'user'" role="menuitem" :tabindex="i" class="_button" :class="[$style.item, { [$style.active]: item.active }]" :disabled="item.active" @click="clicked(item.action, $event)" @mouseenter.passive="onItemMouseEnter(item)" @mouseleave.passive="onItemMouseLeave(item)">
				<MkAvatar :user="item.user" :class="$style.avatar"/><MkUserName :user="item.user"/>
				<div v-if="item.indicate" :class="$style.item_content">
					<span :class="$style.indicator"><i class="_indicatorCircle"></i></span>
				</div>
			</button>
			<button v-else-if="item.type === 'switch'" role="menuitemcheckbox" :tabindex="i" class="_button" :class="[$style.item, $style.switch, { [$style.switchDisabled]: item.disabled } ]" @click="switchItem(item)" @mouseenter.passive="onItemMouseEnter(item)" @mouseleave.passive="onItemMouseLeave(item)">
				<MkSwitchButton :class="$style.switchButton" :checked="item.ref" :disabled="item.disabled" @toggle="switchItem(item)"/>
				<div :class="$style.item_content">
					<span :class="[$style.item_content_text, $style.switchText]">{{ item.text }}</span>
				</div>
			</button>
			<button v-else-if="item.type === 'parent'" class="_button" role="menuitem" :tabindex="i" :class="[$style.item, $style.parent, { [$style.childShowing]: childShowingItem === item }]" @mouseenter="preferClick ? null : showChildren(item, $event)" @click="!preferClick ? null : showChildren(item, $event)">
				<i v-if="item.icon" class="ti-fw" :class="[$style.icon, item.icon]" style="pointer-events: none;"></i>
				<div :class="$style.item_content">
					<span :class="$style.item_content_text" style="pointer-events: none;">{{ item.text }}</span>
					<span :class="$style.caret" style="pointer-events: none;"><i class="ti ti-chevron-right ti-fw"></i></span>
				</div>
			</button>
			<button v-else :tabindex="i" class="_button" role="menuitem" :class="[$style.item, { [$style.danger]: item.danger, [$style.active]: getValue(item.active) }]" :disabled="getValue(item.active)" @click="clicked(item.action, $event)" @mouseenter.passive="onItemMouseEnter(item)" @mouseleave.passive="onItemMouseLeave(item)">
				<i v-if="item.icon" class="ti-fw" :class="[$style.icon, item.icon]"></i>
				<MkAvatar v-if="item.avatar" :user="item.avatar" :class="$style.avatar"/>
				<div :class="$style.item_content">
					<span :class="$style.item_content_text">{{ item.text }}</span>
					<span v-if="item.indicate" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
				</div>
			</button>
		</template>
		<span v-if="items2 == null || items2.length === 0" :class="[$style.none, $style.item]">
			<span>{{ i18n.ts.none }}</span>
		</span>
	</div>
	<div v-if="childMenu">
		<XChild ref="child" :items="childMenu" :targetElement="childTarget!" :rootElement="itemsEl!" showing @actioned="childActioned" @close="close(false)"/>
	</div>
</div>
</template>

<script lang="ts">
import { ComputedRef, computed, defineAsyncComponent, isRef, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { focusPrev, focusNext } from '@/scripts/focus.js';
import MkSwitchButton from '@/components/MkSwitch.button.vue';
import { MenuItem, InnerMenuItem, MenuPending, MenuAction, MenuSwitch, MenuParent } from '@/types/menu.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { isTouchUsing } from '@/scripts/touch.js';

const childrenCache = new WeakMap<MenuParent, MenuItem[]>();
</script>

<script lang="ts" setup>
const XChild = defineAsyncComponent(() => import('./MkMenu.child.vue'));

const props = defineProps<{
	items: MenuItem[];
	viaKeyboard?: boolean;
	asDrawer?: boolean;
	align?: 'center' | string;
	width?: number;
	maxHeight?: number;
}>();

const emit = defineEmits<{
	(ev: 'close', actioned?: boolean): void;
	(ev: 'hide'): void;
}>();

const itemsEl = shallowRef<HTMLDivElement>();

const items2 = ref<InnerMenuItem[]>();

const child = shallowRef<InstanceType<typeof XChild>>();

const keymap = computed(() => ({
	'up|k|shift+tab': focusUp,
	'down|j|tab': focusDown,
	'esc': close,
}));

const childShowingItem = ref<MenuItem | null>();

let preferClick = isTouchUsing || props.asDrawer;

watch(() => props.items, () => {
	const items = [...props.items].filter(item => item !== undefined) as (NonNullable<MenuItem> | MenuPending)[];

	for (let i = 0; i < items.length; i++) {
		const item = items[i];

		if ('then' in item) { // if item is Promise
			items[i] = { type: 'pending' };
			item.then(actualItem => {
				if (items2.value?.[i]) items2.value[i] = actualItem;
			});
		}
	}

	items2.value = items as InnerMenuItem[];
}, {
	immediate: true,
});

const childMenu = ref<MenuItem[] | null>();
const childTarget = shallowRef<HTMLElement | null>();

function closeChild() {
	childMenu.value = null;
	childShowingItem.value = null;
}

function childActioned() {
	closeChild();
	close(true);
}

const onGlobalMousedown = (event: MouseEvent) => {
	if (childTarget.value && (event.target === childTarget.value || childTarget.value.contains(event.target as Node))) return;
	if (child.value && child.value.checkHit(event)) return;
	closeChild();
};

let childCloseTimer: null | number = null;

function onItemMouseEnter(item) {
	childCloseTimer = window.setTimeout(() => {
		closeChild();
	}, 300);
}

function onItemMouseLeave(item) {
	if (childCloseTimer) window.clearTimeout(childCloseTimer);
}

async function showChildren(item: MenuParent, ev: MouseEvent) {
	const children: MenuItem[] = await (async () => {
		if (childrenCache.has(item)) {
			return childrenCache.get(item)!;
		} else {
			if (typeof item.children === 'function') {
				return Promise.resolve(item.children());
			} else {
				return item.children;
			}
		}
	})();

	childrenCache.set(item, children);

	if (props.asDrawer) {
		os.popupMenu(children, ev.currentTarget ?? ev.target).finally(() => {
			emit('close');
		});
		emit('hide');
	} else {
		childTarget.value = (ev.currentTarget ?? ev.target) as HTMLElement;
		// これでもリアクティビティは保たれる
		childMenu.value = children;
		childShowingItem.value = item;
	}
}

function clicked(fn: MenuAction, ev: MouseEvent) {
	fn(ev);
	close(true);
}

function close(actioned = false) {
	emit('close', actioned);
}

function focusUp() {
	focusPrev(document.activeElement);
}

function focusDown() {
	focusNext(document.activeElement);
}

function switchItem(item: MenuSwitch & { ref: any }) {
	if (item.disabled !== undefined && (typeof item.disabled === 'boolean' ? item.disabled : item.disabled.value)) return;
	item.ref = !item.ref;
}

function getValue<T>(item?: ComputedRef<T> | T) {
	return isRef(item) ? item.value : item;
}

onMounted(() => {
	if (props.viaKeyboard) {
		nextTick(() => {
			if (itemsEl.value) focusNext(itemsEl.value.children[0], true, false);
		});
	}

	// TODO: アクティブな要素までスクロール
	//itemsEl.scrollTo();

	document.addEventListener('mousedown', onGlobalMousedown, { passive: true });
});

onBeforeUnmount(() => {
	document.removeEventListener('mousedown', onGlobalMousedown);
});
</script>

<style lang="scss" module>
.root {
	padding: 8px 0;
	box-sizing: border-box;
	max-width: 100vw;
	min-width: 200px;
	overflow: auto;
	overscroll-behavior: contain;

	&.center {
		> .item {
			text-align: center;
		}
	}

	&.asDrawer {
		padding: 12px 0 max(env(safe-area-inset-bottom, 0px), 12px) 0;
		width: 100%;
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;

		> .item {
			font-size: 1em;
			padding: 12px 24px;

			&:before {
				width: calc(100% - 24px);
				border-radius: 12px;
			}

			> .icon {
				margin-right: 14px;
				width: 24px;
			}
		}

		> .divider {
			margin: 12px 0;
		}
	}
}

.item {
	display: flex;
	align-items: center;
	position: relative;
	padding: 5px 16px;
	width: 100%;
	box-sizing: border-box;
	white-space: nowrap;
	font-size: 0.9em;
	line-height: 20px;
	text-align: left;
	overflow: hidden;
	text-overflow: ellipsis;

	&:before {
		content: "";
		display: block;
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0;
		right: 0;
		margin: auto;
		width: calc(100% - 16px);
		height: 100%;
		border-radius: 6px;
	}

	&:not(:disabled):hover {
		color: var(--accent);
		text-decoration: none;

		&:before {
			background: var(--accentedBg);
		}
	}

	&.danger {
		color: #ff2a2a;

		&:hover {
			color: #fff;

			&:before {
				background: #ff4242;
			}
		}

		&:active {
			color: #fff;

			&:before {
				background: #d42e2e !important;
			}
		}
	}

	&:active,
	&.active {
		color: var(--fgOnAccent) !important;
		opacity: 1;

		&:before {
			background: var(--accent) !important;
		}
	}

	&:not(:active):focus-visible {
		box-shadow: 0 0 0 2px var(--focus) inset;
	}

	&.label {
		pointer-events: none;
		font-size: 0.7em;
		padding-bottom: 4px;
	}

	&.pending {
		pointer-events: none;
		opacity: 0.7;
	}

	&.none {
		pointer-events: none;
		opacity: 0.7;
	}

	&.parent {
		pointer-events: auto;
		display: flex;
		align-items: center;
		cursor: default;

		&.childShowing {
			color: var(--accent);
			text-decoration: none;

			&:before {
				background: var(--accentedBg);
			}
		}
	}
}

.item_content {
	width: 100%;
	max-width: 100vw;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	text-overflow: ellipsis;
}

.item_content_text {
	max-width: calc(100vw - 4rem);
	text-overflow: ellipsis;
	overflow: hidden;
}

.switch {
	position: relative;
	display: flex;
	transition: all 0.2s ease;
	user-select: none;
	cursor: pointer;
}

.switchDisabled {
	cursor: not-allowed;
}

.switchButton {
	margin-left: -2px;
}

.switchText {
	margin-left: 8px;
	margin-top: 2px;
	overflow: hidden;
	text-overflow: ellipsis;
}

.switchInput {
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	margin: 0;
}

.icon {
	margin-right: 8px;
	line-height: 1;
}

.caret {
	margin-left: auto;
}

.avatar {
	margin-right: 5px;
	width: 20px;
	height: 20px;
}

.indicator {
	display: flex;
	align-items: center;
	color: var(--indicator);
	font-size: 12px;
	animation: global-blink 1s infinite;
}

.divider {
	margin: 8px 0;
	border-top: solid 0.5px var(--divider);
}
</style>
