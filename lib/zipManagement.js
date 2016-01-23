var archiver = require('archiver');
var fs = require('fs');
var Q = require('q');

exports.create = function (folderPath) {
  var deferred = Q.defer();
  var filePath = '/tmp/pgb-'+process.pid+'.zip';

  console.log('Creating zip file.');
  var archive = archiver('zip');
  var output = fs.createWriteStream(filePath);

  output.on('close', function() {
    console.log('Zip file completed: ' +archive.pointer());
    deferred.resolve(filePath);
  });

  archive.on('error', function(err) {
    deferred.reject(err);
  });

  archive.pipe(output);

  archive.directory(folderPath, false);
  archive.finalize();


  return deferred.promise;
};