#!/usr/bin/env node

const cdvToPgb = require('../lib/cordovaToPhonegap')
const argv = require('yargs').argv
const args = process.argv.slice(2)

return cdvToPgb.uploadProject(args[0], argv.t || argv.token, argv.f || argv.folder)
