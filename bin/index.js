#!/usr/bin/env node
"use strict"

const meow = require('meow');
const helper = require('../lib/helper');

const cli = meow({
  flags: {
    folder: { type: 'string', alias: 'f' },
    token: { type: 'string', alias: 't' },
    lookup: { type: 'boolean', alias: 'l' },
    download: { type: 'string', alias: 'd' },
    key: { type: 'boolean', alias: 'k' },
    keyName: { type: 'string', alias: 'n' },
    keyAndroid: { type: 'string', alias: 'a' },
    keyIos: { type: 'string', alias: 'i' }
  }
});

(async () => {

  const keys = {
    name: cli.flags.keyName,
    passwords: {
      android: cli.flags.keyAndroid,
      ios: cli.flags.keyIos
    }
  };

  try {
    await helper.upload(
      cli.input[0],
      cli.flags.folder,
      cli.flags.token,
      {
        lookup: cli.flags.lookup,
        download: cli.flags.download,
        keys: cli.flags.key ? keys : null
      }
    )
  } catch (err) {
    const message = err.message;
    console.error(message.red);
    throw err;
  }
})()
