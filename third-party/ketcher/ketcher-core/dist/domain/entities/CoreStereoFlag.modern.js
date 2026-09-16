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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { DrawingEntity } from './DrawingEntity.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CoreStereoFlag = function (_DrawingEntity) {
  _inherits(CoreStereoFlag, _DrawingEntity);
  function CoreStereoFlag(position, flagType, relatedMonomer) {
    var _this;
    _classCallCheck(this, CoreStereoFlag);
    _this = _callSuper(this, CoreStereoFlag, [position]);
    _defineProperty(_assertThisInitialized(_this), "flagType", void 0);
    _defineProperty(_assertThisInitialized(_this), "relatedMonomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _this.flagType = flagType;
    _this.relatedMonomer = relatedMonomer;
    return _this;
  }
  _createClass(CoreStereoFlag, [{
    key: "center",
    get: function get() {
      return this.position;
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(CoreStereoFlag.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }]);
  return CoreStereoFlag;
}(DrawingEntity);

export { CoreStereoFlag };
//# sourceMappingURL=CoreStereoFlag.modern.js.map
