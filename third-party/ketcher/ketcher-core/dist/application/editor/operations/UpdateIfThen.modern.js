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
var UpdateIfThen = function (_BaseOperation) {
  _inherits(UpdateIfThen, _BaseOperation);
  function UpdateIfThen(rgNew, rgOld) {
    var _this;
    var skipRgids = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    _classCallCheck(this, UpdateIfThen);
    _this = _callSuper(this, UpdateIfThen, [OperationType.UPDATE_IF_THEN]);
    _defineProperty(_assertThisInitialized(_this), "rgid_new", void 0);
    _defineProperty(_assertThisInitialized(_this), "rgid_old", void 0);
    _defineProperty(_assertThisInitialized(_this), "ifThenHistory", void 0);
    _defineProperty(_assertThisInitialized(_this), "skipRgids", void 0);
    _this.rgid_new = rgNew;
    _this.rgid_old = rgOld;
    _this.ifThenHistory = new Map();
    _this.skipRgids = skipRgids || [];
    return _this;
  }
  _createClass(UpdateIfThen, [{
    key: "execute",
    value: function execute(restruct) {
      var _this2 = this;
      var struct = restruct.molecule;
      struct.rgroups.forEach(function (rg, rgid) {
        if (rg.ifthen === _this2.rgid_old && !_this2.skipRgids.includes(rgid)) {
          rg.ifthen = _this2.rgid_new;
          _this2.ifThenHistory.set(rgid, _this2.rgid_old);
          struct.rgroups.set(rgid, rg);
        }
      });
    }
  }, {
    key: "invert",
    value: function invert() {
      return new UpdateIfThen.InverseConstructor(this.rgid_new, this.rgid_old, this.ifThenHistory);
    }
  }]);
  return UpdateIfThen;
}(BaseOperation);
_defineProperty(UpdateIfThen, "InverseConstructor", void 0);

export { UpdateIfThen };
//# sourceMappingURL=UpdateIfThen.modern.js.map
