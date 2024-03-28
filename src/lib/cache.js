const sqliteStore = require('cache-manager-sqlite');
const cacheManager = require('cache-manager');
const config = require('./config.js');

const cache = cacheManager.caching({
  store: sqliteStore,
  path: `${config.dataFolder}/cache.db`,
  options: { ttl: 86400 }
});

module.exports = cache;
