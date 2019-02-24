'use strict';

const oauth2orize = require('oauth2orize');
const crypto = require('crypto');

const config = require('config');
// const log = require('library/logger');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');
const AuthorizationCode = require('mongo/model/authorization_code');
const AccessToken = require('mongo/model/token');

let server = oauth2orize.createServer();
/*
 * add these things will make authentication process slow?
server.serializeClient((client, done) => {
    done(null, client.client_id)
});

server.deserializeClient((id, done) => {
    Client.findOne({ client_id: id }, (error, client) => {
        if (error) return done(error);
        return done(null, client);
    });
});
 */
server.grant(oauth2orize.grant.code({
    scopeSeparator: [' ', ',']
}, function (client, redirect_uri, user, ares, callback) {
    let authorization_code = new AuthorizationCode({
        code: crypto.randomBytes(16).toString('hex'),
        client_id: client.client_id,
        redirect_uri: redirect_uri,
        user_id: user._id,
        scope: ares.scope
    });

    authorization_code.save(function (err) {
        if (err) return callback(err);
        callback(null, authorization_code.code);
    });
}));

server.exchange(oauth2orize.exchange.code(function (client, code, redirect_uri, callback) {
    AuthorizationCode.findOne({ code }, function (err, authorization_code) {
        if (err) return callback(err);
        if (authorization_code === null) return callback(null, false);
        if (client.client_id.toString() !== authorization_code.client_id) return callback(null, false);
        if (redirect_uri !== authorization_code.redirect_uri) return callback(null, false);

        authorization_code.remove(function (err) {
            if (err) return callback(err);

            let token = new AccessToken({
                token: crypto.randomBytes(32).toString('hex'),
                client_id: authorization_code.client_id,
                user_id: authorization_code.user_id
            });

            token.save(function (err) {
                if (err) return callback(err);
                callback(null, token);
            });
        });
    });
}));

exports.authorization = [
    server.authorization(function (client_id, redirect_uri, callback) {
        Client.findOne({client_id: client_id}, function (err, client) {
            if (err) return callback(err);
            return callback(null, client, redirect_uri);
        });
    }),
    function (req, res) {
        res.render('dialog', {transaction_id: req.oauth2.transactionID, user: req.user, client: req.oauth2.client});
    }
];

exports.decision = [
    server.decision()
];

const errFn = function (cb, err) {
    if (err) return cb(err);
};

const generateTokens = function ({ user, client }, done) {
    let errorHandler = errFn.bind(undefined, done);
    let refreshTokenValue;
    let token;
    let tokenValue;

    const model = {
        user_id: user._id,
        client_id: client.client_id
    };

    AccessToken.deleteOne(model, function (err, removed) {
        if (err) errorHandler(err, removed);
        tokenValue = crypto.randomBytes(32).toString('hex');
        refreshTokenValue = crypto.randomBytes(32).toString('hex');

        model.token = tokenValue;
        token = new AccessToken(model);

        model.token = refreshTokenValue;

        token.save().then(() => {
            done(null, tokenValue, refreshTokenValue, {
                'expires_in': config.limit.tokenLife,
                user,
            });
        }, function (err) {
            if (err) return done(err);
        })
    });
};

server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
    User.findOne({ username }).then(function (user) {
        if (!user || !user.checkPassword(password)) return done(null, false);
        generateTokens({ user, client }, done);
    }, function (error) {
        return done(error);
    })
}));

exports.token = [
    server.token(),
    server.errorHandler()
];
