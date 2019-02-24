const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
// const log = require('library/logger');

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'ap-southeast-1',
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(file);
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const normalUpload = multer({ storage: storage })

const uploadToS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'template-api',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // make folder by adding string like this
            cb(null, 'folder/' + file.originalname)
        },
    }),
});

module.exports = {
    uploadToS3,
    normalUpload,
};
