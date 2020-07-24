const router = require('express').Router();
const ctrl = require('controllers/facebook');

module.exports = function (passport) {
  const auth = passport.authenticate('facebook', {
    authType: 'rerequest',
    scope: ['email', 'user_friends', 'manage_pages'],
  });

  const facebookAuth = passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/',
  });

  router.get('', auth, ctrl.test);
  router.get('/callback', facebookAuth, ctrl.callback);

  return router;
};
