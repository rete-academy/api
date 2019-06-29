'use strict';

const NodeCache = require('node-cache');

// 900 = 15min
// 3600 = 60min
const defaultTTL = 86400; // 24h

let cache = {};

function getDoc(collection, id) {
  if (cache.hasOwnProperty(collection))
    return cache[collection].cache.get(id.toString());
  else return undefined;
}

function getDocs (collection) {
  if (cache.hasOwnProperty(collection)) {
    let array = [];
    let keys = cache[collection].cache.keys();
    for (let j = 0; j < keys.length; j++) {
      array.push(cache[collection].cache.get(keys[j]));
    }
    return array;
  } else return [];
}

function setDoc(collection, key, doc) {
  if (!cache[collection])
    cache[collection] = { cache: new NodeCache(), TTL: defaultTTL };
  if (cache[collection].TTL) {
    if (cache.hasOwnProperty(collection))
      cache[collection].cache.set(
        key.toString(),
        doc,
        cache[collection].TTL
      );
  } else {
    if (cache.hasOwnProperty(collection))
      cache[collection].cache.set(key.toString(), doc);
  }
}

function delDoc(collection, id) {
  if (cache.hasOwnProperty(collection))
    cache[collection].cache.del(id.toString());
}

module.exports = { getDoc, getDocs, setDoc, delDoc };
