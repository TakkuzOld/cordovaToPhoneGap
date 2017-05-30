"use strict"

const archiver = require('archiver')
const fs = require('fs')
const tmpDir = require('os').tmpdir()
const path = require('path')

exports.create = function createZip (folderPath) {
  return new Promise((resolve,reject) => {
    const filePath = path.join(tmpDir, 'pgb-'+process.pid+'.zip')

    console.log('Creating zip file.')
    const archive = archiver('zip')
    const output = fs.createWriteStream(filePath)

    output.on('close', () => {
      console.log('Zip file completed: ' +archive.pointer())
      resolve(filePath)
    })

    archive.on('error', err => reject(err))
    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  })
}
