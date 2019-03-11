'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const { isArray } = require('library/utils');
// const randomize = require('randomatic');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

const refine = function(doc, ret) {
    delete ret.__v;
    delete ret.hashedPassword;
    delete ret.salt;
    if (ret.createdTime) ret.createdTime = ret.createdTime.getTime();
    if (ret.updatedTime) ret.updatedTime = ret.updatedTime.getTime();
    return ret;
}

const schemaDefinition = require('../schema/' + modelName);
const schemaInstance = mongoose.Schema(schemaDefinition, {
    collection: `${modelName}s`,
    toObject: {transform: refine},
    toJSON: {transform: refine},
    minimize: false
});

schemaInstance.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt.toString())
        .update(password)
        .digest('hex');
};

schemaInstance.virtual('password').set(function(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(256).toString('hex');
    this.hashedPassword = this.encryptPassword(password);
}).get(function () {
    return this._plainPassword;
});

schemaInstance.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schemaInstance.methods.checkEmail = function(email) {
    return this.email === email;
};

const modelInstance = mongoose.model(modelName, schemaInstance);

modelInstance.findAll = async function(query) {
    try {
        log.silly('Start finding all ' + modelName);
        return await modelInstance.find(query)
            .populate('progress.path')
            .populate('progress.sprint')
            .populate('progress.material');
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.findById = function(id) {
    log.silly('Start finding ' + modelName + ' with id: ' + id);
    return modelInstance.findOne({ _id: id })
        .then(function (result) {
            log.silly('Found user.');
            return Promise.resolve(result);
        }).catch(function(error) { 
            log.error(`${error.name}: ${error.message}`);
            return Promise.reject(error.message);
        });
};

modelInstance.findByUsername = function(username) {
    log.silly('Start finding ' + modelName + ' by username: ' + username);
    return modelInstance.findOne({ username })
        .then(function (result) {
            log.silly('User with ' + username + ' found.');
            return Promise.resolve(result)
        }).catch(function(error) { 
            log.error(error.message);
            return Promise.reject(error.message);
        });
};

modelInstance.findByEmail = async function(email) {
    try {
        log.silly('Start finding ' + modelName + ' by email: ' + email);
        return await modelInstance.findOne({ email });
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.createNew = async function(user) {
    try {
        log.silly('Start create a new ' + modelName);
        // user.password = randomize('aA0!', 64);
        user.created_time = Date.now();
        user.updated_time = Date.now();
        return await modelInstance.create(user);
    } catch (error) {
        log.error(error.message);
        throw error;
    }
};

modelInstance.updateById = function(id, doc) {
    log.silly('Start update a ' + modelName + ' with id ' + id);
    let user = doc; 
    // Delete non-updatable fields from the request
    delete user.createdTime;
    delete user.hashedPassword;
    delete user.salt;
    delete user.__v;
    delete user._id;

    return modelInstance.findOneAndUpdate({ _id: id }, user, { new: true })
        .then(function (result) {
            if (result === null) return Promise.reject('Not found');
            if (!user.password) return Promise.resolve(result);
            result.hashedPassword = result.encryptPassword(user.password);
            return result.save();
        }).then(result => {
            return Promise.resolve(result);
        }).catch(function(error) {
            log.error(error.message);
            return Promise.reject(error.message);
        });
};

modelInstance.updateStatus = async function(userId, doc) {
    try {
        const updated = await modelInstance.findOneAndUpdate(
            {
                _id: userId,
                'progress._id': doc.id,
            },
            { '$set': { 'progress.$.status': doc.status } },
            { new: true },
        );
        return updated;
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.updateProgress = async function(userId, doc) {
    try {
        log.silly('Start update a user progress...');
        const data = isArray(doc) ? doc : [doc];
        return await modelInstance.findOneAndUpdate(
            { _id: userId },
            {
                '$addToSet': { 'progress': { '$each': data } },
                '$inc': { 'meta.version': 1 },
            },
            { new: true },
        );
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.removeById = function(id) {
    log.silly('Start remove a ' + modelName + ' with id ' + id);
    return modelInstance.findOneAndRemove({ _id: id })
        .then(function (result) {
            if (result === null) return Promise.reject('Not found');
            return Promise.resolve(result);
        }).catch(function(error) {
            log.error(error.message);
            return Promise.reject(error.message);
        });
};

module.exports = modelInstance;
