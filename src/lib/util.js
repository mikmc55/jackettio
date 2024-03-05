import { setTimeout } from 'timers/promises';

export const numberPad = (number, count = 2) => `${number}`.padStart(count, 0);

export const parseWords = (str) => str.replace(/[^a-zA-Z0-9]+/g, ' ').split(' ').filter(Boolean);

export const sortBy = (...keys) => (a, b) => {
  if (typeof keys[0] === 'string') keys = [keys];
  for (const [key, reverse] of keys) {
    if (a[key] > b[key]) return reverse ? -1 : 1;
    if (a[key] < b[key]) return reverse ? 1 : -1;
  }
  return 0;
};

export const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export const wait = (ms) => setTimeout(ms);

export const isVideo = (filename) => [
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

export const promiseTimeout = (promise, ms) => {
  const ac = new AbortController();
  const waitPromise = setTimeout(ms, null, { signal: ac.signal }).then(() =>
    Promise.reject(`Max execution time reached ${ms}`)
  );
  return Promise.race([waitPromise, promise.then((res) => {
    ac.abort();
    return res;
  })]);
};
