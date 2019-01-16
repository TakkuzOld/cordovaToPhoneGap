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

    --key-android           Name of the Android key on PGB;
    --key-ios               Name of the iOS key on PGB;
    --key-android-pwd, -a   Password for the Android key on PGB;
    --key-ios-pwd, -i       Password for the iOS key on PGB;
    --key-alias             Alias for key inside Android keystore;
    --key-alias-pwd         Alias for key inside Android keystore;
    --key-keystore          Keystore path to upload Android key;
    --key-mobprov           MobileProvinionig path to upload iOS key;
    --key-p12               P12 path to upload iOS key;

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
      keyAndroid: { type: 'string' },
      keyIos: { type: 'string' },
      keyAndroidPwd: { type: 'string', alias: 'a' },
      keyIosPwd: { type: 'string', alias: 'i' },
      keyAlias: { type: 'string' },
      keyAliasPwd: { type: 'string' },
      keyKeystore: { type: 'string' },
      keyMobprov: { type: 'string' },
      keyP12: { type: 'string' }
    }
  }
);

(async () => {
  try {
    const keys = ((cli.pkg || {}).config || {}).keys || {};
    keys.android = keys.android || {};
    keys.android.name = cli.flags.keyAndroid || keys.android.name; 
    keys.android.alias = cli.flags.keyAlias || keys.android.alias;
    keys.android.path = cli.flags.keyKeystore ? cli.flags.keyKeystore.split('/') : keys.android.path;
    keys.android.password = cli.flags.keyAndroidPwd || keys.android.password;
    keys.android.keyPassword = cli.flags.keyAliasPwd || keys.android.keyPassword || keys.android.password;
    keys.ios = keys.ios || {};
    keys.ios.name = cli.flags.keyIos || keys.ios.name;
    keys.ios.path = cli.flags.keyMobprov ? cli.flags.keyMobprov.split('/') : keys.ios.path;
    keys.ios.p12 = cli.flags.keyP12 ? cli.flags.keyP12.split('/') : keys.ios.p12;
    keys.ios.password = cli.flags.keyIos || keys.ios.password;

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
