"use strict"

const fs = require('fs');
const { join } = require('path');
const parser = require('fast-xml-parser'); 

exports.getAppData = function getAppData (folder, withVersion = false) {

  // console.log('Reading Cordova config.xml');
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

  const appData = {
    id: configXml.widget.$.id,
    version: withVersion ? configXml.widget.$.version : null
  };
  console.log(`Using ID: ${appData.id}`);
  
  return appData;
}