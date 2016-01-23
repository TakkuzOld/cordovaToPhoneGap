var Q = require('q');
var pg = require('phonegap-build-api');
var pgAuth = Q.denodeify(pg.auth);

var pgToken = process.env.PGToken;

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

exports.uploadZip = function (filePath,appId) {
  var deferred = Q.defer();
  var buildId = 0;
  var pgGet,pgPost,pgPut;

  if (!pgToken) {
    console.error('No PGToken definided.');
    deferred.reject();
    return;
  }

  pgAuth({ token: pgToken })
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
