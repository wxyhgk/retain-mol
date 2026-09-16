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
var MultitailArrowAddTail = function (_BaseOperation) {
  _inherits(MultitailArrowAddTail, _BaseOperation);
  function MultitailArrowAddTail(itemId, tailId, coordinate) {
    var _this;
    _classCallCheck(this, MultitailArrowAddTail);
    _this = _callSuper(this, MultitailArrowAddTail, [OperationType.MULTITAIL_ARROW_ADD_TAIL]);
    _defineProperty(_assertThisInitialized(_this), "itemId", void 0);
    _defineProperty(_assertThisInitialized(_this), "tailId", void 0);
    _defineProperty(_assertThisInitialized(_this), "coordinate", void 0);
    _this.itemId = itemId;
    _this.tailId = tailId;
    _this.coordinate = coordinate;
    return _this;
  }
  _createClass(MultitailArrowAddTail, [{
    key: "execute",
    value: function execute(reStruct) {
      var reMultitailArrow = reStruct.multitailArrows.get(this.itemId);
      var multitailArrow = reStruct.molecule.multitailArrows.get(this.itemId);
      if (!reMultitailArrow || !multitailArrow) {
        return;
      }
      this.tailId = multitailArrow.addTail(this.tailId, this.coordinate);
      BaseOperation.invalidateItem(reStruct, 'multitailArrows', this.itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.tailId === undefined) {
        throw new Error('MultitailArrowAddTail.invert() called before execute()');
      }
      return new MultitailArrowRemoveTail(this.itemId, this.tailId);
    }
  }]);
  return MultitailArrowAddTail;
}(BaseOperation);
var MultitailArrowRemoveTail = function (_BaseOperation2) {
  _inherits(MultitailArrowRemoveTail, _BaseOperation2);
  function MultitailArrowRemoveTail(itemId, tailId) {
    var _this2;
    _classCallCheck(this, MultitailArrowRemoveTail);
    _this2 = _callSuper(this, MultitailArrowRemoveTail, [OperationType.MULTITAIL_ARROW_REMOVE_TAIL]);
    _defineProperty(_assertThisInitialized(_this2), "itemId", void 0);
    _defineProperty(_assertThisInitialized(_this2), "tailId", void 0);
    _defineProperty(_assertThisInitialized(_this2), "coordinate", void 0);
    _this2.itemId = itemId;
    _this2.tailId = tailId;
    return _this2;
  }
  _createClass(MultitailArrowRemoveTail, [{
    key: "execute",
    value: function execute(reStruct) {
      var reMultitailArrow = reStruct.multitailArrows.get(this.itemId);
      var multitailArrow = reStruct.molecule.multitailArrows.get(this.itemId);
      this.coordinate = multitailArrow === null || multitailArrow === void 0 ? void 0 : multitailArrow.getTailCoordinate(this.tailId);
      if (!reMultitailArrow || !multitailArrow || !this.coordinate) {
        return;
      }
      multitailArrow.removeTail(this.tailId);
      BaseOperation.invalidateItem(reStruct, 'multitailArrows', this.itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new MultitailArrowAddTail(this.itemId, this.tailId, this.coordinate);
    }
  }]);
  return MultitailArrowRemoveTail;
}(BaseOperation);

export { MultitailArrowAddTail, MultitailArrowRemoveTail };
//# sourceMappingURL=multitailArrowAddRemoveTail.modern.js.map
