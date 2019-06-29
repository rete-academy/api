'use strict';

const mongoose = require('mongoose');

module.exports = {
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
  type: {
    type: String,
    default: 'tutorial',
    // ebook, article, video, tutorial
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversation',
  },
  icon: {
    type: String,
    default: 'file',
    // kebab-case, check fontAwesome
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      version: 1,
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

