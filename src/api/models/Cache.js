const mongoose = require('mongoose');
const config = require('config');
const _ = require('lodash');

const CacheSchema = new mongoose.Schema({
	key    : {type: String, unique: true},
	data   : {type: String, default: ''},
	updated: {type: Date, default: Date.now()},
});

CacheSchema.pre('save', function (next) {
	this.updated = new Date();
	next();
});

/**
 * Find all records with setting default parameters
 * @param find
 * @param params
 * @returns {Promise<void>}
 */
CacheSchema.statics.findAll = async function (find, params) {
	params = _.merge({skip: 0, limit: 0, sort: { updated: -1 }, select: { _id: 0 }}, params);
	return await this.find(find)
		.limit(params.limit)
		.skip(params.skip)
		.sort(params.sort)
		.select(params.select)
		.exec();
};

/**
 * Create a new record
 * If the limit is exceeded, the oldest record will be overwritten
 * @param key
 * @param data
 * @returns {Promise<boolean>}
 */
CacheSchema.statics.create = async function (key, data) {
	const results = this.findAll({}, {
		skip: config.get('cache.limit') - 1,
		limit: 1,
		select: { _id: 1 }
	});

	let cache;

	if (results && results.length) {
		cache = results.pop();
		_.assignIn(cache, { key, data });
	} else {
		cache = new this({ key, data });
	}

	await cache.save();
	return true;
};

/**
 * Update an existed record or create new one
 * @param key
 * @param data
 * @returns {Promise<boolean>}
 */
CacheSchema.statics.upsert = async function (key, data) {
	const { n: numberUpdated } = await this.update(
		{ key },
		{ $set: { data } }
	);

	if (numberUpdated) {
		return true;
	}

	return await this.create(key, data);
};

// for finding by key
CacheSchema.index({
	key: 1
});

const CacheModel = mongoose.model('Cache', CacheSchema);

module.exports = CacheModel;