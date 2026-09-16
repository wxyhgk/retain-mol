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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var DrawingEntity = require('./DrawingEntity.js');
var vec2 = require('./vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrow = function (_DrawingEntity) {
  _inherits__default["default"](RxnArrow, _DrawingEntity);
  function RxnArrow(type, startEndPosition, height, initiallySelected) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrow);
    _this = _callSuper(this, RxnArrow);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "type", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "startEndPosition", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "height", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "initiallySelected", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrowId", void 0);
    _this.type = type;
    _this.startEndPosition = startEndPosition;
    _this.height = height;
    _this.initiallySelected = initiallySelected;
    return _this;
  }
  _createClass__default["default"](RxnArrow, [{
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
      return new vec2.Vec2((this.startPosition.x + this.endPosition.x) / 2, (this.startPosition.y + this.endPosition.y) / 2);
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](RxnArrow.prototype), "setBaseRenderer", this).call(this, renderer);
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
      var delta = vec2.Vec2.diff(position, this.startPosition);
      this.moveRelative(delta);
    }
  }]);
  return RxnArrow;
}(DrawingEntity.DrawingEntity);

exports.RxnArrow = RxnArrow;
//# sourceMappingURL=CoreRxnArrow.js.map
