module.exports = {
  createdTime: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
};
