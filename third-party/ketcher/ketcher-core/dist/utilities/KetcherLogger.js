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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

exports.LogLevel = void 0;
(function (LogLevel) {
  LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
  LogLevel[LogLevel["WARN"] = 1] = "WARN";
  LogLevel[LogLevel["INFO"] = 2] = "INFO";
  LogLevel[LogLevel["LOG"] = 3] = "LOG";
})(exports.LogLevel || (exports.LogLevel = {}));
var KetcherLogger = function () {
  function KetcherLogger() {
    _classCallCheck__default["default"](this, KetcherLogger);
  }
  _createClass__default["default"](KetcherLogger, null, [{
    key: "settings",
    get: function get() {
      var _window, _window$ketcher$loggi, _window$ketcher;
      if (typeof window === 'undefined') {
        return {};
      }
      if (!((_window = window) !== null && _window !== void 0 && _window.ketcher)) ;
      return (_window$ketcher$loggi = (_window$ketcher = window.ketcher) === null || _window$ketcher === void 0 ? void 0 : _window$ketcher.logging) !== null && _window$ketcher$loggi !== void 0 ? _window$ketcher$loggi : {};
    },
    set: function set(newSettings) {
      for (var _i = 0, _Object$entries = Object.entries(newSettings); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray__default["default"](_Object$entries[_i], 2),
          settingName = _Object$entries$_i[0],
          settingValue = _Object$entries$_i[1];
        this.settings[settingName] = settingValue;
      }
    }
  }, {
    key: "log",
    value: function log() {
      if (!this.isMinimumLogLevel(exports.LogLevel.LOG)) {
        return;
      }
      var showTrace = this.settings.showTrace;
      for (var _len = arguments.length, messages = new Array(_len), _key = 0; _key < _len; _key++) {
        messages[_key] = arguments[_key];
      }
      if (showTrace) {
        window.console.trace(messages);
      } else {
        window.console.log(messages);
      }
    }
  }, {
    key: "info",
    value: function info() {
      if (!this.isMinimumLogLevel(exports.LogLevel.INFO)) {
        return;
      }
      var showTrace = this.settings.showTrace;
      for (var _len2 = arguments.length, messages = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        messages[_key2] = arguments[_key2];
      }
      if (showTrace) {
        window.console.trace(messages);
      } else {
        window.console.info(messages);
      }
    }
  }, {
    key: "warn",
    value: function warn() {
      if (!this.isMinimumLogLevel(exports.LogLevel.WARN)) {
        return;
      }
      for (var _len3 = arguments.length, warnings = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        warnings[_key3] = arguments[_key3];
      }
      window.console.warn(warnings);
    }
  }, {
    key: "error",
    value: function error() {
      if (!this.isMinimumLogLevel(exports.LogLevel.ERROR)) {
        return;
      }
      for (var _len4 = arguments.length, errors = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        errors[_key4] = arguments[_key4];
      }
      window.console.error(errors);
    }
  }, {
    key: "isMinimumLogLevel",
    value: function isMinimumLogLevel(minimumLevel) {
      var _this$settings = this.settings,
        enabled = _this$settings.enabled,
        level = _this$settings.level;
      if (!enabled || level == null) {
        return false;
      }
      return level >= minimumLevel;
    }
  }]);
  return KetcherLogger;
}();

exports.KetcherLogger = KetcherLogger;
//# sourceMappingURL=KetcherLogger.js.map
