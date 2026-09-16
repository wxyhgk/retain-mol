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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _regeneratorRuntime from '@babel/runtime/regenerator';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _molSerializer = new WeakMap();
var MolfileV2000Formatter = function () {
  function MolfileV2000Formatter(molSerializer) {
    _classCallCheck(this, MolfileV2000Formatter);
    _classPrivateFieldInitSpec(this, _molSerializer, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _molSerializer, molSerializer);
  }
  _createClass(MolfileV2000Formatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(struct) {
        var stringifiedMolfile;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              stringifiedMolfile = _classPrivateFieldGet(this, _molSerializer).serialize(struct);
              return _context.abrupt("return", stringifiedMolfile);
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getStringFromStructureAsync(_x) {
        return _getStringFromStructureAsync.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(stringifiedStruct) {
        var struct;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              struct = _classPrivateFieldGet(this, _molSerializer).deserialize(stringifiedStruct);
              return _context2.abrupt("return", struct);
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getStructureFromStringAsync(_x2) {
        return _getStructureFromStringAsync.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }]);
  return MolfileV2000Formatter;
}();

export { MolfileV2000Formatter };
//# sourceMappingURL=molfileV2000Formatter.modern.js.map
