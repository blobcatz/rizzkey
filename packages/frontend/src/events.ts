/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EventEmitter } from 'eventemitter3';
import * as rizzkey from 'rizzkey-js';

export const globalEvents = new EventEmitter<{
	themeChanged: () => void;
	clientNotification: (notification: rizzkey.entities.Notification) => void;
	requestClearPageCache: () => void;
}>();
