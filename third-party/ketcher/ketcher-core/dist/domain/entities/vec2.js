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
var toFixed = require('../../utilities/toFixed.js');
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

var _Vec;
function toNumber(value) {
  return typeof value === 'number' ? value : parseFloat(value);
}
var Vec2 = function () {
  function Vec2() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _classCallCheck__default["default"](this, Vec2);
    _defineProperty__default["default"](this, "x", void 0);
    _defineProperty__default["default"](this, "y", void 0);
    _defineProperty__default["default"](this, "z", void 0);
    if (args.length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    } else if (arguments.length === 1) {
      var point = args[0];
      this.x = toNumber(point.x || 0);
      this.y = toNumber(point.y || 0);
      this.z = toNumber(point.z || 0);
    } else if (arguments.length === 2) {
      this.x = toNumber(args[0] || 0);
      this.y = toNumber(args[1] || 0);
      this.z = 0;
    } else if (arguments.length === 3) {
      this.x = toNumber(args[0]);
      this.y = toNumber(args[1]);
      this.z = toNumber(args[2]);
    } else {
      throw new Error('Vec2(): invalid arguments');
    }
  }
  _createClass__default["default"](Vec2, [{
    key: "length",
    value: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "equals",
    value: function equals(v) {
      return this.x === v.x && this.y === v.y && this.z === v.z;
    }
  }, {
    key: "add",
    value: function add(v) {
      return new Vec2(this.x + v.x, this.y + v.y, this.z + v.z);
    }
  }, {
    key: "add_",
    value: function add_(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    }
  }, {
    key: "get_xy0",
    value: function get_xy0() {
      return new Vec2(this.x, this.y);
    }
  }, {
    key: "sub",
    value: function sub(v) {
      return new Vec2(this.x - v.x, this.y - v.y, this.z - v.z);
    }
  }, {
    key: "scaled",
    value: function scaled(sInitial) {
      var s = isFinite(sInitial) ? sInitial : 1;
      return new Vec2(this.x * s, this.y * s, this.z * s);
    }
  }, {
    key: "negated",
    value: function negated() {
      return new Vec2(-this.x, -this.y, -this.z);
    }
  }, {
    key: "yComplement",
    value: function yComplement(y1) {
      y1 = y1 || 0;
      return new Vec2(this.x, y1 - this.y, this.z);
    }
  }, {
    key: "addScaled",
    value: function addScaled(v, f) {
      return new Vec2(this.x + v.x * f, this.y + v.y * f, this.z + v.z * f);
    }
  }, {
    key: "normalized",
    value: function normalized() {
      return this.scaled(1 / this.length());
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var l = this.length();
      if (l < 0.000001) return false;
      this.x /= l;
      this.y /= l;
      return true;
    }
  }, {
    key: "turnLeft",
    value: function turnLeft() {
      return new Vec2(-this.y, this.x, this.z);
    }
  }, {
    key: "coordStr",
    value: function coordStr() {
      return this.x.toString() + ' , ' + this.y.toString();
    }
  }, {
    key: "toString",
    value: function toString() {
      return '(' + this.x.toFixed(2) + ',' + this.y.toFixed(2) + ')';
    }
  }, {
    key: "max",
    value: function max(v) {
      assert.assert(v != null);
      return Vec2.max(this, v);
    }
  }, {
    key: "min",
    value: function min(v) {
      return Vec2.min(this, v);
    }
  }, {
    key: "ceil",
    value: function ceil() {
      return new Vec2(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }
  }, {
    key: "floor",
    value: function floor() {
      return new Vec2(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }
  }, {
    key: "rotate",
    value: function rotate(angle) {
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);
      return this.rotateSC(sin, cos);
    }
  }, {
    key: "rotateSC",
    value: function rotateSC(sin, cos) {
      assert.assert(sin === 0 || !!sin);
      assert.assert(cos === 0 || !!cos);
      return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos, this.z);
    }
  }, {
    key: "rotateAroundOrigin",
    value: function rotateAroundOrigin(angleInDegrees, origin) {
      var angleInRadians = angleInDegrees * Math.PI / 180;
      var offsetX = this.x - origin.x;
      var offsetY = this.y - origin.y;
      var rotatedX = Math.cos(angleInRadians) * offsetX - Math.sin(angleInRadians) * offsetY;
      var rotatedY = Math.sin(angleInRadians) * offsetX + Math.cos(angleInRadians) * offsetY;
      var x = rotatedX + origin.x;
      var y = rotatedY + origin.y;
      return new Vec2(Number(toFixed.toFixed(x)), Number(toFixed.toFixed(y)), this.z || 0);
    }
  }, {
    key: "isInsidePolygon",
    value: function isInsidePolygon(points) {
      var x = this.x,
        y = this.y;
      var inside = false;
      for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        var xi = points[i].x || 0;
        var yi = points[i].y || 0;
        var xj = points[j].x || 0;
        var yj = points[j].y || 0;
        var intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }
  }, {
    key: "calculateDistanceToLine",
    value: function calculateDistanceToLine(line) {
      var lineVec = Vec2.diff(line[1], line[0]);
      var pointVec = Vec2.diff(this, line[0]);
      var lineLength = Vec2.dist(line[0], line[1]);
      var lineUnitVec = lineVec.normalized();
      var projectionLength = Vec2.dot(lineUnitVec, pointVec);
      var clampedProjectionLength = Math.max(0, Math.min(lineLength, projectionLength));
      var closestPoint = Vec2.sum(line[0], lineUnitVec.scaled(clampedProjectionLength));
      return Vec2.dist(closestPoint, this);
    }
  }, {
    key: "oxAngle",
    value: function oxAngle() {
      return Math.atan2(this.y, this.x);
    }
  }], [{
    key: "dist",
    value: function dist(a, b) {
      return Vec2.diff(a, b).length();
    }
  }, {
    key: "max",
    value: function max(v1, v2) {
      return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y), Math.max(v1.z, v2.z));
    }
  }, {
    key: "min",
    value: function min(v1, v2) {
      return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y), Math.min(v1.z, v2.z));
    }
  }, {
    key: "sum",
    value: function sum(v1, v2) {
      return new Vec2(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
  }, {
    key: "dot",
    value: function dot(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    }
  }, {
    key: "cross",
    value: function cross(v1, v2) {
      return v1.x * v2.y - v1.y * v2.x;
    }
  }, {
    key: "angle",
    value: function angle(v1, v2) {
      return Math.atan2(Vec2.cross(v1, v2), Vec2.dot(v1, v2));
    }
  }, {
    key: "diff",
    value: function diff(v1, v2) {
      return new Vec2(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
  }, {
    key: "lc",
    value: function lc() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var v = new Vec2();
      for (var i = 0; i < arguments.length / 2; ++i) {
        v = v.addScaled(args[2 * i], args[2 * i + 1]);
      }
      return v;
    }
  }, {
    key: "lc2",
    value: function lc2(v1, f1, v2, f2) {
      return new Vec2(v1.x * f1 + v2.x * f2, v1.y * f1 + v2.y * f2, v1.z * f1 + v2.z * f2);
    }
  }, {
    key: "centre",
    value: function centre(v1, v2) {
      return Vec2.lc2(v1, 0.5, v2, 0.5);
    }
  }, {
    key: "getLinePoint",
    value: function getLinePoint(lineStart, lineEnd, length) {
      var difference = lineStart.sub(lineEnd);
      var distance = difference.length();
      var ratio = length / distance;
      return new Vec2(lineStart.x + difference.x * ratio, lineStart.y + difference.y * ratio);
    }
  }, {
    key: "crossProduct",
    value: function crossProduct(v1, v2) {
      return v1.x * v2.y - v1.y * v2.x;
    }
  }, {
    key: "radiansToDegrees",
    value: function radiansToDegrees(radians) {
      return radians * (180 / Math.PI);
    }
  }, {
    key: "degrees_to_radians",
    value: function degrees_to_radians(degrees) {
      return degrees * Math.PI / 180;
    }
  }, {
    key: "oxAngleForVector",
    value: function oxAngleForVector(v1, v2) {
      return Math.atan2(v2.y - v1.y, v2.x - v1.x);
    }
  }, {
    key: "findSecondPoint",
    value: function findSecondPoint(startPoint, lineLength, lineAngleRadians) {
      var cos = Math.cos(lineAngleRadians);
      var sin = Math.sin(lineAngleRadians);
      var deltaX = lineLength * cos;
      var deltaY = lineLength * sin;
      var endPoint = {
        x: startPoint.x + deltaX,
        y: startPoint.y + deltaY
      };
      return endPoint;
    }
  }]);
  return Vec2;
}();
_Vec = Vec2;
_defineProperty__default["default"](Vec2, "ZERO", new _Vec(0, 0));
_defineProperty__default["default"](Vec2, "UNIT", new _Vec(1, 1));

exports.Vec2 = Vec2;
//# sourceMappingURL=vec2.js.map
