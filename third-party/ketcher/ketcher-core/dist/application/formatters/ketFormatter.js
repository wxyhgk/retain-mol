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
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _regeneratorRuntime = require('@babel/runtime/regenerator');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _ketSerializer = new WeakMap();
var KetFormatter = function () {
  function KetFormatter(serializer) {
    _classCallCheck__default["default"](this, KetFormatter);
    _classPrivateFieldInitSpec(this, _ketSerializer, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet__default["default"](this, _ketSerializer, serializer);
  }
  _createClass__default["default"](KetFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(struct, drawingEntitiesManager, selection) {
        var ket;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              ket = _classPrivateFieldGet__default["default"](this, _ketSerializer).serialize(struct, drawingEntitiesManager, selection);
              return _context.abrupt("return", ket);
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getStringFromStructureAsync(_x, _x2, _x3) {
        return _getStringFromStructureAsync.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(content) {
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", _classPrivateFieldGet__default["default"](this, _ketSerializer).deserialize(content));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getStructureFromStringAsync(_x4) {
        return _getStructureFromStringAsync.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }, {
    key: "parseMacromoleculeString",
    value: function parseMacromoleculeString(content) {
      _classPrivateFieldGet__default["default"](this, _ketSerializer).deserializeMicromolecules(content);
    }
  }]);
  return KetFormatter;
}();

exports.KetFormatter = KetFormatter;
//# sourceMappingURL=ketFormatter.js.map
