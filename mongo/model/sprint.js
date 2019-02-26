'use strict';

const mongoose = require('mongoose');
const { union, remove } = require('lodash');
const { isArray } = require('library/utils');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

const refine = function (doc, ret) {
    delete ret.__v;
    return ret;
};

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
        log.silly('Finding ' + modelName);
        return await modelInstance.find(query)
            .sort({ name: 1 })
            .populate('materials');
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.findById = async function(id) {
    try {
        log.silly('Start finding ' + modelName + ' with id ' + id);
        return await modelInstance.findOne({ _id: id });
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.createNew = async function(obj) {
    try {
        log.silly('Creating a new ' + modelName);
        return await modelInstance.create(obj);
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.updateById = async function(id, doc) {
    try {
        log.silly('Updating a ' + modelName + ' with id ' + id);
        let data = { ...doc };
        delete data._id;
        delete data.__v;
        data.updatedTime = Date.now();
        return await modelInstance.findOneAndUpdate(
            { _id: id },
            data,
            { new: true },
        );
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.addMaterials = async function(id, doc) {
    try {
        log.silly('Adding materials to ' + modelName + ' id ' + id);
        const data = isArray(doc.id) ? doc.id : [doc.id];
        const found = await modelInstance.findOne({ _id: id });
        const materialIds = found.materials.map(id => id.toString());
        const combined = union(materialIds, data);
        if (found.meta && found.meta.version) { found.meta.version += 1; }
        return await modelInstance.findOneAndUpdate(
            { _id: id },
            { 
                materials: combined,
                meta: found.meta,
            },
            { new: true },
        );
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.removeMaterials = async function(id, doc) {
    try {
        log.silly('Removing materials from ' + modelName + ' id ' + id);
        const data = isArray(doc.id) ? doc.id : [doc.id];
        const found = await modelInstance.findOne({ _id: id });
        const materialIds = found.materials.map(i => i.toString());
        // Note: remove mutates the origin array
        remove(materialIds, (j) => !!data.find(k => j === k));
        if (found.meta && found.meta.version) { found.meta.version += 1; }
        return await modelInstance.findOneAndUpdate(
            { _id: id },
            { 
                materials: materialIds,
                meta: found.meta,
            },
            { new: true },
        );
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

modelInstance.removeById = async function(id) {
    try {
        log.silly('Start remove a ' + modelName + ' with id ' + id)
        return await modelInstance.findOneAndDelete({ _id: id })
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
};

module.exports = modelInstance;