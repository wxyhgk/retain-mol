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
var BaseMonomerRenderer = require('./BaseMonomerRenderer.js');
var constants = require('./constants.js');
require('../../formatters/types/ket.js');
var monomerHighlightShapes = require('./monomerHighlightShapes.js');
var monomers = require('../../../domain/constants/monomers.js');

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
var NUCLEOTIDE_HOVERED_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.RNA].hover;
var NUCLEOTIDE_SYMBOL_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.RNA].body;
var NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.RNA].autochainPreview;
var UnsplitNucleotideRenderer = function (_BaseMonomerRenderer) {
  _inherits__default["default"](UnsplitNucleotideRenderer, _BaseMonomerRenderer);
  function UnsplitNucleotideRenderer(monomer, scale) {
    var _this;
    _classCallCheck__default["default"](this, UnsplitNucleotideRenderer);
    _this = _callSuper(this, UnsplitNucleotideRenderer, [monomer, NUCLEOTIDE_HOVERED_ELEMENT_ID, NUCLEOTIDE_SYMBOL_ELEMENT_ID, NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", '’5');
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", '’3');
    _this.monomer = monomer;
    return _this;
  }
  _createClass__default["default"](UnsplitNucleotideRenderer, [{
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return monomerHighlightShapes.createNucleotideHighlightPath(this.center, width, height, offset);
    }
  }, {
    key: "textColor",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return 'white';
      }
      return _get__default["default"](_getPrototypeOf__default["default"](UnsplitNucleotideRenderer.prototype), "textColor", this);
    }
  }, {
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      if (this.monomer.monomerItem.props.unresolved) {
        return constants.UNRESOLVED_MONOMER_COLOR;
      }
      return _get__default["default"](_getPrototypeOf__default["default"](UnsplitNucleotideRenderer.prototype), "getMonomerColor", this).call(this, theme);
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      return rootElement.append('use').data([this]).attr('href', NUCLEOTIDE_SYMBOL_ELEMENT_ID).attr('fill', this.getMonomerColor(theme));
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get__default["default"](_getPrototypeOf__default["default"](UnsplitNucleotideRenderer.prototype), "show", this).call(this, theme);
      this.appendEnumeration();
    }
  }, {
    key: "appendLabel",
    value: function appendLabel(rootElement) {
      var fontSize = 6;
      var Y_OFFSET_FROM_MIDDLE = -2;
      var foreignObject = rootElement.append('foreignObject').attr('width', this.width).attr('height', this.height - this.height / 3).attr('font-size', "".concat(fontSize, "px")).attr('line-height', "".concat(fontSize, "px")).attr('font-weight', '700').style('cursor', 'pointer').style('user-select', 'none').attr('pointer-events', 'none').attr('x', '4px').attr('y', this.height / 2 + Y_OFFSET_FROM_MIDDLE);
      foreignObject.append('xhtml:div').style('padding', '0 4px').style('text-align', 'center').style('color', this.textColor).style('display', 'flex').style('height', '100%').style('align-items', 'center').style('justify-content', 'center').text(this.monomer.label);
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return {
        x: 7,
        y: 7
      };
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return {
        x: 0,
        y: 15
      };
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      return undefined;
    }
  }]);
  return UnsplitNucleotideRenderer;
}(BaseMonomerRenderer.BaseMonomerRenderer);

exports.UnsplitNucleotideRenderer = UnsplitNucleotideRenderer;
//# sourceMappingURL=UnsplitNucleotideRenderer.js.map
