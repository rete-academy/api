/*
const randomize = require('randomatic');
const log = require('library/logger');
const User = require('mongo/model/user');
const config = require('config');
const emailService = require('library/email');
const confirmationCode = require('mongo/model/confirmation_code');
*/

const {
  // checkRole,
  defaultResponse,
  // filterUserData,
  // slugify,
} = require('library/utils');

const invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

const getSettings = function (req, res) {};
const putSettings = function (req, res) {};

module.exports = {
  invalidRequest,
  getSettings,
  putSettings,
};
