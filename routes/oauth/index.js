const fs = require('fs');
const router = require('express').Router();

module.exports = function (passport) {
  fs.readdir('./routes/oauth', (err, files) => {
    files.forEach((file) => {
      if (file !== 'index.js') {
        router.use(`/${file.slice(0, -3)}/`, require(`./${file}`)(passport));
      }
    });
  });

  return router;
};
