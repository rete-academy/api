'use strict';

const mongoose = require('mongoose');
// const { isArray } = require('library/utils');
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

const modelInstance = mongoose.model(modelName, schemaInstance);

modelInstance.findAll = async function(query) {
    try {
        log.silly('Start finding all ' + modelName);
        return await modelInstance.find(query).populate('author');
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.findById = async function(id) {
    try {
        log.silly('Start finding ' + modelName + ' with id: ' + id);
        return await modelInstance.findOne({ _id: id }).populate('author');
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.createNew = async function(file) {
    try {
        log.silly('Start create a new ' + modelName);
        return await modelInstance.create(file);
    } catch (error) {
        log.error(error.message);
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
