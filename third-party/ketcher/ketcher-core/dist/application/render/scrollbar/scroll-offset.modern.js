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
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateMethodGet(s, a, r) { return _assertClassBrand(a, s), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _render = new WeakMap();
var _calculateOffset = new WeakSet();
var ScrollOffset = function () {
  function ScrollOffset(render) {
    _classCallCheck(this, ScrollOffset);
    _classPrivateMethodInitSpec(this, _calculateOffset);
    _classPrivateFieldInitSpec(this, _render, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "up", 0);
    _defineProperty(this, "down", 0);
    _defineProperty(this, "left", 0);
    _defineProperty(this, "right", 0);
    _classPrivateFieldSet(this, _render, render);
  }
  _createClass(ScrollOffset, [{
    key: "getAbsViewBox",
    value: function getAbsViewBox() {
      var viewBox = _classPrivateFieldGet(this, _render).viewBox;
      var viewBoxMinXY = new Vec2(viewBox.minX, viewBox.minY);
      var viewBoxMaxXY = new Vec2(viewBox.minX + viewBox.width, viewBox.minY + viewBox.height);
      return new Box2Abs(viewBoxMinXY, viewBoxMaxXY);
    }
  }, {
    key: "getAbsBoundingBox",
    value: function getAbsBoundingBox() {
      var protoBoundingBox = _classPrivateFieldGet(this, _render).ctab.getVBoxObj();
      var boundingBoxMinXY = Scale.modelToCanvas(protoBoundingBox.p0, _classPrivateFieldGet(this, _render).options);
      var boundingBoxMaxXY = Scale.modelToCanvas(protoBoundingBox.p1, _classPrivateFieldGet(this, _render).options);
      return new Box2Abs(boundingBoxMinXY, boundingBoxMaxXY);
    }
  }, {
    key: "update",
    value: function update() {
      _classPrivateMethodGet(this, _calculateOffset, _calculateOffset2).call(this);
    }
  }, {
    key: "hasVerticalOffset",
    value: function hasVerticalOffset() {
      return this.up > 0 || this.down > 0;
    }
  }, {
    key: "hasHorizontalOffset",
    value: function hasHorizontalOffset() {
      return this.left > 0 || this.right > 0;
    }
  }]);
  return ScrollOffset;
}();
function _calculateOffset2() {
  var absBoundingBox = this.getAbsBoundingBox();
  if (absBoundingBox.hasZeroArea()) {
    this.up = 0;
    this.down = 0;
    this.left = 0;
    this.right = 0;
  } else {
    var absViewBox = this.getAbsViewBox();
    this.up = absViewBox.p0.y - absBoundingBox.p0.y;
    this.down = absBoundingBox.p1.y - absViewBox.p1.y;
    this.left = absViewBox.p0.x - absBoundingBox.p0.x;
    this.right = absBoundingBox.p1.x - absViewBox.p1.x;
  }
}

export { ScrollOffset };
//# sourceMappingURL=scroll-offset.modern.js.map
