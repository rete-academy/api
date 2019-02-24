'use strict';

const config = require('config');
const log = require('library/logger');
// const emailService = require('library/email');
const {
    authoriseUser,
    defaultResponse,
    getDomainFromUrl,
    promiseRejectWithError,
    strengthCheck,
} = require('library/utils');

const Password = require('mongo/model/password');
const User = require('mongo/model/user');

module.exports.invalidRequest = function (req, res) {
    defaultResponse(req, res, 405);
};

module.exports.findAll = function (req, res) {
    authoriseUser(req, res).then(function (result) {
        if (!result.admin) return promiseRejectWithError(403);
        return Password.findAll(req.query);
    }).then(function (result) {
        defaultResponse(req, res, 200, result);
    }).catch(function (error) {
        defaultResponse(req, res, error.httpStatusCode, error.message);
    });
};

module.exports.forgot = function (req, res) {
    let protocol = 'https';
    if (req.get('host').indexOf('localhost') !== -1) protocol = 'http';

    const domain = protocol + '://' + req.get('host');
    let redirect;
    if (req.headers.referer) redirect = protocol + '://' + getDomainFromUrl(req.headers.referer);
    if (req.query.hasOwnProperty('redirect_uri')) redirect = req.query.redirect_uri;

    let token;
    // let to;
    if (!req.body.email) return defaultResponse(req, res, 400, 'email is required.');
    return User.findOne({ email: req.body.email }).then(function (result) {
        if (!result) return promiseRejectWithError(404, 'User not found.');
        req.body.user_id = result._id;
        // to = result.email;
        return Password.deleteOne({ user_id: req.body.user_id });
    }).then(function () {
        return Password.createNew(req.body);
    }).then(function (result) {
        token = result;
        // send email to user, write later. Remember to remove token in response.
    }).then(function () {
        log.info('Password reset token sent: ' + token);
        defaultResponse(req, res, 200, token); // should not put token into response.
    }).catch(function (error) {
        defaultResponse(req, res, error.httpStatusCode, error.message);
    })
};

module.exports.reset = function (req, res) {
    let updatedUser;
    if (!req.body.password) return defaultResponse(req, res, 400, 'password is required.');
    return Password.findByToken(req.user.token).then(function (result) {
        if (!result) return promiseRejectWithError(404, 'Token not found.');
        if ((new Date().getMilliseconds() - result.createdTime) >= config.limit.codeLife) {
            return promiseRejectWithError(404, 'Token expired.');
        }
        return User.findOne({_id: req.user.user_id});
    }).then(function (result) {
        if (!result) return promiseRejectWithError(500, 'User not found.');
        try {
            strengthCheck(req.body.password);
        } catch (e) {
            return promiseRejectWithError(400, e);
        }
        result.set('password', req.body.password);
        return result.save();
    }).then(function (result) {
        updatedUser = result;
        return Password.removeByToken(req.user.token);
    }).then(function () {
        defaultResponse(req, res, 200, updatedUser);
    }).catch(function (error) {
        defaultResponse(req, res, error.httpStatusCode, error.message);
    });
};
