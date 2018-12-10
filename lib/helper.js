"use strict"

const pgInterface = require('../lib/pgInterface');
const fsInterface = require('../lib/fsInterface');
const xmlInterface = require('../lib/xmlInterface');

async function upload (mainFolder, extraFolders = [], token, options = {}) {
  pgInterface.auth( token || process.env.npm_config_pgToken );
  
  const tempFolder = fsInterface.cloneProject(
    mainFolder,
    ['www', 'config.xml'].concat(extraFolders)
  );

  // Useless because of the use of native PGB-API functionality
  // const zipPath = await fsInterface.zipFolder(tempFolder);

  if (options.keys) {
    if (typeof options.keys === 'boolean') { options.keys = {}; }
    options.keys.name =
      options.keys.name ||
      process.env[`npm_config_pgKey`];
    if (!options.keys.passwords) { options.keys.passwords = {}; }
    options.keys.passwords.android =
      options.keys.passwords.android ||
      process.env[`npm_config_${options.keys.name}_android`];
    options.keys.passwords.ios =
      options.keys.passwords.ios ||
      process.env[`npm_config_${options.keys.name}_ios`];

    const keyIds = await pgInterface.findKeyIds(options.keys.name);
    await pgInterface.unlockKeys(keyIds, {
      android: options.keys.passwords.android,
      ios: options.keys.passwords.ios
    });
  }

  const appId = xmlInterface.getAppId(tempFolder);
  const response = await pgInterface.upload(appId, tempFolder);

  if (options.lookup) { await pgInterface.lookup(response.id); }
}
exports.upload = upload;
exports.uploadProject = (mainFolder, token, extraFolders) => upload(mainFolder, extraFolders, token);