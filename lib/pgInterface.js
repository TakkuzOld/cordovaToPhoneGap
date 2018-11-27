const pgb = require('pgb-api')();
const colors = require('colors');

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
 */
async function upload (appId, folderPath) {
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

async function lookup (pgbId) {
  // Look if it's a valid PGBID or if its an appId
  if (isNaN(+pgbId)) { pgbId = await searchForPGBId(pgbId); }

  console.log(`\nLookup for app building status:`);

  const mainStatus = [
    { platform: 'android', status: 'pending' },
    { platform: 'ios', status: 'pending' },
    { platform: 'winphone', status: 'pending' }
  ];
  const statusColor = { complete: 'green', error: 'red' };

  async function checkForStatus (resolve, reject) {
    const appData = await pgb.getApp(pgbId);
    const pendingElement = mainStatus
    .filter(el => appData.status[el.platform] !== 'skip')
    .map(el => {
      let newStatus = appData.status[el.platform];
      if (el.status !== newStatus) {
        let message = `${el.platform.yellow} changed to ${newStatus[statusColor[newStatus] || 'yellow']}`;
        if (newStatus === 'error') {
          message += ` - log: ${appData.logs[el.platform].replace('/api/v1', 'https://build.phonegap.com')}`;
        }
        console.log(message);
      }
      el.status = newStatus;
      return el;
    })
    .filter(el => (el.status !== 'complete' && el.status !== 'error'))
    // .filter(el => (el.status !== 'complete' && el.status !== 'error' && el.status !== 'skip'))

    if (!pendingElement.length) { return resolve(appData); }
    setTimeout(() => checkForStatus(resolve,reject), 5000);
  }

  return new Promise((resolve, reject) => checkForStatus(resolve, reject));
}
exports.lookup = lookup;

/**
 * 
 * @param {string} keyId Id of the key on PGB DB in format platform/id
 * @param {string} password Unlock password for key
 */
async function unlockKey (keyId, certPassword, keystorePassword) {
  if (!pgPut) { await init() }
  if (!certPassword) { throw `Unable to find password to unlock key ${keyId}`; }

  const isAndroid = keyId.indexOf('android') === 0

  if (isAndroid && !keystorePassword) {
    console.log('Use same password for keystore and certificate');
    keystorePassword = certPassword
  }

  const options = isAndroid ?
    { form: { data: { key_pw: certPassword, keystore_pw: keystorePassword }}} :
    { form: { data: { password: certPassword }}};
  const keyEndpoint = `/keys/${keyId}`;

  console.log(`Unlocking key: ${keyEndpoint}`);

  const keyResponse = await pgPut(keyEndpoint, options);
  return keyResponse;
}
exports.unlockKey = unlockKey;
