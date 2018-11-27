#!/usr/bin/env node
"use strict"

const meow = require('meow');
const colors = require('colors'); // Extends String.prototype to add color support
const pgInterface = require('../lib/pgInterface');
const fsInterface = require('../lib/fsInterface');
const xmlInterface = require('../lib/xmlInterface');

const cli = meow({
  flags: {
    folder: { type: 'string', alias: 'f' },
    token: { type: 'string', alias: 't' },
    lookup: { type: 'boolean', alias: 'l' }
  }
});

(async () => {
  try {
    pgInterface.auth(
      cli.flags.token ||
      process.env.npm_package_config_pgToken ||
      process.env.npm_config_pgToken
    );
    
    const foldersToSave = (cli.flags.folder && cli.flags.folder.length) ? cli.flags.folder : []
    const tempFolder = fsInterface.cloneProject(
      cli.input[0],
      ['www', 'config.xml'].concat(foldersToSave)
    );

    // Useless because of the use of native PGB-API functionality
    // const zipPath = await fsInterface.zipFolder(tempFolder);
    const appId = xmlInterface.getAppId(tempFolder);
    const response = await pgInterface.upload(appId, tempFolder);

    if (cli.flags.lookup) { await pgInterface.lookup(response.id); }
  } catch (err) {
    const message = err.message;
    console.error(message.red);
  }
})()
