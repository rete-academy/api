const NodeCache = require('node-cache');

// 900 = 15min
// 3600 = 60min
const defaultTTL = 86400; // 24h

const cache = {};

function getDoc(collection, id) {
  if (Object.hasOwnProperty.call(cache, collection)) return cache[collection].cache.get(id.toString());
  return undefined;
}

function getDocs(collection) {
  if (Object.hasOwnProperty.call(cache, collection)) {
    const array = [];
    const keys = cache[collection].cache.keys();
    for (let j = 0; j < keys.length; j++) {
      array.push(cache[collection].cache.get(keys[j]));
    }
    return array;
  } return [];
}

function setDoc(collection, key, doc) {
  if (!cache[collection]) cache[collection] = { cache: new NodeCache(), TTL: defaultTTL };
  if (cache[collection].TTL) {
    if (Object.hasOwnProperty.call(cache, collection)) {
      cache[collection].cache.set(
        key.toString(),
        doc,
        cache[collection].TTL,
      );
    }
  } else if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.set(key.toString(), doc);
}

function delDoc(collection, id) {
  if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.del(id.toString());
}

module.exports = {
  getDoc, getDocs, setDoc, delDoc,
};
