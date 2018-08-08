const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const config = require('config');
const router = require('./router');

const app = express();

app.use(helmet());

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(config.get('db.uri'), { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(logger('dev'));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(compression()); // Compress all routes

let httpServer;

module.exports = {
	start: (resources) => {
		app.use('/', router.init(resources)); // Add routing

		// Catch 404 and forward to error handler
		app.use(function(req, res, next) {
			let err = new Error('Not Found');
			err.status = 404;
			next(err);
		});

		// Error handler
		app.use(function(err, req, res, next) {
			// Set locals, only providing error in development
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};

			// Render the error page
			res.status(err.status || 500);
			res.send(`${err.status} ${err.message}`);
		});

		const port = config.get('app.port');
		const appName = config.get('app.name');

		httpServer = app.listen(port, function() {
			console.log(`${appName} is listening on port ${port}`);
		});

		// start the job for purge expired cache items from DB
		resources.logic.jobs.purge.start();
	},
	stop: () => {
		if (httpServer) {
			httpServer.stop();
		}
	}
};
