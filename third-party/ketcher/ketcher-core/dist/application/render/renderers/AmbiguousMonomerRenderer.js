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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseMonomerRenderer = require('./BaseMonomerRenderer.js');
var AmbiguousMonomer = require('../../../domain/entities/AmbiguousMonomer.js');
var constants = require('./constants.js');
var monomerRendererFactory = require('./monomerRendererFactory.js');
var EmptyMonomer = require('../../../domain/entities/EmptyMonomer.js');
var PreviewAttachmentPoint = require('../../../domain/PreviewAttachmentPoint.js');
var monomers = require('../../../domain/constants/monomers.js');
var monomerHighlightShapes = require('./monomerHighlightShapes.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AmbiguousMonomerRenderer = function (_BaseMonomerRenderer) {
  _inherits__default["default"](AmbiguousMonomerRenderer, _BaseMonomerRenderer);
  function AmbiguousMonomerRenderer(monomer, scale) {
    var _this;
    _classCallCheck__default["default"](this, AmbiguousMonomerRenderer);
    var monomerClass = AmbiguousMonomer.AmbiguousMonomer.getMonomerClass(monomer.monomers);
    var monomerSymbolElementsIds = constants.MONOMER_SYMBOLS_IDS[monomerClass];
    _this = _callSuper(this, AmbiguousMonomerRenderer, [monomer, monomerSymbolElementsIds.hover, monomerSymbolElementsIds.body, monomerSymbolElementsIds.autochainPreview, scale]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerRenderer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerSymbolElementsIds", void 0);
    _this.monomer = monomer;
    var _monomerRendererFacto = monomerRendererFactory.monomerRendererFactory(_this.monomer.monomers[0].monomerItem),
      _monomerRendererFacto2 = _slicedToArray__default["default"](_monomerRendererFacto, 2),
      MonomerRenderer = _monomerRendererFacto2[1];
    _this.monomerRenderer = new MonomerRenderer(new EmptyMonomer.EmptyMonomer());
    _this.monomerSymbolElementsIds = monomerSymbolElementsIds;
    _this.CHAIN_START_TERMINAL_INDICATOR_TEXT = _this.monomerRenderer.CHAIN_START_TERMINAL_INDICATOR_TEXT;
    _this.CHAIN_END_TERMINAL_INDICATOR_TEXT = _this.monomerRenderer.CHAIN_END_TERMINAL_INDICATOR_TEXT;
    return _this;
  }
  _createClass__default["default"](AmbiguousMonomerRenderer, [{
    key: "appendBody",
    value: function appendBody(rootElement) {
      var _this$monomerSymbolEl;
      return rootElement.append('use').data([this]).attr('href', (_this$monomerSymbolEl = this.monomerSymbolElementsIds.variant) !== null && _this$monomerSymbolEl !== void 0 ? _this$monomerSymbolEl : this.monomerSymbolElementsIds.body).attr('fill', '#fff').attr('stroke', '#585858').attr('stroke-width', '1px').attr('paint-order', 'fill');
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return this.monomerRenderer.enumerationElementPosition;
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return this.monomerRenderer.beginningElementPosition;
    }
  }, {
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var monomerClass = AmbiguousMonomer.AmbiguousMonomer.getMonomerClass(this.monomer.monomers);
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      if (monomerClass === monomers.KetMonomerClass.Phosphate) {
        return monomerHighlightShapes.createCircleHighlightPath(this.center, Math.min(width, height) / 2, offset);
      }
      if (monomerClass === monomers.KetMonomerClass.Base) {
        return monomerHighlightShapes.createDiamondHighlightPath(this.center, Math.min(width, height), offset);
      }
      return _get__default["default"](_getPrototypeOf__default["default"](AmbiguousMonomerRenderer.prototype), "getHighlightPath", this).call(this, offset);
    }
  }, {
    key: "appendNumberOfMonomers",
    value: function appendNumberOfMonomers() {
      var _this$rootElement;
      var isMonomersAmountTenOrMore = this.monomer.monomers.length >= 10;
      var numberOfMonomersElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('g').attr('transform', "translate(".concat(this.center.x - this.scaledMonomerPosition.x - (isMonomersAmountTenOrMore ? 2 : 0), ", ").concat(this.center.y - this.scaledMonomerPosition.y + (this.monomer.monomerClass === monomers.KetMonomerClass.Base ? 7 : 8), ")")).attr('pointer-events', 'none');
      numberOfMonomersElement === null || numberOfMonomersElement === void 0 || numberOfMonomersElement.append('foreignObject').attr('width', '20px').attr('height', '20px').attr('x', isMonomersAmountTenOrMore ? '-3' : '-4').attr('y', '-4').append('xhtml:div').attr('style', "\n        width: ".concat(isMonomersAmountTenOrMore ? '10px' : '8px', ";\n        height: 8px;\n        border-radius: ").concat(isMonomersAmountTenOrMore ? '20px' : '50%', ";\n        border: 0.5px solid #cceaee;\n      "));
      numberOfMonomersElement === null || numberOfMonomersElement === void 0 || numberOfMonomersElement.append('text').attr('x', -1.6).attr('y', 2.1).attr('font-size', '6px').attr('font-weight', 300).text(this.monomer.monomers.length);
      this.raiseAttachmentPoints();
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get__default["default"](_getPrototypeOf__default["default"](AmbiguousMonomerRenderer.prototype), "show", this).call(this, theme);
      this.appendNumberOfMonomers();
      if (this.enumerationElementPosition) {
        this.appendEnumeration();
      }
    }
  }, {
    key: "appendPreviewAttachmentPoint",
    value: function appendPreviewAttachmentPoint(params, attachmentPointName, customAngle) {
      var _connectedAttachmentP;
      var selectedAttachmentPoint = params.selectedAttachmentPoint,
        connectedAttachmentPoints = params.connectedAttachmentPoints,
        usage = params.usage;
      var attachmentPointParams = this.prepareAttachmentPointsParams(attachmentPointName, customAngle);
      return new PreviewAttachmentPoint.PreviewAttachmentPoint(_objectSpread(_objectSpread({}, attachmentPointParams), {}, {
        connected: (_connectedAttachmentP = connectedAttachmentPoints === null || connectedAttachmentPoints === void 0 ? void 0 : connectedAttachmentPoints.includes(attachmentPointName)) !== null && _connectedAttachmentP !== void 0 ? _connectedAttachmentP : false,
        selected: selectedAttachmentPoint === attachmentPointName,
        usage: usage,
        canvas: params.canvas,
        applyZoomForPositionCalculation: false
      }));
    }
  }, {
    key: "showExternal",
    value: function showExternal(params) {
      var _this$bodyElement,
        _this2 = this;
      this.rootElement = this.appendRootElement(params.canvas);
      this.bodyElement = this.appendBody(this.rootElement);
      (_this$bodyElement = this.bodyElement) === null || _this$bodyElement === void 0 || _this$bodyElement.attr('data-testid', 'shape');
      this.appendLabel(this.rootElement);
      this.appendNumberOfMonomers();
      this.drawAttachmentPoints(function (attachmentPointName, customAngle) {
        return _this2.appendPreviewAttachmentPoint(params, attachmentPointName, customAngle);
      });
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      switch (this.monomer.monomerClass) {
        case monomers.KetMonomerClass.AminoAcid:
          return {
            backgroundId: '#modified-background',
            requiresFill: true
          };
        case monomers.KetMonomerClass.Base:
          return {
            backgroundId: '#rna-base-modified-background'
          };
        case monomers.KetMonomerClass.Sugar:
          return {
            backgroundId: '#sugar-modified-background',
            requiresFill: true
          };
        case monomers.KetMonomerClass.Phosphate:
          return {
            backgroundId: '#phosphate-modified-background'
          };
        default:
          return undefined;
      }
    }
  }]);
  return AmbiguousMonomerRenderer;
}(BaseMonomerRenderer.BaseMonomerRenderer);

exports.AmbiguousMonomerRenderer = AmbiguousMonomerRenderer;
//# sourceMappingURL=AmbiguousMonomerRenderer.js.map
