const randomize = require('randomatic');
const log = require('library/logger');
const User = require('mongo/model/user');
const config = require('config');
const emailService = require('library/email');
const confirmationCode = require('mongo/model/confirmation_code');

const {
  checkRole,
  defaultResponse,
  filterUserData,
  slugify,
} = require('library/utils');

const invalidRequest = (req, res) => {
  defaultResponse(req, res, 405);
};

const findAll = async (req, res) => {
  try {
    const allUsers = await User.findAll(req.query);
    defaultResponse(req, res, 200, filterUserData(req.user, allUsers));
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const findMe = async (req, res) => {
  try {
    const me = await User.findOne({ email: req.user.email });
    defaultResponse(req, res, 200, { profile: me });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createNew = async (req, res) => {
  try {
    const user = req.body;

    if (!user.username) {
      user.username = `${slugify(user.name)}${randomize('a0', 6)}`;
    }

    if (!req.body.email) {
      throw new TypeError('Email is required.');
    }

    const found = await User.findByEmail(user.email);
    if (found) {
      throw new TypeError('Email taken');
    }

    const createdUser = await User.createNew(user);

    log.debug('Create new user, phase 1: User created.');

    const confirm = await confirmationCode.createNew({
      userId: createdUser._id,
      email: createdUser.email,
    });

    log.debug('Create new user, phase 2: Code created.');

    await emailService.sendMail({
      from: config.email.noreply,
      to: user.email,
      subject: config.email.welcome.subject,
      text: config.email.welcome.text,
      placeholders: {
        TITLE: config.email.welcome.subject,
        CONTENT: config.email.welcome.content,
        LINK: `${config.default.webUrl}/confirm/${confirm.code}`,
        CODE: confirm.code,
      },
      type: 'welcome',
    });

    log.debug('Create new user, phase 3: Email sent.');

    defaultResponse(req, res, 201, 'Check email inbox');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const sendConfirm = async (req, res) => {
  try {
    const email = checkRole(req.user, 'admin') ? req.body.email : req.user.email;
    if (!email) throw new TypeError('Email is required.');
    const foundUser = await User.findByEmail(email);
    if (!foundUser) throw new TypeError('Can not find user account');
    // Delete the confirmation code linked with user email (if anh)
    await confirmationCode.removeByEmail(foundUser.email);
    //  Create new confirmation code.
    const newConfirm = await confirmationCode.createNew({
      userId: foundUser._id,
      email: foundUser.email,
    });
    // Send email to notify user. Need fall back solution if sending fail
    await emailService.sendMail({
      from: config.email.noreply,
      to: foundUser.email,
      subject: config.email.welcome.subject,
      text: config.email.welcome.text,
      placeholders: {
        TITLE: config.email.welcome.subject,
        CONTENT: config.email.welcome.content,
        LINK: `${config.default.webUrl}/confirm/${newConfirm.code}`,
        CODE: newConfirm.code,
      },
      type: 'welcome',
    });

    log.debug(`New code created, email sent to ${foundUser.email}`);
    defaultResponse(req, res, 201, 'Check email inbox');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const confirmEmail = async (req, res) => {
  try {
    const found = await confirmationCode.findByCode(req.params.code);
    if (found.length <= 0 || confirmationCode.isExpired(found[0])) {
      // return new Error('Confirmation code used, expired or not found.');
      defaultResponse(req, res, 404, 'Confirmation code invalid');
      return;
    }
    const confirmedUser = await User.findOneAndUpdate(
      { _id: found[0].userId },
      {
        $set: {
          email: found[0].email,
          updatedTime: Date.now(),
          'meta.confirm': true,
        },
      },
      { new: true },
    );
    await confirmationCode.removeByUserId(confirmedUser._id);
    defaultResponse(req, res, 201, 'Your email is confirmed!');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updateUser = async (req, res) => {
  log.silly('Start updating a user...');

  try {
    if (checkRole(req.user, 'admin') || req.params.id === req.user._id.toString()) {
      const updated = await User.updateById(req.params.id, req.body);
      defaultResponse(req, res, 200, updated);
      log.debug('User was updated');
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updateStatus = async (req, res) => {
  log.silly('Start updating material status...');
  try {
    if (req.body.role) { delete req.body.role; }
    await User.updateStatus(req.params.userId, req.body);
    log.debug('User was updated');
    defaultResponse(req, res, 200, 'OK');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const enroll = async (req, res) => {
  log.silly('Start enrolling...');

  try {
    const response = await User.enroll(req.params.id, req.body.data);
    log.debug('User was enrolled.');

    defaultResponse(req, res, 200, response);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const unenroll = async (req, res) => {
  log.silly('Start unenrolling...');

  try {
    const response = await User.unenroll(req.params.id, req.body.data);
    log.debug('User was unenrolled.');

    defaultResponse(req, res, 200, response);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const increaseProgress = async (req, res) => {
  log.silly('Start increasing...');

  try {
    const response = await User.increaseProgress(req.params.id, req.body.data);
    log.debug('Progress was increased.');

    defaultResponse(req, res, 200, response);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const decreaseProgress = async (req, res) => {
  log.silly('Start increasing...');

  try {
    const response = await User.decreaseProgress(req.params.id, req.body.data);
    log.debug('Progress was increased.');

    defaultResponse(req, res, 200, response);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updateProgress = async (req, res) => {
  log.silly('Start updating user progress...');
  try {
    if (req.body.role) { delete req.body.role; }
    const updated = await User.updateProgress(req.params.userId, req.body);
    log.debug('User was updated');
    defaultResponse(req, res, 200, updated);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (req.file && req.user) {
      // the uploadToS3 will attach the result into req.file
      const updated = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            avatar: { ...req.file },
            updatedTime: Date.now(),
          },
        },
        { new: true },
      );
      defaultResponse(req, res, 200, updated);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const remove = async (req, res) => {
  log.silly('Start deleting user...');
  try {
    if (req.user.role.includes(0)) {
      const deleted = User.removeById(req.params.id);
      log.debug('User was deleted');
      defaultResponse(req, res, 200, deleted);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports = {
  invalidRequest,
  findAll,
  findMe,
  enroll,
  unenroll,
  increaseProgress,
  decreaseProgress,
  uploadAvatar,
  createNew,
  updateUser,
  sendConfirm,
  confirmEmail,
  updateStatus,
  updateProgress,
  remove,
};
