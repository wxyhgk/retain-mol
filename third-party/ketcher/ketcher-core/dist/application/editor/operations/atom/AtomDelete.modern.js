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

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AtomDelete = function (_BaseOperation) {
  _inherits(AtomDelete, _BaseOperation);
  function AtomDelete(atomId) {
    var _this;
    _classCallCheck(this, AtomDelete);
    _this = _callSuper(this, AtomDelete, [OperationType.ATOM_DELETE, OperationPriority.ATOM_DELETE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      aid: atomId !== null && atomId !== void 0 ? atomId : null,
      atom: null,
      pos: null
    };
    return _this;
  }
  _createClass(AtomDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var aid = this.data.aid;
      if (aid === null) return;
      var struct = restruct.molecule;
      if (!this.data.atom) {
        var atomFromStruct = struct.atoms.get(aid);
        if (!atomFromStruct) return;
        this.data.atom = atomFromStruct;
        this.data.pos = atomFromStruct.pp;
      }
      var restructedAtom = restruct.atoms.get(aid);
      if (!restructedAtom) {
        return;
      }
      var set = restruct.connectedComponents.get(restructedAtom.component);
      if (!set) return;
      set["delete"](aid);
      if (set.size === 0) {
        restruct.connectedComponents["delete"](restructedAtom.component);
      }
      restruct.clearVisel(restructedAtom.visel);
      restruct.atoms["delete"](aid);
      restruct.markItemRemoved();
      struct.atoms["delete"](aid);
    }
  }]);
  return AtomDelete;
}(BaseOperation);

export { AtomDelete };
//# sourceMappingURL=AtomDelete.modern.js.map
