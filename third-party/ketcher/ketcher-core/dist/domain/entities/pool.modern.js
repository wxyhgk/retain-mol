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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _typeof from '@babel/runtime/helpers/typeof';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function hasResetInitiallySelected(value) {
  return value !== null && _typeof(value) === 'object' && 'resetInitiallySelected' in value && typeof value.resetInitiallySelected === 'function';
}
var Pool = function (_Map) {
  _inherits(Pool, _Map);
  function Pool() {
    var _this;
    _classCallCheck(this, Pool);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Pool, [].concat(args));
    _defineProperty(_assertThisInitialized(_this), "nextId", 0);
    return _this;
  }
  _createClass(Pool, [{
    key: "add",
    value: function add(item) {
      var id = this.nextId++;
      _get(_getPrototypeOf(Pool.prototype), "set", this).call(this, id, item);
      return id;
    }
  }, {
    key: "newId",
    value: function newId() {
      return this.nextId++;
    }
  }, {
    key: "reserveId",
    value: function reserveId(id) {
      if (!Number.isSafeInteger(id) || id < 0 || id >= Number.MAX_SAFE_INTEGER) {
        throw new RangeError('A pool ID must leave room for a safe next ID.');
      }
      this.nextId = Math.max(this.nextId, id + 1);
    }
  }, {
    key: "keyOf",
    value: function keyOf(item) {
      var _iterator = _createForOfIteratorHelper(this.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];
          if (value === item) return key;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return null;
    }
  }, {
    key: "find",
    value: function find(predicate) {
      var _iterator2 = _createForOfIteratorHelper(this.entries()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            key = _step2$value[0],
            value = _step2$value[1];
          if (predicate(key, value)) return key;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return null;
    }
  }, {
    key: "filter",
    value: function filter(predicate) {
      return new Pool(Array.from(this).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        return predicate(key, value);
      }));
    }
  }, {
    key: "some",
    value: function some(predicate) {
      var _iterator3 = _createForOfIteratorHelper(this.values()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var value = _step3.value;
          if (predicate(value)) {
            return true;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return false;
    }
  }, {
    key: "changeInitiallySelectedPropertiesForPool",
    value: function changeInitiallySelectedPropertiesForPool(invalidate) {
      var _this2 = this;
      this.forEach(function (value, key) {
        if (hasResetInitiallySelected(value)) {
          value.resetInitiallySelected(invalidate);
          _this2.set(key, value);
        }
      });
    }
  }, {
    key: "clone",
    value: function clone() {
      var newPool = new Pool(this);
      newPool.nextId = this.nextId;
      return newPool;
    }
  }]);
  return Pool;
}(_wrapNativeSuper(Map));

export { Pool };
//# sourceMappingURL=pool.modern.js.map
