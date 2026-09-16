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
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var KetcherLogger = require('./KetcherLogger.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

exports.KetcherAsyncEvents = void 0;
(function (KetcherAsyncEvents) {
  KetcherAsyncEvents["LOADING"] = "LOADING";
  KetcherAsyncEvents["SUCCESS"] = "SUCCESS";
  KetcherAsyncEvents["FAILURE"] = "FAILURE";
})(exports.KetcherAsyncEvents || (exports.KetcherAsyncEvents = {}));
var runAsyncAction = function () {
  var _ref = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(action, eventEmitter) {
    var res;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          eventEmitter.emit(exports.KetcherAsyncEvents.LOADING);
          _context.prev = 1;
          _context.next = 4;
          return action();
        case 4:
          res = _context.sent;
          eventEmitter.emit(exports.KetcherAsyncEvents.SUCCESS);
          return _context.abrupt("return", res);
        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          KetcherLogger.KetcherLogger.error('runAsyncAction.ts::runAsyncAction', _context.t0);
          eventEmitter.emit(exports.KetcherAsyncEvents.FAILURE);
          return _context.abrupt("return", undefined);
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 9]]);
  }));
  return function runAsyncAction(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.runAsyncAction = runAsyncAction;
//# sourceMappingURL=runAsyncAction.js.map
