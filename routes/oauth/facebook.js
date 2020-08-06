const router = require('express').Router();
const ctrl = require('controllers/facebook');

module.exports = function (passport) {
  const initAuth = passport.authenticate('facebook', {
    authType: 'reauthenticate',
    scope: ['email', 'user_friends', 'manage_pages'],
  });

  const checkAuth = passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/fail',
  });

  router.get('', initAuth, ctrl.initialize);
  router.get('/callback', checkAuth, ctrl.check);
  router.get('/fail', ctrl.handleFail);

  return router;
};
