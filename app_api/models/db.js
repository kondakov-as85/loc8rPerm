var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/Loc8r';
//var dbURI = 'mongodb://Alexsey:q1w2e3r4@ds115085.mlab.com:15085/loc8r-dev';
if (process.env.NODE_ENV === 'production') {
	dbURI = process.env.MONGOLAB_URI;
}
mongoose.Promise = global.Promise;
mongoose.connect(dbURI);
mongoose.connection.on('connected', function () {
	console.log('Mongoose connection to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
	console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose disconnected');
});

gracefulShutdown = function (msg, callback) {
	mongoose.connection.close(function () {
		console.log('mongoose disconnected through ' + msg);
		callback();
	});	
};
//Для перезапуска nodemon
process.once('SIGUSR2', function () {
	gracefulShutdown('nodemon restart', function () {
		process.kill(process.pid, 'SIGUSR2');
	});
});
//Для завершения приложения
process.on('SIGINT', function () {
	gracefulShutdown('app termination', function () {
		process.exit(0);
	});
});
//Для завершения приложения Heroku
process.on('SIGTERM', function () {
	gracefulShutdown('Heroku app shutdown', function () {
		process.exit(0);
	});
});

require('./locations');
require('./users');