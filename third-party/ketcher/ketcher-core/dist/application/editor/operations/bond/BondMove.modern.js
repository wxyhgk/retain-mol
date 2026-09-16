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
import { Scale } from '../../../../domain/helpers/scale.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BondMove = function (_BaseOperation) {
  _inherits(BondMove, _BaseOperation);
  function BondMove(bondId, d) {
    var _this;
    _classCallCheck(this, BondMove);
    _this = _callSuper(this, BondMove, [OperationType.BOND_MOVE, OperationPriority.BOND_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      bid: bondId !== null && bondId !== void 0 ? bondId : null,
      d: d !== null && d !== void 0 ? d : null
    };
    return _this;
  }
  _createClass(BondMove, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        bid = _this$data.bid,
        d = _this$data.d;
      if (bid === null || !d) return;
      var bond = restruct.bonds.get(bid);
      if (!bond) return;
      bond.b.center.add_(d);
      var scaled = Scale.modelToCanvas(d, restruct.render.options);
      bond.visel.translate(scaled);
      this.data.d = d.negated();
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new BondMove();
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
  return BondMove;
}(BaseOperation);

export { BondMove };
//# sourceMappingURL=BondMove.modern.js.map
