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
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var LoopMove = function (_BaseOperation) {
  _inherits(LoopMove, _BaseOperation);
  function LoopMove(id, d) {
    var _this;
    _classCallCheck(this, LoopMove);
    _this = _callSuper(this, LoopMove, [OperationType.LOOP_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      id: id,
      d: d
    };
    return _this;
  }
  _createClass(LoopMove, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        id = _this$data.id,
        d = _this$data.d;
      if (id === undefined || d === undefined) return;
      var reloop = restruct.reloops.get(id);
      if (reloop !== null && reloop !== void 0 && reloop.visel) {
        var scaled = Scale.modelToCanvas(d, restruct.render.options);
        reloop.visel.translate(scaled);
      }
      this.data.d = d.negated();
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new LoopMove();
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
  return LoopMove;
}(BaseOperation);

export { LoopMove };
//# sourceMappingURL=LoopMove.modern.js.map
