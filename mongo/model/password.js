/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const randomize = require('randomatic');
const log = require('library/logger');

const options = {
  toObject: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    },
  },
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    },
  },
  minimize: false,
};

const schemaDefinition = require('../schema/password');

const schemaInstance = mongoose.Schema(schemaDefinition, options);
const modelInstance = mongoose.model('password', schemaInstance);

schemaInstance.index({ token: 1 });

modelInstance.findByToken = async function (token) {
  log.silly('Start finding token...');
  try {
    return await modelInstance.findOne({ token });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function (doc) {
  log.silly('Start creating new token...');
  try {
    return await modelInstance.create({
      ...doc,
      createdTime: Date.now(),
      token: randomize('a0', 32),
    });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeByToken = async function (token) {
  log.silly('Start deleting token...');
  try {
    return await modelInstance.findOneAndDelete({ token });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
