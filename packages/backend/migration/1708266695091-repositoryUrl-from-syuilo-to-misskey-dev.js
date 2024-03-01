/*
 * SPDX-FileCopyrightText: syuilo and rizzkey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RepositoryUrlFromSyuiloTorizzkeyDev1708266695091 {
    name = 'RepositoryUrlFromSyuiloTorizzkeyDev1708266695091'

    async up(queryRunner) {
        await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/misskey-dev/misskey' WHERE "repositoryUrl" = 'https://github.com/syuilo/rizzkey'`);
    }

    async down(queryRunner) {
        // no valid down migration
    }
}
