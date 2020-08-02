const log = require('library/logger');
const {
  authoriseGoogle,
  getConnectionUrl,
  getAccessToken,
} = require('library/google');
const { defaultResponse } = require('library/utils');

module.exports.invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

module.exports.getConnectionUrl = function (req, res) {
  try {
    log.silly('Start getting connection url for Google Oauth2...');
    const connectionURL = getConnectionUrl();
    defaultResponse(req, res, 200, connectionURL);
  } catch (err) {
    defaultResponse(req, res, 500, err.message);
  }
};

module.exports.getAccessToken = async function (req, res) {
  try {
    log.silly('Start getting Google Oauth2 access token...');
    const { tokens, profile } = await getAccessToken(req.body.code);
    req.session.tokens = tokens; // set token into session
    defaultResponse(req, res, 200, { tokens, profile });
  } catch (err) {
    defaultResponse(req, res, 500, err.message);
  }
};

module.exports.test = async function (req, res) {
  try {
    const authed = await authoriseGoogle(req.session);

    if (authed) {
      defaultResponse(req, res, 200, authed);
    } else {
      defaultResponse(req, res, 401, 'Access denied');
    }
  } catch (err) {
    defaultResponse(req, res, 500, err.message);
  }
};
