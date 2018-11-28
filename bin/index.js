#!/usr/bin/env node
"use strict"

const meow = require('meow');
const helper = require('../lib/helper');

const cli = meow({
  flags: {
    folder: { type: 'string', alias: 'f' },
    token: { type: 'string', alias: 't' },
    lookup: { type: 'boolean', alias: 'l' }
  }
});

(async () => {
  try {
    await helper.upload(
      cli.input[0],
      cli.flags.folder,
      cli.flags.token,
      {
        lookup: cli.flags.lookup
      }
    )
  } catch (err) {
    const message = err.message;
    console.error(message.red);
    throw err;
  }
})()
