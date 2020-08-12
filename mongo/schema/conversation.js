// const validate = require('mongoose-validator');
const mongoose = require('mongoose');

module.exports = {
  messages: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      createdTime: {
        type: Date,
        default: Date.now,
      },
      content: {
        type: String,
        default: '',
      },
    },
  ],
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'material',
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      version: 1,
      people: 0,
      status: 1, // 1 active, 0 inactive, 9 archive
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
