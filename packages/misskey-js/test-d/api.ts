import { expectType } from 'tsd';
import * as rizzkey from '../src/index.js';

describe('API', () => {
	test('success', async () => {
		const cli = new rizzkey.api.APIClient({
			origin: 'https://rizzkey.test',
			credential: 'TOKEN'
		});
		const res = await cli.request('meta', { detail: true });
		expectType<rizzkey.entities.MetaResponse>(res);
	});

	test('conditional respose type (meta)', async () => {
		const cli = new rizzkey.api.APIClient({
			origin: 'https://rizzkey.test',
			credential: 'TOKEN'
		});

		const res = await cli.request('meta', { detail: true });
		expectType<rizzkey.entities.MetaResponse>(res);

		const res2 = await cli.request('meta', { detail: false });
		expectType<rizzkey.entities.MetaResponse>(res2);

		const res3 = await cli.request('meta', { });
		expectType<rizzkey.entities.MetaResponse>(res3);

		const res4 = await cli.request('meta', { detail: true as boolean });
		expectType<rizzkey.entities.MetaResponse>(res4);
	});

	test('conditional respose type (users/show)', async () => {
		const cli = new rizzkey.api.APIClient({
			origin: 'https://rizzkey.test',
			credential: 'TOKEN'
		});

		const res = await cli.request('users/show', { userId: 'xxxxxxxx' });
		expectType<rizzkey.entities.UserDetailed>(res);

		const res2 = await cli.request('users/show', { userIds: ['xxxxxxxx'] });
		expectType<rizzkey.entities.UserDetailed[]>(res2);
	});
});
