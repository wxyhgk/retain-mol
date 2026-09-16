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
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import { MULTITAIL_ARROW_KEY } from '../../../../domain/constants/multitailArrow.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MultitailArrowResizeTailHead = function (_BaseOperation) {
  _inherits(MultitailArrowResizeTailHead, _BaseOperation);
  function MultitailArrowResizeTailHead(id, offset, isHead) {
    var _this;
    _classCallCheck(this, MultitailArrowResizeTailHead);
    _this = _callSuper(this, MultitailArrowResizeTailHead, [OperationType.MULTITAIL_ARROW_RESIZE_HEAD_TAIL]);
    _defineProperty(_assertThisInitialized(_this), "id", void 0);
    _defineProperty(_assertThisInitialized(_this), "offset", void 0);
    _defineProperty(_assertThisInitialized(_this), "isHead", void 0);
    _this.id = id;
    _this.offset = offset;
    _this.isHead = isHead;
    return _this;
  }
  _createClass(MultitailArrowResizeTailHead, [{
    key: "execute",
    value: function execute(reStruct) {
      var multitailArrow = reStruct.molecule.multitailArrows.get(this.id);
      if (!multitailArrow) {
        return;
      }
      this.offset = this.isHead ? multitailArrow.resizeHead(this.offset) : multitailArrow.resizeTails(this.offset);
      BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, this.id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new MultitailArrowResizeTailHead(this.id, -this.offset, this.isHead);
    }
  }]);
  return MultitailArrowResizeTailHead;
}(BaseOperation);

export { MultitailArrowResizeTailHead };
//# sourceMappingURL=multitailArrowResizeTailHead.modern.js.map
