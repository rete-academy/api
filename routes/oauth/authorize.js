const router = require('express').Router();
const oauth2 = require('library/oauth2');

module.exports = function (passport) {
  const auth = passport.authenticate(['bearer'], { session: false });

  router.get('', auth, oauth2.authorization);
  router.post('', auth, oauth2.decision);

  return router;
};
