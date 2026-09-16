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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { EditorHistory } from '../EditorHistory.modern.js';
import '../shared/coordinates.modern.js';
import '../editor.types.modern.js';
import './select/SelectBase.modern.js';
import './select/SelectRectangle.modern.js';
import './select/SelectLasso.modern.js';
import './select/SelectFragment.modern.js';
import { BaseRenderer } from '../../render/renderers/BaseRenderer.modern.js';
import { BaseSequenceRenderer } from '../../render/renderers/sequence/BaseSequenceRenderer.modern.js';

var EraserTool = function () {
  function EraserTool(editor) {
    _classCallCheck(this, EraserTool);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "name", 'eraser-tool');
    _defineProperty(this, "history", void 0);
    this.editor = editor;
    this.editor = editor;
    this.history = EditorHistory.getInstance(editor);
    if (this.editor.drawingEntitiesManager.selectedEntities.length && this.editor.mode.modeName !== 'sequence-layout-mode') {
      var modelChanges = this.editor.drawingEntitiesManager.deleteSelectedEntities();
      modelChanges.merge(this.editor.drawingEntitiesManager.recalculateAntisenseChains());
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.events.selectEntities.dispatch(this.editor.drawingEntitiesManager.selectedEntities.map(function (entity) {
        return entity[1];
      }));
    }
  }
  _createClass(EraserTool, [{
    key: "mousedown",
    value: function mousedown(event) {
      var selectedItemRenderer = event.target.__data__;
      if (selectedItemRenderer instanceof BaseSequenceRenderer) {
        return;
      }
      if (selectedItemRenderer instanceof BaseRenderer) {
        var modelChanges = this.editor.drawingEntitiesManager.deleteDrawingEntity(selectedItemRenderer.drawingEntity, true, true);
        modelChanges.merge(this.editor.drawingEntitiesManager.recalculateAntisenseChains());
        this.history.update(modelChanges);
        this.editor.renderersContainer.update(modelChanges);
        this.editor.events.selectEntities.dispatch(this.editor.drawingEntitiesManager.selectedEntities.map(function (entity) {
          return entity[1];
        }));
      }
    }
  }, {
    key: "mouseOverDrawingEntity",
    value: function mouseOverDrawingEntity(event) {
      var renderer = event.target.__data__;
      var modelChanges = this.editor.drawingEntitiesManager.intendToSelectDrawingEntity(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseLeaveDrawingEntity",
    value: function mouseLeaveDrawingEntity(event) {
      var renderer = event.target.__data__;
      var modelChanges = this.editor.drawingEntitiesManager.cancelIntentionToSelectDrawingEntity(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "destroy",
    value: function destroy() {
    }
  }]);
  return EraserTool;
}();

export { EraserTool };
//# sourceMappingURL=Erase.modern.js.map
