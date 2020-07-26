/*
 * Path schema definitions
 */
const mongoose = require('mongoose');

module.exports = {
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  sprints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sprint',
  }],
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      version: 1,
      position: {},
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
};
