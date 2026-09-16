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
import { Fragment } from '../../../domain/entities/fragment.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var EnhancedFlagMove = function (_BaseOperation) {
  _inherits(EnhancedFlagMove, _BaseOperation);
  function EnhancedFlagMove(fragmentId, p) {
    var _this;
    _classCallCheck(this, EnhancedFlagMove);
    _this = _callSuper(this, EnhancedFlagMove, [OperationType.ENHANCED_FLAG_MOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      frid: fragmentId,
      p: p
    };
    return _this;
  }
  _createClass(EnhancedFlagMove, [{
    key: "execute",
    value: function execute(restruct) {
      var frid = this.data.frid;
      var p = this.data.p;
      if (frid === undefined || p === undefined) return;
      var fragment = restruct.molecule.frags.get(frid);
      if (!fragment) return;
      var currentPosition = fragment.stereoFlagPosition ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y) : Fragment.getDefaultStereoFlagPosition(restruct.molecule, frid);
      if (!currentPosition) return;
      var newPosition = Vec2.sum(currentPosition, p);
      fragment.stereoFlagPosition = newPosition;
      this.data.p = p.negated();
      BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new EnhancedFlagMove();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var p = this.data.p;
      return (p === null || p === void 0 ? void 0 : p.x) === 0 && (p === null || p === void 0 ? void 0 : p.y) === 0;
    }
  }]);
  return EnhancedFlagMove;
}(BaseOperation);

export { EnhancedFlagMove };
//# sourceMappingURL=EnhancedFlagMove.modern.js.map
