'use strict';

module.exports = {
  created_time: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
};