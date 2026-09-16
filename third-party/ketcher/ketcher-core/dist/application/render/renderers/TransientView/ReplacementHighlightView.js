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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var TransientView = require('./TransientView.js');
var PolymerBond = require('../../../../domain/entities/PolymerBond.js');
var BaseMonomerRenderer = require('../BaseMonomerRenderer.js');
var monomerHighlightShapes = require('../monomerHighlightShapes.js');
var paperjs = require('paper');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var paperjs__default = /*#__PURE__*/_interopDefaultLegacy(paperjs);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var OUTLINE_COLOR = '#167782';
var OUTLINE_THICKNESS = 1;
var OUTLINE_GAP = 6;
var NECK_HALF_WIDTH = 0.6;
var ReplacementHighlightView = function (_TransientView) {
  _inherits__default["default"](ReplacementHighlightView, _TransientView);
  function ReplacementHighlightView() {
    _classCallCheck__default["default"](this, ReplacementHighlightView);
    return _callSuper(this, ReplacementHighlightView, arguments);
  }
  _createClass__default["default"](ReplacementHighlightView, null, [{
    key: "collectPathData",
    value:
    function collectPathData(monomers) {
      var pathData = monomers.map(function (monomer) {
        return monomer.renderer.getHighlightPath(OUTLINE_GAP);
      });
      var monomerSet = new Set(monomers);
      var processedBonds = new Set();
      var _iterator = _createForOfIteratorHelper(monomers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var monomer = _step.value;
          var from = monomer.renderer.center;
          for (var _i = 0, _Object$values = Object.values(monomer.attachmentPointsToBonds); _i < _Object$values.length; _i++) {
            var bond = _Object$values[_i];
            if (!(bond instanceof PolymerBond.PolymerBond) || processedBonds.has(bond)) {
              continue;
            }
            var otherMonomer = bond.getAnotherMonomer(monomer);
            if (!otherMonomer || !monomerSet.has(otherMonomer)) {
              continue;
            }
            processedBonds.add(bond);
            var to = otherMonomer.renderer.center;
            pathData.push(monomerHighlightShapes.createSegmentHighlightPath(from, to, NECK_HALF_WIDTH + OUTLINE_GAP));
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return pathData;
    }
  }, {
    key: "getUnitedPathData",
    value: function getUnitedPathData(pathsData) {
      var _combinedPath;
      paperjs__default["default"].setup(document.createElement('canvas'));
      var combinedPath;
      pathsData.forEach(function (pathData) {
        var path = new paperjs__default["default"].CompoundPath(pathData);
        if (!path.closed) {
          path.closePath();
        }
        if (!combinedPath) {
          combinedPath = path;
          return;
        }
        var unitedPath = combinedPath.unite(path);
        combinedPath.remove();
        path.remove();
        combinedPath = unitedPath;
      });
      return (_combinedPath = combinedPath) === null || _combinedPath === void 0 ? void 0 : _combinedPath.pathData;
    }
  }, {
    key: "show",
    value: function show(transientLayer, params) {
      var monomers = params.monomers.filter(function (monomer) {
        return monomer.renderer instanceof BaseMonomerRenderer.BaseMonomerRenderer;
      });
      if (monomers.length === 0) {
        return;
      }
      var pathsData = ReplacementHighlightView.collectPathData(monomers);
      var pathData = ReplacementHighlightView.getUnitedPathData(pathsData);
      if (!pathData) {
        return;
      }
      transientLayer.append('path').attr('d', pathData).attr('fill', '#fff').attr('opacity', '0.65').attr('stroke', OUTLINE_COLOR).attr('stroke-width', OUTLINE_THICKNESS).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round').attr('pointer-events', 'none');
    }
  }]);
  return ReplacementHighlightView;
}(TransientView.TransientView);
_defineProperty__default["default"](ReplacementHighlightView, "viewName", 'ReplacementHighlightView');

exports.ReplacementHighlightView = ReplacementHighlightView;
//# sourceMappingURL=ReplacementHighlightView.js.map
