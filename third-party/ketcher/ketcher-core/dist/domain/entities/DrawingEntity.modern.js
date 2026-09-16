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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Vec2 } from './vec2.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { Coordinates } from '../../application/editor/shared/coordinates.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var id = 0;
var DrawingEntity = function () {
  function DrawingEntity() {
    var _this$config;
    var _position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vec2(0, 0);
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      generateId: true
    };
    _classCallCheck(this, DrawingEntity);
    _defineProperty(this, "_position", void 0);
    _defineProperty(this, "config", void 0);
    _defineProperty(this, "selected", false);
    _defineProperty(this, "hovered", false);
    _defineProperty(this, "id", 0);
    _defineProperty(this, "baseRenderer", void 0);
    this._position = _position;
    this.config = config;
    this._position = _position || new Vec2(0, 0);
    if (((_this$config = this.config) === null || _this$config === void 0 ? void 0 : _this$config.generateId) === true) {
      this.id = id;
      id++;
    }
  }
  _createClass(DrawingEntity, [{
    key: "moveRelative",
    value: function moveRelative(position) {
      this._position.x += position.x;
      this._position.y += position.y;
    }
  }, {
    key: "moveAbsolute",
    value: function moveAbsolute(position) {
      this._position = position;
    }
  }, {
    key: "position",
    get: function get() {
      return this._position;
    }
  }, {
    key: "turnOnHover",
    value: function turnOnHover() {
      this.hovered = true;
    }
  }, {
    key: "turnOffHover",
    value: function turnOffHover() {
      this.hovered = false;
    }
  }, {
    key: "turnOnSelection",
    value: function turnOnSelection() {
      this.selected = true;
    }
  }, {
    key: "turnOffSelection",
    value: function turnOffSelection() {
      this.selected = false;
    }
  }, {
    key: "selectIfLocatedInRectangle",
    value: function selectIfLocatedInRectangle(rectangleTopLeftPoint, rectangleBottomRightPoint) {
      var isPreviousSelected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var shiftKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      assert(this.baseRenderer);
      var prevSelectedValue = this.selected;
      var selectionPoints = this.baseRenderer.selectionPoints || [Coordinates.modelToCanvas(this.center)];
      var isSelected = false;
      selectionPoints.forEach(function (point) {
        var locatedInRectangle = rectangleBottomRightPoint.x > point.x && rectangleBottomRightPoint.y > point.y && rectangleTopLeftPoint.x < point.x && rectangleTopLeftPoint.y < point.y;
        if (shiftKey) {
          isSelected = isPreviousSelected || locatedInRectangle;
        } else {
          isSelected = locatedInRectangle;
        }
      });
      if (isSelected) {
        this.turnOnSelection();
      } else {
        this.turnOffSelection();
      }
      return prevSelectedValue !== this.selected;
    }
  }, {
    key: "selectIfLocatedInPolygon",
    value: function selectIfLocatedInPolygon(polygonPoints) {
      var _this = this;
      var isPreviousSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var shiftKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      assert(this.baseRenderer);
      var prevSelectedValue = this.selected;
      var selectionPoints = this.baseRenderer.selectionPoints || [Coordinates.modelToCanvas(this.center)];
      var isSelected = false;
      selectionPoints.forEach(function (point) {
        var locatedInPolygon = _this.isPointInPolygon(polygonPoints, point);
        if (shiftKey) {
          isSelected = isPreviousSelected || locatedInPolygon;
        } else {
          isSelected = locatedInPolygon;
        }
      });
      if (isSelected) {
        this.turnOnSelection();
      } else {
        this.turnOffSelection();
      }
      return prevSelectedValue !== this.selected;
    }
  }, {
    key: "isPointInPolygon",
    value: function isPointInPolygon(r, p) {
      var d = new Vec2(0, 1);
      var n = d.rotate(Math.PI / 2);
      var v0 = Vec2.diff(r[r.length - 1], p);
      var n0 = Vec2.dot(n, v0);
      var d0 = Vec2.dot(d, v0);
      var w0 = new Vec2(0, 0);
      var counter = 0;
      var eps = 1e-5;
      var flag1 = false;
      var flag0 = false;
      var _iterator = _createForOfIteratorHelper(r),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var point = _step.value;
          var v1 = Vec2.diff(point, p);
          var w1 = Vec2.diff(v1, v0);
          var n1 = Vec2.dot(n, v1);
          var d1 = Vec2.dot(d, v1);
          flag1 = false;
          if (n1 * n0 < 0) {
            if (d1 * d0 > -eps) {
              if (d0 > -eps) flag1 = true;
            } else if ((Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 > 0) {
              flag1 = true;
            }
          }
          if (flag1 && flag0 && Vec2.dot(w1, n) * Vec2.dot(w0, n) >= 0) {
            flag1 = false;
          }
          if (flag1) {
            counter++;
          }
          v0 = v1;
          n0 = n1;
          d0 = d1;
          w0 = w1;
          flag0 = flag1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return counter % 2 !== 0;
    }
  }, {
    key: "setBaseRenderer",
    value: function setBaseRenderer(renderer) {
      this.baseRenderer = renderer;
    }
  }]);
  return DrawingEntity;
}();

export { DrawingEntity };
//# sourceMappingURL=DrawingEntity.modern.js.map
