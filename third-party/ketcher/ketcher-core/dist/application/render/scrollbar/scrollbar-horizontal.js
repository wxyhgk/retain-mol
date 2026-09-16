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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _ = require('lodash');
var scrollbar = require('./scrollbar.js');
var utils = require('./utils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _scrollOffset = new WeakMap();
var HorizontalScrollbar = function (_Scrollbar) {
  _inherits__default["default"](HorizontalScrollbar, _Scrollbar);
  function HorizontalScrollbar(render, scrollOffset) {
    var _this;
    _classCallCheck__default["default"](this, HorizontalScrollbar);
    _this = _callSuper(this, HorizontalScrollbar, [render]);
    _classPrivateFieldInitSpec(_assertThisInitialized__default["default"](_this), _scrollOffset, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet__default["default"](_assertThisInitialized__default["default"](_this), _scrollOffset, scrollOffset);
    return _this;
  }
  _createClass__default["default"](HorizontalScrollbar, [{
    key: "hasOffset",
    value: function hasOffset() {
      return _classPrivateFieldGet__default["default"](this, _scrollOffset).hasHorizontalOffset();
    }
  }, {
    key: "getDynamicAttr",
    value: function getDynamicAttr() {
      var minX = this.render.viewBox.minX + _.clamp(utils.getUserFriendlyScrollOffset(_classPrivateFieldGet__default["default"](this, _scrollOffset).left), utils.getZoomedValue(this.MARGIN, this.render.options), this.render.viewBox.width - utils.getZoomedValue(this.MIN_LENGTH + this.MARGIN, this.render.options));
      var minY = this.render.viewBox.minY + this.render.viewBox.height - utils.getZoomedValue(this.DIST_TO_EDGE, this.render.options);
      var maxX = this.render.viewBox.minX + this.render.viewBox.width - _.clamp(utils.getUserFriendlyScrollOffset(_classPrivateFieldGet__default["default"](this, _scrollOffset).right), utils.getZoomedValue(this.MARGIN, this.render.options), this.render.viewBox.width);
      var length = Math.max(maxX - minX, utils.getZoomedValue(this.MIN_LENGTH, this.render.options));
      return {
        x: minX,
        y: minY,
        width: length,
        height: utils.getZoomedValue(this.WIDTH, this.render.options),
        r: utils.getZoomedValue(this.RADIUS, this.render.options)
      };
    }
  }, {
    key: "onDragMove",
    value: function onDragMove(dx, _dy, _x, _y, _event) {
      if (!this.viewBoxBeforeDrag) {
        return;
      }
      this.render.setViewBox(_objectSpread(_objectSpread({}, this.viewBoxBeforeDrag), {}, {
        minX: this.viewBoxBeforeDrag.minX + utils.getUserFriendlyViewBoxDelta(dx)
      }));
    }
  }]);
  return HorizontalScrollbar;
}(scrollbar.Scrollbar);

exports.HorizontalScrollbar = HorizontalScrollbar;
//# sourceMappingURL=scrollbar-horizontal.js.map
