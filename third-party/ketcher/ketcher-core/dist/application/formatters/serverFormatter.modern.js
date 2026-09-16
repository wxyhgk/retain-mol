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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { SupportedFormat } from './structFormatter.types.modern.js';
import { getPropertiesByFormat } from './formatProperties.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { SmilesFormatter } from './smilesFormatter.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _structService = new WeakMap();
var _ketSerializer = new WeakMap();
var _format = new WeakMap();
var _options = new WeakMap();
var ServerFormatter = function () {
  function ServerFormatter(structService, ketSerializer, format, options) {
    _classCallCheck(this, ServerFormatter);
    _classPrivateFieldInitSpec(this, _structService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _ketSerializer, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _format, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _options, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _structService, structService);
    _classPrivateFieldSet(this, _ketSerializer, ketSerializer);
    _classPrivateFieldSet(this, _format, format);
    _classPrivateFieldSet(this, _options, options);
  }
  _createClass(ServerFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(struct, drawingEntitiesManager) {
        var formatProperties, stringifiedStruct, convertResult, message, details;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              formatProperties = getPropertiesByFormat(_classPrivateFieldGet(this, _format));
              _context.prev = 1;
              stringifiedStruct = _classPrivateFieldGet(this, _ketSerializer).serialize(struct, drawingEntitiesManager);
              _context.next = 5;
              return _classPrivateFieldGet(this, _structService).convert({
                struct: stringifiedStruct,
                output_format: formatProperties.mime
              }, _objectSpread(_objectSpread({}, _classPrivateFieldGet(this, _options)), formatProperties.options));
            case 5:
              convertResult = _context.sent;
              return _context.abrupt("return", convertResult.struct);
            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](1);
              if (_context.t0 instanceof Error && _context.t0.message === 'Server is not compatible') {
                message = "".concat(formatProperties.name, " is not supported.");
              } else {
                details = _context.t0 instanceof Error ? _context.t0.message : String(_context.t0);
                message = "Convert error!\n".concat(details);
              }
              KetcherLogger.error('serverFormatter.ts::getStringFromStructureAsync', _context.t0);
              throw new Error(message);
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[1, 9]]);
      }));
      function getStringFromStructureAsync(_x, _x2) {
        return _getStringFromStructureAsync.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getCallingMethod",
    value: function getCallingMethod(stringifiedStruct, format) {
      if (_classPrivateFieldGet(this, _format) === SupportedFormat.smiles) {
        return {
          method: SmilesFormatter.isContainsCoordinates(stringifiedStruct) ? _classPrivateFieldGet(this, _structService).convert : _classPrivateFieldGet(this, _structService).layout,
          struct: stringifiedStruct
        };
      }
      var withCoords = getPropertiesByFormat(format).supportsCoords;
      var shouldConvert = format === SupportedFormat.idt || withCoords;
      if (shouldConvert) {
        return {
          method: _classPrivateFieldGet(this, _structService).convert,
          struct: stringifiedStruct
        };
      }
      return {
        method: _classPrivateFieldGet(this, _structService).layout,
        struct: stringifiedStruct.trim()
      };
    }
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(stringifiedStruct) {
        var _this$getCallingMetho, method, struct, data, result, parsedStruct, details, formatError;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _this$getCallingMetho = this.getCallingMethod(stringifiedStruct, _classPrivateFieldGet(this, _format)), method = _this$getCallingMetho.method, struct = _this$getCallingMetho.struct;
              data = {
                struct: struct,
                output_format: getPropertiesByFormat(SupportedFormat.ket).mime
              };
              _context2.prev = 2;
              _context2.next = 5;
              return method(data, _classPrivateFieldGet(this, _options));
            case 5:
              result = _context2.sent;
              parsedStruct = _classPrivateFieldGet(this, _ketSerializer).deserialize(result.struct);
              if (method === _classPrivateFieldGet(this, _structService).layout) {
                parsedStruct.rescale();
              }
              return _context2.abrupt("return", parsedStruct);
            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](2);
              if (!(!(_context2.t0 instanceof Error) || _context2.t0.message !== 'Server is not compatible')) {
                _context2.next = 17;
                break;
              }
              KetcherLogger.error('serverFormatter.ts::getStructureFromStringAsync', _context2.t0);
              details = _context2.t0 instanceof Error ? _context2.t0.message : String(_context2.t0);
              throw Error("Convert error!\n".concat(details));
            case 17:
              formatError = _classPrivateFieldGet(this, _format) === 'smiles' ? "".concat(getPropertiesByFormat(SupportedFormat.smilesExt).name, " and opening of ").concat(getPropertiesByFormat(SupportedFormat.smiles).name) : getPropertiesByFormat(_classPrivateFieldGet(this, _format)).name;
              throw Error("".concat(formatError, " is not supported in standalone mode."));
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[2, 11]]);
      }));
      function getStructureFromStringAsync(_x3) {
        return _getStructureFromStringAsync.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }]);
  return ServerFormatter;
}();

export { ServerFormatter };
//# sourceMappingURL=serverFormatter.modern.js.map
