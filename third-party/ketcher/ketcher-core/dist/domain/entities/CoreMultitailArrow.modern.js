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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { DrawingEntity } from './DrawingEntity.modern.js';
import { MultitailArrow as MultitailArrow$1 } from './multitailArrow.modern.js';
import { FixedPrecisionCoordinates } from './fixedPrecision.modern.js';
import { Vec2 } from './vec2.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MultitailArrow = function (_DrawingEntity) {
  _inherits(MultitailArrow, _DrawingEntity);
  function MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailLength, tailsYOffset) {
    var _this;
    _classCallCheck(this, MultitailArrow);
    _this = _callSuper(this, MultitailArrow);
    _defineProperty(_assertThisInitialized(_this), "spineTopX", void 0);
    _defineProperty(_assertThisInitialized(_this), "spineTopY", void 0);
    _defineProperty(_assertThisInitialized(_this), "height", void 0);
    _defineProperty(_assertThisInitialized(_this), "headOffsetX", void 0);
    _defineProperty(_assertThisInitialized(_this), "headOffsetY", void 0);
    _defineProperty(_assertThisInitialized(_this), "tailLength", void 0);
    _defineProperty(_assertThisInitialized(_this), "tailsYOffset", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _defineProperty(_assertThisInitialized(_this), "arrowId", void 0);
    _this.spineTopX = spineTopX;
    _this.spineTopY = spineTopY;
    _this.height = height;
    _this.headOffsetX = headOffsetX;
    _this.headOffsetY = headOffsetY;
    _this.tailLength = tailLength;
    _this.tailsYOffset = tailsYOffset;
    return _this;
  }
  _createClass(MultitailArrow, [{
    key: "center",
    get: function get() {
      return Vec2.centre(new Vec2(this.spineTopX.sub(this.tailLength).getFloatingPrecision(), this.spineTopY.getFloatingPrecision()), new Vec2(this.spineTopX.add(this.headOffsetX).getFloatingPrecision(), this.spineTopY.add(this.height).getFloatingPrecision()));
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(MultitailArrow.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "moveRelative",
    value: function moveRelative(delta) {
      this.spineTopX = this.spineTopX.add(FixedPrecisionCoordinates.fromFloatingPrecision(delta.x));
      this.spineTopY = this.spineTopY.add(FixedPrecisionCoordinates.fromFloatingPrecision(delta.y));
    }
  }, {
    key: "moveAbsolute",
    value: function moveAbsolute(position) {
      var delta = Vec2.diff(position, new Vec2(this.spineTopX.value, this.spineTopY.value));
      this.moveRelative(delta);
    }
  }, {
    key: "toKetNode",
    value: function toKetNode() {
      return MultitailArrow$1.getParametersForKetNode(this.spineTopX, this.spineTopY, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset, this.height, this.center, false);
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions() {
      return MultitailArrow$1.getReferencePositions(this.spineTopX, this.spineTopY, this.height, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset);
    }
  }], [{
    key: "fromKet",
    value: function fromKet(multitailArrowKetNode) {
      var _MicromoleculeMultita = MultitailArrow$1.getConstructorParamsFromKetNode(multitailArrowKetNode),
        spineTopX = _MicromoleculeMultita.spineTopX,
        spineTopY = _MicromoleculeMultita.spineTopY,
        height = _MicromoleculeMultita.height,
        headOffsetX = _MicromoleculeMultita.headOffsetX,
        headOffsetY = _MicromoleculeMultita.headOffsetY,
        tailsLength = _MicromoleculeMultita.tailsLength,
        tailsYOffset = _MicromoleculeMultita.tailsYOffset;
      return new MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailsLength, tailsYOffset);
    }
  }]);
  return MultitailArrow;
}(DrawingEntity);

export { MultitailArrow };
//# sourceMappingURL=CoreMultitailArrow.modern.js.map
