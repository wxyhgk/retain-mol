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
import _typeof from '@babel/runtime/helpers/typeof';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { Action } from './action.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _restruct = new WeakMap();
var _steps = new WeakMap();
var _inverseAction = new WeakMap();
var _state = new WeakMap();
var ActionTransaction = function () {
  function ActionTransaction(restruct) {
    _classCallCheck(this, ActionTransaction);
    _classPrivateFieldInitSpec(this, _restruct, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _steps, {
      writable: true,
      value: []
    });
    _classPrivateFieldInitSpec(this, _inverseAction, {
      writable: true,
      value: new Action()
    });
    _classPrivateFieldInitSpec(this, _state, {
      writable: true,
      value: 'active'
    });
    _classPrivateFieldSet(this, _restruct, restruct);
  }
  _createClass(ActionTransaction, [{
    key: "capture",
    value: function capture(inverse) {
      var _this = this;
      this.assertActive('capture');
      if (inverse instanceof Action) {
        var capturedAction = new Action(_toConsumableArray(inverse.operations));
        _classPrivateFieldGet(this, _steps).push({
          rollback: function rollback() {
            capturedAction.perform(_classPrivateFieldGet(_this, _restruct));
          }
        });
        _classPrivateFieldGet(this, _inverseAction).mergeWith(capturedAction);
      } else {
        _classPrivateFieldGet(this, _steps).push({
          rollback: function rollback() {
            inverse.perform(_classPrivateFieldGet(_this, _restruct));
          }
        });
        _classPrivateFieldGet(this, _inverseAction).addOp(inverse);
      }
      return inverse;
    }
  }, {
    key: "commit",
    value: function commit() {
      if (_classPrivateFieldGet(this, _state) === 'rolled-back') {
        throw new Error('Cannot commit a rolled-back action transaction');
      }
      _classPrivateFieldSet(this, _state, 'committed');
      return _classPrivateFieldGet(this, _inverseAction);
    }
  }, {
    key: "rollback",
    value: function rollback(cause) {
      var hasCause = arguments.length > 0;
      if (_classPrivateFieldGet(this, _state) === 'committed') {
        throw new Error('Cannot roll back a committed action transaction');
      }
      if (_classPrivateFieldGet(this, _state) === 'rolled-back') {
        if (hasCause) throw cause;
        return;
      }
      _classPrivateFieldSet(this, _state, 'rolled-back');
      var rollbackErrors = [];
      var _iterator = _createForOfIteratorHelper(_toConsumableArray(_classPrivateFieldGet(this, _steps)).reverse()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var step = _step.value;
          try {
            step.rollback();
          } catch (rollbackCause) {
            rollbackErrors.push(rollbackCause);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (rollbackErrors.length > 0) {
        var errors = hasCause ? [cause].concat(rollbackErrors) : rollbackErrors;
        throw new AggregateError(errors, hasCause ? 'Action transaction failed and could not be rolled back completely' : 'Action transaction could not be rolled back completely', hasCause ? {
          cause: cause
        } : undefined);
      }
      if (hasCause) throw cause;
    }
  }, {
    key: "assertActive",
    value: function assertActive(operation) {
      if (_classPrivateFieldGet(this, _state) !== 'active') {
        throw new Error("Cannot ".concat(operation, " an action transaction after commit"));
      }
    }
  }]);
  return ActionTransaction;
}();
function isPromiseLike(value) {
  return _typeof(value) === 'object' && value !== null && 'then' in value && typeof value.then === 'function';
}
function runActionTransaction(restruct, callback) {
  var transaction = new ActionTransaction(restruct);
  try {
    var result = callback(transaction);
    if (isPromiseLike(result)) {
      throw new TypeError('runActionTransaction only accepts a synchronous callback; use ActionTransaction directly for async work');
    }
    return transaction.commit();
  } catch (cause) {
    transaction.rollback(cause);
    throw cause;
  }
}

export { ActionTransaction, runActionTransaction };
//# sourceMappingURL=actionTransaction.modern.js.map
