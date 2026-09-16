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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var elements = require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
require('../constants/chains.js');
require('../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var AtomList = function () {
  function AtomList(params) {
    _classCallCheck__default["default"](this, AtomList);
    _defineProperty__default["default"](this, "notList", void 0);
    _defineProperty__default["default"](this, "ids", void 0);
    this.notList = params.notList;
    this.ids = params.ids;
  }
  _createClass__default["default"](AtomList, [{
    key: "labelList",
    value: function labelList() {
      var labels = [];
      var _iterator = _createForOfIteratorHelper(this.ids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          var currenElement = elements.Elements.get(id);
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
        return _toConsumableArray__default["default"](ids !== null && ids !== void 0 ? ids : []).sort(function (a, b) {
          return a - b;
        }).toString();
      };
      return this.notList === atomList.notList && getSortedIds(this.ids) === getSortedIds(atomList.ids);
    }
  }]);
  return AtomList;
}();

exports.AtomList = AtomList;
//# sourceMappingURL=atomList.js.map
