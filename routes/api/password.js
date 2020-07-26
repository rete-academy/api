const router = require('express').Router();
const ctrl = require('controllers/passwords');

module.exports = function (passport) {
  const auth = passport.authenticate(['basic', 'bearer'], { session: false });
  const authReset = passport.authenticate(['password-reset'], { session: false });

  router.get('', auth, ctrl.invalidRequest);
  router.post('', auth, ctrl.invalidRequest);
  router.put('', auth, ctrl.invalidRequest);
  router.delete('', auth, ctrl.invalidRequest);

  router.post('/forgot', ctrl.forgot);
  router.post('/reset', authReset, ctrl.reset);

  router.get('/:id', auth, ctrl.invalidRequest);
  router.post('/:id', auth, ctrl.invalidRequest);
  router.put('/:id', auth, ctrl.invalidRequest);
  router.delete('/:id', auth, ctrl.invalidRequest);

  return router;
};
