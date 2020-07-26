const config = require('config');
const log = require('library/logger');
const Password = require('mongo/model/password');
const User = require('mongo/model/user');
const emailService = require('library/email');
const {
  // authoriseUser,
  // getDomainFromUrl,
  defaultResponse,
  promiseRejectWithError,
} = require('library/utils');

module.exports.invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

module.exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      defaultResponse(req, res, 400, 'Email is required.');
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      promiseRejectWithError(404, 'User not found.');
    }

    await Password.deleteOne({ _id: foundUser._id });

    const newPassword = await Password.createNew({ user_id: foundUser._id });

    await emailService.sendMail({
      from: config.email.noreply,
      to: foundUser.email,
      subject: config.email.reset.subject,
      text: config.email.reset.text,
      placeholders: {
        TITLE: config.email.reset.subject,
        CONTENT: config.email.reset.content,
        LINK: `${config.default.webUrl}/password/reset?token=${newPassword.token}`,
        CODE: newPassword.token,
      },
      type: 'reset',
    });

    defaultResponse(req, res, 200, 'OK'); // should not put token into response.
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports.reset = function (req, res) {
  let updatedUser;
  if (!req.body.password) return defaultResponse(req, res, 400, 'password is required.');
  return Password.findByToken(req.query.token)
    .then((result) => {
      if (!result) return promiseRejectWithError(404, 'Token not found.');
      if (Date.now() - result.createdTime >= config.limit.codeLife) {
        return promiseRejectWithError(404, 'Token expired.');
      }
      return User.findOne({ _id: result.user_id });
    }).then((result) => {
      if (!result) return promiseRejectWithError(500, 'User not found.');
      result.set('password', req.body.password);
      return result.save();
    }).then((result) => {
      updatedUser = result;
      return Password.removeByToken(req.user.token);
    })
    .then(() => {
      defaultResponse(req, res, 200, updatedUser);
    })
    .catch((error) => {
      defaultResponse(req, res, error.httpStatusCode, error.message);
    });
};

module.exports.newReset = async (req, res) => {
  try {
    if (!req.body.password) {
      defaultResponse(req, res, 400, 'password is required.');
    }

    const oldPassword = await Password.findByToken(req.user.token);

    if (!oldPassword) {
      promiseRejectWithError(404, 'Token or password not found.');
    }

    const foundUser = await User.findOne({ _id: req.user.user_id });

    if (!foundUser) {
      promiseRejectWithError(500, 'User not found.');
    }

    oldPassword.set('password', req.body.password);

    oldPassword.save();

    await Password.removeByToken(req.user.token);

    defaultResponse(req, res, 200, oldPassword);
  } catch (error) {
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};
