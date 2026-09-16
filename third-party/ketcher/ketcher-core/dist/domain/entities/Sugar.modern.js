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
import _inherits from '@babel/runtime/helpers/inherits';
import { BaseMonomer } from './BaseMonomer.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { RnaSubChain } from './monomer-chains/RnaSubChain.modern.js';
import { PhosphateSubChain } from './monomer-chains/PhosphateSubChain.modern.js';
import { isRnaBaseOrAmbiguousRnaBase, isPhosphateOrAmbiguousPhosphate } from '../helpers/monomers.modern.js';
import { PolymerBond } from './PolymerBond.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Sugar = function (_BaseMonomer) {
  _inherits(Sugar, _BaseMonomer);
  function Sugar() {
    _classCallCheck(this, Sugar);
    return _callSuper(this, Sugar, arguments);
  }
  _createClass(Sugar, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (!secondMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Sugar.getValidPoint(this, secondMonomer, secondMonomer.potentialSecondAttachmentPointForBond);
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (!firstMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Sugar.getValidPoint(this, firstMonomer, firstMonomer.chosenFirstAttachmentPointForBond);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return RnaSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PhosphateSubChain, RnaSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }, {
    key: "isPartOfRNA",
    get: function get() {
      var r3PolymerBond = this.attachmentPointsToBonds.R3;
      return r3PolymerBond instanceof PolymerBond && isRnaBaseOrAmbiguousRnaBase(r3PolymerBond === null || r3PolymerBond === void 0 ? void 0 : r3PolymerBond.getAnotherMonomer(this));
    }
  }], [{
    key: "getValidPoint",
    value: function getValidPoint(self, otherMonomer, potentialPointOnOther) {
      if (self.chosenFirstAttachmentPointForBond) {
        return self.chosenFirstAttachmentPointForBond;
      }
      if (self.potentialSecondAttachmentPointForBond) {
        return self.potentialSecondAttachmentPointForBond;
      }
      if (self.unUsedAttachmentPointsNamesList.length === 1) {
        return self.unUsedAttachmentPointsNamesList[0];
      }
      if (!isPhosphateOrAmbiguousPhosphate(otherMonomer) && !isRnaBaseOrAmbiguousRnaBase(otherMonomer)) {
        return;
      }
      if (isRnaBaseOrAmbiguousRnaBase(otherMonomer)) {
        if (self.isAttachmentPointExistAndFree(AttachmentPointName.R3)) {
          return AttachmentPointName.R3;
        } else return;
      }
      if (potentialPointOnOther) {
        if (potentialPointOnOther === AttachmentPointName.R1 && self.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
          return AttachmentPointName.R2;
        } else if (potentialPointOnOther !== AttachmentPointName.R1 && self.isAttachmentPointExistAndFree(AttachmentPointName.R1)) {
          return AttachmentPointName.R1;
        } else {
          return;
        }
      }
      if (otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) && self.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
        return AttachmentPointName.R2;
      }
      if (otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) && self.isAttachmentPointExistAndFree(AttachmentPointName.R1)) {
        return AttachmentPointName.R1;
      }
      if (!otherMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) && self.isAttachmentPointExistAndFree(AttachmentPointName.R1)) {
        return AttachmentPointName.R1;
      }
      return undefined;
    }
  }]);
  return Sugar;
}(BaseMonomer);

export { Sugar };
//# sourceMappingURL=Sugar.modern.js.map
