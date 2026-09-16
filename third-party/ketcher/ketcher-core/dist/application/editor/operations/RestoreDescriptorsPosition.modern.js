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
import { OperationType } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RestoreDescriptorsPosition = function (_BaseOperation) {
  _inherits(RestoreDescriptorsPosition, _BaseOperation);
  function RestoreDescriptorsPosition(history) {
    var _this;
    _classCallCheck(this, RestoreDescriptorsPosition);
    _this = _callSuper(this, RestoreDescriptorsPosition, [OperationType.RESTORE_DESCRIPTORS_POSITION]);
    _defineProperty(_assertThisInitialized(_this), "history", void 0);
    _this.history = history;
    return _this;
  }
  _createClass(RestoreDescriptorsPosition, [{
    key: "execute",
    value: function execute(restruct) {
      var _this2 = this;
      var struct = restruct.molecule;
      var sgroups = Array.from(struct.sgroups.values());
      sgroups.forEach(function (sgroup) {
        sgroup.pp = _this2.history[sgroup.id];
        struct.sgroups.set(sgroup.id, sgroup);
        BaseOperation.invalidateItem(restruct, 'sgroupData', sgroup.id, 1);
      });
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RestoreDescriptorsPosition.InverseConstructor();
    }
  }]);
  return RestoreDescriptorsPosition;
}(BaseOperation);
_defineProperty(RestoreDescriptorsPosition, "InverseConstructor", void 0);

export { RestoreDescriptorsPosition };
//# sourceMappingURL=RestoreDescriptorsPosition.modern.js.map
