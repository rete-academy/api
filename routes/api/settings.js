'use strict';

const router = require('express').Router();
const {
  invalidRequest,
  getSettings,
  putSettings,
} = require('controllers/settings');
// const { uploadToS3 } = require('library/aws');
// const { googleAuth } = require('library/google');

module.exports = function(passport) {
  let auth = passport.authenticate(['bearer'], { session: false });
  // let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

  router.get('', auth, getSettings);
  router.put('', auth, putSettings);
  router.post('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  return router;
};
