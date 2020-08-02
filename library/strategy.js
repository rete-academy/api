const util = require('util');
const Strategy = require('passport-strategy');

function PasswordResetStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('Password reset strategy requires a verify function');

  this._tokenField = options.tokenField || 'token';

  Strategy.call(this);
  this.name = 'passwordReset';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

function InvitationStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!verify) {
    throw new Error('Invitation authentication strategy requires a verify function');
  }

  this._invitationCodeField = options.invitationCodeField || 'code';

  Strategy.call(this);
  this.name = 'invitation';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

// function EmailConfirmationStrategy() {}

util.inherits(InvitationStrategy, Strategy);
util.inherits(PasswordResetStrategy, Strategy);
// util.inherits(EmailConfirmationStrategy, Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
PasswordResetStrategy.prototype.authenticate = function (req) {
  function lookup(obj, field) {
    if (!obj) { return null; }

    const chain = field.split(']').join('').split('[');

    for (let i = 0, len = chain.length; i < len; i++) {
      const prop = obj[chain[i]];
      if (typeof (prop) === 'undefined') { return null; }
      if (typeof (prop) !== 'object') {
        return prop;
      }
      obj = prop;
    }
    return null;
  }

  // const options = opt || {};
  // Looking for this._tokenField inside both request queries and request bodies
  const { body, query } = req;
  const resetToken = lookup(body, this._tokenField) || lookup(query, this._tokenField);
  if (!resetToken) {
    return this.fail(new Error('Missing password reset token'));
  }

  const self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    return self.success(user, info);
  }

  if (self._passReqToCallback) {
    return this._verify(req, resetToken, verified);
  }
  return this._verify(resetToken, verified);
};
/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
InvitationStrategy.prototype.authenticate = function (req) {
  function lookup(obj, field) {
    if (!obj) { return null; }
    const chain = field.split(']').join('').split('[');
    for (let i = 0, len = chain.length; i < len; i++) {
      const prop = obj[chain[i]];
      if (typeof (prop) === 'undefined') { return null; }
      if (typeof (prop) !== 'object') {
        return prop;
      }
      obj = prop;
    }
    return null;
  }

  const invitationCode = lookup(req.body, this._invitationCodeField) || lookup(req.query, this._invitationCodeField);
  if (!invitationCode) {
    return this.fail(new Error('Missing invitation code'));
  }

  const self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    return self.success(user, info);
  }

  if (self._passReqToCallback) {
    return this._verify(req, invitationCode, verified);
  }
  return this._verify(invitationCode, verified);
};

// EmailConfirmationStrategy.prototype.authenticate = function () {};

// Expose Strategy constructor
module.exports = {
  InvitationStrategy,
  PasswordResetStrategy,
  // EmailConfirmationStrategy,
};
