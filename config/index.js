// Export the config object based on the NODE_ENV
// ==============================================
// if not set default to dev
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
module.exports = require(`./${process.env.NODE_ENV}.js`) || {};
