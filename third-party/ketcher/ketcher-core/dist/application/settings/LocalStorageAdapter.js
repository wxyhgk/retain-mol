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
var _regeneratorRuntime = require('@babel/runtime/regenerator');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

var LocalStorageAdapter = function () {
  function LocalStorageAdapter() {
    _classCallCheck__default["default"](this, LocalStorageAdapter);
  }
  _createClass__default["default"](LocalStorageAdapter, [{
    key: "load",
    value: (
    function () {
      var _load = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(key) {
        var item;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (this.isAvailable()) {
                _context.next = 3;
                break;
              }
              KetcherLogger.KetcherLogger.warn('localStorage is not available');
              return _context.abrupt("return", null);
            case 3:
              _context.prev = 3;
              item = localStorage.getItem(key);
              if (item) {
                _context.next = 7;
                break;
              }
              return _context.abrupt("return", null);
            case 7:
              return _context.abrupt("return", JSON.parse(item));
            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              KetcherLogger.KetcherLogger.error("Failed to load settings from localStorage (key: ".concat(key, "):"), _context.t0);
              return _context.abrupt("return", null);
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[3, 10]]);
      }));
      function load(_x) {
        return _load.apply(this, arguments);
      }
      return load;
    }()
    )
  }, {
    key: "save",
    value: (function () {
      var _save = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(key, settings) {
        var json;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (this.isAvailable()) {
                _context2.next = 2;
                break;
              }
              throw new Error('localStorage is not available');
            case 2:
              _context2.prev = 2;
              json = JSON.stringify(settings);
              localStorage.setItem(key, json);
              _context2.next = 11;
              break;
            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](2);
              KetcherLogger.KetcherLogger.error("Failed to save settings to localStorage (key: ".concat(key, "):"), _context2.t0);
              throw _context2.t0;
            case 11:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[2, 7]]);
      }));
      function save(_x2, _x3) {
        return _save.apply(this, arguments);
      }
      return save;
    }()
    )
  }, {
    key: "clear",
    value: (function () {
      var _clear = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3(key) {
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (this.isAvailable()) {
                _context3.next = 2;
                break;
              }
              return _context3.abrupt("return");
            case 2:
              try {
                localStorage.removeItem(key);
              } catch (error) {
                KetcherLogger.KetcherLogger.error("Failed to clear settings from localStorage (key: ".concat(key, "):"), error);
              }
            case 3:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function clear(_x4) {
        return _clear.apply(this, arguments);
      }
      return clear;
    }()
    )
  }, {
    key: "isAvailable",
    value: function isAvailable() {
      try {
        var test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (_unused) {
        return false;
      }
    }
  }]);
  return LocalStorageAdapter;
}();

exports.LocalStorageAdapter = LocalStorageAdapter;
//# sourceMappingURL=LocalStorageAdapter.js.map
