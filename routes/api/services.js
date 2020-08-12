const router = require('express').Router();
const ctrl = require('../../controllers/services');

module.exports = function (passport) {
  const auth = passport.authenticate(['basic', 'bearer'], { session: false });

  router.get('', auth, ctrl.findAll);
  router.post('', auth, ctrl.create);
  router.put('', auth, ctrl.invalidRequest);
  router.delete('', auth, ctrl.invalidRequest);

  router.get('/:id', auth, ctrl.invalidRequest);
  router.post('/:id', auth, ctrl.invalidRequest);
  router.put('/:id', auth, ctrl.updateById);
  router.delete('/:id', auth, ctrl.invalidRequest);

  return router;
};
