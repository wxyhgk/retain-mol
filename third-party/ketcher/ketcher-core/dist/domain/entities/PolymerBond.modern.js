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
import { isMonomerConnectedToR2RnaBase, isRnaBaseOrAmbiguousRnaBase, isBondBetweenSugarAndBaseOfRna } from '../helpers/polymerBondMonomerConnections.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { BaseBond } from './BaseBond.modern.js';
import '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import { HalfMonomerSize } from '../constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PolymerBond = function (_BaseBond) {
  _inherits(PolymerBond, _BaseBond);
  function PolymerBond(firstMonomer, secondMonomer) {
    var _this;
    _classCallCheck(this, PolymerBond);
    _this = _callSuper(this, PolymerBond);
    _defineProperty(_assertThisInitialized(_this), "firstMonomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "secondMonomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _defineProperty(_assertThisInitialized(_this), "hasAntisenseInRow", false);
    _defineProperty(_assertThisInitialized(_this), "nextRowPositionX", void 0);
    _this.firstMonomer = firstMonomer;
    _this.firstMonomer = firstMonomer;
    _this.secondMonomer = secondMonomer;
    return _this;
  }
  _createClass(PolymerBond, [{
    key: "setFirstMonomer",
    value: function setFirstMonomer(monomer) {
      this.firstMonomer = monomer;
    }
  }, {
    key: "setSecondMonomer",
    value: function setSecondMonomer(monomer) {
      this.secondMonomer = monomer;
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(PolymerBond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "isBackBoneChainConnection",
    get: function get() {
      return !this.isSideChainConnection;
    }
  }, {
    key: "firstMonomerAttachmentPoint",
    get: function get() {
      return this.firstMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "secondMonomerAttachmentPoint",
    get: function get() {
      var _this$secondMonomer;
      return (_this$secondMonomer = this.secondMonomer) === null || _this$secondMonomer === void 0 ? void 0 : _this$secondMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "isSideChainConnection",
    get: function get() {
      var firstMonomerAttachmentPoint = this.firstMonomerAttachmentPoint;
      var secondMonomerAttachmentPoint = this.secondMonomerAttachmentPoint;
      if (!firstMonomerAttachmentPoint || !secondMonomerAttachmentPoint) {
        return false;
      }
      return (!(PolymerBond.backBoneChainAttachmentPoints.includes(firstMonomerAttachmentPoint) && PolymerBond.backBoneChainAttachmentPoints.includes(secondMonomerAttachmentPoint)) || isMonomerConnectedToR2RnaBase(this.firstMonomer) && isRnaBaseOrAmbiguousRnaBase(this.secondMonomer) || isMonomerConnectedToR2RnaBase(this.secondMonomer) && isRnaBaseOrAmbiguousRnaBase(this.firstMonomer) || firstMonomerAttachmentPoint === secondMonomerAttachmentPoint) && !isBondBetweenSugarAndBaseOfRna(this);
    }
  }, {
    key: "firstEndEntity",
    get: function get() {
      return this.firstMonomer;
    }
  }, {
    key: "secondEndEntity",
    get: function get() {
      return this.secondMonomer;
    }
  }, {
    key: "getAnotherMonomer",
    value: function getAnotherMonomer(monomer) {
      return _get(_getPrototypeOf(PolymerBond.prototype), "getAnotherEntity", this).call(this, monomer);
    }
  }, {
    key: "isHorizontal",
    get: function get() {
      if (!this.secondMonomer) {
        return false;
      }
      return Math.abs(this.firstMonomer.position.y - this.secondMonomer.position.y) < HalfMonomerSize;
    }
  }, {
    key: "isVertical",
    get: function get() {
      if (!this.secondMonomer) {
        return false;
      }
      return Math.abs(this.firstMonomer.position.x - this.secondMonomer.position.x) < HalfMonomerSize;
    }
  }], [{
    key: "backBoneChainAttachmentPoints",
    get: function get() {
      return [AttachmentPointName.R1, AttachmentPointName.R2];
    }
  }]);
  return PolymerBond;
}(BaseBond);

export { PolymerBond };
//# sourceMappingURL=PolymerBond.modern.js.map
