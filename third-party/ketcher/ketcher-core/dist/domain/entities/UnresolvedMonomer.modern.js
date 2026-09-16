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
import { PeptideSubChain } from './monomer-chains/PeptideSubChain.modern.js';
import { Peptide } from './Peptide.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var UnresolvedMonomer = function (_BaseMonomer) {
  _inherits(UnresolvedMonomer, _BaseMonomer);
  function UnresolvedMonomer() {
    _classCallCheck(this, UnresolvedMonomer);
    return _callSuper(this, UnresolvedMonomer, arguments);
  }
  _createClass(UnresolvedMonomer, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (!secondMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Peptide.prototype.getValidSourcePoint.call(this, secondMonomer);
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (!firstMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Peptide.prototype.getValidTargetPoint.call(this, firstMonomer);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return ChemSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PeptideSubChain, ChemSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }]);
  return UnresolvedMonomer;
}(BaseMonomer);

export { UnresolvedMonomer };
//# sourceMappingURL=UnresolvedMonomer.modern.js.map
