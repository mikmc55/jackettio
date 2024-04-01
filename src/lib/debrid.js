const debridlink = require("./debrid/debridlink.js");
const alldebrid = require("./debrid/alldebrid.js");
const realdebrid = require('./debrid/realdebrid.js');
const { ERROR } = require('./debrid/const.js');

const debrid = { debridlink, alldebrid, realdebrid };

function instance(userConfig) {
  if (!debrid[userConfig.debridId]) {
    throw new Error(`Debrid service "${userConfig.debridId} not exists`);
  }

  return new debrid[userConfig.debridId](userConfig);
}

async function list() {
  const values = [];
  for (const instance of Object.values(debrid)) {
    values.push({
      id: instance.id,
      name: instance.name,
      shortName: instance.shortName,
      configFields: instance.configFields
    });
  }
  return values;
}

module.exports = {
  ERROR,
  instance,
  list
};
