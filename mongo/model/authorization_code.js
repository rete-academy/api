'use strict';

let options = {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    minimize: false
};

let mongoose = require('mongoose'),
    modelName = 'authorization_code',
    schemaDefinition = require('../schema/' + modelName),
    schemaInstance = mongoose.Schema(schemaDefinition, options);

let modelInstance = mongoose.model(modelName, schemaInstance),
    AuthorizationCode = module.exports = modelInstance;

module.exports.findAll = function (query) {
    return AuthorizationCode.find(query).then(function (result) {
        return Promise.resolve(result);
    }).catch(function(error) {
        return Promise.reject(error.message);
    });
};

module.exports.findByCode = function (code) {
    return AuthorizationCode.findOne({code: code}).then(function (result) {
        return Promise.resolve(result);
    }).catch(function(error) {
        return Promise.reject(error.message);
    });
};

module.exports.removeByCode = function (code) {
    return AuthorizationCode.findOneAndRemove({code: code}).then(function (result) {
        if (result === null) return Promise.reject('Not found');
        return Promise.resolve(result);
    }).catch(function(error) {
        return Promise.reject(error.message);
    });
};