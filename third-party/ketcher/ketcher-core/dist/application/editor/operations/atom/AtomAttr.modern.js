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
var AtomAttr = function (_BaseOperation) {
  _inherits(AtomAttr, _BaseOperation);
  function AtomAttr(atomId, attribute, value) {
    var _this;
    _classCallCheck(this, AtomAttr);
    _this = _callSuper(this, AtomAttr, [OperationType.ATOM_ATTR, OperationPriority.ATOM_ATTR]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "data2", void 0);
    _this.data = {
      aid: atomId,
      attribute: attribute,
      value: value
    };
    _this.data2 = null;
    return _this;
  }
  _createClass(AtomAttr, [{
    key: "execute",
    value: function execute(restruct) {
      if (this.data) {
        var _this$data = this.data,
          aid = _this$data.aid,
          attribute = _this$data.attribute,
          value = _this$data.value;
        if (aid === undefined || attribute === undefined) {
          return;
        }
        var atom = restruct.molecule.atoms.get(aid);
        if (!atom) return;
        if (!this.data2) {
          this.data2 = {
            aid: aid,
            attribute: attribute,
            value: Reflect.get(atom, attribute)
          };
        }
        Reflect.set(atom, attribute, value);
        BaseOperation.invalidateAtom(restruct, aid);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new AtomAttr();
      inverted.data = this.data2;
      inverted.data2 = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      var data = this.data;
      if (!data) {
        return false;
      }
      var aid = data.aid,
        attribute = data.attribute,
        value = data.value;
      if (aid === undefined || attribute === undefined) {
        return false;
      }
      var atom = restruct.molecule.atoms.get(aid);
      if (!atom) {
        return false;
      }
      return Reflect.get(atom, attribute) === value;
    }
  }]);
  return AtomAttr;
}(BaseOperation);

export { AtomAttr };
//# sourceMappingURL=AtomAttr.modern.js.map
