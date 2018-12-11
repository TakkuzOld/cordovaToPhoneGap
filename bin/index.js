#!/usr/bin/env node
"use strict"

const meow = require('meow');
const helper = require('../lib/helper');

const cli = meow(
  `
    Usage
      $ tobuild <projectFolder>

    Options
      --folder, -f       Include this folder into the build;
      --token, -t        Use a specific token to authorize in PGB;
      --lookup, -l       Wait till all builds succeed or fail;
      --download, -d     Download a build after it succeeds;
      --path, -p         Specify a path for the downloaded build;
      --key, -k          Use keys to certificate apps;
      --key-name, -n     Specify names of keys to be used;
      --key-android, -a  Password for android key and keystore;
      --key-ios, -i      Password for ios key and keystore

    Examples
      $ tobuild /path/to/project -f resources -l
      $ tobuild /path/to/project -f resources -k -n "App Key" -d -p "~/Downloads"
  `,
  {
    flags: {
      folder: { type: 'string', alias: 'f' },
      token: { type: 'string', alias: 't' },
      lookup: { type: 'boolean', alias: 'l' },
      download: { type: 'boolean', alias: 'd' },
      path: { type: 'string', alias: 'p' },
      key: { type: 'boolean', alias: 'k' },
      keyName: { type: 'string', alias: 'n' },
      keyAndroid: { type: 'string', alias: 'a' },
      keyIos: { type: 'string', alias: 'i' }
    }
  }
);

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
        download: cli.flags.path || cli.flags.download,
        keys: cli.flags.key ? keys : null
      }
    )
  } catch (err) {
    const message = err.message;
    console.error(message.red);

    console.log(cli.showHelp());
  }
})()
