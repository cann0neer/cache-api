const cache = require('../../../src/api/logic/controllers/cache');
const _noop = require('lodash/noop');
const sinon = require('sinon');

// given
const key = 'some_key';
const data = 'some data';

const getResources = () => {
	return {
		models: {
			Cache: {
				findAll: _noop,
				upsert: _noop,
				remove: _noop,
				findOne: _noop,
				create: _noop
			}
		}
	};
};

const getParameters = () => {
	return {
		req: {
			params: { key },
			body: { data }
		},
		res: {
			send: _noop
		}
	};
};

describe('Cache controller test cases', () => {

	describe('GetAll test cases', () => {

		test('Should execute successfully', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('findAll')
				.once()
				.returns(Promise.resolve([ { key, data } ]));

			mockRes.expects('send')
				.once()
				.withArgs([ { key, data } ])
				.returns(Promise.resolve(true));

			await cache.init(resources).getAll({}, params.res);

			mockCache.verify();
			mockRes.verify();
		});

	});

	describe('RemoveAll test cases', () => {

		test('Should execute successfully', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('remove')
				.once()
				.returns(Promise.resolve(true));

			mockRes.expects('send')
				.once()
				.withArgs({ success: true })
				.returns(Promise.resolve(true));

			await cache.init(resources).removeAll({}, params.res);

			mockCache.verify();
			mockRes.verify();
		});

	});

	describe('RemoveByKey test cases', () => {

		test('Should execute successfully', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('remove')
				.once()
				.withArgs({ key })
				.returns(Promise.resolve({ n: 1 }));

			mockRes.expects('send')
				.once()
				.withArgs({ success: true })
				.returns(Promise.resolve(true));

			await cache.init(resources).removeByKey(params.req, params.res);

			mockCache.verify();
			mockRes.verify();
		});

	});

	describe('Save test cases', () => {

		test('Should execute successfully', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('upsert')
				.once()
				.withArgs(key, data)
				.returns(Promise.resolve(true));

			mockRes.expects('send')
				.once()
				.withArgs({ success: true })
				.returns(Promise.resolve(true));

			await cache.init(resources).save(params.req, params.res);

			mockCache.verify();
			mockRes.verify();
		});

	});

	describe('GetByKey test cases', () => {

		test('Should return a found record', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('findOne')
				.once()
				.returns({
					select: () => {
						return {
							lean: () => {
								return {
									exec: () => {
										return Promise.resolve({ key, data });
									}
								}
							}
						}
					}
				});

			mockCache.expects('create')
				.never();

			mockRes.expects('send')
				.once()
				.withArgs({ key, data })
				.returns(Promise.resolve(true));

			await cache.init(resources).getByKey(params.req, params.res);

			mockCache.verify();
			mockRes.verify();
		});

		test('Should create a new record', async () => {
			const resources = getResources();
			const params = getParameters();

			const mockCache = sinon.mock(resources.models.Cache);
			const mockRes = sinon.mock(params.res);

			mockCache.expects('findOne')
				.once()
				.returns({
					select: () => {
						return {
							lean: () => {
								return {
									exec: () => {
										return Promise.resolve(null);
									}
								}
							}
						}
					}
				});

			mockCache.expects('create')
				.withArgs(key)
				.once();

			mockRes.expects('send')
				.once()
				.returns(Promise.resolve(true));

			await cache.init(resources).getByKey(params.req, params.res);

			mockCache.verify();
			mockRes.verify();
		});

	});

});