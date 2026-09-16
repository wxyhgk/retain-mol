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
var Phosphate = require('../../../../domain/entities/Phosphate.js');
var monomers = require('../../../../domain/helpers/monomers.js');
var RNASequenceItemRenderer = require('./RNASequenceItemRenderer.js');
var monomers$1 = require('../../../../domain/constants/monomers.js');

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
var NucleosideSequenceItemRenderer = function (_RNASequenceItemRende) {
  _inherits__default["default"](NucleosideSequenceItemRenderer, _RNASequenceItemRende);
  function NucleosideSequenceItemRenderer() {
    var _this;
    _classCallCheck__default["default"](this, NucleosideSequenceItemRenderer);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, NucleosideSequenceItemRenderer, [].concat(args));
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "nucleosideCircleElement", void 0);
    return _this;
  }
  _createClass__default["default"](NucleosideSequenceItemRenderer, [{
    key: "drawModification",
    value: function drawModification() {
      var node = this.node;
      var nextNode = monomers.getNextMonomerInChain(node.sugar);
      this.drawCommonModification(node);
      if (this.nucleosideCircleElement) {
        this.nucleosideCircleElement.remove();
      }
      if (nextNode && !(nextNode instanceof Phosphate.Phosphate)) {
        var _this$rootElement;
        this.nucleosideCircleElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('circle').attr('r', '3px').attr('stroke', this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858').attr('stroke-width', '1px').attr('fill', 'none').attr('cx', '12').attr('cy', '-17');
      }
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$rootElement2;
      this.rootElement = _get__default["default"](_getPrototypeOf__default["default"](NucleosideSequenceItemRenderer.prototype), "appendRootElement", this).call(this);
      (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 || _this$rootElement2.attr('data-symbol-type', this.node.sugar.label === monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA ? 'DNA' : 'RNA');
      return this.rootElement;
    }
  }]);
  return NucleosideSequenceItemRenderer;
}(RNASequenceItemRenderer.RNASequenceItemRenderer);

exports.NucleosideSequenceItemRenderer = NucleosideSequenceItemRenderer;
//# sourceMappingURL=NucleosideSequenceItemRenderer.js.map
