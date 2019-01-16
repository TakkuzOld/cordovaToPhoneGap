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
    appOptions.keys = {};
    appOptions.keys = await pgInterface.findKeyIds(
      (options.keys.android || {}).name,
      (options.keys.ios || {}).name
    );

    if (
      !appOptions.keys.android &&
      (
        options.keys.android.name &&
        options.keys.android.alias &&
        options.keys.android.path && options.keys.android.path.length &&
        options.keys.android.password
      )
    ) {
      appOptions.keys.android = (await pgInterface.addKey(
        'android', [mainFolder].concat(options.keys.android.path), {
          title: options.keys.android.name,
          alias: options.keys.android.alias,
          passwords: options.keys.android.password,
          keyPassword: options.keys.android.keyPassword
        }
      ))
    }
    if (
      !appOptions.keys.ios &&
      (
        options.keys.name &&
        options.keys.ios.path && options.keys.ios.path.length &&
        options.keys.ios.p12 &&
        options.keys.ios.password
      )
    ) {
      appOptions.keys.ios = (await pgInterface.addKey(
        'ios', [mainFolder].concat(options.keys.ios.path), {
          title: options.keys.ios.name,
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