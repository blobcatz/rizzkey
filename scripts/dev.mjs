/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

await execa('pnpm', ['clean'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

await execa('pnpm', ['build-pre'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

await execa('pnpm', ['build-assets'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

await execa('pnpm', ['--filter', 'rizzkey-js', 'ts'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

await execa('pnpm', ['--filter', 'rizzkey-reversi', 'build:tsc'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

await execa('pnpm', ['--filter', 'rizzkey-bubble-game', 'build:tsc'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['build-pre', '--watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['build-assets', '--watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'backend', 'dev'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'frontend', process.env.MK_DEV_PREFER === 'backend' ? 'watch' : 'dev'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'sw', 'watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'rizzkey-js', 'watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'rizzkey-reversi', 'watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});

execa('pnpm', ['--filter', 'rizzkey-bubble-game', 'watch'], {
	cwd: _dirname + '/../',
	stdout: process.stdout,
	stderr: process.stderr,
});
