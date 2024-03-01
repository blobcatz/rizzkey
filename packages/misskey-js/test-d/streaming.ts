import { expectType } from 'tsd';
import * as rizzkey from '../src/index.js';

describe('Streaming', () => {
	test('emit type', async () => {
		const stream = new rizzkey.Stream('https://rizzkey.test', { token: 'TOKEN' });
		const mainChannel = stream.useChannel('main');
		mainChannel.on('notification', notification => {
			expectType<rizzkey.entities.Notification>(notification);
		});
	});
});
