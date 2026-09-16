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
var structFormatter_types = require('./structFormatter.types.js');
var formatProperties = require('./formatProperties.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var smilesFormatter = require('./smilesFormatter.js');

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
var _structService = new WeakMap();
var _ketSerializer = new WeakMap();
var _format = new WeakMap();
var _options = new WeakMap();
var ServerFormatter = function () {
  function ServerFormatter(structService, ketSerializer, format, options) {
    _classCallCheck__default["default"](this, ServerFormatter);
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
    _classPrivateFieldSet__default["default"](this, _structService, structService);
    _classPrivateFieldSet__default["default"](this, _ketSerializer, ketSerializer);
    _classPrivateFieldSet__default["default"](this, _format, format);
    _classPrivateFieldSet__default["default"](this, _options, options);
  }
  _createClass__default["default"](ServerFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(struct, drawingEntitiesManager) {
        var formatProperties$1, stringifiedStruct, convertResult, message, details;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              formatProperties$1 = formatProperties.getPropertiesByFormat(_classPrivateFieldGet__default["default"](this, _format));
              _context.prev = 1;
              stringifiedStruct = _classPrivateFieldGet__default["default"](this, _ketSerializer).serialize(struct, drawingEntitiesManager);
              _context.next = 5;
              return _classPrivateFieldGet__default["default"](this, _structService).convert({
                struct: stringifiedStruct,
                output_format: formatProperties$1.mime
              }, _objectSpread(_objectSpread({}, _classPrivateFieldGet__default["default"](this, _options)), formatProperties$1.options));
            case 5:
              convertResult = _context.sent;
              return _context.abrupt("return", convertResult.struct);
            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](1);
              if (_context.t0 instanceof Error && _context.t0.message === 'Server is not compatible') {
                message = "".concat(formatProperties$1.name, " is not supported.");
              } else {
                details = _context.t0 instanceof Error ? _context.t0.message : String(_context.t0);
                message = "Convert error!\n".concat(details);
              }
              KetcherLogger.KetcherLogger.error('serverFormatter.ts::getStringFromStructureAsync', _context.t0);
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
      if (_classPrivateFieldGet__default["default"](this, _format) === structFormatter_types.SupportedFormat.smiles) {
        return {
          method: smilesFormatter.SmilesFormatter.isContainsCoordinates(stringifiedStruct) ? _classPrivateFieldGet__default["default"](this, _structService).convert : _classPrivateFieldGet__default["default"](this, _structService).layout,
          struct: stringifiedStruct
        };
      }
      var withCoords = formatProperties.getPropertiesByFormat(format).supportsCoords;
      var shouldConvert = format === structFormatter_types.SupportedFormat.idt || withCoords;
      if (shouldConvert) {
        return {
          method: _classPrivateFieldGet__default["default"](this, _structService).convert,
          struct: stringifiedStruct
        };
      }
      return {
        method: _classPrivateFieldGet__default["default"](this, _structService).layout,
        struct: stringifiedStruct.trim()
      };
    }
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(stringifiedStruct) {
        var _this$getCallingMetho, method, struct, data, result, parsedStruct, details, formatError;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _this$getCallingMetho = this.getCallingMethod(stringifiedStruct, _classPrivateFieldGet__default["default"](this, _format)), method = _this$getCallingMetho.method, struct = _this$getCallingMetho.struct;
              data = {
                struct: struct,
                output_format: formatProperties.getPropertiesByFormat(structFormatter_types.SupportedFormat.ket).mime
              };
              _context2.prev = 2;
              _context2.next = 5;
              return method(data, _classPrivateFieldGet__default["default"](this, _options));
            case 5:
              result = _context2.sent;
              parsedStruct = _classPrivateFieldGet__default["default"](this, _ketSerializer).deserialize(result.struct);
              if (method === _classPrivateFieldGet__default["default"](this, _structService).layout) {
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
              KetcherLogger.KetcherLogger.error('serverFormatter.ts::getStructureFromStringAsync', _context2.t0);
              details = _context2.t0 instanceof Error ? _context2.t0.message : String(_context2.t0);
              throw Error("Convert error!\n".concat(details));
            case 17:
              formatError = _classPrivateFieldGet__default["default"](this, _format) === 'smiles' ? "".concat(formatProperties.getPropertiesByFormat(structFormatter_types.SupportedFormat.smilesExt).name, " and opening of ").concat(formatProperties.getPropertiesByFormat(structFormatter_types.SupportedFormat.smiles).name) : formatProperties.getPropertiesByFormat(_classPrivateFieldGet__default["default"](this, _format)).name;
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

exports.ServerFormatter = ServerFormatter;
//# sourceMappingURL=serverFormatter.js.map
