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
import { RNASequenceItemRenderer } from './RNASequenceItemRenderer.modern.js';
import { RNA_DNA_NON_MODIFIED_PART } from '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var NucleotideSequenceItemRenderer = function (_RNASequenceItemRende) {
  _inherits(NucleotideSequenceItemRenderer, _RNASequenceItemRende);
  function NucleotideSequenceItemRenderer() {
    var _this;
    _classCallCheck(this, NucleotideSequenceItemRenderer);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, NucleotideSequenceItemRenderer, [].concat(args));
    _defineProperty(_assertThisInitialized(_this), "phosphateModificationCircleElement", void 0);
    return _this;
  }
  _createClass(NucleotideSequenceItemRenderer, [{
    key: "drawModification",
    value: function drawModification() {
      var _node$phosphate;
      var node = this.node;
      this.drawCommonModification(node);
      if (this.phosphateModificationCircleElement) {
        this.phosphateModificationCircleElement.remove();
      }
      if ((_node$phosphate = node.phosphate) !== null && _node$phosphate !== void 0 && _node$phosphate.isModification) {
        var _this$rootElement;
        this.phosphateModificationCircleElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('circle').attr('r', '3px').attr('fill', this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858').attr('cx', '12').attr('cy', '-17');
      }
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$rootElement2;
      this.rootElement = _get(_getPrototypeOf(NucleotideSequenceItemRenderer.prototype), "appendRootElement", this).call(this);
      (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 || _this$rootElement2.attr('data-symbol-type', this.node.sugar.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA ? 'DNA' : 'RNA');
      return this.rootElement;
    }
  }]);
  return NucleotideSequenceItemRenderer;
}(RNASequenceItemRenderer);

export { NucleotideSequenceItemRenderer };
//# sourceMappingURL=NucleotideSequenceItemRenderer.modern.js.map
