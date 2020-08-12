const mongoose = require('mongoose');
// const { isArray } = require('library/utils');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

const refine = function (doc, ret) {
  delete ret.__v;
  return ret;
};

const schemaDefinition = require(`../schema/${modelName}`);
const schemaInstance = mongoose.Schema(schemaDefinition, {
  collection: `${modelName}s`,
  toObject: { transform: refine },
  toJSON: { transform: refine },
  minimize: false,
});

const modelInstance = mongoose.model(modelName, schemaInstance);

modelInstance.findAll = async function (query) {
  try {
    log.silly(`Finding ${modelName}`);
    return await modelInstance.find(query)
      .sort({ createdTime: 1 })
      .populate('material')
      .populate('messages.user');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findById = async function (id) {
  try {
    log.silly(`Start finding ${modelName} with id ${id}`);
    return await modelInstance.findOne({ _id: id })
      .sort({ createdTime: 1 })
      .populate('material')
      .populate('messages.user');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function (doc) {
  try {
    log.silly(`Creating a new ${modelName}`);
    return await modelInstance.create(doc)
      .populate('material');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.addMessage = async (id, doc) => {
  try {
    log.silly(`Start update a ${modelName} with id ${id}`);
    const data = { ...doc };
    data.createdTime = Date.now();
    return await modelInstance.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { messages: data },
        $inc: { 'meta.version': 1 },
        updatedTime: Date.now(),
      },
      { new: true },
    )
      .sort({ createdTime: 1 })
      .populate('material')
      .populate('messages.user');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeById = async function (id) {
  try {
    log.silly(`Start remove a ${modelName} with id ${id}`);
    return await modelInstance.findOneAndDelete({ _id: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
