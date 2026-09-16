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
import { KetMonomerClass, RNA_DNA_NON_MODIFIED_PART } from '../../../domain/constants/monomers.modern.js';
import { createCircleHighlightPath } from './monomerHighlightShapes.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PHOSPHATE_HOVERED_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].hover;
var PHOSPHATE_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].body;
var PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].autochainPreview;
var PhosphateRenderer = function (_BaseMonomerRenderer) {
  _inherits(PhosphateRenderer, _BaseMonomerRenderer);
  function PhosphateRenderer(monomer, scale) {
    var _this;
    _classCallCheck(this, PhosphateRenderer);
    _this = _callSuper(this, PhosphateRenderer, [monomer, PHOSPHATE_HOVERED_ELEMENT_ID, PHOSPHATE_SYMBOL_ELEMENT_ID, PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _this.monomer = monomer;
    return _this;
  }
  _createClass(PhosphateRenderer, [{
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      return theme.monomer.color[RNA_DNA_NON_MODIFIED_PART.PHOSPHATE].regular;
    }
  }, {
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return createCircleHighlightPath(this.center, Math.min(width, height) / 2, offset);
    }
  }, {
    key: "textColor",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return '#fff';
      }
      return this.monomer.isModification ? '#fff' : '#333333';
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return undefined;
      }
      return {
        backgroundId: '#phosphate-modified-background'
      };
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      var isUnresolved = this.monomer.monomerItem.props.unresolved;
      var color = isUnresolved ? UNRESOLVED_MONOMER_COLOR : this.getMonomerColor(theme);
      return rootElement.append('use').data([this]).attr('href', PHOSPHATE_SYMBOL_ELEMENT_ID).attr('fill', color);
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get(_getPrototypeOf(PhosphateRenderer.prototype), "show", this).call(this, theme);
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
  }]);
  return PhosphateRenderer;
}(BaseMonomerRenderer);

export { PhosphateRenderer };
//# sourceMappingURL=PhosphateRenderer.modern.js.map
