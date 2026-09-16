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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseMonomerRenderer } from './BaseMonomerRenderer.modern.js';
import { MONOMER_SYMBOLS_IDS, UNRESOLVED_MONOMER_COLOR } from './constants.modern.js';
import '../../formatters/types/ket.modern.js';
import { createNucleotideHighlightPath } from './monomerHighlightShapes.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var NUCLEOTIDE_HOVERED_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.RNA].hover;
var NUCLEOTIDE_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.RNA].body;
var NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.RNA].autochainPreview;
var UnsplitNucleotideRenderer = function (_BaseMonomerRenderer) {
  _inherits(UnsplitNucleotideRenderer, _BaseMonomerRenderer);
  function UnsplitNucleotideRenderer(monomer, scale) {
    var _this;
    _classCallCheck(this, UnsplitNucleotideRenderer);
    _this = _callSuper(this, UnsplitNucleotideRenderer, [monomer, NUCLEOTIDE_HOVERED_ELEMENT_ID, NUCLEOTIDE_SYMBOL_ELEMENT_ID, NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", '’5');
    _defineProperty(_assertThisInitialized(_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", '’3');
    _this.monomer = monomer;
    return _this;
  }
  _createClass(UnsplitNucleotideRenderer, [{
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return createNucleotideHighlightPath(this.center, width, height, offset);
    }
  }, {
    key: "textColor",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return 'white';
      }
      return _get(_getPrototypeOf(UnsplitNucleotideRenderer.prototype), "textColor", this);
    }
  }, {
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      if (this.monomer.monomerItem.props.unresolved) {
        return UNRESOLVED_MONOMER_COLOR;
      }
      return _get(_getPrototypeOf(UnsplitNucleotideRenderer.prototype), "getMonomerColor", this).call(this, theme);
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      return rootElement.append('use').data([this]).attr('href', NUCLEOTIDE_SYMBOL_ELEMENT_ID).attr('fill', this.getMonomerColor(theme));
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get(_getPrototypeOf(UnsplitNucleotideRenderer.prototype), "show", this).call(this, theme);
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
}(BaseMonomerRenderer);

export { UnsplitNucleotideRenderer };
//# sourceMappingURL=UnsplitNucleotideRenderer.modern.js.map
