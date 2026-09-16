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
import { ReinitializeModeOperation } from '../operations/modes/index.modern.js';
import { ZoomTool } from './Zoom.modern.js';

var ClearTool = function () {
  function ClearTool(editor) {
    _classCallCheck(this, ClearTool);
    _defineProperty(this, "editor", void 0);
    this.editor = editor;
    this.editor = editor;
    if (!this.editor.drawingEntitiesManager.hasDrawingEntities) {
      return;
    }
    var history = EditorHistory.getInstance(editor);
    var mode = editor.mode;
    var modelChanges = this.editor.drawingEntitiesManager.deleteAllEntities();
    if (mode.modeName === 'sequence-layout-mode') {
      modelChanges.addOperation(new ReinitializeModeOperation());
    }
    this.editor.transientDrawingView.clear();
    this.editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    ZoomTool.instance.resetZoom();
  }
  _createClass(ClearTool, [{
    key: "destroy",
    value: function destroy() {
    }
  }]);
  return ClearTool;
}();

export { ClearTool };
//# sourceMappingURL=Clear.modern.js.map
