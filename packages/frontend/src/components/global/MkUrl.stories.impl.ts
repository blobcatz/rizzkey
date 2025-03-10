/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { StoryObj } from '@storybook/vue3';
import { HttpResponse, http } from 'msw';
import { commonHandlers } from '../../../.storybook/mocks.js';
import MkUrl from './MkUrl.vue';
export const Default = {
	render(args) {
		return {
			components: {
				MkUrl,
			},
			setup() {
				return {
					args,
				};
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
			},
			template: '<MkUrl v-bind="props">Text</MkUrl>',
		};
	},
	async play({ canvasElement }) {
		const canvas = within(canvasElement);
		const a = canvas.getByRole<HTMLAnchorElement>('link');
		await expect(a).toHaveAttribute('href', 'https://misskey-hub.net/');
		await waitFor(() => userEvent.hover(a));
		/*
		await tick(); // FIXME: wait for network request
		const anchors = canvas.getAllByRole<HTMLAnchorElement>('link');
		const popup = anchors.find(anchor => anchor !== a)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		await expect(popup).toBeInTheDocument();
		await expect(popup).toHaveAttribute('href', 'https://misskey-hub.net/');
		await expect(popup).toHaveTextContent('rizzkey Hub');
		await expect(popup).toHaveTextContent('rizzkeyはオープンソースの分散型ソーシャルネットワーキングプラットフォームです。');
		await expect(popup).toHaveTextContent('misskey-hub.net');
		const icon = within(popup).getByRole('img');
		await expect(icon).toBeInTheDocument();
		await expect(icon).toHaveAttribute('src', 'https://misskey-hub.net/favicon.ico');
		 */
		await waitFor(() => userEvent.unhover(a));
	},
	args: {
		url: 'https://misskey-hub.net/',
	},
	parameters: {
		layout: 'centered',
		msw: {
			handlers: [
				...commonHandlers,
				http.get('/url', () => {
					return HttpResponse.json({
						title: 'rizzkey Hub',
						icon: 'https://misskey-hub.net/favicon.ico',
						description: 'rizzkeyはオープンソースの分散型ソーシャルネットワーキングプラットフォームです。',
						thumbnail: null,
						player: {
							url: null,
							width: null,
							height: null,
							allow: [],
						},
						sitename: 'misskey-hub.net',
						sensitive: false,
						url: 'https://misskey-hub.net/',
					});
				}),
			],
		},
	},
} satisfies StoryObj<typeof MkUrl>;
