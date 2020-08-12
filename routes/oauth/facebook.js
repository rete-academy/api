const router = require('express').Router();
const ctrl = require('controllers/facebook');

module.exports = function (passport) {
  const initFacebookAuth = passport.authenticate('facebook', {
    authType: 'reauthenticate',
    // scope: ['email', 'user_friends', 'manage_pages'],
    scope: ['email', 'public_profile'],
  });

  const checkFacebookAuth = passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/fail',
  });

  router.get('', initFacebookAuth, ctrl.initialize);
  router.get('/callback', checkFacebookAuth, ctrl.check);
  router.get('/fail', ctrl.handleFail);

  return router;
};
