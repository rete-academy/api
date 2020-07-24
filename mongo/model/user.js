/* eslint-disable no-param-reassign */
const crypto = require('crypto');
const mongoose = require('mongoose');
const { isArray } = require('library/utils');
const log = require('library/logger');

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

schemaInstance.virtual('password').set((password) => {
  this._plainPassword = password;
  this.salt = crypto.randomBytes(256).toString('hex');
  this.hashedPassword = this.encryptPassword(password);
}).get(() => this._plainPassword);

schemaInstance.methods.checkPassword = function (password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schemaInstance.methods.checkEmail = function (email) {
  return this.email === email;
};

const modelInstance = mongoose.model('user', schemaInstance);

modelInstance.findAll = async (query) => {
  try {
    log.silly('Start finding all users');
    return await modelInstance.find(query)
      .populate('progress.path')
      .populate('progress.sprint')
      .populate('progress.material');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findById = (id) => {
  log.silly(`Start finding user with id: ${id}`);
  return modelInstance.findOne({ _id: id })
    .then((result) => {
      log.silly('Found user.');
      return Promise.resolve(result);
    }).catch((error) => {
      log.error(`${error.name}: ${error.message}`);
      return Promise.reject(error.message);
    });
};

modelInstance.findByUsername = (username) => {
  log.silly(`Start finding user by username: ${username}`);
  return modelInstance.findOne({ username })
    .then((result) => {
      log.silly(`User with ${username} found.`);
      return Promise.resolve(result);
    }).catch((error) => {
      log.error(error.message);
      return Promise.reject(error.message);
    });
};

modelInstance.findByEmail = async (email) => {
  try {
    log.silly(`Start finding user by email: ${email}`);
    return await modelInstance.findOne({ email });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async (user) => {
  try {
    log.silly('Start create a new user');
    // user.password = randomize('aA0!', 64);
    user.created_time = Date.now();
    user.updated_time = Date.now();
    return await modelInstance.create(user);
  } catch (error) {
    log.error(error.message);
    throw error;
  }
};

modelInstance.updateById = (id, doc) => {
  log.silly(`Start update a user with id ${id}`);
  const user = doc;
  // Delete non-updatable fields from the request
  delete user.createdTime;
  delete user.hashedPassword;
  delete user.salt;
  delete user.__v;
  delete user._id;

  return modelInstance.findOneAndUpdate({ _id: id }, user, { new: true })
    .then((result) => {
      if (result === null) return Promise.reject(new Error('Not found'));
      if (!user.password) return Promise.resolve(result);
      result.hashedPassword = result.encryptPassword(user.password);
      return result.save();
    }).then((result) => Promise.resolve(result)).catch((error) => {
      log.error(error.message);
      return Promise.reject(error.message);
    });
};

modelInstance.updateStatus = async (userId, doc) => {
  try {
    const updated = await modelInstance.findOneAndUpdate(
      {
        _id: userId,
        'progress._id': doc.id,
      },
      { $set: { 'progress.$.status': doc.status } },
      { new: true },
    );
    return updated;
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.updateProgress = async (userId, doc) => {
  try {
    log.silly('Start update a user progress...');
    const data = isArray(doc) ? doc : [doc];
    return await modelInstance.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { progress: { $each: data } },
        $inc: { 'meta.version': 1 },
      },
      { new: true },
    );
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
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
