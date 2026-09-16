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
import { createHexagonHighlightPath } from './monomerHighlightShapes.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PEPTIDE_HOVERED_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].hover;
var PEPTIDE_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].body;
var PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].autochainPreview;
var PeptideRenderer = function (_BaseMonomerRenderer) {
  _inherits(PeptideRenderer, _BaseMonomerRenderer);
  function PeptideRenderer(monomer, scale) {
    var _this;
    _classCallCheck(this, PeptideRenderer);
    _this = _callSuper(this, PeptideRenderer, [monomer, PEPTIDE_HOVERED_ELEMENT_ID, PEPTIDE_SYMBOL_ELEMENT_ID, PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", 'N');
    _defineProperty(_assertThisInitialized(_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", 'C');
    _this.monomer = monomer;
    return _this;
  }
  _createClass(PeptideRenderer, [{
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return createHexagonHighlightPath(this.center, width, height, offset);
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return undefined;
      }
      return {
        backgroundId: '#modified-background',
        requiresFill: true
      };
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      var isUnresolved = this.monomer.monomerItem.props.unresolved;
      var color;
      if (isUnresolved) {
        color = UNRESOLVED_MONOMER_COLOR;
      } else {
        var _this$monomer$monomer;
        var isPeptide = ((_this$monomer$monomer = this.monomer.monomerItem.props) === null || _this$monomer$monomer === void 0 ? void 0 : _this$monomer$monomer.MonomerType) === 'PEPTIDE';
        color = isPeptide ? this.getPeptideColor(theme) : this.getMonomerColor(theme);
      }
      return rootElement.append('use').data([this]).attr('href', PEPTIDE_SYMBOL_ELEMENT_ID).attr('fill', color);
    }
  }, {
    key: "textColor",
    get: function get() {
      var _peptideColorsMap$mon;
      var LIGHT_COLOR = 'white';
      var DARK_COLOR = '#333333';
      if (this.monomer.monomerItem.props.unresolved) {
        return LIGHT_COLOR;
      }
      var peptideColorsMap = {
        D: DARK_COLOR,
        E: LIGHT_COLOR,
        K: DARK_COLOR,
        H: LIGHT_COLOR,
        O: LIGHT_COLOR,
        R: LIGHT_COLOR,
        Q: DARK_COLOR,
        Y: LIGHT_COLOR,
        U: DARK_COLOR,
        S: LIGHT_COLOR,
        C: LIGHT_COLOR,
        N: LIGHT_COLOR,
        T: LIGHT_COLOR,
        L: DARK_COLOR,
        I: LIGHT_COLOR,
        F: LIGHT_COLOR,
        A: LIGHT_COLOR,
        W: DARK_COLOR,
        P: DARK_COLOR,
        G: DARK_COLOR,
        M: DARK_COLOR,
        V: DARK_COLOR
      };
      var monomerCode = this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
      var baseColor = (_peptideColorsMap$mon = peptideColorsMap[monomerCode]) !== null && _peptideColorsMap$mon !== void 0 ? _peptideColorsMap$mon : _get(_getPrototypeOf(PeptideRenderer.prototype), "textColor", this);
      if (this.monomer.isModification) {
        baseColor = baseColor === LIGHT_COLOR ? DARK_COLOR : LIGHT_COLOR;
      }
      return baseColor;
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get(_getPrototypeOf(PeptideRenderer.prototype), "show", this).call(this, theme);
      this.appendEnumeration();
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return {
        x: 10,
        y: -1
      };
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return {
        x: -6,
        y: 10
      };
    }
  }]);
  return PeptideRenderer;
}(BaseMonomerRenderer);

export { PeptideRenderer };
//# sourceMappingURL=PeptideRenderer.modern.js.map
