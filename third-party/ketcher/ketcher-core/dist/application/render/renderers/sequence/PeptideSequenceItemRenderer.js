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
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _NO_ANALOGUE_SYMBOL = new WeakMap();
var PeptideSequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits__default["default"](PeptideSequenceItemRenderer, _BaseSequenceItemRend);
  function PeptideSequenceItemRenderer() {
    var _this;
    _classCallCheck__default["default"](this, PeptideSequenceItemRenderer);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, PeptideSequenceItemRenderer, [].concat(args));
    _classPrivateFieldInitSpec(_assertThisInitialized__default["default"](_this), _NO_ANALOGUE_SYMBOL, {
      writable: true,
      value: '@'
    });
    return _this;
  }
  _createClass__default["default"](PeptideSequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      return this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode || _classPrivateFieldGet__default["default"](this, _NO_ANALOGUE_SYMBOL);
    }
  }, {
    key: "drawLine",
    value: function drawLine() {
      var _this$rootElement;
      var TEXT_COLOR = '#333333';
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.append('path').attr('d', 'M 0,3 L 12,3').attr('stroke', TEXT_COLOR).attr('stroke-linecap', 'round').attr('stroke-width', '1.7px');
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
      var isAsparticAcidWithDifferentR3 = this.node.monomer.monomerItem.label === 'D*';
      if (isAsparticAcidWithDifferentR3) return;
      if (this.symbolToDisplay === _classPrivateFieldGet__default["default"](this, _NO_ANALOGUE_SYMBOL)) return;
      this.drawLine();
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$rootElement2;
      this.rootElement = _get__default["default"](_getPrototypeOf__default["default"](PeptideSequenceItemRenderer.prototype), "appendRootElement", this).call(this);
      (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 || _this$rootElement2.attr('data-symbol-type', 'Peptide');
      return this.rootElement;
    }
  }]);
  return PeptideSequenceItemRenderer;
}(BaseSequenceItemRenderer.BaseSequenceItemRenderer);

exports.PeptideSequenceItemRenderer = PeptideSequenceItemRenderer;
//# sourceMappingURL=PeptideSequenceItemRenderer.js.map
