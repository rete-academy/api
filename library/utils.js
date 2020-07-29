// const { maxBy } = require('lodash');

const defaultResponses = {
  res_200: { success: true, message: 'OK' },
  res_201: { success: true, message: 'Created.' },
  res_204: { success: true, message: 'No Content.' },
  res_400: { success: false, message: 'Bad Request.' },
  res_401: { success: false, message: 'Unauthorized.' },
  res_403: { success: false, message: 'Access denied.' },
  res_404: { success: false, message: 'Not Found.' },
  res_405: { success: false, message: 'Method Not Allowed.' },
  res_429: { success: false, message: 'Too Many Requests.' },
  res_500: { success: false, message: 'Internal Server Error.' },
};

function authoriseUser() {}
function notifyAdmin() {}

function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function isArray(value) {
  return value && typeof value === 'object' && value.constructor === Array;
}

function isEmail(str) {
  return /^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(str);
}

function getDomainFromUrl(url, port) {
  let domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
  if (domain.slice(-1) === '/') domain = domain.slice(0, -1);
  if (port) {
    const colonIndex = domain.indexOf(':');
    if (colonIndex !== -1) {
      domain = domain.substring(0, colonIndex);
    } else {
      domain = domain.substring(0, domain.length);
    }
  }
  return domain;
}

function promiseRejectWithError(code, msg, reference) {
  const error = new Error(msg || '');
  error.httpStatusCode = code || 500;
  error.reference = reference;
  return Promise.reject(error);
}

function defaultResponse(req, res, inputCode, msg) {
  let code = inputCode;

  if (!res.finished) {
    if (!code) code = 500;
    const json = JSON.parse(JSON.stringify(defaultResponses[`res_${code}`]));
    if (code === 200 || code === 201) {
      if (msg) json.message = msg;
      res.status(code).send(json);
    } else {
      if (isObject(msg)) json.message = msg;
      else if (msg) json.message += ` ${msg}`;
      res.status(code).send(json);
    }
  }
}

function strengthCheck(password) {
  const strong = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
  const medium = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');
  if (strong.test(password)) return 'Strong';
  if (medium.test(password)) return 'Medium';
  throw new Error('Password has to contain at least 6 chars and two of the following: lowercase, uppercase or number.');
}

function slugify(value) {
  let str = value;
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

const isAdmin = (auth) => !!auth && auth.role && auth.role.includes(0);

function filterUserData(auth, results) {
  if (auth.email) { // only allow registered user
    return results.filter((o) => Math.min(...o.role) >= Math.min(...auth.role));
  }
  return 'Not allowed';
}

function checkRole(user, role) {
  if (user && user.role && role) {
    switch (role) {
      case 'admin':
      case 0:
        return user.role.some((n) => n === 0);
      case 'teacher':
      case 'mod':
      case 1:
        return user.role.some((n) => n === 1 || n === 0);
      case 'student':
      case 'user':
      case 2:
        return user.role.some((n) => n === 2 || n === 0);
      case 'unconfirmed':
      case 'new-user':
      case 3:
        return user.role.some((n) => n === 3 || n === 0);
      default:
        return false;
    }
  }
  return false;
}

module.exports = {
  authoriseUser,
  checkRole,
  promiseRejectWithError,
  defaultResponse,
  filterUserData,
  getDomainFromUrl,
  notifyAdmin,
  slugify,
  strengthCheck,
  isAdmin,
  isArray,
  isEmail,
  isObject,
};
