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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var vec2 = require('./vec2.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _classStaticPrivateMethodGet(s, a, t) { return _assertClassBrand(a, s), t; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var Box2Abs = function () {
  function Box2Abs() {
    _classCallCheck__default["default"](this, Box2Abs);
    _defineProperty__default["default"](this, "p0", void 0);
    _defineProperty__default["default"](this, "p1", void 0);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && 'min' in args[0] && 'max' in args[0]) {
      this.p0 = args[0].min;
      this.p1 = args[0].max;
    }
    if (args.length === 2) {
      this.p0 = args[0];
      this.p1 = args[1];
    } else if (args.length === 4) {
      this.p0 = new vec2.Vec2(args[0], args[1]);
      this.p1 = new vec2.Vec2(args[2], args[3]);
    } else if (args.length === 0) {
      this.p0 = new vec2.Vec2();
      this.p1 = new vec2.Vec2();
    } else {
      throw new Error('Box2Abs constructor only accepts 4 numbers or 2 vectors or no args!');
    }
  }
  _createClass__default["default"](Box2Abs, [{
    key: "toString",
    value: function toString() {
      return this.p0.toString() + ' ' + this.p1.toString();
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Box2Abs(this.p0, this.p1);
    }
  }, {
    key: "extend",
    value: function extend(lp, rb) {
      rb = rb || lp;
      return new Box2Abs(this.p0.sub(lp), this.p1.add(rb));
    }
  }, {
    key: "include",
    value: function include(p) {
      assert.assert(p != null);
      return new Box2Abs(this.p0.min(p), this.p1.max(p));
    }
  }, {
    key: "contains",
    value: function contains(p) {
      var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;
      assert.assert(p != null);
      return p.x >= this.p0.x - ext && p.x <= this.p1.x + ext && p.y >= this.p0.y - ext && p.y <= this.p1.y + ext;
    }
  }, {
    key: "translate",
    value: function translate(d) {
      return new Box2Abs(this.p0.add(d), this.p1.add(d));
    }
  }, {
    key: "transform",
    value: function transform(f, options) {
      assert.assert(typeof f === 'function');
      return new Box2Abs(f(this.p0, options), f(this.p1, options));
    }
  }, {
    key: "sz",
    value: function sz() {
      return this.p1.sub(this.p0);
    }
  }, {
    key: "centre",
    value: function centre() {
      return vec2.Vec2.centre(this.p0, this.p1);
    }
  }, {
    key: "pos",
    value: function pos() {
      return this.p0;
    }
  }, {
    key: "hasZeroArea",
    value: function hasZeroArea() {
      var size = this.sz();
      return size.x === 0 && size.y === 0;
    }
  }], [{
    key: "fromRelBox",
    value: function fromRelBox(relBox) {
      return new Box2Abs(relBox.x, relBox.y, relBox.x + relBox.width, relBox.y + relBox.height);
    }
  }, {
    key: "union",
    value: function union(b1, b2) {
      return new Box2Abs(vec2.Vec2.min(b1.p0, b2.p0), vec2.Vec2.max(b1.p1, b2.p1));
    }
  }, {
    key: "segmentIntersection",
    value: function segmentIntersection(a, b, c, d) {
      var dc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
      var dd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
      var da = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
      var db = (c.x - b.x) * (d.y - b.y) - (c.y - b.y) * (d.x - b.x);
      if (dc === 0 && dd === 0 && da === 0 && db === 0) {
        return _classStaticPrivateMethodGet(Box2Abs, Box2Abs, _isPointOnSegment).call(Box2Abs, a, b, c) || _classStaticPrivateMethodGet(Box2Abs, Box2Abs, _isPointOnSegment).call(Box2Abs, a, b, d) || _classStaticPrivateMethodGet(Box2Abs, Box2Abs, _isPointOnSegment).call(Box2Abs, c, d, a) || _classStaticPrivateMethodGet(Box2Abs, Box2Abs, _isPointOnSegment).call(Box2Abs, c, d, b);
      } else return dc * dd < 0 && da * db < 0;
    }
  }]);
  return Box2Abs;
}();
function _isPointOnSegment(segPointA, segPointB, point) {
  var minX = Math.min(segPointA.x, segPointB.x);
  var maxX = Math.max(segPointA.x, segPointB.x);
  var minY = Math.min(segPointA.y, segPointB.y);
  var maxY = Math.max(segPointA.y, segPointB.y);
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

exports.Box2Abs = Box2Abs;
//# sourceMappingURL=box2Abs.js.map
