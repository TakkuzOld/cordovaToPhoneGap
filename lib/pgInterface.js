const pgb = require('pgb-api')();
const { join } = require('path');
const colors = require('colors'); // Keep to extend String prototype to add colors

exports.auth = function auth (pgToken) {
  if (!pgToken) { throw { message: 'No PGToken defined.'}; }
  pgb.addAuth(pgToken);
}

const appOptions = {};
/**
 * Iterate through all the apps on PGB to find ID of already updated. If exists.
 * @param {string} appId App ID of the App as it's reported in config.xml
 */
async function searchForPGBId (appId) {
  const existingApps = (await pgb.getApps()).apps;
  let buildId = 0;
  for (let i = 0, appData; i < existingApps.length; i++) {
    appData = existingApps[i];
    if (appData.package === appId) {
      buildId = appData.id;
      break;
    }
  }
  return buildId;
}

/**
 * 
 * @param {string} appId App ID of the App as it's reported in config.xml
 * @param {string} folderPath Path of the folder config.xml and www folder
 * @param {object} appOptions Object to add app options as defined for pgb-api.addApp/updateApp
 */
async function upload (appId, folderPath, appOptions) {
  if (!pgb.hasAuth()) { throw { message: 'PG:B Auth not defined.'}; }
  let appResponse;
  const pgbId = await searchForPGBId(appId);
  if (pgbId) {
    console.log(`Update existing app: ${pgbId}`);
    appResponse = await pgb.updateApp(pgbId, folderPath, appOptions);
  } else {
    console.log(`Create new app: ${appId}`);
    appResponse = await pgb.addApp(folderPath, appOptions);
  }
  console.log(
    `App uploaded succesfully
    \tInstall URL: ${appResponse.install_url.green}`
  );
  return appResponse;
}
exports.upload = upload;

async function lookup (pgbId, downloadPath) {
  // Look if it's a valid PGBID or if its an appId
  if (isNaN(+pgbId)) { pgbId = await searchForPGBId(pgbId); }
  if (downloadPath === true) { downloadPath = '.'; }

  console.log(`\nLookup for app building status:`);

  const mainStatus = [
    { platform: 'android', status: 'pending' },
    { platform: 'ios', status: 'pending' },
    { platform: 'winphone', status: 'pending' }
  ];
  const statusColor = { complete: 'green', error: 'red' };

  let checkInterval = 5000;
  let checkIntervalMultiplier = 1.2;

  async function checkForStatus (resolve, reject) {
    const appData = await pgb.getApp(pgbId);
    const pendingElement = mainStatus
    .filter(el => appData.status[el.platform] !== 'skip')
    .map(el => {
      let newStatus = appData.status[el.platform];
      if (el.status !== newStatus) {
        let message = `${el.platform}: ${newStatus[statusColor[newStatus] || 'yellow']}`;
        if (newStatus === 'error') {
          message += `: ${appData.error[el.platform]}`.red;
          message += `\n\tlog: ${appData.logs[el.platform].replace('/api/v1', 'https://build.phonegap.com')}`;
        }
        console.log(message);
      }
      el.status = newStatus;
      if (el.status === 'complete' && downloadPath) {
        const fileName = `${appData.title}_${appData.version}.${appData.build_count}.${el.platform === 'ios' ? 'ipa' : 'apk'}`;
        const filePath = join(downloadPath, fileName);
        console.log(`Downloading ${el.platform} version: ${filePath}`);
        pgb.downloadApp(pgbId, el.platform, filePath);
      }
      return el;
    })
    .filter(el => (el.status !== 'complete' && el.status !== 'error'))

    if (!pendingElement.length) { return resolve(appData); }
    checkInterval = checkInterval * checkIntervalMultiplier;
    setTimeout(() => checkForStatus(resolve,reject), checkInterval);
  }

  return new Promise((resolve, reject) => checkForStatus(resolve, reject));
}
exports.lookup = lookup;

/**
 * 
 * @param {object} keyIds ids of the keys in a Object { android: id, ios: id }
 * @param {object} passwords Unlock passwords for key in a Object { android: { keystore, key }, ios }. If keystore and key are the same you could provide a string for "android" property.
 */
async function unlockKeys (keyIds, passwords) {
  const androidId = keyIds.android;
  const iosId = keyIds.ios;

  const androidKeystore = (passwords.android || {}).keystore || passwords.android;
  const androidKey      = (passwords.android || {}).key || passwords.android;
  const iosKey          = passwords.ios

  if (androidId && (!androidKeystore || !androidKey)) {
    console.log(`WARNING: Android key or keystore password not provided.`);
  }
  if (iosId && !iosKey) {
    console.log(`WARNING: iOS key password not provided.`);
  }


  let androidRespose = null;
  let iosRespose = null;
  if (androidId && androidKeystore && androidKey) {
    console.log(`Unlocking Android Key ${androidId}`);
    androidRespose = await pgb.unlockAndroidKey(androidId, androidKeystore, androidKey)
    .catch(err => {
      console.log(`WARNING: Error while unlockin ${androidId} key`.yellow);
      return false;
    });
  }
  if (iosId && iosKey) {
    console.log(`Unlocking iOS Key ${iosId}`);
    iosRespose = await pgb.unlockIOSKey(iosId, iosKey)
    .catch(err => {
      console.log(`WARNING: Error while unlockin ${iosId} key`.yellow);
      return false;
    });
  }
  
  if ((androidId || iosId) && (!androidRespose && !iosRespose)) {
    throw { message: `Unable to unlock any keys for this project` };
  }

  return true;
}
exports.unlockKeys = unlockKeys;

/**
 * Retrieve IDs of keys given an App Name
 * @param {string} keyName name of the key on PGB
 */
async function findKeyIds (keyName) {
  if (!keyName) { throw { message: `Key name to find not provided` }; }

  const data = await pgb.getKeys();
  const keyIds = {
    android: lookForKeyName(data.keys.android.all, keyName),
    ios: lookForKeyName(data.keys.ios.all, keyName)
  };
  
  function lookForKeyName (keys, title) {
    for (let key of keys) {
      if (key.title === title) { return key.id; }
    }
    return null;
  }

  if (!keyIds.android) { `WARNING: No key "${keyName}" found for Android`.yellow };
  if (!keyIds.ios) { `WARNING: No key "${keyName}" found for iOS`.yellow };

  return keyIds;
}
exports.findKeyIds = findKeyIds;