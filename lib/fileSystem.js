const Q = require('q')
const fs = require('fs')
const os = require('os')
const argv = require('yargs').argv
const ncp = Q.denodeify(require('ncp').ncp)
const rm = Q.denodeify(require('rimraf'))
const QfsStat = Q.denodeify(fs.stat)
const QmkDir = Q.denodeify(fs.mkdir)
const path = require('path')

let toSave = [
  'config.xml',
  'www'
]

exports.getXmlData = function getXmlData (xmlPath) {
  console.log('Reading Cordova config.xml')
  return fs.readFileSync(xmlPath)
}
// exports.setXmlData = function (xmlData,xmlPath) {
//   console.log('Saving PhoneGap Build config.xml');
//   return fs.writeFileSync(xmlPath, xmlData);
// };

// exports.prepareDir = function (projectPath,wwwPath) {
//   console.log('Copy resources into www');
//   return Q.denodeify(fs.lstat.bind(fs))(projectPath+'/resources')
//   .then(function () {
//     return ncp(projectPath+'/resources',wwwPath+'/resources');
//   })
//   .catch(function (err) { return false; });
// };

exports.clearDir = function clearDir (projectPath) {
  console.log('Clearing directory')
  fs.unlinkSync(path.join(os.tmpdir(),'pgb-'+process.pid+'.zip'))
  return rm(path.join(os.tmpdir(),'pgb-'+process.pid))
}

function getCopyPromises (projectPath,tempPath) {
  const promises = []

  if (argv.f) { toSave = toSave.concat(argv.f) }
  if (argv.folder) { toSave = toSave.concat(argv.folder) }

  console.log(`Files to save from ${projectPath} to ${tempPath}: ${toSave}`)

  toSave.forEach(el => promises.push(
    ncp(path.join(projectPath,el), path.join(tempPath,el))
    .catch(err => console.log(err))
  ))
  return promises
}
exports.cloneProject = function cloneProject (projectPath) {
  console.log('Clonig project')
  const tempPath = path.join(os.tmpdir(),'pgb-'+process.pid)
  return QfsStat(tempPath).then(
    () => fs.unlinkSync(tempPath),
    () => null
  )
  .then(() => QmkDir(tempPath))
  .then(() => {
    console.log('Cloning project into temporary folder')
    return Promise.all(getCopyPromises(projectPath,tempPath))
    // return ncp(projectPath+'/www',tempPath);
  })
  .then(() => tempPath )
}
