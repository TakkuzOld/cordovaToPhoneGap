var fs = require('./fileSystem');
var pg = require('./phonegapInterface');
var zip = require('./zipManagement');
var xmlParsing = require('./xmlParsing');

exports.uploadProject = function (projectPath) {
  var folderPath;
  var appId;

  fs.cloneProject(projectPath)
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
    var pgbXml = xmlParsing.toXmlString(jsonData);
    fs.setXmlData(pgbXml, folderPath+'/config.xml');
  })

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
    return pg.uploadZip(filePath,appId)
    .catch(function (error) {
      console.error('Error while upload zip');
      throw error;
    });
  })
  .then(function () {
    return fs.clearDir(folderPath)
    .catch(function (error) {
      console.error('Error while clear directory');
      throw error;
    });
  })
  .catch(function () {
    console.log('Operation aborted due to some errors.');
  })
  .done(function () {
    console.log('Everything is done');
  });
};