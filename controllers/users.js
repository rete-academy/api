'use strict';

// const fs = require('fs-extra');
const randomize = require('randomatic');
const log = require('library/logger');
const User = require('mongo/model/user');
// const Image = require('mongo/model/image');
const confirmationCode = require('mongo/model/confirmation_code');
// const PasswordResetToken = require('mongo/model/password');

const {
    authoriseUser,
    defaultResponse,
    filterUserData,
    // getDomainWithUrl,
    // sendMail,
} = require('library/utils');

const invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const findAll = async function(req, res) {
    try {
        const allUsers = await User.findAll(req.query);
        defaultResponse(req, res, 200, filterUserData(req.user, allUsers));
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const findMe = async function(req, res) {
    try {
        const me = await User.findOne({ email: req.user.email });
        defaultResponse(req, res, 200, { profile: me });
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const upload = async function(req, res) {
    try {
        const authed = await authoriseUser(req, res);
        if (authed && req.file) {
            defaultResponse(req, res, 200, req.file);
        }
    } catch (error) {
        throw error;
    }
};

const createNew = async function(req, res) {
    try {
        let user = req.body;
        user.username = user.email.split('@').shift();
        const usedUser = await User.findOne({ username: user.username });
        if (usedUser) user.username = user.username.concat(randomize('Aa', 10));

        if (!req.body.email) throw new TypeError('Email is required.');
        
        const found = await User.findByEmail(user.email);
        if (found) throw new TypeError('Email taken');

        const createdUser = await User.createNew(user);

        const confirm = await confirmationCode.createNew({
            userId: createdUser._id,
            email: createdUser.email,
        });

        console.log(confirm); // !!! REMOVE IT AFTER FINISH EMAIL FUNC

        log.debug('User created and confirmation code created.');
        defaultResponse(req, res, 201, createdUser);
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updateUser = async function(req, res) {
    log.silly('Start updating a user...');
    try {
        const updated = await User.updateById(req.params.id, req.body);
        log.debug('User was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updateMaterialStatus = async function(req, res) {
    log.silly('Start updating material status...');
    try {
        await User.updateMaterialStatus(req.params.userId, req.params.materialId, req.body);
        log.debug('User was updated');
        defaultResponse(req, res, 200, 'OK');
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updateProgress = async function() {
    log.silly('Start updating study progress...');
};

const confirmEmail = async function(req, res) {
    try {
        const found = await confirmationCode.findByCode(req.params.code);
        if (!found || confirmationCode.isExpired(found)) {
            return new Error('Confirmation code used, expired or not found.');
        }
        const confirmedUser = await User.findOneAndUpdate(
            { _id: found.userId },
            {
                $set: {
                    email: found.email,
                    updatedTime: Date.now(),
                    'meta.confirm': true ,
                },
            },
            { new: true }
        );
        await confirmationCode.removeByUserId(confirmedUser._id);
        defaultResponse( req, res, 201, 'Your email is confirmed!');
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const remove = async function(req, res) {
    try {
        if (req.user.role.includes(0)) {
            const deleted = User.removeById(req.params.id);
            defaultResponse(req, res, 200, deleted);
        } else {
            defaultResponse(req, res, 403);
        }
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    findAll,
    findMe,
    upload,
    updateUser,
    updateMaterialStatus,
    updateProgress,
    confirmEmail,
    createNew,
    remove,
};

