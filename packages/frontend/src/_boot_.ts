/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// https://vitejs.dev/config/build-options.html#build-modulepreload
import 'vite/modulepreload-polyfill';

import '@/style.scss';
import { mainBoot } from '@/boot/main-boot.js';
import { subBoot } from '@/boot/sub-boot.js';

const subBootPaths = ['/share', '/auth', '/miauth', '/signup-complete'];

if (subBootPaths.some(i => location.pathname === i || location.pathname.startsWith(i + '/'))) {
	subBoot();
} else {
	mainBoot();
}
