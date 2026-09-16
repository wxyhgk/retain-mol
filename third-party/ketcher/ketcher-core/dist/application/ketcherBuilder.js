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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
require('./formatters/supportedFormatProperties.js');
require('./formatters/formatProperties.js');
require('./formatters/structFormatter.types.js');
var formatterFactory = require('./formatters/formatterFactory.js');
require('./formatters/mol2Formatter.js');
require('./formatters/xyzFormatter.js');
require('./formatters/qcSchemaFormatter.js');
require('../utilities/runAsyncAction.js');
require('../utilities/KetcherLogger.js');
require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
var assert = require('../utilities/assert.js');
require('./formatters/types/ket.js');
var ketcher = require('./ketcher.js');
var ketcherProvider = require('./ketcherProvider.js');
require('./settings/types.js');
var SettingsService = require('./settings/SettingsService.js');
var LocalStorageAdapter = require('./settings/LocalStorageAdapter.js');
require('./settings/MemoryStorageAdapter.js');
require('./settings/SchemaValidator.js');
require('./settings/SettingsMigration.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var DefaultStructServiceOptions = {
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'ignore-no-chiral-flag': false
};
var _structServiceProvider = new WeakMap();
var _settingsService = new WeakMap();
var _storageAdapter = new WeakMap();
var _initialSettings = new WeakMap();
var KetcherBuilder = function () {
  function KetcherBuilder() {
    _classCallCheck__default["default"](this, KetcherBuilder);
    _classPrivateFieldInitSpec(this, _structServiceProvider, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _settingsService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _storageAdapter, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _initialSettings, {
      writable: true,
      value: void 0
    });
  }
  _createClass__default["default"](KetcherBuilder, [{
    key: "withStructServiceProvider",
    value: function withStructServiceProvider(structServiceProvider) {
      _classPrivateFieldSet__default["default"](this, _structServiceProvider, structServiceProvider);
      return this;
    }
  }, {
    key: "withSettingsService",
    value: function withSettingsService(settingsService) {
      _classPrivateFieldSet__default["default"](this, _settingsService, settingsService);
      return this;
    }
  }, {
    key: "withStorageAdapter",
    value: function withStorageAdapter(storageAdapter) {
      _classPrivateFieldSet__default["default"](this, _storageAdapter, storageAdapter);
      return this;
    }
  }, {
    key: "withSettings",
    value: function withSettings(settings) {
      _classPrivateFieldSet__default["default"](this, _initialSettings, settings);
      return this;
    }
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(serviceOptions) {
        var structServiceProvider, mergedServiceOptions, structService, settingsService, ketcher$1;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              assert.assert(_classPrivateFieldGet__default["default"](this, _structServiceProvider) !== undefined);
              structServiceProvider = _classPrivateFieldGet__default["default"](this, _structServiceProvider);
              mergedServiceOptions = _objectSpread(_objectSpread({}, DefaultStructServiceOptions), serviceOptions);
              structService = structServiceProvider.createStructService(mergedServiceOptions);
              settingsService = _classPrivateFieldGet__default["default"](this, _settingsService);
              if (settingsService) {
                _context.next = 9;
                break;
              }
              _context.next = 8;
              return SettingsService.SettingsService.getInstance({
                storage: _classPrivateFieldGet__default["default"](this, _storageAdapter) || new LocalStorageAdapter.LocalStorageAdapter(),
                defaults: _classPrivateFieldGet__default["default"](this, _initialSettings),
                autoSave: true,
                migrateOnLoad: true
              });
            case 8:
              settingsService = _context.sent;
            case 9:
              ketcher$1 = new ketcher.Ketcher(structService, new formatterFactory.FormatterFactory(structService), settingsService);
              structService.addKetcherId(ketcher$1.id);
              ketcher$1[structServiceProvider.mode] = true;
              ketcherProvider.ketcherProvider.addKetcherInstance(ketcher$1);
              return _context.abrupt("return", ketcher$1);
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function build(_x) {
        return _build.apply(this, arguments);
      }
      return build;
    }()
  }]);
  return KetcherBuilder;
}();

exports.DefaultStructServiceOptions = DefaultStructServiceOptions;
exports.KetcherBuilder = KetcherBuilder;
//# sourceMappingURL=ketcherBuilder.js.map
