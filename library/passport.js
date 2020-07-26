// const conf = require('config');
const { BasicStrategy } = require('passport-http');
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const log = require('library/logger');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');
const Invitation = require('mongo/model/invitation');
const AccessToken = require('mongo/model/token');
const PasswordResetToken = require('mongo/model/password');
const Confirmation = require('mongo/model/confirmation_code');

const {
  InvitationStrategy,
  PasswordResetStrategy,
  EmailConfirmationStrategy,
} = require('library/strategy');

module.exports = function (passport) {
  console.log('### passport:', passport);
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  /*
   * add these things will make authentication process slow?
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            if (err) return done(err);
            done(null, user);
        });
    });
  */

  passport.use('basic', new BasicStrategy(
    (username, password, done) => {
      User.findOne({ username }).then((user) => {
        if (!user || !user.checkPassword(password) || user.status > 1) {
          return done(null, false);
        }
        return done(null, user);
      }, (err) => done(err));
    },
  ));

  passport.use('client', new BasicStrategy(
    (clientId, clientSecret, done) => {
      console.log('### clientSecret:', clientSecret);
      console.log('### clientId:', clientId);
      Client.findOne({ client_id: clientId }).then((client) => {
        console.log('### client:', client);
        if (client && client.client_secret === clientSecret) {
          return done(null, false);
        }
        return done(null, false);
      });
    },
  ));

  passport.use('client-basic', new ClientPasswordStrategy(
    (clientId, clientSecret, done) => {
      console.log('### clientSecret:', clientSecret);
      console.log('### clientId:', clientId);
      Client.findOne({ client_id: clientId }).then((client) => {
        console.log('### client:', client);
        if (!client) return done(null, false);
        if (client.client_secret !== clientSecret) return done(null, false);
        return done(null, client);
      }, (err) => done(err));
    },
  ));

  passport.use('bearer', new BearerStrategy(
    (tokenStr, done) => {
      AccessToken.findOne({ token: tokenStr }).then((token) => {
        if (!token) done(null, false);

        if (Math.round((Date.now() - token.created_time) / 1000) > 2592000) {
          AccessToken.deleteOne({ token }, (err) => done(err));
          done(null, false, { message: 'Token expired' });
        }

        User.findOne({ _id: token.user_id }).then((user) => {
          if (!user || user.status > 1) {
            return done(null, false, { message: 'Unknown user' });
          }

          const info = { scope: '*' };
          return done(null, user, info);
        }, (error) => done(error));
      }, (err) => done(err));
    },
  ));

  passport.use('invitation', new InvitationStrategy(
    (code, done) => {
      Invitation.findOne({ code }).then((foundCode) => {
        if (!foundCode) return done(null, false);
        return done(null, code);
      }).catch((err) => done(err));
    },
  ));

  passport.use('password-reset', new PasswordResetStrategy(
    (token, done) => {
      PasswordResetToken.findOne({ token }).then((foundToken) => {
        if (!foundToken) return done(null, false);
        return done(null, token);
      }).catch((err) => done(err));
    },
  ));

  passport.use('confirmation', new EmailConfirmationStrategy(
    (code, done) => {
      Confirmation.findByCode({ code }).then((foundCode) => {
        if (!foundCode) return done(null, false);
        return done(null, code);
      }).catch((err) => done(err));
    },
  ));

  passport.use('facebook', new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: process.env.FB_APP_CALLBACK,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
      log.debug(`login from FB ${accessToken}`);

      User.findOne({ 'provider.facebook.id': profile.id })
        .then(async (err, user) => {
          if (err) {
            if (err) log.error(err);
            return done(err);
          }

          if (!user) {
            log.debug('Can not find this facebook user');
            const newUser = await User.createNew({
              fullName: profile.displayName,
              email: profile.emails[0].value,
              username: profile.username,
              provider: {
                facebook: profile._json,
              },
            });
            return done(err, newUser);
          }
          log.debug('Found facebook user');
          return done(err, user);
        });
    },
  ));
};
