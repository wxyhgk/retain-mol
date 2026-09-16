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
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PhosphateSequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits__default["default"](PhosphateSequenceItemRenderer, _BaseSequenceItemRend);
  function PhosphateSequenceItemRenderer() {
    _classCallCheck__default["default"](this, PhosphateSequenceItemRenderer);
    return _callSuper(this, PhosphateSequenceItemRenderer, arguments);
  }
  _createClass__default["default"](PhosphateSequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      return 'p';
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$rootElement;
      this.rootElement = _get__default["default"](_getPrototypeOf__default["default"](PhosphateSequenceItemRenderer.prototype), "appendRootElement", this).call(this);
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.attr('data-symbol-type', 'Phosphate');
      return this.rootElement;
    }
  }]);
  return PhosphateSequenceItemRenderer;
}(BaseSequenceItemRenderer.BaseSequenceItemRenderer);

exports.PhosphateSequenceItemRenderer = PhosphateSequenceItemRenderer;
//# sourceMappingURL=PhosphateSequenceItemRenderer.js.map
