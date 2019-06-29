'use strict';

const cors = require('cors');
const RateLimit = require('express-rate-limit');

const config = require('config');

module.exports = function (app, passport) {
  /*
    Only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
    app.enable('trust proxy');
    */

  const optionsOauth = {
    windowMs: config.limit.oauthWindow,
    max: config.limit.oauthMax,
    delayMs: config.limit.oauthDelay,
    message: "Use too many requests!",
    statusCode: 429,
    handler: function (req, res) {
      if (optionsOauth.headers) {
        res.setHeader('Retry-After', Math.ceil(optionsOauth.windowMs / 1000));
      }
      res.format({
        html: function () {
          res.status(optionsOauth.statusCode).end(optionsOauth.message);
        },
        json: function () {
          res.status(optionsOauth.statusCode).json({message: optionsOauth.message});
        }
      });
    }
  };

  const optionsApi = {
    windowMs: config.limit.apiWindow,
    max: config.limit.apiMax,
    delayMs: config.limit.apiDelay,
    message: "Use too many requests!",
    statusCode: 429,
    handler: function (req, res) {

      if (optionsApi.headers) {
        res.setHeader('Retry-After', Math.ceil(optionsApi.windowMs / 1000));
      }
      res.format({
        html: function () {
          res.status(optionsApi.statusCode).end(optionsApi.message);
        },
        json: function () {
          res.status(optionsApi.statusCode).json({message: optionsApi.message});
        }
      });
    }
  };

  const limiterOauth = new RateLimit(optionsOauth);
  const limiterApi = new RateLimit(optionsApi);
  app.options('*', cors({ origin: config.default.webUrl }));
  app.use('/oauth/', limiterOauth, require('./oauth')(passport));
  app.use('/api/', limiterApi, require('./api')(passport));
};
