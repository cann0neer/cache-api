const moment = require('moment');
const ttl = require('config').get('cache.ttl');

module.exports.init = ({ models = {} }) => {
	const { Cache } = models;

	return {
		// get all records with valid TTL
		getAll:  async (req, res) => {
			const find = {
				updated: {
					$gte: moment().subtract(ttl, 'ms').toDate()
				}
			};
			const params = {
				select: {
					key: 1,
					data: 1
				}
			};
			const cache = await Cache.findAll(find, params);
			res.send(cache);
		},

		// first try to find existed cache, then create new one if it's needed
		getByKey: async (req, res) => {
			const key = req.params.key;
			const find = {
				key,
				updated: {
					$gte: moment().subtract(ttl, 'ms').toDate()
				}
			};
			let cache = await Cache.findOne(find).select({ _id: 0, key: 1, data: 1 }).lean().exec();

			if (cache) {
				console.log(`Cache hit, key [${key}]`);
				return res.send({
					key: cache.key,
					data: cache.data
				});
			}

			console.log(`Cache miss, key [${key}]`);

			const randData = Math.random().toString(36).substr(2, 10);

			await Cache.create(key, randData);

			res.send({
				key,
				data: randData
			});
		},

		// one endpoint for create/update as it was mentioned in the task
		save:  async (req, res) => {
			await Cache.upsert(req.params.key, req.body.data);
			res.send({
				success: true
			});
		},

		// remove all
		removeAll:  async (req, res) => {
			await Cache.remove({});
			res.send({
				success: true
			});
		},

		// remove by key
		removeByKey:  async (req, res) => {
			const { n: numberUpdated } = await Cache.remove({ key: req.params.key });

			if (!numberUpdated) {
				let err = new Error('Not Found');
				err.status = 404;
				throw err;
			}

			res.send({
				success: Boolean(numberUpdated)
			});
		},
	};
};
