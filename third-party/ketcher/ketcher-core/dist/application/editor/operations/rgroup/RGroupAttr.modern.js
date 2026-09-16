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
import { OperationType } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RGroupAttr = function (_BaseOperation) {
  _inherits(RGroupAttr, _BaseOperation);
  function RGroupAttr(rgroupId, attribute, value) {
    var _this;
    _classCallCheck(this, RGroupAttr);
    _this = _callSuper(this, RGroupAttr, [OperationType.R_GROUP_ATTR]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "data2", void 0);
    _this.data = {
      rgid: rgroupId,
      attribute: attribute,
      value: value
    };
    _this.data2 = null;
    return _this;
  }
  _createClass(RGroupAttr, [{
    key: "execute",
    value: function execute(restruct) {
      if (!this.data) {
        return;
      }
      var _this$data = this.data,
        rgid = _this$data.rgid,
        attribute = _this$data.attribute,
        value = _this$data.value;
      if (rgid === undefined || attribute === undefined || value === undefined) {
        return;
      }
      var rgp = restruct.molecule.rgroups.get(rgid);
      if (!rgp) {
        return;
      }
      if (!this.data2) {
        this.data2 = {
          rgid: rgid,
          attribute: attribute,
          value: rgp[attribute]
        };
      }
      rgp[attribute] = value;
      BaseOperation.invalidateItem(restruct, 'rgroups', rgid);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new RGroupAttr();
      inverted.data = this.data2;
      inverted.data2 = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!this.data) {
        return false;
      }
      var _this$data2 = this.data,
        rgid = _this$data2.rgid,
        attribute = _this$data2.attribute,
        value = _this$data2.value;
      if (rgid === undefined || attribute === undefined) {
        return false;
      }
      var rgroup = restruct.molecule.rgroups.get(rgid);
      return rgroup ? rgroup[attribute] === value : false;
    }
  }]);
  return RGroupAttr;
}(BaseOperation);

export { RGroupAttr };
//# sourceMappingURL=RGroupAttr.modern.js.map
