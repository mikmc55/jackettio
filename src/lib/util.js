const { setTimeout } = require('timers/promises');

function numberPad(number, count = 2) {
  return `${number}`.padStart(count, 0);
}

function parseWords(str) {
  return str.replace(/[^a-zA-Z0-9]+/g, ' ').split(' ').filter(Boolean);
}

function sortBy(...keys) {
  return (a, b) => {
    if (typeof keys[0] === 'string') keys = [keys];
    for (const [key, reverse] of keys) {
      if (a[key] > b[key]) return reverse ? -1 : 1;
      if (a[key] < b[key]) return reverse ? 1 : -1;
    }
    return 0;
  };
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVideo(filename) {
  return [
    '3g2',
    '3gp',
    'avi',
    'flv',
    'mkv',
    'mk3d',
    'mov',
    'mp2',
    'mp4',
    'm4v',
    'mpe',
    'mpeg',
    'mpg',
    'mpv',
    'webm',
    'wmv',
    'ogm',
    'ts',
    'm2ts',
  ].includes(filename?.split('.').pop());
}

async function promiseTimeout(promise, ms) {
  const ac = new AbortController();
  const waitPromise = new Promise((_, reject) =>
    setTimeout(() => reject(`Max execution time reached ${ms}`), ms)
  );
  return Promise.race([waitPromise, promise.then((res) => {
    ac.abort();
    return res;
  })]);
}

module.exports = {
  numberPad,
  parseWords,
  sortBy,
  bytesToSize,
  wait,
  isVideo,
  promiseTimeout,
};
