#!/usr/bin/env node
"use strict"

const cdvToPgb = require('../lib/cordovaToPhonegap')
const pgInterface = require('../lib/phonegapInterface')
const argv = require('yargs').argv
const args = process.argv.slice(2)

Promise.resolve()
.then(async () => {
  await pgInterface.init()
  const response = await pgInterface.unlockKey('ios/987808', 'mobimentum')
  console.log(JSON.stringify(response,null,2))
})

// return cdvToPgb.uploadProject(args[0], argv.t || argv.token, argv.f || argv.folder)
