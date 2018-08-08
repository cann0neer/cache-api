const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const walkSync = function(dir, files) {
	const filesCurrentDir = fs.readdirSync(dir);
	files = files || [];
	filesCurrentDir.forEach(function(file) {
		if (fs.statSync(dir + '/' + file).isDirectory()) {
			files = walkSync(dir + '/' + file, files);
		} else {
			if (file !== 'index.js') {
				files.push(dir + '/' + file);
			}
		}
	});
	return files;
};

module.exports.init = (resources = {}) => {
	const files = walkSync(path.resolve(__dirname));

	const result = {};

	files.forEach((file) => {
		if (file === 'index.js') {
			return;
		}

		const logic = require(file);

		if (!logic || !logic.init) {
			return;
		}

		const path = file
			.replace(__dirname, '')
			.replace('.js', '')
			.split('/')
			.filter(Boolean);

		_.set(result, path, logic.init(resources));
	});

	return result;
};
