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
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType, OperationPriority } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FragmentDeleteStereoAtom = function (_BaseOperation) {
  _inherits(FragmentDeleteStereoAtom, _BaseOperation);
  function FragmentDeleteStereoAtom(fragmentId, atomId) {
    var _this;
    _classCallCheck(this, FragmentDeleteStereoAtom);
    _this = _callSuper(this, FragmentDeleteStereoAtom, [OperationType.FRAGMENT_DELETE_STEREO_ATOM, OperationPriority.FRAGMENT_DELETE_STEREO_ATOM]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      frid: fragmentId,
      aid: atomId
    };
    return _this;
  }
  _createClass(FragmentDeleteStereoAtom, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        aid = _this$data.aid,
        frid = _this$data.frid;
      var frag = restruct.molecule.frags.get(frid);
      if (frag) {
        frag.updateStereoAtom(restruct.molecule, aid, frid, false);
        BaseOperation.invalidateEnhancedFlag(restruct, frid);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new FragmentDeleteStereoAtom.InverseConstructor(this.data.frid, this.data.aid);
    }
  }]);
  return FragmentDeleteStereoAtom;
}(BaseOperation);
_defineProperty(FragmentDeleteStereoAtom, "InverseConstructor", void 0);

export { FragmentDeleteStereoAtom };
//# sourceMappingURL=FragmentDeleteStereoAtom.modern.js.map
