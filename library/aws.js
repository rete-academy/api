const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const config = require('config');
const log = require('library/logger');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'ap-southeast-1',
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    log.debug(file);
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    log.debug(file);
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const normalUpload = multer({ storage });

const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    cacheControl: `max-age=${config.limit.fileCache}`,
    metadata(req, file, callback) {
      callback(null, {
        fieldname: file.fieldname,
        user: req.user._id.toString(),
      });
    },
    key(req, file, callback) {
      callback(null, `${file.fieldname}/${file.originalname}`);
    },
  }),
});

const deleteFromS3 = (params) => new Promise((resolve, reject) => {
  s3.deleteObjects(params, (err, data) => {
    if (err) {
      log.error(err.stack);
      reject(err.stack);
    } else {
      log.debug(data);
      resolve(data);
    }
  });
});

module.exports = {
  uploadToS3,
  deleteFromS3,
  normalUpload,
};
