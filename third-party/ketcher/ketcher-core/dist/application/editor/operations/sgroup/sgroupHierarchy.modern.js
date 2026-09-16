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
import '../../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupAddToHierarchy = function (_BaseOperation) {
  _inherits(SGroupAddToHierarchy, _BaseOperation);
  function SGroupAddToHierarchy(sgroupId, parent, children) {
    var _this;
    _classCallCheck(this, SGroupAddToHierarchy);
    _this = _callSuper(this, SGroupAddToHierarchy, [OperationType.S_GROUP_ADD_TO_HIERACHY, OperationPriority.S_GROUP_ADD_TO_HIERACHY]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      sgid: sgroupId,
      parent: parent,
      children: children
    };
    return _this;
  }
  _createClass(SGroupAddToHierarchy, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        sgid = _this$data.sgid,
        parent = _this$data.parent,
        children = _this$data.children;
      var struct = restruct.molecule;
      var sgroup = struct.sgroups.get(sgid);
      if (!sgroup) {
        KetcherLogger.error("SGroupAddToHierarchy: S-Group ".concat(sgid, " not found"));
        return;
      }
      var relations = struct.sGroupForest.insert(sgroup, parent, children);
      this.data.parent = relations.parent;
      this.data.children = relations.children;
    }
  }]);
  return SGroupAddToHierarchy;
}(BaseOperation);
var SGroupRemoveFromHierarchy = function (_BaseOperation2) {
  _inherits(SGroupRemoveFromHierarchy, _BaseOperation2);
  function SGroupRemoveFromHierarchy(sgroupId) {
    var _this2;
    _classCallCheck(this, SGroupRemoveFromHierarchy);
    _this2 = _callSuper(this, SGroupRemoveFromHierarchy, [OperationType.S_GROUP_REMOVE_FROM_HIERACHY, 110]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      sgid: sgroupId
    };
    return _this2;
  }
  _createClass(SGroupRemoveFromHierarchy, [{
    key: "execute",
    value: function execute(restruct) {
      var sgid = this.data.sgid;
      var struct = restruct.molecule;
      this.data.parent = struct.sGroupForest.parent.get(sgid);
      this.data.children = struct.sGroupForest.children.get(sgid);
      struct.sGroupForest.remove(sgid);
    }
  }]);
  return SGroupRemoveFromHierarchy;
}(BaseOperation);
SGroupAddToHierarchy.InverseConstructor = SGroupRemoveFromHierarchy;
SGroupRemoveFromHierarchy.InverseConstructor = SGroupAddToHierarchy;

export { SGroupAddToHierarchy, SGroupRemoveFromHierarchy };
//# sourceMappingURL=sgroupHierarchy.modern.js.map
