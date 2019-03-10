'use strict';

const config = require('config');
const log = require('library/logger');
const Password = require('mongo/model/password');
const User = require('mongo/model/user');
const emailService = require('library/email');
const {
    // authoriseUser,
    defaultResponse,
    getDomainFromUrl,
    promiseRejectWithError,
    strengthCheck,
} = require('library/utils');

module.exports.invalidRequest = function (req, res) {
    defaultResponse(req, res, 405);
};

module.exports.forgot = async (req, res) => {
    try {
        const data = req.body;
        if (!req.body.email) return defaultResponse(req, res, 400, 'Email is required.');
        const foundUser = await User.findOne({ email: req.body.email });
        if (!foundUser) return promiseRejectWithError(404, 'User not found.');
        data.user_id = foundUser._id;
        await Password.deleteOne({ user_id: data.user_id });
        const newPassword = await Password.createNew(data);

        await emailService.sendMail({
            from: config.email.noreply,
            to: foundUser.email,
            subject: config.email.reset.subject,
            text: config.email.reset.text,
            placeholders: {
                TITLE: config.email.reset.subject,
                CONTENT: config.email.reset.content,
                LINK: config.default.webUrl + '/password/reset?token=' + newPassword.token,
                CODE: newPassword.token,
            },
            type: 'reset',
        });

        defaultResponse(req, res, 200, 'OK'); // should not put token into response.
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
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
