"use strict"

const fs = require('fs');
const { join } = require('path');
const parser = require('fast-xml-parser'); 

exports.getAppId = function getAppId (folder) {

  console.log('Reading Cordova config.xml');
  const configXmlData = fs.readFileSync(join(folder, 'config.xml'), { encoding: 'UTF8' });

  const configXml = parser.parse(configXmlData, {
    attributeNamePrefix : '',
    attrNodeName: '$',
    textNodeName : '_',
    ignoreAttributes : false,
    ignoreNameSpace : false,
    allowBooleanAttributes : true,
    parseNodeValue : true,
    parseAttributeValue : true
  });

  const appId = configXml.widget.$.id;
  console.log(`Found ID: ${appId}`);
  
  return appId;
}