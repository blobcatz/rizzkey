/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'probe-image-size' {
	import type { ReadStream } from 'node:fs';

	type ProbeOptions = {
		retries: 1;
		timeout: 30000;
	};

	type ProbeResult = {
		width: number;
		height: number;
		length?: number;
		type: string;
		mime: string;
		wUnits: 'in' | 'mm' | 'cm' | 'pt' | 'pc' | 'px' | 'em' | 'ex';
		hUnits: 'in' | 'mm' | 'cm' | 'pt' | 'pc' | 'px' | 'em' | 'ex';
		url?: string;
	};

	function probeImageSize(src: string | ReadStream, options?: ProbeOptions): Promise<ProbeResult>;
	function probeImageSize(src: string | ReadStream, callback: (err: Error | null, result?: ProbeResult) => void): void;
	function probeImageSize(src: string | ReadStream, options: ProbeOptions, callback: (err: Error | null, result?: ProbeResult) => void): void;

	namespace probeImageSize {} // Hack

	export = probeImageSize;
}
