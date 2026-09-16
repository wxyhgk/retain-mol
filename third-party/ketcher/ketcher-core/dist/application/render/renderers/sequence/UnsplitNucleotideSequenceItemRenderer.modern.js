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
import _inherits from '@babel/runtime/helpers/inherits';
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer.modern.js';
import { NO_NATURAL_ANALOGUE } from '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var UnsplitNucleotideSequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits(UnsplitNucleotideSequenceItemRenderer, _BaseSequenceItemRend);
  function UnsplitNucleotideSequenceItemRenderer() {
    _classCallCheck(this, UnsplitNucleotideSequenceItemRenderer);
    return _callSuper(this, UnsplitNucleotideSequenceItemRenderer, arguments);
  }
  _createClass(UnsplitNucleotideSequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      var naturalAnalogue = this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode;
      return naturalAnalogue && naturalAnalogue !== NO_NATURAL_ANALOGUE ? naturalAnalogue : NO_NATURAL_ANALOGUE;
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
      return undefined;
    }
  }]);
  return UnsplitNucleotideSequenceItemRenderer;
}(BaseSequenceItemRenderer);

export { UnsplitNucleotideSequenceItemRenderer };
//# sourceMappingURL=UnsplitNucleotideSequenceItemRenderer.modern.js.map
