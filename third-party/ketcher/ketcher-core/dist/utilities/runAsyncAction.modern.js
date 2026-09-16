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
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { KetcherLogger } from './KetcherLogger.modern.js';

var KetcherAsyncEvents;
(function (KetcherAsyncEvents) {
  KetcherAsyncEvents["LOADING"] = "LOADING";
  KetcherAsyncEvents["SUCCESS"] = "SUCCESS";
  KetcherAsyncEvents["FAILURE"] = "FAILURE";
})(KetcherAsyncEvents || (KetcherAsyncEvents = {}));
var runAsyncAction = function () {
  var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(action, eventEmitter) {
    var res;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          eventEmitter.emit(KetcherAsyncEvents.LOADING);
          _context.prev = 1;
          _context.next = 4;
          return action();
        case 4:
          res = _context.sent;
          eventEmitter.emit(KetcherAsyncEvents.SUCCESS);
          return _context.abrupt("return", res);
        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          KetcherLogger.error('runAsyncAction.ts::runAsyncAction', _context.t0);
          eventEmitter.emit(KetcherAsyncEvents.FAILURE);
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

export { KetcherAsyncEvents, runAsyncAction };
//# sourceMappingURL=runAsyncAction.modern.js.map
