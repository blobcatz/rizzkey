/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// TODO: なんでもかんでもos.tsに突っ込むのやめたいのでよしなに分割する

import { Component, markRaw, Ref, ref, defineAsyncComponent } from 'vue';
import { EventEmitter } from 'eventemitter3';
import * as rizzkey from 'rizzkey-js';
import type { ComponentProps as CP } from 'vue-component-type-helpers';
import type { Form, GetFormResultType } from '@/scripts/form.js';
import { rizzkeyApi } from '@/scripts/rizzkey-api.js';
import { i18n } from '@/i18n.js';
import MkPostFormDialog from '@/components/MkPostFormDialog.vue';
import MkWaitingDialog from '@/components/MkWaitingDialog.vue';
import MkPageWindow from '@/components/MkPageWindow.vue';
import MkToast from '@/components/MkToast.vue';
import MkDialog from '@/components/MkDialog.vue';
import MkPasswordDialog from '@/components/MkPasswordDialog.vue';
import MkEmojiPickerDialog from '@/components/MkEmojiPickerDialog.vue';
import MkPopupMenu from '@/components/MkPopupMenu.vue';
import MkContextMenu from '@/components/MkContextMenu.vue';
import { MenuItem } from '@/types/menu.js';
import copyToClipboard from '@/scripts/copy-to-clipboard.js';
import { showMovedDialog } from '@/scripts/show-moved-dialog.js';

export const openingWindowsCount = ref(0);

export const apiWithDialog = (<E extends keyof rizzkey.Endpoints = keyof rizzkey.Endpoints, P extends rizzkey.Endpoints[E]['req'] = rizzkey.Endpoints[E]['req']>(
	endpoint: E,
	data: P = {} as any,
	token?: string | null | undefined,
) => {
	const promise = rizzkeyApi(endpoint, data, token);
	promiseDialog(promise, null, async (err) => {
		let title: string | undefined;
		let text = err.message + '\n' + err.id;
		if (err.code === 'INTERNAL_ERROR') {
			title = i18n.ts.internalServerError;
			text = i18n.ts.internalServerErrorDescription;
			const date = new Date().toISOString();
			const { result } = await actions({
				type: 'error',
				title,
				text,
				actions: [{
					value: 'ok',
					text: i18n.ts.gotIt,
					primary: true,
				}, {
					value: 'copy',
					text: i18n.ts.copyErrorInfo,
				}],
			});
			if (result === 'copy') {
				copyToClipboard(`Endpoint: ${endpoint}\nInfo: ${JSON.stringify(err.info)}\nDate: ${date}`);
				success();
			}
			return;
		} else if (err.code === 'RATE_LIMIT_EXCEEDED') {
			title = i18n.ts.cannotPerformTemporary;
			text = i18n.ts.cannotPerformTemporaryDescription;
		} else if (err.code === 'INVALID_PARAM') {
			title = i18n.ts.invalidParamError;
			text = i18n.ts.invalidParamErrorDescription;
		} else if (err.code === 'ROLE_PERMISSION_DENIED') {
			title = i18n.ts.permissionDeniedError;
			text = i18n.ts.permissionDeniedErrorDescription;
		} else if (err.code.startsWith('TOO_MANY')) {
			title = i18n.ts.youCannotCreateAnymore;
			text = `${i18n.ts.error}: ${err.id}`;
		} else if (err.message.startsWith('Unexpected token')) {
			title = i18n.ts.gotInvalidResponseError;
			text = i18n.ts.gotInvalidResponseErrorDescription;
		}
		alert({
			type: 'error',
			title,
			text,
		});
	});

	return promise;
}) as typeof rizzkeyApi;

export function promiseDialog<T extends Promise<any>>(
	promise: T,
	onSuccess?: ((res: any) => void) | null,
	onFailure?: ((err: rizzkey.api.APIError) => void) | null,
	text?: string,
): T {
	const showing = ref(true);
	const success = ref(false);

	promise.then(res => {
		if (onSuccess) {
			showing.value = false;
			onSuccess(res);
		} else {
			success.value = true;
			window.setTimeout(() => {
				showing.value = false;
			}, 1000);
		}
	}).catch(err => {
		showing.value = false;
		if (onFailure) {
			onFailure(err);
		} else {
			alert({
				type: 'error',
				text: err,
			});
		}
	});

	// NOTE: dynamic importすると挙動がおかしくなる(showingの変更が伝播しない)
	popup(MkWaitingDialog, {
		success: success,
		showing: showing,
		text: text,
	}, {}, 'closed');

	return promise;
}

let popupIdCount = 0;
export const popups = ref([]) as Ref<{
	id: number;
	component: Component;
	props: Record<string, any>;
	events: Record<string, any>;
}[]>;

const zIndexes = {
	veryLow: 500000,
	low: 1000000,
	middle: 2000000,
	high: 3000000,
};
export function claimZIndex(priority: keyof typeof zIndexes = 'low'): number {
	zIndexes[priority] += 100;
	return zIndexes[priority];
}

// InstanceType<typeof Component>['$emit'] だとインターセクション型が返ってきて
// 使い物にならないので、代わりに ['$props'] から色々省くことで emit の型を生成する
// FIXME: 何故か *.ts ファイルからだと型がうまく取れない？ことがあるのをなんとかしたい
type ComponentEmit<T> = T extends new () => { $props: infer Props }
	? [keyof Pick<T, Extract<keyof T, `on${string}`>>] extends [never]
		? Record<string, unknown> // *.ts ファイルから型がうまく取れないとき用（これがないと {} になって型エラーがうるさい）
		: EmitsExtractor<Props>
	: T extends (...args: any) => any
		? ReturnType<T> extends { [x: string]: any; __ctx?: { [x: string]: any; props: infer Props } }
			? [keyof Pick<T, Extract<keyof T, `on${string}`>>] extends [never]
				? Record<string, unknown>
				: EmitsExtractor<Props>
			: never
		: never;

// props に ref を許可するようにする
type ComponentProps<T extends Component> = { [K in keyof CP<T>]: CP<T>[K] | Ref<CP<T>[K]> };

type EmitsExtractor<T> = {
	[K in keyof T as K extends `onVnode${string}` ? never : K extends `on${infer E}` ? Uncapitalize<E> : K extends string ? never : K]: T[K];
};

export async function popup<T extends Component>(
	component: T,
	props: ComponentProps<T>,
	events: ComponentEmit<T> = {} as ComponentEmit<T>,
	disposeEvent?: keyof ComponentEmit<T>,
): Promise<{ dispose: () => void }> {
	markRaw(component);

	const id = ++popupIdCount;
	const dispose = () => {
		// このsetTimeoutが無いと挙動がおかしくなる(autocompleteが閉じなくなる)。Vueのバグ？
		window.setTimeout(() => {
			popups.value = popups.value.filter(popup => popup.id !== id);
		}, 0);
	};
	const state = {
		component,
		props,
		events: disposeEvent ? {
			...events,
			[disposeEvent]: dispose,
		} : events,
		id,
	};

	popups.value.push(state);

	return {
		dispose,
	};
}

export function pageWindow(path: string) {
	popup(MkPageWindow, {
		initialPath: path,
	}, {}, 'closed');
}

export function toast(message: string) {
	popup(MkToast, {
		message,
	}, {}, 'closed');
}

export function alert(props: {
	type?: 'error' | 'info' | 'success' | 'warning' | 'waiting' | 'question';
	title?: string;
	text?: string;
}): Promise<void> {
	return new Promise(resolve => {
		popup(MkDialog, props, {
			done: () => {
				resolve();
			},
		}, 'closed');
	});
}

export function confirm(props: {
	type: 'error' | 'info' | 'success' | 'warning' | 'waiting' | 'question';
	title?: string;
	text?: string;
	okText?: string;
	cancelText?: string;
}): Promise<{ canceled: boolean }> {
	return new Promise(resolve => {
		popup(MkDialog, {
			...props,
			showCancelButton: true,
		}, {
			done: result => {
				resolve(result ? result : { canceled: true });
			},
		}, 'closed');
	});
}

// TODO: const T extends ... にしたい
// https://zenn.dev/general_link/articles/813e47b7a0eef7#const-type-parameters
export function actions<T extends {
	value: string;
	text: string;
	primary?: boolean,
	danger?: boolean,
}[]>(props: {
	type: 'error' | 'info' | 'success' | 'warning' | 'waiting' | 'question';
	title?: string;
	text?: string;
	actions: T;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: T[number]['value'];
}> {
	return new Promise(resolve => {
		popup(MkDialog, {
			...props,
			actions: props.actions.map(a => ({
				text: a.text,
				primary: a.primary,
				danger: a.danger,
				callback: () => {
					resolve({ canceled: false, result: a.value });
				},
			})),
		}, {
			done: result => {
				resolve(result ? result : { canceled: true });
			},
		}, 'closed');
	});
}

// default が指定されていたら result は null になり得ないことを保証する overload function
export function inputText(props: {
	type?: 'text' | 'email' | 'password' | 'url';
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default: string;
	minLength?: number;
	maxLength?: number;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: string;
}>;
export function inputText(props: {
	type?: 'text' | 'email' | 'password' | 'url';
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default?: string | null;
	minLength?: number;
	maxLength?: number;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: string | null;
}>;
export function inputText(props: {
	type?: 'text' | 'email' | 'password' | 'url';
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default?: string | null;
	minLength?: number;
	maxLength?: number;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: string | null;
}> {
	return new Promise(resolve => {
		popup(MkDialog, {
			title: props.title,
			text: props.text,
			input: {
				type: props.type,
				placeholder: props.placeholder,
				autocomplete: props.autocomplete,
				default: props.default ?? null,
				minLength: props.minLength,
				maxLength: props.maxLength,
			},
		}, {
			done: result => {
				resolve(result ? result : { canceled: true });
			},
		}, 'closed');
	});
}

// default が指定されていたら result は null になり得ないことを保証する overload function
export function inputNumber(props: {
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default: number;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: number;
}>;
export function inputNumber(props: {
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default?: number | null;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: number | null;
}>;
export function inputNumber(props: {
	title?: string;
	text?: string;
	placeholder?: string | null;
	autocomplete?: string;
	default?: number | null;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: number | null;
}> {
	return new Promise(resolve => {
		popup(MkDialog, {
			title: props.title,
			text: props.text,
			input: {
				type: 'number',
				placeholder: props.placeholder,
				autocomplete: props.autocomplete,
				default: props.default ?? null,
			},
		}, {
			done: result => {
				resolve(result ? result : { canceled: true });
			},
		}, 'closed');
	});
}

export function inputDate(props: {
	title?: string;
	text?: string;
	placeholder?: string | null;
	default?: string | null;
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: Date;
}> {
	return new Promise(resolve => {
		popup(MkDialog, {
			title: props.title,
			text: props.text,
			input: {
				type: 'date',
				placeholder: props.placeholder,
				default: props.default ?? null,
			},
		}, {
			done: result => {
				resolve(result ? { result: new Date(result.result), canceled: false } : { result: undefined, canceled: true });
			},
		}, 'closed');
	});
}

export function authenticateDialog(): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: { password: string; token: string | null; };
}> {
	return new Promise(resolve => {
		popup(MkPasswordDialog, {}, {
			done: result => {
				resolve(result ? { canceled: false, result } : { canceled: true, result: undefined });
			},
		}, 'closed');
	});
}

// default が指定されていたら result は null になり得ないことを保証する overload function
export function select<C = any>(props: {
	title?: string;
	text?: string;
	default: string;
	items: {
		value: C;
		text: string;
	}[];
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: C;
}>;
export function select<C = any>(props: {
	title?: string;
	text?: string;
	default?: string | null;
	items: {
		value: C;
		text: string;
	}[];
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: C | null;
}>;
export function select<C = any>(props: {
	title?: string;
	text?: string;
	default?: string | null;
	items: {
		value: C;
		text: string;
	}[];
}): Promise<{
	canceled: true; result: undefined;
} | {
	canceled: false; result: C | null;
}> {
	return new Promise(resolve => {
		popup(MkDialog, {
			title: props.title,
			text: props.text,
			select: {
				items: props.items,
				default: props.default ?? null,
			},
		}, {
			done: result => {
				resolve(result ? result : { canceled: true });
			},
		}, 'closed');
	});
}

export function success(): Promise<void> {
	return new Promise(resolve => {
		const showing = ref(true);
		window.setTimeout(() => {
			showing.value = false;
		}, 1000);
		popup(MkWaitingDialog, {
			success: true,
			showing: showing,
		}, {
			done: () => resolve(),
		}, 'closed');
	});
}

export function waiting(): Promise<void> {
	return new Promise(resolve => {
		const showing = ref(true);
		popup(MkWaitingDialog, {
			success: false,
			showing: showing,
		}, {
			done: () => resolve(),
		}, 'closed');
	});
}

export function form<F extends Form>(title: string, f: F): Promise<{ canceled: true } | { result: GetFormResultType<F> }> {
	return new Promise(resolve => {
		popup(defineAsyncComponent(() => import('@/components/MkFormDialog.vue')), { title, form: f }, {
			done: result => {
				resolve(result);
			},
		}, 'closed');
	});
}

export async function selectUser(opts: { includeSelf?: boolean; localOnly?: boolean; } = {}): Promise<rizzkey.entities.UserDetailed> {
	return new Promise(resolve => {
		popup(defineAsyncComponent(() => import('@/components/MkUserSelectDialog.vue')), {
			includeSelf: opts.includeSelf,
			localOnly: opts.localOnly,
		}, {
			ok: user => {
				resolve(user);
			},
		}, 'closed');
	});
}

export async function selectDriveFile(multiple: boolean): Promise<rizzkey.entities.DriveFile[]> {
	return new Promise(resolve => {
		popup(defineAsyncComponent(() => import('@/components/MkDriveSelectDialog.vue')), {
			type: 'file',
			multiple,
		}, {
			done: files => {
				if (files) {
					resolve(files);
				}
			},
		}, 'closed');
	});
}

export async function selectDriveFolder(multiple: boolean): Promise<rizzkey.entities.DriveFolder[]> {
	return new Promise(resolve => {
		popup(defineAsyncComponent(() => import('@/components/MkDriveSelectDialog.vue')), {
			type: 'folder',
			multiple,
		}, {
			done: folders => {
				if (folders) {
					resolve(folders);
				}
			},
		}, 'closed');
	});
}

export async function pickEmoji(src: HTMLElement, opts: ComponentProps<typeof MkEmojiPickerDialog>): Promise<string> {
	return new Promise(resolve => {
		popup(MkEmojiPickerDialog, {
			src,
			...opts,
		}, {
			done: emoji => {
				resolve(emoji);
			},
		}, 'closed');
	});
}

export async function cropImage(image: rizzkey.entities.DriveFile, options: {
	aspectRatio: number;
	uploadFolder?: string | null;
}): Promise<rizzkey.entities.DriveFile> {
	return new Promise(resolve => {
		popup(defineAsyncComponent(() => import('@/components/MkCropperDialog.vue')), {
			file: image,
			aspectRatio: options.aspectRatio,
			uploadFolder: options.uploadFolder,
		}, {
			ok: x => {
				resolve(x);
			},
		}, 'closed');
	});
}

export function popupMenu(items: MenuItem[], src?: HTMLElement | EventTarget | null, options?: {
	align?: string;
	width?: number;
	viaKeyboard?: boolean;
	onClosing?: () => void;
}): Promise<void> {
	return new Promise(resolve => {
		let dispose;
		popup(MkPopupMenu, {
			items,
			src,
			width: options?.width,
			align: options?.align,
			viaKeyboard: options?.viaKeyboard,
		}, {
			closed: () => {
				resolve();
				dispose();
			},
			closing: () => {
				if (options?.onClosing) options.onClosing();
			},
		}).then(res => {
			dispose = res.dispose;
		});
	});
}

export function contextMenu(items: MenuItem[], ev: MouseEvent): Promise<void> {
	ev.preventDefault();
	return new Promise(resolve => {
		let dispose;
		popup(MkContextMenu, {
			items,
			ev,
		}, {
			closed: () => {
				resolve();
				dispose();
			},
		}).then(res => {
			dispose = res.dispose;
		});
	});
}

export function post(props: Record<string, any> = {}): Promise<void> {
	showMovedDialog();

	return new Promise(resolve => {
		// NOTE: MkPostFormDialogをdynamic importするとiOSでテキストエリアに自動フォーカスできない
		// NOTE: ただ、dynamic importしない場合、MkPostFormDialogインスタンスが使いまわされ、
		//       Vueが渡されたコンポーネントに内部的に__propsというプロパティを生やす影響で、
		//       複数のpost formを開いたときに場合によってはエラーになる
		//       もちろん複数のpost formを開けること自体rizzkeyサイドのバグなのだが
		let dispose;
		popup(MkPostFormDialog, props, {
			closed: () => {
				resolve();
				dispose();
			},
		}).then(res => {
			dispose = res.dispose;
		});
	});
}

export const deckGlobalEvents = new EventEmitter();

/*
export function checkExistence(fileData: ArrayBuffer): Promise<any> {
	return new Promise((resolve, reject) => {
		const data = new FormData();
		data.append('md5', getMD5(fileData));

		api('drive/files/find-by-hash', {
			md5: getMD5(fileData)
		}).then(resp => {
			resolve(resp.length > 0 ? resp[0] : null);
		});
	});
}*/
