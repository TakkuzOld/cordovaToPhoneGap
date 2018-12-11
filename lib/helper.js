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

  const appOptions = {};
  if (options.keys) {
    console.log(`Using key "${options.keys.name}"`);
    appOptions.keys = await pgInterface.findKeyIds(options.keys.name);

    if (!appOptions.keys.android && options.keys.android.path) {
      appOptions.keys.android = (await pgInterface.addKey(
        'android', [mainFolder].concat(options.keys.android.path), {
          title: options.keys.name,
          alias: options.keys.android.alias,
          passwords: options.keys.android.password
        }
      ))
    }
    if (!appOptions.keys.ios && options.keys.ios.path) {
      appOptions.keys.ios = (await pgInterface.addKey(
        'ios', [mainFolder].concat(options.keys.ios.path), {
          title: options.keys.name,
          alias: options.keys.ios.p12,
          passwords: options.keys.ios.password
        }
      ))
    }

    await pgInterface.unlockKeys(appOptions.keys, {
      android: options.keys.android.password,
      ios: options.keys.ios.password
    });
  }

  const appId = xmlInterface.getAppId(tempFolder);
  const response = await pgInterface.upload(appId, tempFolder, appOptions);

  if (options.lookup || options.download) {
    await pgInterface.lookup(response.id, options.download, options.timeout);
  }
}
exports.upload = upload;
exports.uploadProject = (mainFolder, token, extraFolders) => upload(mainFolder, extraFolders, token);