This script takes a Cordova 5+ project folder and create a Phonegap Build compliant .zip file and upload it to Phonegap Build.  
Really useful into a Continuos Integration build system.

It's an early stage but it works.

## Installation:  
`npm install -g cordova-to-phonegap-build`

## Usage:  
Script needs the Phonegap Token loaded as Enviromental Variable in order to connect to Phonegap Build, you can retrieve it into _Account settings_ on Phonegap Build site.

`export PGToken="$yourPhonegapToken"`  
`cdv-pgb $cordovaProjectDirectory`

The script import Cordova `resources` folders into `www` so there can't be any folder with the same name inside it. You could use `www/res` if you need.