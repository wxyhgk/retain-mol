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
import { PeptideSubChain } from './monomer-chains/PeptideSubChain.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Peptide = function (_BaseMonomer) {
  _inherits(Peptide, _BaseMonomer);
  function Peptide() {
    _classCallCheck(this, Peptide);
    return _callSuper(this, Peptide, arguments);
  }
  _createClass(Peptide, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (this.chosenFirstAttachmentPointForBond) {
        return this.chosenFirstAttachmentPointForBond;
      }
      if (this.unUsedAttachmentPointsNamesList.length === 1) {
        return this.unUsedAttachmentPointsNamesList[0];
      }
      if (secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.potentialSecondAttachmentPointForBond) {
        if ((secondMonomer === null || secondMonomer === void 0 ? void 0 : secondMonomer.potentialSecondAttachmentPointForBond) === AttachmentPointName.R1 && this.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
          return AttachmentPointName.R2;
        }
        if ((secondMonomer === null || secondMonomer === void 0 ? void 0 : secondMonomer.potentialSecondAttachmentPointForBond) === AttachmentPointName.R2 && this.isAttachmentPointExistAndFree(AttachmentPointName.R1)) {
          return AttachmentPointName.R1;
        }
        return;
      }
      if ((!secondMonomer || secondMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1)) && this.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
        return AttachmentPointName.R2;
      }
      if (this.isAttachmentPointExistAndFree(AttachmentPointName.R1) && secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
        return AttachmentPointName.R1;
      }
      return undefined;
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (this.potentialSecondAttachmentPointForBond) {
        return this.potentialSecondAttachmentPointForBond;
      }
      if (this.unUsedAttachmentPointsNamesList.length === 1) {
        return this.unUsedAttachmentPointsNamesList[0];
      }
      if (firstMonomer !== null && firstMonomer !== void 0 && firstMonomer.chosenFirstAttachmentPointForBond) {
        if ((firstMonomer === null || firstMonomer === void 0 ? void 0 : firstMonomer.chosenFirstAttachmentPointForBond) === AttachmentPointName.R1 && this.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
          return AttachmentPointName.R2;
        }
        if ((firstMonomer === null || firstMonomer === void 0 ? void 0 : firstMonomer.chosenFirstAttachmentPointForBond) === AttachmentPointName.R2 && this.isAttachmentPointExistAndFree(AttachmentPointName.R1)) {
          return AttachmentPointName.R1;
        }
        return;
      }
      if (this.isAttachmentPointExistAndFree(AttachmentPointName.R1) && firstMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
        return AttachmentPointName.R1;
      }
      if (firstMonomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) && this.isAttachmentPointExistAndFree(AttachmentPointName.R2)) {
        return AttachmentPointName.R2;
      }
      return undefined;
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return PeptideSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PeptideSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }]);
  return Peptide;
}(BaseMonomer);

export { Peptide };
//# sourceMappingURL=Peptide.modern.js.map
