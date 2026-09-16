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
var RestoreIfThen = function (_BaseOperation) {
  _inherits(RestoreIfThen, _BaseOperation);
  function RestoreIfThen(rgNew, rgOld, history) {
    var _this;
    _classCallCheck(this, RestoreIfThen);
    _this = _callSuper(this, RestoreIfThen, [OperationType.RESTORE_IF_THEN]);
    _defineProperty(_assertThisInitialized(_this), "rgid_new", void 0);
    _defineProperty(_assertThisInitialized(_this), "rgid_old", void 0);
    _defineProperty(_assertThisInitialized(_this), "ifThenHistory", void 0);
    _this.rgid_new = rgNew;
    _this.rgid_old = rgOld;
    _this.ifThenHistory = history || new Map();
    return _this;
  }
  _createClass(RestoreIfThen, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      this.ifThenHistory.forEach(function (rg, rgid) {
        var rgValue = struct.rgroups.get(rgid);
        if (!rgValue) return;
        rgValue.ifthen = rg;
        struct.rgroups.set(rgid, rgValue);
      });
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RestoreIfThen.InverseConstructor(this.rgid_old, this.rgid_new);
    }
  }]);
  return RestoreIfThen;
}(BaseOperation);
_defineProperty(RestoreIfThen, "InverseConstructor", void 0);

export { RestoreIfThen };
//# sourceMappingURL=RestoreIfThen.modern.js.map
