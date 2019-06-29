'use strict';

const util = require('util');
const Strategy = require('passport-strategy');

function PasswordResetStrategy(options, verify) {
  if (typeof options == 'function') {
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
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('Invitation authentication strategy requires a verify function');

  this._invitationCodeField = options.invitationCodeField || 'code';

  Strategy.call(this);
  this.name = 'invitation';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

function EmailConfirmationStrategy() {}

util.inherits(InvitationStrategy, Strategy);
util.inherits(PasswordResetStrategy, Strategy);
util.inherits(EmailConfirmationStrategy, Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
PasswordResetStrategy.prototype.authenticate = function(req) {
  // const options = opt || {};
  //Looking for this._tokenField inside both request queries and request bodies
  var resetToken = lookup(req.body, this._tokenField) || lookup(req.query, this._tokenField);
  if (!resetToken) {
    return this.fail(new Error("Missing password reset token"));
  }

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  if (self._passReqToCallback) {
    this._verify(req, resetToken, verified);
  } else {
    this._verify(resetToken, verified);
  }

  function lookup(obj, field) {
    if (!obj) { return null; }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
      var prop = obj[chain[i]];
      if (typeof(prop) === 'undefined') { return null; }
      if (typeof(prop) !== 'object') {
        return prop; }
      obj = prop;
    }
    return null;
  }
};
/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
InvitationStrategy.prototype.authenticate = function(req) {
  // options = options || {};
  //Looking for this._invitationCodeField inside both request queries and request bodies
  var invitationCode = lookup(req.body, this._invitationCodeField) || lookup(req.query, this._invitationCodeField);
  if (!invitationCode) {
    return this.fail(new Error("Missing invitation code"));
  }

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  if (self._passReqToCallback) {
    this._verify(req, invitationCode, verified);
  } else {
    this._verify(invitationCode, verified);
  }

  function lookup(obj, field) {
    if (!obj) { return null; }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
      var prop = obj[chain[i]];
      if (typeof(prop) === 'undefined') { return null; }
      if (typeof(prop) !== 'object') {
        return prop; }
      obj = prop;
    }
    return null;
  }
};

EmailConfirmationStrategy.prototype.authenticate = function() {}

// Expose Strategy constructor
module.exports = {
  InvitationStrategy,
  PasswordResetStrategy,
  EmailConfirmationStrategy,
};
