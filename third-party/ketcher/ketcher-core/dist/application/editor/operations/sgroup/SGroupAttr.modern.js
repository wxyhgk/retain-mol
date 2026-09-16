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
import { MonomerMicromolecule } from '../../../../domain/entities/monomerMicromolecule.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupAttr = function (_BaseOperation) {
  _inherits(SGroupAttr, _BaseOperation);
  function SGroupAttr(sgroupId, attribute, value) {
    var _this;
    _classCallCheck(this, SGroupAttr);
    _this = _callSuper(this, SGroupAttr, [OperationType.S_GROUP_ATTR, OperationPriority.S_GROUP_ATTR]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      sgid: sgroupId,
      attr: attribute,
      value: value
    };
    return _this;
  }
  _createClass(SGroupAttr, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var _this$data = this.data,
        sgid = _this$data.sgid,
        attr = _this$data.attr,
        value = _this$data.value;
      if (sgid === undefined || attr === undefined) {
        return;
      }
      var sgroup = struct.sgroups.get(sgid);
      if (!sgroup) {
        return;
      }
      var sgroupData = restruct.sgroupData.get(sgid);
      if (sgroup.type === 'DAT' && sgroupData) {
        restruct.clearVisel(sgroupData.visel);
        restruct.sgroupData["delete"](sgid);
      }
      if (attr === 'expanded' && sgroup instanceof MonomerMicromolecule) {
        if (Object.isFrozen(sgroup.monomer.monomerItem)) {
          sgroup.monomer.monomerItem = _objectSpread({}, sgroup.monomer.monomerItem);
        }
        if (typeof value === 'boolean') {
          sgroup.monomer.monomerItem.expanded = value;
        }
      }
      this.data.value = sgroup.setAttr(attr, value);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new SGroupAttr();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var _this$data2 = this.data,
        sgid = _this$data2.sgid,
        attr = _this$data2.attr,
        value = _this$data2.value;
      if (sgid === undefined || attr === undefined) {
        return false;
      }
      var sgroup = restruct.molecule.sgroups.get(sgid);
      if (!sgroup) return false;
      return sgroup.checkAttr(attr, value);
    }
  }]);
  return SGroupAttr;
}(BaseOperation);

export { SGroupAttr };
//# sourceMappingURL=SGroupAttr.modern.js.map
