#!/usr/bin/env node

var cdvToPgb = require('../lib/cordovaToPhonegap');
var args = process.argv.slice(2);

return cdvToPgb.uploadProject(args[0], args[1]);