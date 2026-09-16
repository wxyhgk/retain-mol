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
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { ketcherProvider } from '../ketcherProvider.modern.js';

var HISTORY_SIZE = 32;
var EditorHistory = function () {
  function EditorHistory(editor) {
    _classCallCheck(this, EditorHistory);
    _defineProperty(this, "historyStack", []);
    _defineProperty(this, "historyPointer", 0);
    _defineProperty(this, "editor", void 0);
    this.editor = editor;
    this.historyPointer = 0;
  }
  _createClass(EditorHistory, [{
    key: "update",
    value: function update(command, megreWithLatestHistoryCommand) {
      var _ketcherProvider$getK;
      var latestCommand = this.historyStack[this.historyStack.length - 1];
      if (megreWithLatestHistoryCommand && latestCommand) {
        latestCommand.merge(command);
      } else {
        this.historyStack.splice(this.historyPointer, HISTORY_SIZE + 1, command);
        if (this.historyStack.length > HISTORY_SIZE) {
          this.historyStack.shift();
        }
        this.historyPointer = this.historyStack.length;
      }
      (_ketcherProvider$getK = ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK === void 0 || _ketcherProvider$getK.changeEvent.dispatch();
      if (command.operations.length > 0) {
        this.editor.events.modelChange.dispatch();
      }
    }
  }, {
    key: "undo",
    value: function undo() {
      var _ketcherProvider$getK2, _this$editor, _this$editor2;
      if (this.historyPointer === 0) {
        return;
      }
      (_ketcherProvider$getK2 = ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK2 === void 0 || _ketcherProvider$getK2.changeEvent.dispatch();
      assert(this.editor);
      var nextPointer = this.historyPointer - 1;
      var lastCommand = this.historyStack[nextPointer];
      lastCommand.invert(this.editor.renderersContainer);
      this.historyPointer = nextPointer;
      var turnOffSelectionCommand = (_this$editor = this.editor) === null || _this$editor === void 0 ? void 0 : _this$editor.drawingEntitiesManager.unselectAllDrawingEntities();
      (_this$editor2 = this.editor) === null || _this$editor2 === void 0 || _this$editor2.renderersContainer.update(turnOffSelectionCommand);
      this.editor.events.modelChange.dispatch();
    }
  }, {
    key: "redo",
    value: function redo() {
      var _ketcherProvider$getK3, _this$editor3, _this$editor4;
      if (this.historyPointer === this.historyStack.length) {
        return;
      }
      (_ketcherProvider$getK3 = ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK3 === void 0 || _ketcherProvider$getK3.changeEvent.dispatch();
      assert(this.editor);
      var lastCommand = this.historyStack[this.historyPointer];
      lastCommand.execute(this.editor.renderersContainer);
      this.historyPointer++;
      var turnOffSelectionCommand = (_this$editor3 = this.editor) === null || _this$editor3 === void 0 ? void 0 : _this$editor3.drawingEntitiesManager.unselectAllDrawingEntities();
      (_this$editor4 = this.editor) === null || _this$editor4 === void 0 || _this$editor4.renderersContainer.update(turnOffSelectionCommand);
      this.editor.events.modelChange.dispatch();
    }
  }, {
    key: "previousCommand",
    get: function get() {
      return this.historyStack[this.historyPointer - 1];
    }
  }, {
    key: "destroy",
    value: function destroy() {
      EditorHistory.instances["delete"](this.editor);
      this.historyStack = [];
      this.historyPointer = 0;
    }
  }], [{
    key: "getInstance",
    value: function getInstance(editor) {
      var instance = EditorHistory.instances.get(editor);
      if (instance) {
        return instance;
      }
      var createdInstance = new EditorHistory(editor);
      EditorHistory.instances.set(editor, createdInstance);
      return createdInstance;
    }
  }]);
  return EditorHistory;
}();
_defineProperty(EditorHistory, "instances", new WeakMap());

export { EditorHistory };
//# sourceMappingURL=EditorHistory.modern.js.map
