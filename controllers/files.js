const log = require('library/logger');
const File = require('mongo/model/file');
const { deleteFromS3 } = require('library/aws');

const {
  checkAuthor,
  checkRole,
  defaultResponse,
} = require('library/utils');

const invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

const findAll = async function (req, res) {
  try {
    log.verbose('Start finding all files');

    const query = checkRole(req.user, 'admin') ? req.query : {
      $and: [
        req.query,
        {
          $or: [
            { authors: { $elemMatch: { id: req.user._id } } },
            { status: 'public' },
          ],
        },
      ],
    };

    const allFiles = await File.find(query).populate('authors');

    defaultResponse(req, res, 200, allFiles);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const uploadSingle = async function (req, res) {
  try {
    if (req.file && req.user) {
      // the uploadToS3 will attach the result into req.file
      const value = {
        data: req.file,
        status: 'private',
        authors: [req.user._id],
      };
      const newFile = await File.createNew(value);
      defaultResponse(req, res, 200, newFile);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const deleteFiles = async function (req, res) {
  try {
    log.verbose('Start deleting files...');
    const { body, user } = req;

    let deleteObjects = [];

    const files = await File.find({ _id: { $in: body.ids } });

    if (checkRole(user, 'teacher')) {
      deleteObjects = files.map((o) => ({ Key: o.data.key }));
    } else {
      deleteObjects = files
        .filter((o) => checkAuthor(user, o))
        .map((o) => ({ Key: o.data.key }));
    }

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: { Objects: deleteObjects },
    };

    if (deleteObjects.length > 0) {
      await deleteFromS3(deleteParams);
      await File.deleteMany({ _id: { $in: files.map((o) => o._id) } });
      defaultResponse(req, res, 200, 'Deleted');
    } else {
      defaultResponse(req, res, 200, 'Nothing to delete');
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports = {
  invalidRequest,
  findAll,
  uploadSingle,
  deleteFiles,
};
