var Q = require('q');
var pg = require('phonegap-build-api');
var pgAuth = Q.denodeify(pg.auth);
let pgApi, pgGet, pgPost, pgPut;

var appScanner = function (appArray,appId) {
  var buildId = 0;
  for (var i = 0, appData; i < appArray.length; i++) {
    appData = appArray[i];
    if (appData.package === appId) {
      buildId = appData.id;
      break;
    }
  }

  return buildId;
};

async function init (pgToken) {
  if (pgApi && pgGet && pgPost && pgPut) { return pgApi }

  if (!pgToken) { throw 'No PGToken defined.'; }

  pgApi = await pgAuth({ token: pgToken })
  pgGet = Q.denodeify(api.get);
  pgPost = Q.denodeify(api.post);
  pgPut = Q.denodeify(api.put);

  return pgApi
}

/**
 * 
 * @param {string} keyId Id of the key on PGB DB in format platform/id
 * @param {string} password Unlock password for key
 */
async function unlockKey (keyId, password) {
  if (!pgPut) { throw 'PhoneGap:Build interface not initialized.'; }
  if (!password) { throw `Unable to find password to unlock key ${keyId}`; }

  const options = { form: { data: { password: password }}};
  const keyEndpoint = `/keys/${keyId}`;

  console.log(`Unlocking key: ${keyEndpoint}`);

  const keyResponse = await pgPut(keyEndpoint, options);
  return keyResponse;
}


exports.init = init;
exports.unlockKey = unlockKey;

exports.uploadZip = function (filePath,appId,pgToken) {
  var deferred = Q.defer();
  var buildId = 0;
  var pgGet,pgPost,pgPut;

  if (!pgToken) {
    console.error('No PGToken definided.');
    deferred.reject();
    return;
  }

  init(pgToken)
  .then(function(api) {
    pgGet = Q.denodeify(api.get);
    pgPost = Q.denodeify(api.post);
    pgPut = Q.denodeify(api.put);
  })
  .then(function () {
    return pgGet('/apps');
  })
  .then(function(data) {
    // Checking packagename existence
    var buildId = 0;
    if (data && data.apps) {
      buildId = appScanner(data.apps,appId);
    } else {
      throw data;
    }
    return buildId;
  })
  .then(function (buildId) {
    var options = {
      form: {
        file: filePath
      }
    };

    if (buildId) {
      console.log('App already exists: update ' +buildId);
      return pgPut('/apps/' +buildId, options);
    } else {
      console.log('Creating new app');
      options.form.data = {
        title: 'Mobimentum App',
        create_method: 'file'
      };
      return pgPost('/apps', options);
    }
  })
  .then(function (data) {
    console.log('App successfully uploaded');
    deferred.resolve(data);
  })
  .catch(function (error) {
    deferred.reject(error);
  });

  return deferred.promise;
};
