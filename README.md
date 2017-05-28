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

cdvPgb.uploadProject(process.cwd(), '$yourPhonegapToken', 'resources')
```

### Using shell command

Script needs the Phonegap Token loaded as Enviromental Variable in order to connect to Phonegap Build, you can retrieve it into _Account settings_ on Phonegap Build site.

`export PGToken="$yourPhonegapToken"`
`cdv-pgb $cordovaProjectDirectory -f resources`

The script creates a .zip file to upload to PhoneGap: Build with "config.xml" and the "www" folder


## Parameters:

### -f/--folder folderName
Indicate any other folder to be added to the uploaded file. Required if you use splash/icons external resources folder.
Could be used more times as needed. folderName is relative to the project path.

i.e.: `cdv-pgb --folder resources --folder fonts`

### -t/--token $yourPhonegapToken
You could use your token as params instead of environment variable.
