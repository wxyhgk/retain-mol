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
import { MONOMER_SYMBOLS_IDS } from './constants.modern.js';
import '../../formatters/types/ket.modern.js';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CHEM_HOVERED_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].hover;
var CHEM_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].body;
var CHEM_AUTOCHAIN_PREVIEW_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].autochainPreview;
var ChemRenderer = function (_BaseMonomerRenderer) {
  _inherits(ChemRenderer, _BaseMonomerRenderer);
  function ChemRenderer(monomer, scale) {
    var _this;
    _classCallCheck(this, ChemRenderer);
    _this = _callSuper(this, ChemRenderer, [monomer, CHEM_HOVERED_ELEMENT_ID, CHEM_SYMBOL_ELEMENT_ID, CHEM_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _this.monomer = monomer;
    return _this;
  }
  _createClass(ChemRenderer, [{
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      return rootElement.append('use').data([this]).attr('href', CHEM_SYMBOL_ELEMENT_ID).attr('fill', '#F5F6F7').attr('stroke', theme.monomer.color.CHEM.regular);
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return undefined;
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return undefined;
    }
  }, {
    key: "show",
    value: function show(theme) {
      if (this.monomer.monomerItem.props.isMicromoleculeFragment && !isMonomerSgroupWithAttachmentPoints(this.monomer)) {
        return;
      }
      _get(_getPrototypeOf(ChemRenderer.prototype), "show", this).call(this, theme);
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      return undefined;
    }
  }]);
  return ChemRenderer;
}(BaseMonomerRenderer);

export { ChemRenderer };
//# sourceMappingURL=ChemRenderer.modern.js.map
