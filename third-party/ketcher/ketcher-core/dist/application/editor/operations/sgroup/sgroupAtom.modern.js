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
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType, OperationPriority } from '../OperationType.modern.js';
import { SGroup } from '../../../../domain/entities/sgroup.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupAtomAdd = function (_BaseOperation) {
  _inherits(SGroupAtomAdd, _BaseOperation);
  function SGroupAtomAdd(sgroupId, aid) {
    var _this;
    _classCallCheck(this, SGroupAtomAdd);
    _this = _callSuper(this, SGroupAtomAdd, [OperationType.S_GROUP_ATOM_ADD, OperationPriority.S_GROUP_ATOM_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      sgid: sgroupId,
      aid: aid
    };
    return _this;
  }
  _createClass(SGroupAtomAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        aid = _this$data.aid,
        sgid = _this$data.sgid;
      var struct = restruct.molecule;
      var atom = struct.atoms.get(aid);
      var sgroup = struct.sgroups.get(sgid);
      assert(atom, "OpSGroupAtomAdd: Atom ".concat(aid, " not found"));
      assert(sgroup, "OpSGroupAtomAdd: S-Group ".concat(sgid, " not found"));
      if (sgroup.atoms.indexOf(aid) >= 0) {
        return;
      }
      struct.atomAddToSGroup(sgid, aid);
      BaseOperation.invalidateAtom(restruct, aid);
    }
  }]);
  return SGroupAtomAdd;
}(BaseOperation);
var SGroupAtomRemove = function (_BaseOperation2) {
  _inherits(SGroupAtomRemove, _BaseOperation2);
  function SGroupAtomRemove(sgroupId, aid) {
    var _this2;
    _classCallCheck(this, SGroupAtomRemove);
    _this2 = _callSuper(this, SGroupAtomRemove, [OperationType.S_GROUP_ATOM_REMOVE, 4]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      sgid: sgroupId,
      aid: aid
    };
    return _this2;
  }
  _createClass(SGroupAtomRemove, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data2 = this.data,
        aid = _this$data2.aid,
        sgid = _this$data2.sgid;
      var struct = restruct.molecule;
      var atom = struct.atoms.get(aid);
      var sgroup = struct.sgroups.get(sgid);
      if (!atom || !sgroup) {
        return;
      }
      SGroup.removeAtom(sgroup, aid);
      atom.sgs["delete"](sgid);
      BaseOperation.invalidateAtom(restruct, aid);
    }
  }]);
  return SGroupAtomRemove;
}(BaseOperation);
SGroupAtomAdd.InverseConstructor = SGroupAtomRemove;
SGroupAtomRemove.InverseConstructor = SGroupAtomAdd;

export { SGroupAtomAdd, SGroupAtomRemove };
//# sourceMappingURL=sgroupAtom.modern.js.map
