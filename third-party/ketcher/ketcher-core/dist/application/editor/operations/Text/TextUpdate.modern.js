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
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var TextUpdate = function (_BaseOperation) {
  _inherits(TextUpdate, _BaseOperation);
  function TextUpdate(id, content) {
    var _this;
    _classCallCheck(this, TextUpdate);
    _this = _callSuper(this, TextUpdate, [OperationType.TEXT_UPDATE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      id: id,
      content: content
    };
    return _this;
  }
  _createClass(TextUpdate, [{
    key: "execute",
    value: function execute(restruct) {
      if (this.data.shouldSkip) {
        return;
      }
      var _this$data = this.data,
        id = _this$data.id,
        content = _this$data.content;
      var text = restruct.molecule.texts.get(id);
      if (text) {
        this.data.previousContent = text.content;
        text.content = content;
      }
      BaseOperation.invalidateItem(restruct, 'texts', id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.data.shouldSkip) {
        var _this$data$previousCo;
        var _inverted = new TextUpdate(this.data.id, this.data.content);
        _inverted.data.previousContent = (_this$data$previousCo = this.data.previousContent) !== null && _this$data$previousCo !== void 0 ? _this$data$previousCo : this.data.content;
        _inverted.data.shouldSkip = true;
        return _inverted;
      }
      if (this.data.previousContent === undefined) {
        var _inverted2 = new TextUpdate(this.data.id, this.data.content);
        _inverted2.data.previousContent = this.data.content;
        _inverted2.data.shouldSkip = true;
        return _inverted2;
      }
      var inverted = new TextUpdate(this.data.id, this.data.previousContent);
      inverted.data.previousContent = this.data.content;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var text = restruct.molecule.texts.get(this.data.id);
      if (!text) return false;
      return text.content === this.data.content;
    }
  }]);
  return TextUpdate;
}(BaseOperation);

export { TextUpdate };
//# sourceMappingURL=TextUpdate.modern.js.map
