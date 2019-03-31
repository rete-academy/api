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
    destination: function (req, file, cb) {
        log.debug(file);
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        log.debug(file);
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const normalUpload = multer({ storage: storage })

const uploadToS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
        cacheControl: `max-age=${config.limit.fileCache}`,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null,`${req.user._id}/${file.fieldname}/${file.originalname}`);
        },
    }),
});

const deleteFromS3 = (params) => {
    return new Promise((resolve, reject) => {
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
};

module.exports = {
    uploadToS3,
    deleteFromS3,
    normalUpload,
};