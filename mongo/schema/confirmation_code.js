module.exports = {
  createdTime: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    validate(email) {
      return /^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
    },
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
};
