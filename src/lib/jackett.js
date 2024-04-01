const crypto = require('crypto');
const { Parser } = require('xml2js');
const config = require('./config.js');
const cache = require('./cache.js');
const { numberPad } = require('./util.js');

const CATEGORY = {
  MOVIE: 2000,
  SERIES: 5000,
};

async function searchMovieTorrents({ indexer, name, year }) {
  indexer = indexer || 'all';
  let items = await cache.get(`jackettItems:movie:${indexer}:${name}:${year}`);

  if (!items) {
    const res = await jackettApi(
      `/api/v2.0/indexers/${indexer}/results/torznab/api`,
      { t: 'movie', q: name, year: year }
    );
    items = normalizeItems(res?.rss?.channel?.item || []);
    cache.set(`jackettItems:movie:${indexer}:${name}:${year}`, items, { ttl: items.length > 0 ? 3600 * 36 : 60 });
  }

  return items;
}

async function searchSeasonTorrents({ indexer, name, year, season }) {
  indexer = indexer || 'all';
  let items = await cache.get(`jackettItems:season:${indexer}:${name}:${year}:${season}`);

  if (!items) {
    const res = await jackettApi(
      `/api/v2.0/indexers/${indexer}/results/torznab/api`,
      { t: 'tvsearch', q: `${name} S${numberPad(season)}` }
    );
    items = normalizeItems(res?.rss?.channel?.item || []);
    cache.set(`jackettItems:season:${indexer}:${name}:${year}:${season}`, items, { ttl: items.length > 0 ? 3600 * 36 : 60 });
  }

  return items;
}

async function searchEpisodeTorrents({ indexer, name, year, season, episode }) {
  indexer = indexer || 'all';
  let items = await cache.get(`jackettItems:episode:${indexer}:${name}:${year}:${season}:${episode}`);

  if (!items) {
    const res = await jackettApi(
      `/api/v2.0/indexers/${indexer}/results/torznab/api`,
      { t: 'tvsearch', q: `${name} S${numberPad(season)}E${numberPad(episode)}` }
    );
    items = normalizeItems(res?.rss?.channel?.item || []);
    cache.set(`jackettItems:episode:${indexer}:${name}:${year}:${season}:${episode}`, items, { ttl: items.length > 0 ? 3600 * 36 : 60 });
  }

  return items;
}

async function getIndexers() {
  const res = await jackettApi(
    '/api/v2.0/indexers/all/results/torznab/api',
    { t: 'indexers', configured: 'true' }
  );

  return normalizeIndexers(res?.indexers?.indexer || []);
}

async function jackettApi(path, query) {
  const params = new URLSearchParams(query || {});
  params.set('apikey', config.jackettApiKey);

  const url = `${config.jackettUrl}${path}?${params.toString()}`;

  let data;
  const res = await fetch(url);
  if (res.headers.get('content-type').includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    const parser = new Parser({ explicitArray: false, ignoreAttrs: false });
    data = await parser.parseStringPromise(text);
  }

  if (data.error) {
    throw new Error(`jackettApi: ${url.replace(/apikey=[a-z0-9\-]+/, 'apikey=****')} : ${data.error?.$?.description || data.error}`);
  }

  return data;
}

function normalizeItems(items) {
  return forceArray(items).map(item => {
    item = mergeDollarKeys(item);
    const attr = item['torznab:attr'].reduce((obj, item) => {
      obj[item.name] = item.value;
      return obj;
    }, {});
    const quality = item.title.match(/(2160|1080|720|480|360)p/);
    let languages = config.languages.filter(lang => item.title.match(lang.pattern));
    return {
      name: item.title,
      guid: item.guid,
      indexerId: item.jackettindexer.id,
      id: crypto.createHash('sha1').update(item.guid).digest('hex'),
      size: parseInt(item.size),
      link: item.link,
      seeders: parseInt(attr.seeders || 0),
      peers: parseInt(attr.peers || 0),
      infoHash: attr.infohash || '',
      magneturl: attr.magneturl || '',
      type: item.type,
      quality: quality ? parseInt(quality[1]) : 0,
      languages: languages
    };
  });
}

function normalizeIndexers(items) {
  return forceArray(items).map(item => {
    item = mergeDollarKeys(item);
    const searching = item.caps.searching;
    return {
      id: item.id,
      configured: item.configured == 'true',
      title: item.title,
      language: item.language,
      type: item.type,
      categories: forceArray(item.caps.categories.category).map(category => parseInt(category.id)),
      searching: {
        movie: {
          available: searching['movie-search'].available == 'yes',
          supportedParams: searching['movie-search'].supportedParams.split(',')
        },
        series: {
          available: searching['tv-search'].available == 'yes',
          supportedParams: searching['tv-search'].supportedParams.split(',')
        }
      }
    };
  });
}

function mergeDollarKeys(item) {
  if (item.$) {
    item = { ...item.$, ...item };
    delete item.$;
  }
  for (let key in item) {
    if (typeof (item[key]) === 'object') {
      item[key] = mergeDollarKeys(item[key]);
    }
  }
  return item;
}

function forceArray(value) {
  return Array.isArray(value) ? value : [value];
}

module.exports = {
  CATEGORY,
  searchMovieTorrents,
  searchSeasonTorrents,
  searchEpisodeTorrents,
  getIndexers,
};
