const validate = require('mongoose-validator');
const mongoose = require('mongoose');

module.exports = {
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validate({
      validator: 'isEmail',
      message: 'Must be valid email address',
    }),
  },
  name: String,
  username: String,
  phone: String,
  avatar: {
    type: mongoose.Schema.Types.Mixed,
  },
  provider: {
    type: mongoose.Schema.Types.Mixed,
  },

  // [0: admin, 1: instructor, 2: user, 3: new]
  role: {
    type: Array,
    default: [3],
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.Mixed,
  },
  enrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'path',
  }],
  progress: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'material',
  }],
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      version: 1,
      confirm: false,
    },
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  updatedTime: {
    type: Date,
    default: Date.now,
  },
  hashedPassword: {
    type: String,
  },
  salt: {
    type: String,
  },
};
