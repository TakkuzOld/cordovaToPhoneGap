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

### -d/--download
After a build succeed it starts to download into current folder

### -p/--path
Defines a path where to download the build

### -o/--timeout
Specifies the max amount of minutes to wait for _download_ or _lookup_. Defaults to 10, if reached exits with an error.


## Key Management

Keys options are supposed to be defined inside _package.json_ `config` prop in that form:
```
"config": {
  "keys": {
    "android": {
      "name": "Foo",
      "alias": "release",
      "keyPassword": "aliasBar",
      "password": "keyBar",
      "path": ["utils", "app.keystore"]
    },
    "ios": {
      "name": "Faa",
      "password": "bor",
      "path": ["utils", "app.mobileprovisioning"],
      "p12": ["utils", "app.p12"]
    }
  }
}
```

Keys can also be defined by CLI params that override _package.json_ entries.

### --key-android
Key name of Android key on Phonegap:Build.
It could also be defined as NPM config.

### -a/--key-android-pwd
### -i/--key-ios-pwd
Password for keystore of the Android keystore and iOS certificate.

### --key-alias
Alias for key inside Android keystore

### --key-alias-pwd
Password for defined alias inside Android keystore.
If not defined it will be used the same of Android keystore.

### --key-keystore
### --key-mobprov
### --key-p12
Paths of the corresponding file to be used to create key element if it is'n found