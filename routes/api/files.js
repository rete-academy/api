const router = require('express').Router();
const {
  invalidRequest,
  findAll,
  deleteFiles,
  uploadSingle,
} = require('controllers/files');
const { uploadToS3 } = require('library/aws');

module.exports = function (passport) {
  const auth = passport.authenticate(['bearer'], { session: false });

  router.get('', auth, findAll);
  router.put('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  router.post('/upload', auth, uploadToS3.single('files'), uploadSingle);
  router.patch('/delete', auth, deleteFiles);

  return router;
};
