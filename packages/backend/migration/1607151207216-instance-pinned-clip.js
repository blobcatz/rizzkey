/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class instancePinnedClip1607151207216 {
    constructor() {
        this.name = 'instancePinnedClip1607151207216';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "pinnedClipId" character varying(32)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "pinnedClipId"`);
    }
}
