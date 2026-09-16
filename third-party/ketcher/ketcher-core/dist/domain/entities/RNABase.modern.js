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
import { ChemSubChain } from './monomer-chains/ChemSubChain.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { getSugarFromRnaBase } from '../helpers/monomers.modern.js';
import { MonomerToAtomBond } from './MonomerToAtomBond.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RNABase = function (_BaseMonomer) {
  _inherits(RNABase, _BaseMonomer);
  function RNABase() {
    _classCallCheck(this, RNABase);
    return _callSuper(this, RNABase, arguments);
  }
  _createClass(RNABase, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint() {
      if (this.chosenFirstAttachmentPointForBond) {
        return this.chosenFirstAttachmentPointForBond;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint() {
      if (this.potentialSecondAttachmentPointForBond) {
        return this.potentialSecondAttachmentPointForBond;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return ChemSubChain;
    }
  }, {
    key: "sideConnections",
    get: function get() {
      var _this = this;
      var sideConnections = [];
      this.forEachBond(function (polymerBond, attachmentPointName) {
        if (!(polymerBond instanceof MonomerToAtomBond) && (attachmentPointName !== AttachmentPointName.R1 || !getSugarFromRnaBase(_this))) {
          sideConnections.push(polymerBond);
        }
      });
      return sideConnections;
    }
  }]);
  return RNABase;
}(BaseMonomer);

export { RNABase };
//# sourceMappingURL=RNABase.modern.js.map
