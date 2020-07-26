const mongoose = require('mongoose');

module.exports = {
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      fieldname: '',
      originalname: '',
      encoding: '',
      mimetype: '',
      size: 0,
      location: '',
    },
  },
  status: {
    type: String,
    required: true,
    default: 'unlisted', // 'private', 'unlisted', 'public'
  },
  authors: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    role: 0,
  }],
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
};
