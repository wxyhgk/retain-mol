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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseMonomerRenderer } from './BaseMonomerRenderer.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import { MONOMER_SYMBOLS_IDS } from './constants.modern.js';
import { monomerRendererFactory } from './monomerRendererFactory.modern.js';
import { EmptyMonomer } from '../../../domain/entities/EmptyMonomer.modern.js';
import { PreviewAttachmentPoint } from '../../../domain/PreviewAttachmentPoint.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';
import { createCircleHighlightPath, createDiamondHighlightPath } from './monomerHighlightShapes.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AmbiguousMonomerRenderer = function (_BaseMonomerRenderer) {
  _inherits(AmbiguousMonomerRenderer, _BaseMonomerRenderer);
  function AmbiguousMonomerRenderer(monomer, scale) {
    var _this;
    _classCallCheck(this, AmbiguousMonomerRenderer);
    var monomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
    var monomerSymbolElementsIds = MONOMER_SYMBOLS_IDS[monomerClass];
    _this = _callSuper(this, AmbiguousMonomerRenderer, [monomer, monomerSymbolElementsIds.hover, monomerSymbolElementsIds.body, monomerSymbolElementsIds.autochainPreview, scale]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerRenderer", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerSymbolElementsIds", void 0);
    _this.monomer = monomer;
    var _monomerRendererFacto = monomerRendererFactory(_this.monomer.monomers[0].monomerItem),
      _monomerRendererFacto2 = _slicedToArray(_monomerRendererFacto, 2),
      MonomerRenderer = _monomerRendererFacto2[1];
    _this.monomerRenderer = new MonomerRenderer(new EmptyMonomer());
    _this.monomerSymbolElementsIds = monomerSymbolElementsIds;
    _this.CHAIN_START_TERMINAL_INDICATOR_TEXT = _this.monomerRenderer.CHAIN_START_TERMINAL_INDICATOR_TEXT;
    _this.CHAIN_END_TERMINAL_INDICATOR_TEXT = _this.monomerRenderer.CHAIN_END_TERMINAL_INDICATOR_TEXT;
    return _this;
  }
  _createClass(AmbiguousMonomerRenderer, [{
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
      var monomerClass = AmbiguousMonomer.getMonomerClass(this.monomer.monomers);
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      if (monomerClass === KetMonomerClass.Phosphate) {
        return createCircleHighlightPath(this.center, Math.min(width, height) / 2, offset);
      }
      if (monomerClass === KetMonomerClass.Base) {
        return createDiamondHighlightPath(this.center, Math.min(width, height), offset);
      }
      return _get(_getPrototypeOf(AmbiguousMonomerRenderer.prototype), "getHighlightPath", this).call(this, offset);
    }
  }, {
    key: "appendNumberOfMonomers",
    value: function appendNumberOfMonomers() {
      var _this$rootElement;
      var isMonomersAmountTenOrMore = this.monomer.monomers.length >= 10;
      var numberOfMonomersElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('g').attr('transform', "translate(".concat(this.center.x - this.scaledMonomerPosition.x - (isMonomersAmountTenOrMore ? 2 : 0), ", ").concat(this.center.y - this.scaledMonomerPosition.y + (this.monomer.monomerClass === KetMonomerClass.Base ? 7 : 8), ")")).attr('pointer-events', 'none');
      numberOfMonomersElement === null || numberOfMonomersElement === void 0 || numberOfMonomersElement.append('foreignObject').attr('width', '20px').attr('height', '20px').attr('x', isMonomersAmountTenOrMore ? '-3' : '-4').attr('y', '-4').append('xhtml:div').attr('style', "\n        width: ".concat(isMonomersAmountTenOrMore ? '10px' : '8px', ";\n        height: 8px;\n        border-radius: ").concat(isMonomersAmountTenOrMore ? '20px' : '50%', ";\n        border: 0.5px solid #cceaee;\n      "));
      numberOfMonomersElement === null || numberOfMonomersElement === void 0 || numberOfMonomersElement.append('text').attr('x', -1.6).attr('y', 2.1).attr('font-size', '6px').attr('font-weight', 300).text(this.monomer.monomers.length);
      this.raiseAttachmentPoints();
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get(_getPrototypeOf(AmbiguousMonomerRenderer.prototype), "show", this).call(this, theme);
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
      return new PreviewAttachmentPoint(_objectSpread(_objectSpread({}, attachmentPointParams), {}, {
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
        case KetMonomerClass.AminoAcid:
          return {
            backgroundId: '#modified-background',
            requiresFill: true
          };
        case KetMonomerClass.Base:
          return {
            backgroundId: '#rna-base-modified-background'
          };
        case KetMonomerClass.Sugar:
          return {
            backgroundId: '#sugar-modified-background',
            requiresFill: true
          };
        case KetMonomerClass.Phosphate:
          return {
            backgroundId: '#phosphate-modified-background'
          };
        default:
          return undefined;
      }
    }
  }]);
  return AmbiguousMonomerRenderer;
}(BaseMonomerRenderer);

export { AmbiguousMonomerRenderer };
//# sourceMappingURL=AmbiguousMonomerRenderer.modern.js.map
