/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
// const { union, remove } = require('lodash');
// const { isArray } = require('library/utils');
const config = require('config');
const randomize = require('randomatic');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

const refine = function (doc, ret) {
  delete ret._id;
  delete ret.__v;
  return ret;
};

const schemaDefinition = require('../schema/confirmation_code');

const schemaInstance = mongoose.Schema(schemaDefinition, {
  collection: `${modelName}s`,
  toObject: { transform: refine },
  toJSON: { transform: refine },
  minimize: false,
});
const modelInstance = mongoose.model(modelName, schemaInstance);

schemaInstance.index({ userId: 1 });

modelInstance.findAll = async function (query) {
  try {
    log.silly(`Finding ${modelName}`);
    return await modelInstance.find(query);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findByCode = async function (code) {
  try {
    log.silly('Finding code...');
    // return await modelInstance.find({ code: code })
    //     .limit(1).maxTimeMS(1000);
    return await modelInstance.find({ code }).exec();
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findByUserId = async function (id) {
  try {
    log.silly(`Finding userId ${modelName}`);
    return await modelInstance.findOne({ userId: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function (doc) {
  try {
    log.silly(`Creating ${modelName}`);
    const confirmationCode = { ...doc };
    confirmationCode.createdTime = Date.now();
    confirmationCode.code = randomize('aA0', 64);
    const found = await modelInstance.findOne({ userId: doc.userId });
    if (found) await modelInstance.removeByUserId(doc.userId);
    return await modelInstance.create(confirmationCode);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeByCode = async function (code) {
  try {
    log.silly(`Deleting ${modelName}`);
    return await modelInstance.findOneAndRemove({ code });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeByUserId = async function (id) {
  try {
    log.silly(`Deleting ${modelName}`);
    return await modelInstance.findOneAndRemove({ userId: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeByEmail = async function (email) {
  try {
    log.silly(`Deleting ${modelName}`);
    return await modelInstance.deleteMany({ email });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.isExpired = function (obj) {
  return Math.round((Date.now() - obj.createdTime) / 1000) > config.limit.codeLife;
};

module.exports = modelInstance;
