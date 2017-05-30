"use strict"

// var jstoxml = require('jstoxml');
const Q = require('q');
const parseString = Q.denodeify(require('xml2js').parseString);

exports.getAppId = function getAppId (xmlData) {
  return parseString(xmlData)
  .then(result => result.widget.$.id)
}

// var parseElements = function (name,data) {
//   if (!data) { return ''; }
//   var elements = [];
//   var parseEvery = function (element) {
//     var parseData = function () {
//       var content = element._ || (typeof element === 'string' ? element : '') || parseContent(element);
//       var el = {
//         _name: name,
//         _attrs: element.$
//       };
//       if (content) { el._content = content; }
//       // Necessary to show splashscreen on PhoneGap:Build - http://stackoverflow.com/questions/25385308/phonegap-build-not-showing-splashscreen
//       if (el._name === 'preference' && el._attrs.name === 'SplashScreen') { el._attrs.value = 'splash'; }
//       elements.push(el);
//     }
//     // Mantain switch for future purposes
//     switch (name) {
//       case 'plugin':
//         if (element.variable) {
//           element.param = element.variable
//           delete element.variable
//         }
//         parseData()
//         break
//
//         // // OLD!
//         // // Plugin to skip (incompatible with cordova 4.0)
//         // // if (element.$.name === 'cordova-plugin-whitelist') { return; }
//         // // These plugins need Play Services
//         // // if (element.$.name === 'phonegap-plugin-push') { return; }
//
//         // if (
//         //   element.$.name === 'cordova-plugin-google-analytics' ||
//         //   // element.$.name === 'phonegap-plugin-push' ||
//         //   element.$.name === 'onesignal-cordova-plugin'
//         // ) {
//         //   elements.push(parsePlugin('cordova-plugin-googleplayservices'));
//         // }
//         // if (element.$.name === 'onesignal-cordova-plugin') {
//         //   elements.push(parsePlugin('onesignal-cordova-plugin-pgb-compat', 'npm'));
//         //   elements.push(parsePlugin('cordova-plugin-android-support-v4'));
//         //   return;
//         // }
//         // var source,version;
//         // if (element.$.spec && element.$.spec.indexOf('http') === 0) {
//         //   // source = element.$.spec;
//         // } else if (element.$.spec) {
//         //   version = element.$.spec.replace('~','');
//         // }
//         // elements.push(parsePlugin(element.$.name,source,element.variable,version));
//         // break;
//       // case 'platform':
//       //   elements.push({
//       //     _name: 'platform',
//       //     _attrs: { name: element.$.name }
//       //   });
//       //   elements.push(parsePlatform(element));
//       //   break;
//       // case 'engine': break;
//       default:
//         parseData();
//         break;
//     }
//   };
//
//   data.forEach(parseEvery);
//   return elements;
// };
//
// var parseContent = function (data) {
//   var content = [];
//   for (var i in data) {
//     if (i === '$') { continue; }
//     content.push.apply(content, parseElements(i,data[i]));
//   }
//
//   if (content.length === 0) { return ''; }
//   return content;
// };
//
// var parsePlugin = function (elName, elSource, elVariable, elVersion) {
//   var source = elSource || getPluginSource(elName);
//   var pluginData = {
//     _name: 'plugin',
//     _attrs: {
//       name: elName,
//     }
//   };
//
//   if (source) { pluginData._attrs.source = source; }
//   if (elVersion) { pluginData._attrs.spec = elVersion; }
//   if (elVariable) {
//     pluginData._content = [];
//     for (var i = elVariable.length - 1; i >= 0; i--) {
//       pluginData._content.push({
//         _name: 'param',
//         _attrs: {
//           name: elVariable[i].$.name,
//           value: elVariable[i].$.value
//         }
//       });
//     }
//   }
//   return pluginData;
// };
// var getPluginSource = function (name) {
//   if (
//     name.indexOf('cordova-') === 0 ||
//     name.indexOf('phonegap-') === 0 ||
//     name.indexOf('ionic-') === 0) {
//      return 'npm';
//   }
//
//   return 'pgb';
// };
// var parsePlatform = function (data) {
//   var platformArray = [], type = '';
//   var parseElement = function (element) {
//     // Android
//     if (element.$.density) {
//       platformArray.push({
//         _name: type,
//         _attrs: {
//           src: element.$.src,
//           'gap:qualifier': element.$.density,
//           'gap:platform': data.$.name
//         }
//       });
//     } else if (data.$.name === 'winphone') {
//       if (type === 'icon' && element.$.height > 100) {
//         platformArray.push({
//           _name: type,
//           _attrs: {
//             src: element.$.src,
//             'gap:platform': data.$.name,
//             role: 'background'
//           }
//         });
//       } else {
//         platformArray.push({
//           _name: type,
//           _attrs: {
//             src: element.$.src,
//             'gap:platform': data.$.name
//           }
//         });
//       }
//     } else {
//     // iOS
//       platformArray.push({
//         _name: type,
//         _attrs: {
//           src: element.$.src,
//           height: element.$.height,
//           width: element.$.width,
//           'gap:platform': data.$.name
//         }
//       });
//     }
//   };
//
//   if (data.$.name === 'wp8') { data.$.name = 'winphone'; }
//
//   type = 'icon';
//   if (data.icon) { data.icon.forEach(parseElement); }
//   type = 'splash';
//   if (data.splash) { data.splash.forEach(parseElement); }
//
//   return platformArray;
// };
//
//
// exports.toJson = function toJson (xmlData) {
//   var json = {
//     _name: 'widget',
//     _attrs: {
//       'xmlns'    : 'http://www.w3.org/ns/widgets',
//       'xmlns:gap': 'http://phonegap.com/ns/1.0'
//     },
//     _content: []
//   };
//
//   // var deferred = Q.defer();
//
//   return parseString(xmlData)
//   .then(function (result) {
//     json._attrs.id = result.widget.$.id;
//     json._attrs.version = result.widget.$.version;
//     json._attrs.versionCode = result.widget.$.versionCode;
//
//     for (var i in result.widget) {
//       // Prevent error or looping
//       if (i === '$' | i === '_') { continue; }
//       json._content.push.apply(json._content, parseElements(i,result.widget[i]));
//     }
//
//     return json;
//     // deferred.resolve(json);
//   });
//
//   // return deferred.promise;
// };
//
// exports.toXmlString = function (jsonData) {
//   var returnString = jstoxml.toXML(jsonData, { header: true, indent: '  ' });
//   // console.log(returnString);
//   return returnString;
// };
//
// exports.toXmlFile = function (jsonData,filePath) {
//   return null;
// };
