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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var bond = require('../../../domain/entities/bond.js');
var vec2 = require('../../../domain/entities/vec2.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var toFixed = require('../../../utilities/toFixed.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReLoop = function (_ReObject) {
  _inherits__default["default"](ReLoop, _ReObject);
  function ReLoop(loop) {
    var _this;
    _classCallCheck__default["default"](this, ReLoop);
    _this = _callSuper(this, ReLoop, ['loop']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "loop", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "centre", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "radius", void 0);
    _this.loop = loop;
    _this.centre = new vec2.Vec2();
    _this.radius = 0;
    return _this;
  }
  _createClass__default["default"](ReLoop, [{
    key: "show",
    value: function show(restruct, _rlid, options) {
      var render = restruct.render,
        molecule = restruct.molecule;
      var paper = render.paper;
      var loop = this.loop;
      var halfBondIds = loop.hbs;
      this.centre = new vec2.Vec2();
      var _iterator = _createForOfIteratorHelper(halfBondIds),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var halfBondId = _step.value;
          var halfBond = molecule.halfBonds.get(halfBondId);
          if (!halfBond) {
            return;
          }
          var bond$1 = restruct.bonds.get(halfBond.bid);
          if (!bond$1) {
            return;
          }
          var beginAtom = restruct.atoms.get(halfBond.begin);
          if (!beginAtom) {
            return;
          }
          var beginPosition = scale.Scale.modelToCanvas(beginAtom.a.pp, options);
          if (bond$1.b.type !== bond.Bond.PATTERN.TYPE.AROMATIC) {
            loop.aromatic = false;
          }
          this.centre = this.centre.add(beginPosition);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      loop.convex = true;
      for (var index = 0; index < halfBondIds.length; ++index) {
        var currentHalfBond = molecule.halfBonds.get(halfBondIds[index]);
        var nextHalfBond = molecule.halfBonds.get(halfBondIds[(index + 1) % halfBondIds.length]);
        if (!currentHalfBond || !nextHalfBond) {
          return;
        }
        var angle = Math.atan2(vec2.Vec2.cross(currentHalfBond.dir, nextHalfBond.dir), vec2.Vec2.dot(currentHalfBond.dir, nextHalfBond.dir));
        if (angle > 0) {
          loop.convex = false;
        }
      }
      this.centre = this.centre.scaled(1.0 / halfBondIds.length);
      this.radius = -1;
      var _iterator2 = _createForOfIteratorHelper(halfBondIds),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _halfBondId = _step2.value;
          var _halfBond = molecule.halfBonds.get(_halfBondId);
          if (!_halfBond) {
            return;
          }
          var _beginAtom = restruct.atoms.get(_halfBond.begin);
          var endAtom = restruct.atoms.get(_halfBond.end);
          if (!_beginAtom || !endAtom) {
            return;
          }
          var _beginPosition = scale.Scale.modelToCanvas(_beginAtom.a.pp, options);
          var endPosition = scale.Scale.modelToCanvas(endAtom.a.pp, options);
          var normal = vec2.Vec2.diff(endPosition, _beginPosition).rotateSC(1, 0).normalized();
          var distance = vec2.Vec2.dot(vec2.Vec2.diff(_beginPosition, this.centre), normal);
          this.radius = this.radius < 0 ? distance : Math.min(this.radius, distance);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.radius *= 0.7;
      if (!loop.aromatic) {
        return;
      }
      var atomIds = new Set();
      var _iterator3 = _createForOfIteratorHelper(halfBondIds),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _halfBondId2 = _step3.value;
          var _halfBond2 = molecule.halfBonds.get(_halfBondId2);
          if (!_halfBond2) {
            return;
          }
          atomIds.add(_halfBond2.begin);
          atomIds.add(_halfBond2.end);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      var firstAtomId = atomIds.values().next().value;
      if (firstAtomId === undefined) {
        return;
      }
      var sgroup = molecule.getGroupFromAtomId(firstAtomId);
      if (sgroup !== null && sgroup !== void 0 && sgroup.isContracted()) {
        var allInSameSgroup = _toConsumableArray__default["default"](atomIds).every(function (atomId) {
          return molecule.getGroupFromAtomId(atomId) === sgroup;
        });
        if (allInSameSgroup) {
          return;
        }
      }
      var path = null;
      if (loop.convex && options.aromaticCircle) {
        path = paper.circle(this.centre.x, this.centre.y, this.radius).attr({
          stroke: '#000',
          'stroke-width': options.lineattr['stroke-width']
        });
      } else {
        var pathString = '';
        for (var _index = 0; _index < halfBondIds.length; ++_index) {
          var _currentHalfBond = molecule.halfBonds.get(halfBondIds[_index]);
          var _nextHalfBond = molecule.halfBonds.get(halfBondIds[(_index + 1) % halfBondIds.length]);
          if (!_currentHalfBond || !_nextHalfBond) {
            return;
          }
          var _angle = Math.atan2(vec2.Vec2.cross(_currentHalfBond.dir, _nextHalfBond.dir), vec2.Vec2.dot(_currentHalfBond.dir, _nextHalfBond.dir));
          var halfAngle = (Math.PI - _angle) / 2;
          var direction = _nextHalfBond.dir.rotate(halfAngle);
          var nextBeginAtom = restruct.atoms.get(_nextHalfBond.begin);
          if (!nextBeginAtom) {
            return;
          }
          var atomPosition = scale.Scale.modelToCanvas(nextBeginAtom.a.pp, options);
          var sin = Math.sin(halfAngle);
          var minSin = 0.1;
          if (Math.abs(sin) < minSin) {
            sin = sin * minSin / Math.abs(sin);
          }
          var offset = options.bondSpace / sin;
          var innerPosition = atomPosition.addScaled(direction, -offset);
          pathString += _index === 0 ? 'M' : 'L';
          pathString += toFixed.toFixed(innerPosition.x) + ',' + toFixed.toFixed(innerPosition.y);
        }
        pathString += 'Z';
        path = paper.path(pathString).attr({
          stroke: '#000',
          'stroke-width': options.lineattr['stroke-width'],
          'stroke-dasharray': '- '
        });
      }
      restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, path, null, true);
    }
  }, {
    key: "isValid",
    value: function isValid(struct, rlid) {
      var halfBonds = struct.halfBonds;
      return this.loop.hbs.every(function (halfBondId) {
        var halfBond = halfBonds.get(halfBondId);
        return halfBond !== undefined && halfBond.loop === rlid;
      });
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return false;
    }
  }]);
  return ReLoop;
}(reobject["default"]);

exports["default"] = ReLoop;
//# sourceMappingURL=reloop.js.map
