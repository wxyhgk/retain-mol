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
var BondAttr = function (_BaseOperation) {
  _inherits(BondAttr, _BaseOperation);
  function BondAttr(bondId, attribute, value) {
    var _this;
    var needInvalidateBond = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    _classCallCheck(this, BondAttr);
    _this = _callSuper(this, BondAttr, [OperationType.BOND_ATTR, OperationPriority.BOND_ATTR]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "data2", void 0);
    _this.data = {
      bid: bondId,
      attribute: attribute,
      value: value,
      needInvalidateBond: needInvalidateBond
    };
    _this.data2 = null;
    return _this;
  }
  _createClass(BondAttr, [{
    key: "execute",
    value: function execute(restruct) {
      if (this.data) {
        var _this$data = this.data,
          attribute = _this$data.attribute,
          bid = _this$data.bid,
          value = _this$data.value,
          needInvalidateBond = _this$data.needInvalidateBond;
        var bond = restruct.molecule.bonds.get(bid);
        if (!bond) {
          return;
        }
        if (!this.data2) {
          this.data2 = {
            bid: bid,
            attribute: attribute,
            value: bond[attribute],
            needInvalidateBond: needInvalidateBond
          };
        }
        bond[attribute] = value;
        if (this.data.needInvalidateBond) {
          BaseOperation.invalidateBond(restruct, bid);
        }
        if (attribute === 'type') {
          BaseOperation.invalidateLoop(restruct, bid);
        }
      }
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (this.data) {
        var _this$data2 = this.data,
          attribute = _this$data2.attribute,
          bid = _this$data2.bid,
          value = _this$data2.value;
        var bond = restruct.molecule.bonds.get(bid);
        return bond ? bond[attribute] === value : false;
      }
      return false;
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new BondAttr();
      inverted.data = this.data2;
      inverted.data2 = this.data;
      return inverted;
    }
  }]);
  return BondAttr;
}(BaseOperation);

export { BondAttr };
//# sourceMappingURL=BondAttr.modern.js.map
