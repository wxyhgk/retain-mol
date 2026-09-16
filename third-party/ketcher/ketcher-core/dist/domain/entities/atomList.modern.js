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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Elements } from '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import '../constants/monomers.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var AtomList = function () {
  function AtomList(params) {
    _classCallCheck(this, AtomList);
    _defineProperty(this, "notList", void 0);
    _defineProperty(this, "ids", void 0);
    this.notList = params.notList;
    this.ids = params.ids;
  }
  _createClass(AtomList, [{
    key: "labelList",
    value: function labelList() {
      var labels = [];
      var _iterator = _createForOfIteratorHelper(this.ids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          var currenElement = Elements.get(id);
          if (currenElement) {
            labels.push(currenElement.label);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return labels;
    }
  }, {
    key: "label",
    value: function label() {
      var label = '[' + this.labelList().join(',') + ']';
      if (this.notList) {
        label = '!' + label;
      }
      return label;
    }
  }, {
    key: "equals",
    value: function equals(atomList) {
      var getSortedIds = function getSortedIds(ids) {
        return _toConsumableArray(ids !== null && ids !== void 0 ? ids : []).sort(function (a, b) {
          return a - b;
        }).toString();
      };
      return this.notList === atomList.notList && getSortedIds(this.ids) === getSortedIds(atomList.ids);
    }
  }]);
  return AtomList;
}();

export { AtomList };
//# sourceMappingURL=atomList.modern.js.map
