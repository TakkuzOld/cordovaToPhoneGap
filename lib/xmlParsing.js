var jstoxml = require('jstoxml');
var Q = require('q');
var parseString = Q.denodeify(require('xml2js').parseString);

var parseElements = function (name,data) {
  if (!data) { return ''; }
  var elements = [];
  var parseEvery = function (element) {
    switch (name) {
      case 'plugin':
        // Plugin to skip (incompatible with cordova 4.0)
        // if (element.$.name === 'cordova-plugin-whitelist') { return; }
        // These plugins need Play Services
        if (
          element.$.name === 'cordova-plugin-google-analytics' ||
          element.$.name === 'onesignal-cordova-plugin' ||
          element.$.name === 'phonegap-plugin-push') {
            elements.push(parsePlugin('cordova-plugin-googleplayservices'));
        }
        if (element.$.name === 'onesignal-cordova-plugin') {
          elements.push(parsePlugin('onesignal-cordova-plugin-pgb-compat', 'npm'));
          elements.push(parsePlugin('cordova-plugin-android-support-v4'));
          return;
        }

        elements.push(parsePlugin(element.$.name));
        break;
      case 'platform':
        elements.push({
          _name: 'gap:platform',
          _attrs: { name: element.$.name }
        });
        elements.push(parsePlatform(element));
        break;
      case 'engine': break;
      default:
        var content = element._ || (typeof element === 'string' ? element : '') || parseContent(element);
        var el = {
          _name: name,
          _attrs: element.$
        };
        if (content) { el._content = content; }
        // Necessary to show splashscreen on PhoneGap:Build - http://stackoverflow.com/questions/25385308/phonegap-build-not-showing-splashscreen
        if (el._name === 'preference' && el._attrs.name === 'SplashScreen') { el._attrs.value = 'splash'; }
        elements.push(el);
        break;
    }
  };

  data.forEach(parseEvery);
  return elements;
};

var parseContent = function (data) {
  var content = [];
  for (var i in data) {
    if (i === '$') { continue; }
    content.push.apply(content, parseElements(i,data[i]));
  }

  if (content.length === 0) { return ''; }
  return content;
};

var parsePlugin = function (elName, elSource) {
  var source = elSource || getPluginSource(elName);
  var pluginData = {
    _name: 'gap:plugin',
    _attrs: {
      name: elName,
    }
  };

  if (source) { pluginData._attrs.source = source; }
  return pluginData;
};
var getPluginSource = function (name) {
  if (
    name.indexOf('cordova-') === 0 ||
    name.indexOf('phonegap-') === 0 ||
    name.indexOf('ionic-') === 0) {
     return 'npm';
  }

  return null;
};
var parsePlatform = function (data) {
  var platformArray = [], type = '';
  var parseElement = function (element) {
    // Android
    if (element.$.density) {
      platformArray.push({
        _name: type,
        _attrs: {
          src: element.$.src,
          'gap:qualifier': element.$.density,
          'gap:platform': data.$.name
        }
      });
    } else if (data.$.name === 'winphone') {
      if (type === 'icon' && element.$.height > 100) {
        platformArray.push({
          _name: type,
          _attrs: {
            src: element.$.src,
            'gap:platform': data.$.name,
            role: 'background'
          }
        });
      } else {
        platformArray.push({
          _name: type,
          _attrs: {
            src: element.$.src,
            'gap:platform': data.$.name
          }
        });
      }
    } else {
    // iOS
      platformArray.push({
        _name: type,
        _attrs: {
          src: element.$.src,
          height: element.$.height,
          width: element.$.width,
          'gap:platform': data.$.name
        }
      });
    }
  };

  if (data.$.name === 'wp8') { data.$.name = 'winphone'; }

  type = 'icon';
  if (data.icon) { data.icon.forEach(parseElement); }
  type = 'splash';
  if (data.splash) { data.splash.forEach(parseElement); }

  return platformArray;
};

exports.toJson = function (xmlData) {
  var json = {
    _name: 'widget',
    _attrs: {
      'xmlns'    : 'http://www.w3.org/ns/widgets',
      'xmlns:gap': 'http://phonegap.com/ns/1.0'
    },
    _content: []
  };

  // var deferred = Q.defer();

  return parseString(xmlData)
  .then(function (result) {
    json._attrs.id = result.widget.$.id;
    json._attrs.version = result.widget.$.version;

    for (var i in result.widget) {
      if (i === '$') { continue; }
      json._content.push.apply(json._content, parseElements(i,result.widget[i]));
    }

    return json;
    // deferred.resolve(json);
  });

  // return deferred.promise;
};

exports.toXmlString = function (jsonData) {
  var returnString = jstoxml.toXML(jsonData, { header: true, indent: '  ' });
  // console.log(returnString);
  return returnString;
};

exports.toXmlFile = function (jsonData,filePath) {
  return null;
};