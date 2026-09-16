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
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var Visel = function () {
  function Visel(type) {
    _classCallCheck(this, Visel);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "paths", void 0);
    _defineProperty(this, "boxes", void 0);
    _defineProperty(this, "boundingBox", void 0);
    _defineProperty(this, "oldBoundingBox", void 0);
    _defineProperty(this, "exts", void 0);
    this.type = type;
    this.paths = [];
    this.boxes = [];
    this.boundingBox = null;
    this.oldBoundingBox = null;
    this.exts = [];
  }
  _createClass(Visel, [{
    key: "add",
    value: function add(path, bb, ext) {
      this.paths.push(path);
      if (bb) {
        this.boxes.push(bb);
        this.boundingBox = this.boundingBox === null ? bb : Box2Abs.union(this.boundingBox, bb);
      }
      if (ext) {
        this.exts.push(ext);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.paths = [];
      this.boxes = [];
      this.exts = [];
      if (this.boundingBox !== null) {
        this.oldBoundingBox = this.boundingBox.clone();
      }
      this.boundingBox = null;
    }
  }, {
    key: "translate",
    value: function translate() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length === 1) {
        var vector = args[0];
        this.translate(vector.x, vector.y);
      } else {
        var x = args[0],
          y = args[1];
        var delta = new Vec2(x, y);
        var _iterator = _createForOfIteratorHelper(this.paths),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var path = _step.value;
            path.translateAbs(x, y);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.boxes = this.boxes.map(function (box) {
          return box.translate(delta);
        });
        if (this.boundingBox !== null) {
          this.boundingBox = this.boundingBox.translate(delta);
        }
      }
    }
  }, {
    key: "rotate",
    value: function rotate(degree, center) {
      var _iterator2 = _createForOfIteratorHelper(this.paths),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var path = _step2.value;
          path.rotate(degree, center.x, center.y);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.boxes = this.boxes.map(function (box) {
        return box.transform(function (point) {
          return point.rotateAroundOrigin(degree, center);
        }, undefined);
      });
      if (this.boundingBox !== null) {
        this.boundingBox = this.boundingBox.transform(function (point) {
          return point.rotateAroundOrigin(degree, center);
        }, undefined);
      }
    }
  }]);
  return Visel;
}();

export { Visel as default };
//# sourceMappingURL=visel.modern.js.map
