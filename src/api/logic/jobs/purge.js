const moment = require('moment');
const config = require('config');

const ttl = config.get('cache.ttl');
const purgeInterval = config.get('cache.purgeInterval');

module.exports.init = (resources) => {
	const { models: { Cache } } = resources;

	return {
		/**
		 * Job purges cache records with expired TTL
		 */
		start: (cb = () => {}) => {
			setInterval(async () => {
				console.log('Purge begin');
				await Cache.remove({
					updated: {
						$lt: moment().subtract(ttl, 'ms').toDate()
					}
				});
				console.log('Purge end');
				return cb();
			}, purgeInterval);
			console.log('Purge job is started');
		}
	};
};