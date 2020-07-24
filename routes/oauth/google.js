const router = require('express').Router();
const ctrl = require('controllers/google');

module.exports = function () {
  router.get('', ctrl.getConnectionUrl);
  router.post('', ctrl.getAccessToken);
  router.put('', ctrl.invalidRequest);
  router.delete('', ctrl.invalidRequest);
  router.get('/test', ctrl.test);

  return router;
};
