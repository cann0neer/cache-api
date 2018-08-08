const sinon = require('sinon');
const mongoose = require('mongoose');
require('sinon-mongoose');
require('../../../src/api/models/Cache');

// given
const key = 'some_key';
const data = 'some data';

describe('Cache Model test cases', () => {

	describe('Upsert method test cases', () => {

		test('Should update an existing record during upsert', async () => {
			const Cache = mongoose.model('Cache');
			const CacheMock = sinon.mock(Cache);

			CacheMock
				.expects('update')
				.withArgs({ key }, { $set: { data } })
				.resolves({ n: 1 });

			CacheMock
				.expects('create')
				.never();


			await Cache.upsert(key, data);

			CacheMock.verify();
		});

		test('Should create a new record during upsert if no existed one was found', async () => {
			const Cache = mongoose.model('Cache');
			const CacheMock = sinon.mock(Cache);

			CacheMock
				.expects('update')
				.resolves({ n: 0 });

			CacheMock
				.expects('create')
				.withArgs(key, data)
				.once();

			await Cache.upsert(key, data);

			CacheMock.verify();
		});

	});

});