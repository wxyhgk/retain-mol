/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var editorSingleton = require('../../../application/editor/editorSingleton.js');
var structService_types = require('../../../domain/services/struct/structService.types.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var normalizeError = require('../../../utilities/normalizeError.js');
var helpers = require('../helpers.js');
var ketcherProvider = require('../../../application/ketcherProvider.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function pollDeferred(process, complete, timeGap, startTimeGap) {
  return new Promise(function (resolve, reject) {
    function iterate() {
      process().then(function (val) {
        try {
          if (complete(val)) resolve(val);else setTimeout(iterate, timeGap);
        } catch (error) {
          KetcherLogger.KetcherLogger.error('remoteStructService.ts::pollDeferred', error);
          reject(normalizeError.normalizeError(error));
        }
      }, function (err) {
        return reject(normalizeError.normalizeError(err));
      });
    }
    setTimeout(iterate, startTimeGap !== null && startTimeGap !== void 0 ? startTimeGap : 0);
  });
}
function parametrizeUrl(url, params) {
  return url.replace(/(^|\/):(\w+)/g, function (_, prefix, val) {
    return prefix + params[val];
  });
}
function request(method, url, data, headers, responseHandler) {
  var requestUrl = url;
  if (data && method === 'GET') requestUrl = parametrizeUrl(url, data);
  var response = fetch(requestUrl, {
    method: method,
    headers: _objectSpread({
      Accept: 'application/json'
    }, headers !== null && headers !== void 0 ? headers : {}),
    body: method !== 'GET' ? data : undefined,
    credentials: 'same-origin'
  });
  if (responseHandler) {
    response = responseHandler(response);
  } else {
    response = response.then(function (response) {
      return response.json().then(function (res) {
        return response.ok ? res : Promise.reject(new Error(res.error));
      });
    });
  }
  return response;
}
function indigoCall(method, url, baseUrl, defaultOptions, customHeaders) {
  return function (data, options, responseHandler) {
    var _body$options;
    var body = _objectSpread({}, data !== null && data !== void 0 ? data : {});
    body.options = _objectSpread(_objectSpread(_objectSpread({}, (_body$options = body.options) !== null && _body$options !== void 0 ? _body$options : {}), defaultOptions !== null && defaultOptions !== void 0 ? defaultOptions : {}), options !== null && options !== void 0 ? options : {});
    return request(method, baseUrl + url, JSON.stringify(body), _objectSpread({
      'Content-Type': 'application/json'
    }, customHeaders), responseHandler);
  };
}
function pickStandardServerOptions(ketcherId, options) {
  var ketcherInstance = ketcherProvider.ketcherProvider.getKetcher(ketcherId);
  return {
    'dearomatize-on-load': options === null || options === void 0 ? void 0 : options['dearomatize-on-load'],
    'aromaticity-model': 'generic',
    'smart-layout': options === null || options === void 0 ? void 0 : options['smart-layout'],
    'ignore-stereochemistry-errors': options === null || options === void 0 ? void 0 : options['ignore-stereochemistry-errors'],
    'mass-skip-error-on-pseudoatoms': options === null || options === void 0 ? void 0 : options['mass-skip-error-on-pseudoatoms'],
    'gross-formula-add-rsites': options === null || options === void 0 ? void 0 : options['gross-formula-add-rsites'],
    'gross-formula-add-isotopes': options === null || options === void 0 ? void 0 : options['gross-formula-add-isotopes'],
    'ignore-no-chiral-flag': ketcherInstance.editor.options().ignoreChiralFlag,
    'aromatize-skip-superatoms': true,
    'valence-mode': options === null || options === void 0 ? void 0 : options['valence-mode']
  };
}
var RemoteStructService = function () {
  function RemoteStructService(apiPath, defaultOptions, customHeaders) {
    _classCallCheck__default["default"](this, RemoteStructService);
    _defineProperty__default["default"](this, "apiPath", void 0);
    _defineProperty__default["default"](this, "defaultOptions", void 0);
    _defineProperty__default["default"](this, "customHeaders", void 0);
    _defineProperty__default["default"](this, "ketcherId", void 0);
    this.apiPath = apiPath;
    this.defaultOptions = defaultOptions;
    this.customHeaders = customHeaders;
    this.ketcherId = null;
  }
  _createClass__default["default"](RemoteStructService, [{
    key: "addKetcherId",
    value: function addKetcherId(ketcherId) {
      this.ketcherId = ketcherId;
    }
  }, {
    key: "getInChIKey",
    value: function getInChIKey(struct) {
      return indigoCall('POST', 'indigo/convert', this.apiPath, this.defaultOptions, this.customHeaders)({
        struct: struct,
        output_format: structService_types.ChemicalMimeType.InChIKey
      }, {});
    }
  }, {
    key: "getStandardServerOptions",
    value: function getStandardServerOptions(options) {
      if (!options) {
        return this.defaultOptions;
      }
      if (!this.ketcherId) {
        throw new Error('ketcherId is missed when options getting');
      }
      return pickStandardServerOptions(this.ketcherId, options);
    }
  }, {
    key: "info",
    value: function () {
      var _info = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee() {
        var indigoVersion, imagoVersions, isAvailable, response;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              isAvailable = false;
              _context.prev = 1;
              _context.next = 4;
              return request('GET', this.apiPath + 'info', undefined, this.customHeaders);
            case 4:
              response = _context.sent;
              indigoVersion = response.indigo_version;
              imagoVersions = response.imago_versions;
              isAvailable = true;
              _context.next = 16;
              break;
            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](1);
              KetcherLogger.KetcherLogger.error('remoteStructService.ts::RemoteStructService::info', _context.t0);
              indigoVersion = '';
              imagoVersions = [];
              isAvailable = false;
            case 16:
              return _context.abrupt("return", {
                indigoVersion: indigoVersion,
                imagoVersions: imagoVersions,
                isAvailable: isAvailable
              });
            case 17:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[1, 10]]);
      }));
      function info() {
        return _info.apply(this, arguments);
      }
      return info;
    }()
  }, {
    key: "convert",
    value: function convert(data, options) {
      var _provideEditorInstanc;
      var monomerLibrary = JSON.stringify((_provideEditorInstanc = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc === void 0 ? void 0 : _provideEditorInstanc.monomersLibraryParsedJson);
      var expandedOptions = _objectSpread(_objectSpread({
        monomerLibrary: monomerLibrary
      }, this.getStandardServerOptions(options)), {}, {
        'bond-length-unit': options === null || options === void 0 ? void 0 : options['bond-length-unit'],
        'bond-length': options === null || options === void 0 ? void 0 : options['bond-length'],
        'reaction-component-margin-size-unit': options === null || options === void 0 ? void 0 : options['reaction-component-margin-size-unit'],
        'reaction-component-margin-size': options === null || options === void 0 ? void 0 : options['reaction-component-margin-size'],
        'image-resolution': options === null || options === void 0 ? void 0 : options['image-resolution'],
        'molfile-saving-mode': options === null || options === void 0 ? void 0 : options['molfile-saving-mode'],
        'monomer-library-saving-mode': options === null || options === void 0 ? void 0 : options['monomer-library-saving-mode'],
        'molfile-saving-skip-date': options === null || options === void 0 ? void 0 : options['molfile-saving-skip-date'],
        'output-content-type': options === null || options === void 0 ? void 0 : options['output-content-type'],
        'sequence-type': options === null || options === void 0 ? void 0 : options['sequence-type']
      });
      return indigoCall('POST', 'indigo/convert', this.apiPath, this.defaultOptions, this.customHeaders)(data, expandedOptions);
    }
  }, {
    key: "layout",
    value: function layout(data, options) {
      var expandedOptions = _objectSpread(_objectSpread({}, this.getStandardServerOptions(options)), {}, {
        'render-label-mode': this.ketcherId ? helpers.getLabelRenderModeForIndigo(this.ketcherId) : undefined,
        'render-font-size': options === null || options === void 0 ? void 0 : options['render-font-size'],
        'render-font-size-unit': options === null || options === void 0 ? void 0 : options['render-font-size-unit'],
        'render-font-size-sub': options === null || options === void 0 ? void 0 : options['render-font-size-sub'],
        'render-font-size-sub-unit': options === null || options === void 0 ? void 0 : options['render-font-size-sub-unit'],
        'output-content-type': 'application/json',
        'bond-length-unit': options === null || options === void 0 ? void 0 : options['bond-length-unit'],
        'bond-length': options === null || options === void 0 ? void 0 : options['bond-length'],
        'reaction-component-margin-size-unit': options === null || options === void 0 ? void 0 : options['reaction-component-margin-size-unit'],
        'reaction-component-margin-size': options === null || options === void 0 ? void 0 : options['reaction-component-margin-size'],
        'image-resolution': options === null || options === void 0 ? void 0 : options['image-resolution']
      });
      return indigoCall('POST', 'indigo/layout', this.apiPath, this.defaultOptions, this.customHeaders)(data, expandedOptions);
    }
  }, {
    key: "clean",
    value: function clean(data, options) {
      return indigoCall('POST', 'indigo/clean', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "aromatize",
    value: function aromatize(data, options) {
      return indigoCall('POST', 'indigo/aromatize', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "dearomatize",
    value: function dearomatize(data, options) {
      return indigoCall('POST', 'indigo/dearomatize', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "calculateCip",
    value: function calculateCip(data, options) {
      return indigoCall('POST', 'indigo/calculate_cip', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "automap",
    value: function automap(data, options) {
      return indigoCall('POST', 'indigo/automap', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "check",
    value: function check(data, options) {
      return indigoCall('POST', 'indigo/check', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "calculate",
    value: function calculate(data, options) {
      return indigoCall('POST', 'indigo/calculate', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "recognize",
    value: function recognize(blob, version) {
      var _blob$type;
      var parVersion = version ? "?version=".concat(version) : '';
      var req = request('POST', this.apiPath + "imago/uploads".concat(parVersion), blob, _objectSpread({
        'Content-Type': (_blob$type = blob.type) !== null && _blob$type !== void 0 ? _blob$type : 'application/octet-stream'
      }, this.customHeaders));
      var statusUrl = this.apiPath + 'imago/uploads/:id';
      var customHeaders = this.customHeaders;
      var status = function status(data) {
        return request('GET', statusUrl, data, customHeaders);
      };
      return req.then(function (data) {
        return pollDeferred(status.bind(null, {
          id: data.upload_id
        }), function (response) {
          if (response.state === 'FAILURE') throw new Error(JSON.stringify(response));
          return response.state === 'SUCCESS';
        }, 500, 300);
      }).then(function (response) {
        return {
          struct: response.metadata.mol_str
        };
      });
    }
  }, {
    key: "generateImageAsBase64",
    value: function generateImageAsBase64(data, options) {
      var _options$outputFormat;
      var outputFormat = (_options$outputFormat = options === null || options === void 0 ? void 0 : options.outputFormat) !== null && _options$outputFormat !== void 0 ? _options$outputFormat : 'png';
      return indigoCall('POST', 'indigo/render', this.apiPath, this.defaultOptions, this.customHeaders)({
        struct: data
      }, _objectSpread(_objectSpread({}, this.getStandardServerOptions(options)), {}, {
        'render-coloring': options === null || options === void 0 ? void 0 : options['render-coloring'],
        'render-font-size': options === null || options === void 0 ? void 0 : options['render-font-size'],
        'render-font-size-unit': options === null || options === void 0 ? void 0 : options['render-font-size-unit'],
        'render-font-size-sub': options === null || options === void 0 ? void 0 : options['render-font-size-sub'],
        'render-font-size-sub-unit': options === null || options === void 0 ? void 0 : options['render-font-size-sub-unit'],
        'image-resolution': options === null || options === void 0 ? void 0 : options['image-resolution'],
        'bond-length-unit': options === null || options === void 0 ? void 0 : options['bond-length-unit'],
        'bond-length': options === null || options === void 0 ? void 0 : options['bond-length'],
        'render-bond-thickness': options === null || options === void 0 ? void 0 : options['render-bond-thickness'],
        'render-bond-thickness-unit': options === null || options === void 0 ? void 0 : options['render-bond-thickness-unit'],
        'render-bond-spacing': options === null || options === void 0 ? void 0 : options['render-bond-spacing'],
        'render-stereo-bond-width': options === null || options === void 0 ? void 0 : options['render-stereo-bond-width'],
        'render-stereo-bond-width-unit': options === null || options === void 0 ? void 0 : options['render-stereo-bond-width-unit'],
        'render-stereo-style': options === null || options === void 0 ? void 0 : options['render-stereo-style'],
        'render-hash-spacing': options === null || options === void 0 ? void 0 : options['render-hash-spacing'],
        'render-hash-spacing-unit': options === null || options === void 0 ? void 0 : options['render-hash-spacing-unit'],
        'render-output-sheet-width': options === null || options === void 0 ? void 0 : options['render-output-sheet-width'],
        'render-output-sheet-height': options === null || options === void 0 ? void 0 : options['render-output-sheet-height'],
        'render-output-format': outputFormat,
        'render-label-mode': this.ketcherId ? helpers.getLabelRenderModeForIndigo(this.ketcherId) : undefined
      }), function (response) {
        return response.then(function (resp) {
          return resp.text();
        });
      });
    }
  }, {
    key: "toggleExplicitHydrogens",
    value: function toggleExplicitHydrogens(data, options) {
      return indigoCall('POST', 'indigo/convert_explicit_hydrogens', this.apiPath, this.defaultOptions, this.customHeaders)(data, this.getStandardServerOptions(options));
    }
  }, {
    key: "calculateMacromoleculeProperties",
    value: function calculateMacromoleculeProperties(data, options) {
      return indigoCall('POST', 'indigo/calculateMacroProperties', this.apiPath, this.defaultOptions, this.customHeaders)(data, _objectSpread(_objectSpread({}, this.getStandardServerOptions(options)), {}, {
        upc: options === null || options === void 0 ? void 0 : options.upc,
        nac: options === null || options === void 0 ? void 0 : options.nac
      }));
    }
  }]);
  return RemoteStructService;
}();

exports.RemoteStructService = RemoteStructService;
exports.pickStandardServerOptions = pickStandardServerOptions;
//# sourceMappingURL=remoteStructService.js.map
