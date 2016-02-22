var fs = require('fs');
var Q = require('q');
var ncp = Q.denodeify(require('ncp').ncp);
var rm = Q.denodeify(require('rimraf'));
var fsStat = Q.denodeify(fs.stat);

exports.getXmlData = function (xmlPath) {
  console.log('Reading Cordova config.xml');
  return fs.readFileSync(xmlPath);
};
exports.setXmlData = function (xmlData,xmlPath) {
  console.log('Saving PhoneGap Build config.xml');
  return fs.writeFileSync(xmlPath, xmlData);
};

exports.prepareDir = function (projectPath,wwwPath) {
  console.log('Copy resources into www');
  return Q.denodeify(fs.lstat.bind(fs))(projectPath+'/resources')
  .then(function () {
    return ncp(projectPath+'/resources',wwwPath+'/resources');
  })
  .catch(function (err) { return false; });
};

exports.clearDir = function (projectPath) {
  console.log('Clearing directory');
  fs.unlinkSync('/tmp/pgb-'+process.pid+'.zip');
  return rm('/tmp/pgb-'+process.pid);
};

exports.cloneProject = function (projectPath) {
  console.log('Clonig project');
  var tempPath = '/tmp/pgb-'+process.pid;
  return fsStat(tempPath).then(
    function () { fs.unlinkSync(tempPath); return; },
    function () { }
  )
  .then(function () {
    console.log('Cloning project into temporary folder');
    return ncp(projectPath+'/www',tempPath);
  })
  .then(function () {
    return tempPath;
  });
};