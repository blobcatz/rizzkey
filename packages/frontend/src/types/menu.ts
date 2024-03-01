/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as rizzkey from 'rizzkey-js';
import { ComputedRef, Ref } from 'vue';

export type MenuAction = (ev: MouseEvent) => void;

export type MenuDivider = { type: 'divider' };
export type MenuNull = undefined;
export type MenuLabel = { type: 'label', text: string };
export type MenuLink = { type: 'link', to: string, text: string, icon?: string, indicate?: boolean, avatar?: rizzkey.entities.User };
export type MenuA = { type: 'a', href: string, target?: string, download?: string, text: string, icon?: string, indicate?: boolean };
export type MenuUser = { type: 'user', user: rizzkey.entities.User, active?: boolean, indicate?: boolean, action: MenuAction };
export type MenuSwitch = { type: 'switch', ref: Ref<boolean>, text: string, disabled?: boolean | Ref<boolean> };
export type MenuButton = { type?: 'button', text: string, icon?: string, indicate?: boolean, danger?: boolean, active?: boolean | ComputedRef<boolean>, avatar?: rizzkey.entities.User; action: MenuAction };
export type MenuParent = { type: 'parent', text: string, icon?: string, children: MenuItem[] | (() => Promise<MenuItem[]> | MenuItem[]) };

export type MenuPending = { type: 'pending' };

type OuterMenuItem = MenuDivider | MenuNull | MenuLabel | MenuLink | MenuA | MenuUser | MenuSwitch | MenuButton | MenuParent;
type OuterPromiseMenuItem = Promise<MenuLabel | MenuLink | MenuA | MenuUser | MenuSwitch | MenuButton | MenuParent>;
export type MenuItem = OuterMenuItem | OuterPromiseMenuItem;
export type InnerMenuItem = MenuDivider | MenuPending | MenuLabel | MenuLink | MenuA | MenuUser | MenuSwitch | MenuButton | MenuParent;
