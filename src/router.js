const express = require('express');
const router = express.Router();

module.exports.init = (resources) => {
	const { logic: { controllers: { cache } } } = resources;

	/**
	 * Wrap an action by error handling
	 * @param action
	 * @returns {Function}
	 */
	const getExecutor = (action) => {
		return async (req, res, next) => {
			try {
				await action(req, res);
			} catch (err) {
				next(err);
			}
		}
	};

	// returns all stored keys in the cache
	router.get('/cache', getExecutor(cache.getAll));

	// returns the cached data for a given key
	router.get('/cache/:key', getExecutor(cache.getByKey));

	// updates the data for a given key
	router.put('/cache/:key', getExecutor(cache.save));

	// create a new cache record
	router.post('/cache/:key', getExecutor(cache.save));

	// removes a given key from the cache
	router.delete('/cache/:key', getExecutor(cache.removeByKey));

	// removes all keys from the cache
	router.delete('/cache', getExecutor(cache.removeAll));

	return router;
};