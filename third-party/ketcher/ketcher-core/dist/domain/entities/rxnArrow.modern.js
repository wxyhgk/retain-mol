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
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Vec2 } from './vec2.modern.js';
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrowMode;
(function (RxnArrowMode) {
  RxnArrowMode["OpenAngle"] = "open-angle";
  RxnArrowMode["FilledTriangle"] = "filled-triangle";
  RxnArrowMode["FilledBow"] = "filled-bow";
  RxnArrowMode["DashedOpenAngle"] = "dashed-open-angle";
  RxnArrowMode["Failed"] = "failed";
  RxnArrowMode["Retrosynthetic"] = "retrosynthetic";
  RxnArrowMode["BothEndsFilledTriangle"] = "both-ends-filled-triangle";
  RxnArrowMode["EquilibriumFilledTriangle"] = "equilibrium-filled-triangle";
  RxnArrowMode["EquilibriumFilledHalfBow"] = "equilibrium-filled-half-bow";
  RxnArrowMode["EquilibriumOpenAngle"] = "equilibrium-open-angle";
  RxnArrowMode["UnbalancedEquilibriumFilledHalfBow"] = "unbalanced-equilibrium-filled-half-bow";
  RxnArrowMode["UnbalancedEquilibriumOpenHalfAngle"] = "unbalanced-equilibrium-open-half-angle";
  RxnArrowMode["UnbalancedEquilibriumLargeFilledHalfBow"] = "unbalanced-equilibrium-large-filled-half-bow";
  RxnArrowMode["UnbalancedEquilibriumFilledHalfTriangle"] = "unbalanced-equilibrium-filled-half-triangle";
  RxnArrowMode["EllipticalArcFilledBow"] = "elliptical-arc-arrow-filled-bow";
  RxnArrowMode["EllipticalArcFilledTriangle"] = "elliptical-arc-arrow-filled-triangle";
  RxnArrowMode["EllipticalArcOpenAngle"] = "elliptical-arc-arrow-open-angle";
  RxnArrowMode["EllipticalArcOpenHalfAngle"] = "elliptical-arc-arrow-open-half-angle";
})(RxnArrowMode || (RxnArrowMode = {}));
var RxnArrow = function (_BaseMicromoleculeEnt) {
  _inherits(RxnArrow, _BaseMicromoleculeEnt);
  function RxnArrow(attributes) {
    var _this;
    _classCallCheck(this, RxnArrow);
    _this = _callSuper(this, RxnArrow, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "mode", void 0);
    _defineProperty(_assertThisInitialized(_this), "pos", void 0);
    _defineProperty(_assertThisInitialized(_this), "height", void 0);
    _defineProperty(_assertThisInitialized(_this), "arrowId", void 0);
    _this.pos = [];
    _this.arrowId = attributes.arrowId;
    if (attributes.pos) {
      for (var i = 0; i < attributes.pos.length; i++) {
        var currentP = attributes.pos[i];
        _this.pos[i] = currentP ? new Vec2(attributes.pos[i]) : new Vec2();
      }
    }
    _this.mode = attributes.mode;
    var defaultHeight = 1;
    if (RxnArrow.isElliptical(_assertThisInitialized(_this))) {
      var _attributes$height;
      _this.height = (_attributes$height = attributes.height) !== null && _attributes$height !== void 0 ? _attributes$height : defaultHeight;
    }
    return _this;
  }
  _createClass(RxnArrow, [{
    key: "clone",
    value: function clone() {
      return new RxnArrow(this);
    }
  }, {
    key: "center",
    value: function center() {
      return Vec2.centre(this.pos[0], this.pos[1]);
    }
  }], [{
    key: "isElliptical",
    value: function isElliptical(arrow) {
      return [RxnArrowMode.EllipticalArcFilledBow, RxnArrowMode.EllipticalArcFilledTriangle, RxnArrowMode.EllipticalArcOpenHalfAngle, RxnArrowMode.EllipticalArcOpenAngle].includes(arrow.mode);
    }
  }]);
  return RxnArrow;
}(BaseMicromoleculeEntity);

export { RxnArrow, RxnArrowMode };
//# sourceMappingURL=rxnArrow.modern.js.map
