const purge = require('../../../src/api/logic/jobs/purge');
const _noop = require('lodash/noop');
const sinon = require('sinon');
const config = require('config');

const getResources = () => {
	return {
		models: {
			Cache: {
				remove: _noop
			}
		}
	};
};

describe('Jobs test cases', () => {

	describe('Purge cache test cases', () => {

		const purgeInterval = config.get('cache.purgeInterval');

		test('Should wait till the job is done', async () => {
			const resources = getResources();

			const mockCache = sinon.mock(resources.models.Cache);

			mockCache.expects('remove')
				.once()
				.returns(Promise.resolve(true));

			return new Promise(async (resolve) => {
				await purge.init(resources).start(() => {
					mockCache.verify();
					resolve();
				});
			});
		}, purgeInterval * 2);

	});

});