var fs = require('./fileSystem');
var pg = require('./phonegapInterface');
var zip = require('./zipManagement');
var xmlParsing = require('./xmlParsing');

exports.uploadProject = function (projectPath, pgTokenArg) {
  var folderPath;
  var appId;
  var appData;

  // Cloning project to temporary path
  return fs.cloneProject(projectPath)
  .then(function (tempPath) {
    folderPath = tempPath;
    console.log('Creating PG:B compatible XML');
    var xmlData = fs.getXmlData(projectPath+'/config.xml');
    return xmlParsing.toJson(xmlData);
  })

  // Write XML File
  .then(function (jsonData) {
    // Saving appId to use while upload to PG:B
    appId = jsonData._attrs.id;
    console.log('Using ID: ' +appId);
    var pgbXml = xmlParsing.toXmlString(jsonData);
    fs.setXmlData(pgbXml, folderPath+'/config.xml');
  })

  // Preparing www folder copying resource into it
  .then(function () {
    return fs.prepareDir(projectPath,folderPath)
    .catch(function (error) {
      console.error('Error while preparing directory');
      throw error;
    });
  })
  // Zip WWW folder
  .then(function () {
    return zip.create(folderPath)
    .catch(function (error) {
      console.error('Error while zip file');
      throw error;
    });
  })
  // Upload to PhoneGap Build
  .then(function (filePath) {
    var pgToken = pgTokenArg || process.env.PGToken;
    return pg.uploadZip(filePath,appId,pgToken)
    .catch(function (error) {
      console.error('Error while upload zip');
      throw error;
    });
  })
  .then(function (data) {
    appData = data;
    console.log('# Install Url: ' +data.install_url);
    console.log('# App ID: ' +data.id);
  })
  // DEV: to inspect /tmp/ folder for debugging
  // .delay(10000)
  .then(function () {
    return fs.clearDir(folderPath)
    .catch(function (error) {
      console.error('Error while clear directory');
      throw error;
    });
  })
  .catch(function (err) {
    console.log('Operation aborted due to some errors.');
    throw err;
  })
  .then(function () {
    console.log('Everything is done');
    return appData;
  });
};