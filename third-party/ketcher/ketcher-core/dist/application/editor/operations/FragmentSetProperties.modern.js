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
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FragmentSetProperties = function (_BaseOperation) {
  _inherits(FragmentSetProperties, _BaseOperation);
  function FragmentSetProperties(fragmentId, properties) {
    var _this;
    _classCallCheck(this, FragmentSetProperties);
    _this = _callSuper(this, FragmentSetProperties, [OperationType.FRAGMENT_SET_PROPERTIES]);
    _defineProperty(_assertThisInitialized(_this), "frid", void 0);
    _defineProperty(_assertThisInitialized(_this), "properties", void 0);
    _this.frid = fragmentId;
    _this.properties = properties;
    return _this;
  }
  _createClass(FragmentSetProperties, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var frag = struct.frags.get(this.frid);
      if (frag) {
        if (this.properties) {
          frag.properties = this.properties;
        } else {
          frag === null || frag === void 0 || delete frag.properties;
        }
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new FragmentSetProperties(this.frid, undefined);
    }
  }]);
  return FragmentSetProperties;
}(BaseOperation);

export { FragmentSetProperties };
//# sourceMappingURL=FragmentSetProperties.modern.js.map
