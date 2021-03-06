/* eslint-disable no-param-reassign */
const crypto = require('crypto');
const mongoose = require('mongoose');
const log = require('library/logger');
const { isArray } = require('library/utils');

const schemaDefinition = require('../schema/user');

const transform = (doc, ret) => {
  delete ret.__v;
  delete ret.hashedPassword;
  delete ret.salt;
  if (ret.createdTime) ret.createdTime = ret.createdTime.getTime();
  if (ret.updatedTime) ret.updatedTime = ret.updatedTime.getTime();
  return ret;
};

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform },
  toJSON: { transform },
  minimize: false,
});

schemaInstance.methods.encryptPassword = function (password) {
  return crypto.createHmac('sha1', this.salt.toString())
    .update(password)
    .digest('hex');
};

schemaInstance.methods.checkPassword = function (password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schemaInstance.methods.checkEmail = function (email) {
  return this.email === email;
};

schemaInstance.virtual('password').set(function (password) {
  this._plainPassword = password;
  this.salt = crypto.randomBytes(256).toString('hex');
  this.hashedPassword = this.encryptPassword(password);
}).get(() => this._plainPassword);

const modelInstance = mongoose.model('user', schemaInstance);

modelInstance.search = async (query) => {
  log.silly('Start finding all users');

  return modelInstance.find(query)
    .populate({
      path: 'enrolled',
      populate: {
        path: 'sprints',
        populate: { path: 'materials' },
      },
    })
    .populate('progress');
};

modelInstance.findById = async (id) => {
  log.silly(`Start finding user with id: ${id}`);

  return modelInstance.findOne({ _id: id })
    .populate({
      path: 'enrolled',
      populate: {
        path: 'sprints',
        populate: { path: 'materials' },
      },
    })
    .populate('progress');
};

modelInstance.findByUsername = async (username) => {
  log.silly(`Start finding user by username: ${username}`);

  return modelInstance.findOne({ username })
    .populate({
      path: 'enrolled',
      populate: {
        path: 'sprints',
        populate: { path: 'materials' },
      },
    })
    .populate('progress');
};

modelInstance.findByEmail = async (email) => {
  log.silly(`Start finding user by email: ${email}`);

  return modelInstance.findOne({ email })
    .populate({
      path: 'enrolled',
      populate: {
        path: 'sprints',
        populate: { path: 'materials' },
      },
    })
    .populate('progress');
};

modelInstance.createNew = async (user) => {
  try {
    log.silly('Start creating a new user');
    return modelInstance.create(user);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.updateById = (id, doc) => {
  log.silly(`Start updating a user with id ${id}`);

  const user = { ...doc };
  // Delete non-updatable fields from the request
  delete user.createdTime;
  delete user.hashedPassword;
  delete user.enrolled;
  delete user.progress;
  delete user.salt;
  delete user.__v;
  delete user._id;

  // TODO: check password before save
  // result.hashedPassword = result.encryptPassword(user.password);
  // return result.save();
  return modelInstance.findOneAndUpdate({ _id: id }, user)
    .then((result) => {
      if (result === null) {
        return Promise.reject(new Error('Not found'));
      }
      return Promise.resolve(result);
    })
    .catch((error) => {
      log.error(error.message);
      return Promise.reject(error.message);
    });
};

// ids is path ids
modelInstance.enroll = async (userId, ids) => {
  log.silly('Start enrolling...');

  return modelInstance.findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: { enrolled: { $each: isArray(ids) ? ids : [ids] } },
      $inc: { 'meta.version': 1 },
    },
    { new: true },
  );
};

modelInstance.unenroll = async (userId, ids) => {
  log.silly('Start unenrolling...');

  return modelInstance.findOneAndUpdate(
    { _id: userId },
    {
      $pull: { enrolled: { $in: isArray(ids) ? ids : [ids] } },
      $inc: { 'meta.version': 1 },
    },
    { multi: true },
  );
};

modelInstance.increaseProgress = async (userId, ids) => {
  log.silly('Increase the progress...');

  const response = await modelInstance.findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: { progress: { $each: isArray(ids) ? ids : [ids] } },
      $inc: { 'meta.version': 1 },
    },
    { new: true },
  );
  return response;
};

modelInstance.decreaseProgress = async (userId, ids) => {
  log.silly('Decrease the progress...');

  return modelInstance.findOneAndUpdate(
    { _id: userId },
    {
      $pull: { progress: { $in: isArray(ids) ? ids : [ids] } },
      $inc: { 'meta.version': 1 },
    },
    { multi: true },
  );
};

modelInstance.removeById = (id) => {
  log.silly(`Start remove a user with id ${id}`);
  return modelInstance.findOneAndRemove({ _id: id })
    .then((result) => {
      if (result === null) return Promise.reject(new Error('Not found'));
      return Promise.resolve(result);
    }).catch((error) => {
      log.error(error.message);
      return Promise.reject(error.message);
    });
};

module.exports = modelInstance;
