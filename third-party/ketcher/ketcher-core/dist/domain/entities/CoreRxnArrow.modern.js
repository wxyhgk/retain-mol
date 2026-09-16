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
import { Vec2 } from './vec2.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrow = function (_DrawingEntity) {
  _inherits(RxnArrow, _DrawingEntity);
  function RxnArrow(type, startEndPosition, height, initiallySelected) {
    var _this;
    _classCallCheck(this, RxnArrow);
    _this = _callSuper(this, RxnArrow);
    _defineProperty(_assertThisInitialized(_this), "type", void 0);
    _defineProperty(_assertThisInitialized(_this), "startEndPosition", void 0);
    _defineProperty(_assertThisInitialized(_this), "height", void 0);
    _defineProperty(_assertThisInitialized(_this), "initiallySelected", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _defineProperty(_assertThisInitialized(_this), "arrowId", void 0);
    _this.type = type;
    _this.startEndPosition = startEndPosition;
    _this.height = height;
    _this.initiallySelected = initiallySelected;
    return _this;
  }
  _createClass(RxnArrow, [{
    key: "startPosition",
    get: function get() {
      return this.startEndPosition[0];
    },
    set: function set(newStartPosition) {
      this.startEndPosition[0] = newStartPosition;
    }
  }, {
    key: "endPosition",
    get: function get() {
      return this.startEndPosition[1];
    },
    set: function set(newEndPosition) {
      this.startEndPosition[1] = newEndPosition;
    }
  }, {
    key: "center",
    get: function get() {
      return new Vec2((this.startPosition.x + this.endPosition.x) / 2, (this.startPosition.y + this.endPosition.y) / 2);
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(RxnArrow.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "moveRelative",
    value: function moveRelative(delta) {
      this.startPosition = this.startPosition.add(delta);
      this.endPosition = this.endPosition.add(delta);
    }
  }, {
    key: "moveAbsolute",
    value: function moveAbsolute(position) {
      var delta = Vec2.diff(position, this.startPosition);
      this.moveRelative(delta);
    }
  }]);
  return RxnArrow;
}(DrawingEntity);

export { RxnArrow };
//# sourceMappingURL=CoreRxnArrow.modern.js.map
