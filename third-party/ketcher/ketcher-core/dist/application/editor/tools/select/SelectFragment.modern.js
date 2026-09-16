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
import { SelectBase } from './SelectBase.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SelectFragment = function (_SelectBase) {
  _inherits(SelectFragment, _SelectBase);
  function SelectFragment(editor) {
    var _this;
    _classCallCheck(this, SelectFragment);
    _this = _callSuper(this, SelectFragment, [editor]);
    _defineProperty(_assertThisInitialized(_this), "editor", void 0);
    _this.editor = editor;
    return _this;
  }
  _createClass(SelectFragment, [{
    key: "createSelectionView",
    value: function createSelectionView() {
    }
  }, {
    key: "onSelectionMove",
    value: function onSelectionMove() {
    }
  }, {
    key: "updateSelectionViewParams",
    value: function updateSelectionViewParams() {
    }
  }, {
    key: "mousedownEntity",
    value: function mousedownEntity(renderer) {
      var shiftKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var modKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var altKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      _get(_getPrototypeOf(SelectFragment.prototype), "mousedownEntity", this).call(this, renderer, shiftKey, modKey, altKey);
      var command = this.editor.drawingEntitiesManager.selectAllConnectedEntities(renderer.drawingEntity);
      this.editor.renderersContainer.update(command);
    }
  }, {
    key: "mouseOverDrawingEntity",
    value: function mouseOverDrawingEntity(event) {
      var renderer = event.target.__data__;
      var modelChanges = this.editor.drawingEntitiesManager.intendToSelectAllConnectedDrawingEntities(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseLeaveDrawingEntity",
    value: function mouseLeaveDrawingEntity(event) {
      var renderer = event.target.__data__;
      var modelChanges = this.editor.drawingEntitiesManager.cancelIntentionToSelectAllConnectedDrawingEntities(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }]);
  return SelectFragment;
}(SelectBase);

export { SelectFragment };
//# sourceMappingURL=SelectFragment.modern.js.map
