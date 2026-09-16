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
var SGroupDataMove = function (_BaseOperation) {
  _inherits(SGroupDataMove, _BaseOperation);
  function SGroupDataMove(id, d) {
    var _this;
    _classCallCheck(this, SGroupDataMove);
    _this = _callSuper(this, SGroupDataMove, [OperationType.S_GROUP_DATA_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      id: id,
      d: d
    };
    return _this;
  }
  _createClass(SGroupDataMove, [{
    key: "execute",
    value: function execute(restruct) {
      var _sgroup$pp;
      var _this$data = this.data,
        d = _this$data.d,
        id = _this$data.id;
      if (id === undefined || d === undefined) return;
      var sgroups = restruct.molecule.sgroups;
      var sgroup = sgroups.get(id);
      if (!sgroup) return;
      (_sgroup$pp = sgroup.pp) === null || _sgroup$pp === void 0 || _sgroup$pp.add_(d);
      this.data.d = d.negated();
      BaseOperation.invalidateItem(restruct, 'sgroupData', id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new SGroupDataMove();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return (d === null || d === void 0 ? void 0 : d.x) === 0 && (d === null || d === void 0 ? void 0 : d.y) === 0;
    }
  }]);
  return SGroupDataMove;
}(BaseOperation);

export { SGroupDataMove };
//# sourceMappingURL=SGroupDataMove.modern.js.map
