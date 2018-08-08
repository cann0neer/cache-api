const fs = require('fs');
const path = require('path');

module.exports.init = () => {
	const filesCurrentDir = fs.readdirSync(__dirname);

	const result = {};

	filesCurrentDir.forEach(function(file) {
		if (!fs.statSync(path.resolve(__dirname, file)).isDirectory() && file !== 'index.js') {
			const model = require(`./${file}`);
			const name = file.replace('.js', '');
			result[name] = model;
		}
	});

	return result;
};