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
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer.modern.js';
import { AmbiguousMonomer } from '../../../../domain/entities/AmbiguousMonomer.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RNASequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits(RNASequenceItemRenderer, _BaseSequenceItemRend);
  function RNASequenceItemRenderer(node, _firstNodeInChainPosition, _monomerIndexInChain, _isLastMonomerInChain, _chain, _nodeIndexOverall, _editingNodeIndexOverall, monomerSize, scaledMonomerPosition, _twoStrandedNode) {
    var _this;
    var _previousRowsWithAntisense = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    _classCallCheck(this, RNASequenceItemRenderer);
    _this = _callSuper(this, RNASequenceItemRenderer, [node, _firstNodeInChainPosition, _monomerIndexInChain, _isLastMonomerInChain, _chain, _nodeIndexOverall, _editingNodeIndexOverall, monomerSize, scaledMonomerPosition, _twoStrandedNode, _previousRowsWithAntisense]);
    _defineProperty(_assertThisInitialized(_this), "node", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerSize", void 0);
    _defineProperty(_assertThisInitialized(_this), "scaledMonomerPosition", void 0);
    _this.node = node;
    _this.monomerSize = monomerSize;
    _this.scaledMonomerPosition = scaledMonomerPosition;
    return _this;
  }
  _createClass(RNASequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      var _this$node$rnaBase$mo;
      return this.node.rnaBase instanceof AmbiguousMonomer ? this.node.rnaBase.label : ((_this$node$rnaBase$mo = this.node.rnaBase.monomerItem) === null || _this$node$rnaBase$mo === void 0 ? void 0 : _this$node$rnaBase$mo.props.MonomerNaturalAnalogCode) || '@';
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
}(BaseSequenceItemRenderer);

export { RNASequenceItemRenderer };
//# sourceMappingURL=RNASequenceItemRenderer.modern.js.map
