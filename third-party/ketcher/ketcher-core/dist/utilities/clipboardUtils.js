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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var structService_types = require('../domain/services/struct/structService.types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var PLAIN_TEXT_MIME_TYPE = 'text/plain';
var clipboardDataTypes = [structService_types.ChemicalMimeType.KET, structService_types.ChemicalMimeType.Mol, structService_types.ChemicalMimeType.Rxn, PLAIN_TEXT_MIME_TYPE];
function isClipboardAPIAvailable() {
  var _navigator, _navigator2;
  return typeof ((_navigator = navigator) === null || _navigator === void 0 || (_navigator = _navigator.clipboard) === null || _navigator === void 0 ? void 0 : _navigator.writeText) === 'function' && typeof ((_navigator2 = navigator) === null || _navigator2 === void 0 || (_navigator2 = _navigator2.clipboard) === null || _navigator2 === void 0 ? void 0 : _navigator2.read) === 'function';
}
function legacyCopy(clipboardData, data) {
  if (!clipboardData) {
    return;
  }
  var curFmt = null;
  clipboardData.setData(PLAIN_TEXT_MIME_TYPE, data[PLAIN_TEXT_MIME_TYPE] || '');
  try {
    Object.entries(data).forEach(function (_ref) {
      var _ref2 = _slicedToArray__default["default"](_ref, 2),
        fmt = _ref2[0],
        value = _ref2[1];
      curFmt = fmt;
      if (typeof value === 'string') {
        clipboardData.setData(fmt, value);
      }
    });
  } catch (e) {
  }
}
function legacyPaste(cb, formats) {
  var data = _defineProperty__default["default"]({}, PLAIN_TEXT_MIME_TYPE, '');
  if (!cb) {
    return data;
  }
  data[PLAIN_TEXT_MIME_TYPE] = cb.getData(PLAIN_TEXT_MIME_TYPE);
  return formats.reduce(function (res, fmt) {
    var d = cb.getData(fmt);
    if (d) res[fmt] = d;
    return res;
  }, data);
}
function notifyCopyCut() {
  var event = new Event('copyOrCutComplete');
  window.dispatchEvent(event);
}
function hasClipboardItemAPI(item) {
  return Boolean(item && typeof item.getType === 'function');
}
function getStructStringFromClipboardData(_x) {
  return _getStructStringFromClipboardData.apply(this, arguments);
}
function _getStructStringFromClipboardData() {
  _getStructStringFromClipboardData = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(data) {
    var clipboardItem, _iterator, _step, clipboardDataType, mimeType, structStr, _iterator2, _step2, _clipboardDataType, _structStr;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!Array.isArray(data)) {
            _context.next = 26;
            break;
          }
          clipboardItem = data[0];
          if (hasClipboardItemAPI(clipboardItem)) {
            _context.next = 4;
            break;
          }
          return _context.abrupt("return", '');
        case 4:
          _iterator = _createForOfIteratorHelper(clipboardDataTypes);
          _context.prev = 5;
          _iterator.s();
        case 7:
          if ((_step = _iterator.n()).done) {
            _context.next = 17;
            break;
          }
          clipboardDataType = _step.value;
          mimeType = clipboardDataType === PLAIN_TEXT_MIME_TYPE ? clipboardDataType : "web ".concat(clipboardDataType);
          _context.next = 12;
          return safelyGetMimeType(clipboardItem, mimeType);
        case 12:
          structStr = _context.sent;
          if (!structStr) {
            _context.next = 15;
            break;
          }
          return _context.abrupt("return", structStr.text());
        case 15:
          _context.next = 7;
          break;
        case 17:
          _context.next = 22;
          break;
        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](5);
          _iterator.e(_context.t0);
        case 22:
          _context.prev = 22;
          _iterator.f();
          return _context.finish(22);
        case 25:
          return _context.abrupt("return", '');
        case 26:
          _iterator2 = _createForOfIteratorHelper(clipboardDataTypes);
          _context.prev = 27;
          _iterator2.s();
        case 29:
          if ((_step2 = _iterator2.n()).done) {
            _context.next = 36;
            break;
          }
          _clipboardDataType = _step2.value;
          _structStr = data[_clipboardDataType];
          if (!_structStr) {
            _context.next = 34;
            break;
          }
          return _context.abrupt("return", _structStr);
        case 34:
          _context.next = 29;
          break;
        case 36:
          _context.next = 41;
          break;
        case 38:
          _context.prev = 38;
          _context.t1 = _context["catch"](27);
          _iterator2.e(_context.t1);
        case 41:
          _context.prev = 41;
          _iterator2.f();
          return _context.finish(41);
        case 44:
          return _context.abrupt("return", '');
        case 45:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[5, 19, 22, 25], [27, 38, 41, 44]]);
  }));
  return _getStructStringFromClipboardData.apply(this, arguments);
}
function isPasteContentAvailable() {
  return _isPasteContentAvailable.apply(this, arguments);
}
function _isPasteContentAvailable() {
  _isPasteContentAvailable = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2() {
    var clipboardData, structStr;
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (isClipboardAPIAvailable()) {
            _context2.next = 2;
            break;
          }
          return _context2.abrupt("return", true);
        case 2:
          _context2.prev = 2;
          _context2.next = 5;
          return navigator.clipboard.read();
        case 5:
          clipboardData = _context2.sent;
          _context2.next = 8;
          return getStructStringFromClipboardData(clipboardData);
        case 8:
          structStr = _context2.sent;
          return _context2.abrupt("return", Boolean(structStr === null || structStr === void 0 ? void 0 : structStr.trim()));
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](2);
          return _context2.abrupt("return", _context2.t0 instanceof DOMException && _context2.t0.name === 'NotAllowedError');
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[2, 12]]);
  }));
  return _isPasteContentAvailable.apply(this, arguments);
}
function safelyGetMimeType(_x2, _x3) {
  return _safelyGetMimeType.apply(this, arguments);
}
function _safelyGetMimeType() {
  _safelyGetMimeType = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3(clipboardItem, mimeType) {
    var result;
    return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return clipboardItem.getType(mimeType);
        case 3:
          result = _context3.sent;
          return _context3.abrupt("return", (result === null || result === void 0 ? void 0 : result.size) > 0 ? result : '');
        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", '');
        case 10:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 7]]);
  }));
  return _safelyGetMimeType.apply(this, arguments);
}

exports.PLAIN_TEXT_MIME_TYPE = PLAIN_TEXT_MIME_TYPE;
exports.getStructStringFromClipboardData = getStructStringFromClipboardData;
exports.isClipboardAPIAvailable = isClipboardAPIAvailable;
exports.isPasteContentAvailable = isPasteContentAvailable;
exports.legacyCopy = legacyCopy;
exports.legacyPaste = legacyPaste;
exports.notifyCopyCut = notifyCopyCut;
exports.safelyGetMimeType = safelyGetMimeType;
//# sourceMappingURL=clipboardUtils.js.map
