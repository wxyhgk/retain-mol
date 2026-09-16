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
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');
var AmbiguousMonomer = require('../../../../domain/entities/AmbiguousMonomer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RNASequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits__default["default"](RNASequenceItemRenderer, _BaseSequenceItemRend);
  function RNASequenceItemRenderer(node, _firstNodeInChainPosition, _monomerIndexInChain, _isLastMonomerInChain, _chain, _nodeIndexOverall, _editingNodeIndexOverall, monomerSize, scaledMonomerPosition, _twoStrandedNode) {
    var _this;
    var _previousRowsWithAntisense = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    _classCallCheck__default["default"](this, RNASequenceItemRenderer);
    _this = _callSuper(this, RNASequenceItemRenderer, [node, _firstNodeInChainPosition, _monomerIndexInChain, _isLastMonomerInChain, _chain, _nodeIndexOverall, _editingNodeIndexOverall, monomerSize, scaledMonomerPosition, _twoStrandedNode, _previousRowsWithAntisense]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "node", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerSize", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "scaledMonomerPosition", void 0);
    _this.node = node;
    _this.monomerSize = monomerSize;
    _this.scaledMonomerPosition = scaledMonomerPosition;
    return _this;
  }
  _createClass__default["default"](RNASequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      var _this$node$rnaBase$mo;
      return this.node.rnaBase instanceof AmbiguousMonomer.AmbiguousMonomer ? this.node.rnaBase.label : ((_this$node$rnaBase$mo = this.node.rnaBase.monomerItem) === null || _this$node$rnaBase$mo === void 0 ? void 0 : _this$node$rnaBase$mo.props.MonomerNaturalAnalogCode) || '@';
    }
  }, {
    key: "drawCommonModification",
    value: function drawCommonModification(node) {
      if (node.rnaBase.isModification) {
        var _this$backgroundEleme;
        var modificationFillColor = '#CAD3DD';
        if (this.node.monomer.selected) {
          modificationFillColor = this.isSequenceEditInRnaBuilderModeTurnedOn ? '#41A8B2' : '#3ACA6A';
        }
        (_this$backgroundEleme = this.backgroundElement) === null || _this$backgroundEleme === void 0 || _this$backgroundEleme.attr('fill', modificationFillColor);
      }
      if (node.sugar.isModification) {
        var _this$backgroundEleme2;
        (_this$backgroundEleme2 = this.backgroundElement) === null || _this$backgroundEleme2 === void 0 || _this$backgroundEleme2.attr('stroke', this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858').attr('stroke-width', '1px');
      }
    }
  }]);
  return RNASequenceItemRenderer;
}(BaseSequenceItemRenderer.BaseSequenceItemRenderer);

exports.RNASequenceItemRenderer = RNASequenceItemRenderer;
//# sourceMappingURL=RNASequenceItemRenderer.js.map
