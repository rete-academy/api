const oauth2orize = require('oauth2orize');
const crypto = require('crypto');

const config = require('config');
// const log = require('library/logger');
const { isEmail } = require('library/utils');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');
const AuthorizationCode = require('mongo/model/authorization_code');
const AccessToken = require('mongo/model/token');

const server = oauth2orize.createServer();
/*
//  * add these things will make authentication process slow?
server.serializeClient((client, done) => {
  done(null, client.clientId);
});

server.deserializeClient((id, done) => {
  Client.findOne({ client_id: id }, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
});
*/
server.grant(oauth2orize.grant.code({
  scopeSeparator: [' ', ','],
}, (client, redirectUri, user, ares, callback) => {
  const authorizationCode = new AuthorizationCode({
    code: crypto.randomBytes(16).toString('hex'),
    client_id: client.client_id,
    redirect_uri: redirectUri,
    user_id: user._id,
    scope: ares.scope,
  });

  authorizationCode.save((err) => {
    if (err) { callback(err); }
    callback(null, authorizationCode.code);
  });
}));

server.exchange(oauth2orize.exchange.code((client, code, redirectUri, callback) => {
  AuthorizationCode.findOne({ code }, (err, authorizationCode) => {
    if (err) { callback(err); }
    if (authorizationCode === null) { callback(null, false); }
    if (client.client_id.toString() !== authorizationCode.client_id) callback(null, false);
    if (redirectUri !== authorizationCode.redirect_uri) callback(null, false);

    authorizationCode.remove((removeError) => {
      if (err) callback(removeError);

      const token = new AccessToken({
        token: crypto.randomBytes(32).toString('hex'),
        client_id: authorizationCode.client_id,
        user_id: authorizationCode.user_id,
      });

      token.save((error) => {
        if (error) return callback(error);
        return callback(null, token);
      });
    });
  });
}));

exports.authorization = [
  server.authorization((clientId, redirectUri, callback) => {
    Client.findOne({ client_id: clientId }, (err, client) => {
      if (err) return callback(err);
      return callback(null, client, redirectUri);
    });
  }),

  (req, res) => {
    res.render('dialog', { transaction_id: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
  },
];

exports.decision = [
  server.decision(),
];

const errFn = (cb, err) => {
  if (err) cb(err);
};

const generateTokens = (user, client, done) => {
  const errorHandler = errFn.bind(undefined, done);
  let refreshTokenValue;
  let token;
  let tokenValue;

  const model = {
    user_id: user._id,
    client_id: client.client_id,
  };

  AccessToken.deleteOne(model, (err, removed) => {
    if (err) errorHandler(err, removed);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    model.token = tokenValue;
    model.refreshToken = refreshTokenValue;

    token = new AccessToken(model);

    token.save()
      .then(() => done(null, tokenValue, refreshTokenValue, {
        expires_in: config.limit.tokenLife,
        user,
      }))
      .catch((error) => done(error));
  });
};

server.exchange(oauth2orize.exchange.password((client, login, password, scope, done) => {
  let query;

  if (isEmail(login)) query = { email: login };
  else query = { username: login };

  User.findOne(query).then((user) => {
    if (!user || !user.checkPassword(password)) { return done(null, false); }

    return generateTokens(user, client, done);
  }, (error) => done(error));
}));

exports.token = [
  server.token(),
  server.errorHandler(),
];
