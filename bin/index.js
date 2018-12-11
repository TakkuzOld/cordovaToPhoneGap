#!/usr/bin/env node
"use strict"

const meow = require('meow');
const helper = require('../lib/helper');
const helpMessage =
`
  Usage
    $ tobuild <projectFolder>

  Options
    --folder, -f     Include this folder into the build;
    --token, -t      Use a specific token to authorize in PGB;
    --lookup, -l     Wait till all builds succeed or fail;
    --download, -d   Download a build after it succeeds;
    --timeout, -o    Max timeout in minutes to wait for lookup or download;
    --path, -p       Specify a path for the downloaded build;

    --key-name       Specify names of keys to be used;
    --key-alias      Alias for key inside Android keystore;
    --key-android    Password for android key and keystore;
    --key-ios        Password for ios key and keystore;
    --key-keystore   Keystore path to upload Android key;
    --key-mobprov    MobileProvinionig path to upload iOS key;
    --key-p12        P12 path to upload iOS key;

  Examples
    $ tobuild /path/to/project -f resources -l
    $ tobuild /path/to/project -f resources -k -n "App Key" -d -p "~/Downloads"
`

const cli = meow(
  helpMessage,
  {
    flags: {
      folder: { type: 'string', alias: 'f' },
      token: { type: 'string', alias: 't' },
      lookup: { type: 'boolean', alias: 'l' },
      download: { type: 'boolean', alias: 'd' },
      path: { type: 'string', alias: 'p' },
      keyName: { type: 'string' },
      keyAlias: { type: 'string' },
      keyAndroid: { type: 'string' },
      keyIos: { type: 'string' },
      keyKeystore: { type: 'string' },
      keyMobprov: { type: 'string' },
      keyP12: { type: 'string' },
    }
  }
);

(async () => {
  try {
    const keys = ((cli.pkg || {}).config || {}).keys || {};
    keys.name = cli.flags.keyName || keys.name;
    if (keys.name) {
      keys.android = keys.android || {};
      keys.android.alias = cli.flags.keyAlias || keys.android.alias;
      keys.android.path = cli.flags.keyKeystore.split('/') || keys.android.path;
      keys.android.password = cli.flags.keyAndroid || keys.android.password;
      keys.ios = keys.ios || {};
      // keys.ios.path = cli.flags.keyMobprov.split('/') || keys.ios.path;
      // keys.ios.p12 = cli.flags.keyP12.split('/') || keys.ios.p12;
      keys.ios.password = cli.flags.keyIos || keys.ios.password;
    }

    switch (cli.input[0]) {

      default:
        await helper.upload(
          cli.input[0],
          cli.flags.folder,
          cli.flags.token,
          {
            lookup: cli.flags.lookup,
            download: cli.flags.path || cli.flags.download,
            keys: keys.name ? keys : null,
            timeout: cli.flags.timeout
          }
        );
    }

  } catch (err) {
    const message = err.message;
    console.error()
    console.error(message.red)
    console.error();
    process.exit(5);
  }
})()
