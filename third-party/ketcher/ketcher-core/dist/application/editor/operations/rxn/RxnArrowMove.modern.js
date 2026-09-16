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
import { Scale } from '../../../../domain/helpers/scale.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrowMove = function (_Base) {
  _inherits(RxnArrowMove, _Base);
  function RxnArrowMove(id, d, noinvalidate) {
    var _this;
    _classCallCheck(this, RxnArrowMove);
    _this = _callSuper(this, RxnArrowMove, [OperationType.RXN_ARROW_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      id: id,
      d: d,
      noinvalidate: noinvalidate
    };
    return _this;
  }
  _createClass(RxnArrowMove, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      if (id === undefined || d === undefined) return;
      var item = struct.rxnArrows.get(id);
      if (!item) return;
      item.pos.forEach(function (p) {
        return p.add_(d);
      });
      var reItem = restruct.rxnArrows.get(id);
      if (!reItem) return;
      reItem.visel.translate(Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.invalidateItem(restruct, 'rxnArrows', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var move = new RxnArrowMove(this.data.id, this.data.d, this.data.noinvalidate);
      move.data = this.data;
      return move;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return (d === null || d === void 0 ? void 0 : d.x) === 0 && (d === null || d === void 0 ? void 0 : d.y) === 0;
    }
  }]);
  return RxnArrowMove;
}(BaseOperation);

export { RxnArrowMove };
//# sourceMappingURL=RxnArrowMove.modern.js.map
