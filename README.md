This script takes a Cordova 5+ project folder and create a Phonegap Build compliant .zip file and upload it to Phonegap Build.
Really useful into a Continuos Integration build system.

## Installation:
`npm install -g cordova-to-phonegap-build`

## Usage:

### Inside NodeJS applications
You can import this script inside your NodeJS application:

First you need it installed locally:
`npm install cordova-to-phonegap-build`

then you can invoke it within you application

```
const cdvPgb = require('cordova-to-phonegap-build')

cdvPgb.upload(process.cwd(), '$yourPhonegapToken', 'resources')
```

### Using shell command

Script needs the Phonegap Token loaded as Enviromental Variable in order to connect to Phonegap Build, you can retrieve it into _Account settings_ on Phonegap Build site.

`export PGToken="$yourPhonegapToken"`
`tobuild $cordovaProjectDirectory -f resources`

The script creates a .zip file to upload to PhoneGap: Build with "config.xml" and the "www" folder


## Parameters:

### -f/--folder folderName
Indicate any other folder to be added to the uploaded file. Required if you use splash/icons external resources folder.
Could be used more times as needed. folderName is relative to the project path.

i.e.: `tobuild --folder resources --folder fonts`

### -t/--token $yourPhonegapToken
You could use your token as params instead of environment variable.  
Token could be obtained also from NPM config.

i.e.: `npm config set pgToken "$yourPhonegapToken"`
will save it in you `~/.npmrc` and you do not need to use in your command

### -l/--lookup
Keeps process running after upload to look at the current status of the build for every platforms.

### -k/--key
Define if you need to use keys for signing build

Keys options are supposed to be defined inside _package.json_ `config` prop in that form:
```
"config": {
  "keys": {
    "name": "Foo",
    "android": {
      "alias": "release",
      "password": "bar",
      "path": ["utils", "app.keystore"]
    },
    "ios": {
      "password": "bar",
      "path": ["utils", "app.mobileprovisioning"],
      "p12": ["utils", "app.p12"]
    }
  }
}
```


### -n/--key-name
Key name on Phonegap:Build.
It could also be defined as NPM config.
More usefull on per project base, adding a line on _.npmrc_: `pgKey=$yourKeyName` or
into `config` properties in _package.json_: see (Key)[-k/--key]

If name is defined inside _package.json_ it takes priority even if `-k` isn't provided.

### -a/--key-android
### -i/--key-ios
Password for keystore and key of the Android key and iOS certificate.
On Android they has to be the same, to use different password you havo to access to `pgInterface.unlockKeys` method.
It could also be retrieved from NPM config _"$keyName":android_ and _"$keyName":ios_. or into _package.json_.

Supposing keyName is Foo and password is bar

i.e.: `npm config set "Foo:android" bar` and `npm config set Foo:ios bar`
or
i.e.: `"config": { "Foo:android": "bar", "Foo:ios": "bar" }`

### -d/--download
After a build succeed it starts to download into current folder

### -p/--path
Defines a path where to download the build

### -o/--timeout
Specifies the max amount of minutes to wait for _download_ or _lookup_. Defaults to 10, if reached exits with an error.