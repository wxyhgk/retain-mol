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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { clamp } from 'lodash';
import { Scrollbar } from './scrollbar.modern.js';
import { getUserFriendlyScrollOffset, getZoomedValue, getUserFriendlyViewBoxDelta } from './utils.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _scrollOffset = new WeakMap();
var HorizontalScrollbar = function (_Scrollbar) {
  _inherits(HorizontalScrollbar, _Scrollbar);
  function HorizontalScrollbar(render, scrollOffset) {
    var _this;
    _classCallCheck(this, HorizontalScrollbar);
    _this = _callSuper(this, HorizontalScrollbar, [render]);
    _classPrivateFieldInitSpec(_assertThisInitialized(_this), _scrollOffset, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(_assertThisInitialized(_this), _scrollOffset, scrollOffset);
    return _this;
  }
  _createClass(HorizontalScrollbar, [{
    key: "hasOffset",
    value: function hasOffset() {
      return _classPrivateFieldGet(this, _scrollOffset).hasHorizontalOffset();
    }
  }, {
    key: "getDynamicAttr",
    value: function getDynamicAttr() {
      var minX = this.render.viewBox.minX + clamp(getUserFriendlyScrollOffset(_classPrivateFieldGet(this, _scrollOffset).left), getZoomedValue(this.MARGIN, this.render.options), this.render.viewBox.width - getZoomedValue(this.MIN_LENGTH + this.MARGIN, this.render.options));
      var minY = this.render.viewBox.minY + this.render.viewBox.height - getZoomedValue(this.DIST_TO_EDGE, this.render.options);
      var maxX = this.render.viewBox.minX + this.render.viewBox.width - clamp(getUserFriendlyScrollOffset(_classPrivateFieldGet(this, _scrollOffset).right), getZoomedValue(this.MARGIN, this.render.options), this.render.viewBox.width);
      var length = Math.max(maxX - minX, getZoomedValue(this.MIN_LENGTH, this.render.options));
      return {
        x: minX,
        y: minY,
        width: length,
        height: getZoomedValue(this.WIDTH, this.render.options),
        r: getZoomedValue(this.RADIUS, this.render.options)
      };
    }
  }, {
    key: "onDragMove",
    value: function onDragMove(dx, _dy, _x, _y, _event) {
      if (!this.viewBoxBeforeDrag) {
        return;
      }
      this.render.setViewBox(_objectSpread(_objectSpread({}, this.viewBoxBeforeDrag), {}, {
        minX: this.viewBoxBeforeDrag.minX + getUserFriendlyViewBoxDelta(dx)
      }));
    }
  }]);
  return HorizontalScrollbar;
}(Scrollbar);

export { HorizontalScrollbar };
//# sourceMappingURL=scrollbar-horizontal.modern.js.map
