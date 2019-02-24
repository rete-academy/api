'use strict';

// const conf = require('config');
const BasicStrategy = require('passport-http').BasicStrategy;
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
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
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
        function (username, password, done) {
            User.findOne({ username: username }).then(function (user) {
                if (!user || !user.checkPassword(password) || user.status > 1) {
                    return done(null, false);
                }
                return done(null, user);
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));

    passport.use('client', new BasicStrategy(
        function (client_id, client_secret, done) {
            Client.findOne({client_id: client_id}).then(function (client) {
                if (!client || client.client_secret !== client_secret) {
                    return done(null, false);
                }
                return done(null, client);
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));

    passport.use('client-basic', new ClientPasswordStrategy(
        function (client_id, client_secret, done) {
            Client.findOne({client_id: client_id}).then(function (client) {
                if (!client) return done(null, false);
                if (client.client_secret !== client_secret) return done(null, false);
                return done(null, client);
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));

    passport.use('bearer', new BearerStrategy(
        function (token, done) {
            AccessToken.findOne({ token }).then(function (token) {
                if (!token) return done(null, false);
                if (Math.round((Date.now() - token.created_time) / 1000) > 2592000) {
                    AccessToken.deleteOne({ token }, function (err) {
                        if (err) return done(err);
                    });
                    return done(null, false, { message: 'Token expired' });
                }
                User.findOne({_id: token.user_id}).then(function (user) {
                    if (!user || user.status > 1)
                        return done(null, false, { message: 'Unknown user' });

                    let info = {scope: '*'};
                    done(null, user, info);
                }, function (error) {
                    return done(error);
                });
            }, function (err) {
                if (err) return done(err);
            });
        }
    ));

    passport.use('invitation', new InvitationStrategy(
        function (code, done) {
            Invitation.findOne({code: code}).then(function (code) {
                if (!code) return done(null, false);
                return done(null, code);
            }).catch(function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));

    passport.use('password-reset', new PasswordResetStrategy(
        function (token, done) {
            PasswordResetToken.findOne({token: token}).then(function (token) {
                if (!token) return done(null, false);
                return done(null, token);
            }).catch(function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));
    
    passport.use('confirmation', new EmailConfirmationStrategy(
        function (code, done) {
            Confirmation.findByCode({ code: code }).then(function(code) {
                if (!code) return done(null, false);
                return done(null, code);
            }).catch(function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
    ));

    passport.use('facebook', new FacebookStrategy(
        {
            clientID: process.env.FB_APP_ID,
            clientSecret: process.env.FB_APP_SECRET,
            callbackURL: process.env.FB_APP_CALLBACK,
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        (accessToken, refreshToken, profile, done) => {
            log.debug('login from FB ' + accessToken);

            User.findOne({ 'provider.facebook.id': profile.id }).
                then(async function(err, user) {
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
                    } else {
                        log.debug('Found facebook user');
                        return done(err, user);
                    }
                });
        }
    ));
};
