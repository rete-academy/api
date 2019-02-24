'use strict';

const mongoose = require('mongoose');
const log = require('library/logger');
const {
    createFirstUser,
    createFirstClient,
} = require('./create');

mongoose.set('useCreateIndex', true);

// Establish database connection
mongoose.connect(
    process.env.MONGO_URL,
    {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
        useNewUrlParser: true ,
    },
);

// Listen for Mongoose connection events and output statuses to console
mongoose.connection.on('connected', function () {
    log.verbose('Connecting to ' + process.env.MONGO_URL);
    log.info('App connected to database successfully');
    createFirstUser();
    createFirstClient();
});

mongoose.connection.on('error', function (err) {
    log.error(err);
});

mongoose.connection.on('disconnected', function () {
    log.info('App disconnected from database');
});

// Listen to Node processes for termination or restart signals,
// and call gracefulShutdown function when appropriate,
// passing a continuation callback
// To be called when process is restarted or terminated
let gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        callback();
    });
};

// Listen for SIGUSR2, which is what nodemon uses to restart
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// Listen for SIGINT emitted on application termination
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    });
});

// Listen for SIGTERM emitted by Heroku and Jelastic for shutdown
process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app termination', function () {
        process.exit(0);
    });
});

module.exports = mongoose;
