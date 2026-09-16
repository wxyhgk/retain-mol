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
import { BaseMode } from './BaseMode.modern.js';
import '../EditorHistory.modern.js';
import { Coordinates } from '../shared/coordinates.modern.js';
import '../editor.types.modern.js';
import '../tools/select/SelectBase.modern.js';
import '../tools/select/SelectRectangle.modern.js';
import '../tools/select/SelectLasso.modern.js';
import '../tools/select/SelectFragment.modern.js';
import { provideEditorInstance } from '../editorSingleton.modern.js';
import { Command } from '../../../domain/entities/Command.modern.js';
import { registerMode } from './modesRegistry.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FlexMode = function (_BaseMode) {
  _inherits(FlexMode, _BaseMode);
  function FlexMode(previousMode) {
    _classCallCheck(this, FlexMode);
    return _callSuper(this, FlexMode, ['flex-layout-mode', previousMode]);
  }
  _createClass(FlexMode, [{
    key: "initialize",
    value: function initialize() {
      var command = _get(_getPrototypeOf(FlexMode.prototype), "initialize", this).call(this);
      var editor = provideEditorInstance();
      var antisenseChanges = editor.drawingEntitiesManager.recalculateAntisenseChains();
      var modelChanges = editor.drawingEntitiesManager.applyFlexLayoutMode(true);
      command.merge(editor.drawingEntitiesManager.recalculateCanvasMatrix());
      modelChanges.merge(antisenseChanges);
      editor.renderersContainer.update(modelChanges);
      return command;
    }
  }, {
    key: "getNewNodePosition",
    value: function getNewNodePosition() {
      var editor = provideEditorInstance();
      return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
    }
  }, {
    key: "applyAdditionalPasteOperations",
    value: function applyAdditionalPasteOperations(mergedDrawingEntities) {
      var command = new Command();
      var editor = provideEditorInstance();
      editor.drawingEntitiesManager.recalculateAntisenseChains();
      command.merge(editor.drawingEntitiesManager.selectDrawingEntities(mergedDrawingEntities.allEntitiesArray));
      if (!editor.drawingEntitiesManager.hasAntisenseChains) {
        return command;
      }
      command.merge(editor.drawingEntitiesManager.applySnakeLayout(true, true, true));
      command.setUndoOperationsByPriority();
      return command;
    }
  }, {
    key: "isPasteAllowedByMode",
    value: function isPasteAllowedByMode() {
      return true;
    }
  }, {
    key: "isPasteAvailable",
    value: function isPasteAvailable() {
      return true;
    }
  }, {
    key: "scrollForView",
    value: function scrollForView() {
    }
  }]);
  return FlexMode;
}(BaseMode);
registerMode('flex-layout-mode', FlexMode);

export { FlexMode };
//# sourceMappingURL=FlexMode.modern.js.map
