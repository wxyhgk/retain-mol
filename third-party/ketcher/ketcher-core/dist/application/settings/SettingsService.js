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

var _typeof = require('@babel/runtime/helpers/typeof');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var events = require('events');
var types = require('./types.js');
var schema = require('./schema.js');
var LocalStorageAdapter = require('./LocalStorageAdapter.js');
var SchemaValidator = require('./SchemaValidator.js');
var SettingsMigration = require('./SettingsMigration.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var DEFAULT_STORAGE_KEY = 'ketcher-opts';
var SettingsService = function () {
  function SettingsService() {
    var _options$autoSave;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck__default["default"](this, SettingsService);
    _defineProperty__default["default"](this, "settings", void 0);
    _defineProperty__default["default"](this, "storage", void 0);
    _defineProperty__default["default"](this, "validator", void 0);
    _defineProperty__default["default"](this, "emitter", void 0);
    _defineProperty__default["default"](this, "storageKey", void 0);
    _defineProperty__default["default"](this, "autoSave", void 0);
    _defineProperty__default["default"](this, "initialized", false);
    this.storage = options.storage || new LocalStorageAdapter.LocalStorageAdapter();
    this.validator = options.validator || new SchemaValidator.SchemaValidator();
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    this.autoSave = (_options$autoSave = options.autoSave) !== null && _options$autoSave !== void 0 ? _options$autoSave : true;
    this.emitter = new events.EventEmitter();
    this.settings = this.mergeWithDefaults(options.defaults || {});
  }
  _createClass__default["default"](SettingsService, [{
    key: "init",
    value: (function () {
      var _init = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee() {
        var stored, migrated, merged, validation;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.initialized) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return");
            case 2:
              _context.prev = 2;
              _context.next = 5;
              return this.storage.load(this.storageKey);
            case 5:
              stored = _context.sent;
              if (stored) {
                migrated = SettingsMigration.SettingsMigration.migrate(stored);
                merged = this.mergeWithDefaults(migrated);
                validation = this.validator.validate(merged);
                if (!validation.valid) {
                  KetcherLogger.KetcherLogger.warn('Invalid settings in storage, using defaults', validation.errors);
                } else {
                  this.settings = merged;
                }
              }
              if (!this.autoSave) {
                _context.next = 10;
                break;
              }
              _context.next = 10;
              return this.storage.save(this.storageKey, this.settings);
            case 10:
              this.initialized = true;
              _context.next = 17;
              break;
            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](2);
              KetcherLogger.KetcherLogger.error('[SettingsService] Failed to initialize settings:', _context.t0);
              this.initialized = true;
            case 17:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 13]]);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    )
  }, {
    key: "getSettings",
    value: function getSettings() {
      this.assertInitialized();
      return this.freeze(this.settings);
    }
  }, {
    key: "updateSettings",
    value: (function () {
      var _updateSettings = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(partial) {
        var validation, updated, fullValidation;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.assertInitialized();
              validation = this.validator.validatePartial(partial);
              if (validation.valid) {
                _context2.next = 4;
                break;
              }
              throw new types.SettingsValidationError(validation.errors || []);
            case 4:
              updated = this.deepMerge(this.settings, partial);
              fullValidation = this.validator.validate(updated);
              if (fullValidation.valid) {
                _context2.next = 8;
                break;
              }
              throw new types.SettingsValidationError(fullValidation.errors || []);
            case 8:
              this.settings = updated;
              if (!this.autoSave) {
                _context2.next = 18;
                break;
              }
              _context2.prev = 10;
              _context2.next = 13;
              return this.storage.save(this.storageKey, this.settings);
            case 13:
              _context2.next = 18;
              break;
            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2["catch"](10);
              KetcherLogger.KetcherLogger.error('[SettingsService] Failed to persist settings:', _context2.t0);
            case 18:
              this.emitter.emit('settings:changed', this.freeze(this.settings));
              return _context2.abrupt("return", this.getSettings());
            case 20:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[10, 15]]);
      }));
      function updateSettings(_x) {
        return _updateSettings.apply(this, arguments);
      }
      return updateSettings;
    }()
    )
  }, {
    key: "resetToDefaults",
    value: (function () {
      var _resetToDefaults = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3() {
        var defaults;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              this.assertInitialized();
              defaults = schema.getDefaultSettings();
              return _context3.abrupt("return", this.updateSettings(defaults));
            case 3:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function resetToDefaults() {
        return _resetToDefaults.apply(this, arguments);
      }
      return resetToDefaults;
    }()
    )
  }, {
    key: "loadPreset",
    value: (function () {
      var _loadPreset = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee4(name) {
        var preset;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              this.assertInitialized();
              preset = schema.PRESETS[name];
              if (preset) {
                _context4.next = 4;
                break;
              }
              throw new Error("Unknown preset: ".concat(name));
            case 4:
              return _context4.abrupt("return", this.updateSettings(preset));
            case 5:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function loadPreset(_x2) {
        return _loadPreset.apply(this, arguments);
      }
      return loadPreset;
    }()
    )
  }, {
    key: "getAvailablePresets",
    value: function getAvailablePresets() {
      return Object.keys(schema.PRESETS);
    }
  }, {
    key: "validateSettings",
    value: function validateSettings(settings) {
      return this.validator.validate(settings);
    }
  }, {
    key: "exportSettings",
    value: function exportSettings() {
      this.assertInitialized();
      return JSON.stringify(this.settings, null, 2);
    }
  }, {
    key: "importSettings",
    value: (function () {
      var _importSettings = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee5(json) {
        var parsed;
        return _regeneratorRuntime__default["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              this.assertInitialized();
              _context5.prev = 1;
              parsed = JSON.parse(json);
              return _context5.abrupt("return", this.updateSettings(parsed));
            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5["catch"](1);
              throw new Error("Failed to import settings: ".concat(_context5.t0.message));
            case 9:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[1, 6]]);
      }));
      function importSettings(_x3) {
        return _importSettings.apply(this, arguments);
      }
      return importSettings;
    }()
    )
  }, {
    key: "subscribe",
    value: function subscribe(listener) {
      var _this = this;
      this.emitter.on('settings:changed', listener);
      return function () {
        _this.emitter.off('settings:changed', listener);
      };
    }
  }, {
    key: "getSchema",
    value: function getSchema() {
      return schema.PRESETS;
    }
  }, {
    key: "deepMerge",
    value: function deepMerge(target, source) {
      if (!source || _typeof__default["default"](source) !== 'object') {
        return target;
      }
      var result = _objectSpread({}, target);
      for (var key in source) {
        if (Object.hasOwn(source, key)) {
          var sourceValue = source[key];
          var targetValue = result[key];
          if (sourceValue === undefined) {
            continue;
          }
          if (sourceValue && _typeof__default["default"](sourceValue) === 'object' && !Array.isArray(sourceValue) && targetValue && _typeof__default["default"](targetValue) === 'object' && !Array.isArray(targetValue)) {
            result[key] = this.deepMerge(targetValue, sourceValue);
          } else {
            result[key] = sourceValue;
          }
        }
      }
      return result;
    }
  }, {
    key: "mergeWithDefaults",
    value: function mergeWithDefaults(partial) {
      var defaults = schema.getDefaultSettings();
      return this.deepMerge(defaults, partial);
    }
  }, {
    key: "freeze",
    value: function freeze(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  }, {
    key: "assertInitialized",
    value: function assertInitialized() {
      if (!this.initialized) {
        throw new Error('SettingsService not initialized. Call init() first.');
      }
    }
  }], [{
    key: "getInstance",
    value: (
    function () {
      var _getInstance = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee6() {
        var options,
          _args6 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              options = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {};
              if (SettingsService.instance) {
                _context6.next = 5;
                break;
              }
              SettingsService.instance = new SettingsService(options);
              _context6.next = 5;
              return SettingsService.instance.init();
            case 5:
              return _context6.abrupt("return", SettingsService.instance);
            case 6:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      }));
      function getInstance() {
        return _getInstance.apply(this, arguments);
      }
      return getInstance;
    }()
    )
  }, {
    key: "resetInstance",
    value: function resetInstance() {
      SettingsService.instance = null;
    }
  }]);
  return SettingsService;
}();
_defineProperty__default["default"](SettingsService, "instance", null);

exports.SettingsService = SettingsService;
//# sourceMappingURL=SettingsService.js.map
