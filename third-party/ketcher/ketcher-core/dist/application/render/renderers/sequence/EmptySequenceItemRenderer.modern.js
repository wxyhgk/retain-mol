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
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var EmptySequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits(EmptySequenceItemRenderer, _BaseSequenceItemRend);
  function EmptySequenceItemRenderer() {
    _classCallCheck(this, EmptySequenceItemRenderer);
    return _callSuper(this, EmptySequenceItemRenderer, arguments);
  }
  _createClass(EmptySequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      return '';
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$rootElement;
      this.rootElement = _get(_getPrototypeOf(EmptySequenceItemRenderer.prototype), "appendRootElement", this).call(this);
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.attr('data-symbol-type', 'Empty');
      return this.rootElement;
    }
  }]);
  return EmptySequenceItemRenderer;
}(BaseSequenceItemRenderer);

export { EmptySequenceItemRenderer };
//# sourceMappingURL=EmptySequenceItemRenderer.modern.js.map
