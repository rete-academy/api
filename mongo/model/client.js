'use strict';

// const log = require('library/logger');

const options = {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            if (ret.created_time) ret.created_time = ret.created_time.getTime();
            if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
            return ret;
        }
    },
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            if (ret.created_time) ret.created_time = ret.created_time.getTime();
            if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
            return ret;
        }
    },
    minimize: false
};

let mongoose = require('mongoose'),
    modelName = 'client',
    schemaDefinition = require('../schema/' + modelName),
    schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ client_id: 1 });

let modelInstance = mongoose.model(modelName, schemaInstance),
    Client = module.exports = modelInstance;

module.exports.findAll = function (query) {
    return Client.find(query).then(function (result) {
        return Promise.resolve(result);
    }).catch(function(error) { 
        return Promise.reject(error.message);
    });
};

module.exports.findById = function (id) {
    return Client.findOne({ client_id: id }).then(function (result) {
        return Promise.resolve(result);
    }).catch(function(error) { 
        return Promise.reject(error.message);
    });
};

module.exports.createNew = function (doc) {
    let client = doc;
    client.created_time = Date.now();
    return Client.create(client).then(function (result) {
        return Promise.resolve(result);
    }).catch(function(error) { 
        return Promise.reject(error.message);
    });
};

module.exports.updateById = function (id, doc) {
    let client = doc;

    // Delete non-updatable fields from the request
    delete client.created_time;
    delete client.__v;
    delete client._id;

    return Client.findOneAndUpdate({client_id: id}, client, {new: true}).then(function (result) {
        if (result === null) return Promise.reject('Not found');
        return Promise.resolve(result);
    }).catch(function(error) { 
        return Promise.reject(error.message);
    });
};

module.exports.removeById = function (id) {
    return Client.findOneAndRemove({client_id: id}).then(function (result) {
        if (result === null) return Promise.reject('Not found');
        return Promise.resolve(result);
    }).catch(function(error) { 
        return Promise.reject(error.message);
    });
};
