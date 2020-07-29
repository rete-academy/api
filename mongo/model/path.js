/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { isArray } = require('library/utils');
const log = require('library/logger');

const schemaDefinition = require('../schema/path');

const transform = function (doc, ret) {
  delete ret.__v;
  return ret;
};

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform },
  toJSON: { transform },
  minimize: false,
});

const modelInstance = mongoose.model('path', schemaInstance);

modelInstance.findAll = async function (query) {
  try {
    log.silly('Finding paths');

    return await modelInstance.find(query)
      .sort({ name: 1 })
      .populate('authors')
      .populate('sprints')
      .populate({
        path: 'sprints',
        populate: { path: 'materials' },
      });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findSlug = async function (slug) {
  try {
    log.silly('Finding one path by slug');
    return await modelInstance.findOne({ slug })
      .sort({ name: 1 })
      .populate('sprints')
      .populate({
        path: 'sprints',
        populate: { path: 'materials' },
      });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findById = async function (id) {
  try {
    log.silly(`Start finding path with id ${id}`);
    return await modelInstance.findOne({ _id: id })
      .sort({ name: 1 })
      .populate('sprints');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function (obj) {
  try {
    log.silly('Creating a new path');
    return await modelInstance.create(obj);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.updateById = async function (id, doc) {
  try {
    log.silly(`Updating a path with id ${id}`);
    const data = { ...doc };
    delete data._id;
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

modelInstance.addSprints = async function (id, doc) {
  try {
    log.silly(`Adding sprints to path id ${id}`);
    const data = isArray(doc.id) ? doc.id : [doc.id];
    const found = await modelInstance.findOne({ _id: id });
    const sprintIds = found.sprints.map((i) => i.toString());
    const newIds = data.filter((i) => !sprintIds.includes(i));
    return await modelInstance.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { sprints: { $each: newIds } },
        $inc: { 'meta.version': 1 },
      },
      { new: true },
    );
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeSprints = async function (id, doc) {
  try {
    log.silly(`Removing sprints from path with id ${id}`);
    const data = isArray(doc.id) ? doc.id : [doc.id];
    const found = await modelInstance.findOne({ _id: id });
    const sprintIds = found.sprints.map((i) => i.toString());
    const matchedIds = data.filter((i) => sprintIds.includes(i));
    return await modelInstance.findOneAndUpdate(
      { _id: id },
      {
        $pull: { sprints: { $in: matchedIds } },
        $inc: { 'meta.version': 1 },
      },
      { new: true },
    );
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeById = async function (id) {
  try {
    log.silly(`Remove a path with id ${id}`);
    return await modelInstance.findOneAndDelete({ _id: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
