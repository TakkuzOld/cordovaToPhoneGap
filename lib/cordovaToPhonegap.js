"use strict"

const path = require('path')
const fs = require('./fileSystem')
const pg = require('./phonegapInterface')
const zip = require('./zipManagement')
const xmlParsing = require('./xmlParsing')

exports.uploadProject = function uploadProject (projectPath, pgTokenArg) {
  let folderPath;
  let appId;
  let appData;

  // Cloning project to temporary path
  return fs.cloneProject(projectPath)
  .then(tempPath => {
    folderPath = tempPath
    console.log('Getting app ID')
    const xmlData = fs.getXmlData(path.join(projectPath,'config.xml'))
    return xmlParsing.getAppId(xmlData)
  })
  // Write XML File
  // .then(jsonData => {
  //   // Saving appId to use while upload to PG:B
  //   appId = jsonData._attrs.id;
  //   console.log('Using ID: ' +appId);
  //   var pgbXml = xmlParsing.toXmlString(jsonData);
  //   fs.setXmlData(pgbXml, folderPath+'/config.xml');
  // })

  // Preparing www folder copying resource into it
  // .then(function () {
  //   return fs.prepareDir(projectPath,folderPath)
  //   .catch(function (error) {
  //     console.error('Error while preparing directory');
  //     throw error;
  //   });
  // })
  // Zip WWW folder
  .then(configAppId => {
    appId = configAppId
    console.log('Using ID: ' +appId)
    return zip.create(folderPath)
    .catch(error => {
      console.error('Error while zip file')
      throw error
    })
  })
  // Upload to PhoneGap Build
  .then(filePath => {
    var pgToken = pgTokenArg || process.env.PGToken;
    return pg.uploadZip(filePath,appId,pgToken)
    .catch(error => {
      console.error('Error while upload zip')
      throw error
    });
  })
  .then(data => {
    appData = data;
    console.log('# Install Url: ' +data.install_url)
    console.log('# App ID: ' +data.id)
  })
  // DEV: to inspect /tmp/ folder for debugging
  // .delay(10000)
  .then(() => {
    return fs.clearDir(folderPath)
    .catch(error => {
      console.error('Error while clear directory')
      throw error
    });
  })
  .catch(err => {
    console.log('Operation aborted due to some errors.')
    throw err
  })
  .then(() => {
    console.log('Everything is done')
    return appData
  })
};
