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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

var MemoryStorageAdapter = function () {
  function MemoryStorageAdapter() {
    _classCallCheck__default["default"](this, MemoryStorageAdapter);
    _defineProperty__default["default"](this, "storage", new Map());
  }
  _createClass__default["default"](MemoryStorageAdapter, [{
    key: "load",
    value: (
    function () {
      var _load = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(key) {
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", this.storage.get(key) || null);
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
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
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.storage.set(key, JSON.parse(JSON.stringify(settings)));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
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
              this.storage["delete"](key);
            case 1:
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
      return true;
    }
  }, {
    key: "clearAll",
    value: function clearAll() {
      this.storage.clear();
    }
  }]);
  return MemoryStorageAdapter;
}();

exports.MemoryStorageAdapter = MemoryStorageAdapter;
//# sourceMappingURL=MemoryStorageAdapter.js.map
