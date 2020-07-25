const mongoose = require('mongoose');
const log = require('library/logger');
const { createAdmin } = require('./create');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

function handleConnect() {
  mongoose.connect(
    process.env.MONGO_URL,
    {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      useNewUrlParser: true,
    },
  );

  mongoose.connection.once('open', () => {
    log.verbose('We are connected to database.');
  });
}

// Establish database connection
handleConnect();

// Listen for Mongoose connection events and output statuses to console
mongoose.connection.on('connected', async () => {
  log.debug(`Trying to connect to ${process.env.MONGO_URL}...`);
  log.verbose('App connected to database successfully');
  createAdmin();
});

mongoose.connection.on('error', (err) => {
  log.error(err);
  log.verbose('Trying to reconnect...');

  handleConnect();
});

mongoose.connection.on('disconnected', () => {
  log.verbose('App disconnected from database');
});

// Listen to Node processes for termination or restart signals,
// and call gracefulShutdown function when appropriate,
// passing a continuation callback
// To be called when process is restarted or terminated
function gracefulShutdown(msg, callback) {
  mongoose.connection.close(() => {
    callback();
  });
}

// Listen for SIGUSR2, which is what nodemon uses to restart
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

// Listen for SIGINT emitted on application termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

// Listen for SIGTERM emitted by Heroku and Jelastic for shutdown
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app termination', () => {
    process.exit(0);
  });
});

module.exports = mongoose;
