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
import { OperationType } from '../OperationType.modern.js';
import { Scale } from '../../../../domain/helpers/scale.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MultitailArrowMove = function (_BaseOperation) {
  _inherits(MultitailArrowMove, _BaseOperation);
  function MultitailArrowMove(id, offset) {
    var _this;
    _classCallCheck(this, MultitailArrowMove);
    _this = _callSuper(this, MultitailArrowMove, [OperationType.MULTITAIL_ARROW_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "id", void 0);
    _defineProperty(_assertThisInitialized(_this), "offset", void 0);
    _this.id = id;
    _this.offset = offset;
    return _this;
  }
  _createClass(MultitailArrowMove, [{
    key: "execute",
    value: function execute(reStruct) {
      var renderItem = reStruct.multitailArrows.get(this.id);
      var item = reStruct.molecule.multitailArrows.get(this.id);
      if (!item || !renderItem) {
        return;
      }
      var scaledOffset = Scale.modelToCanvas(this.offset, reStruct.render.options);
      renderItem.visel.translate(scaledOffset);
      item.move(this.offset);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new MultitailArrowMove(this.id, this.offset.negated());
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.offset.x === 0 && this.offset.y === 0;
    }
  }]);
  return MultitailArrowMove;
}(BaseOperation);

export { MultitailArrowMove };
//# sourceMappingURL=multitailArrowMove.modern.js.map
