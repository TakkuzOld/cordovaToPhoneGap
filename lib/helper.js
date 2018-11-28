"use strict"

const pgInterface = require('../lib/pgInterface');
const fsInterface = require('../lib/fsInterface');
const xmlInterface = require('../lib/xmlInterface');

async function upload (mainFolder, extraFolders = [], token, options = {}) {
  pgInterface.auth(
    token ||
    process.env.npm_package_config_pgToken ||
    process.env.npm_config_pgToken
  );
  
  const tempFolder = fsInterface.cloneProject(
    mainFolder,
    ['www', 'config.xml'].concat(extraFolders)
  );

  // Useless because of the use of native PGB-API functionality
  // const zipPath = await fsInterface.zipFolder(tempFolder);
  const appId = xmlInterface.getAppId(tempFolder);
  const response = await pgInterface.upload(appId, tempFolder);

  if (options.lookup) { await pgInterface.lookup(response.id); }
}
exports.upload = upload;
exports.uploadProject = (mainFolder, token, extraFolders) => upload(mainFolder, extraFolders, token);