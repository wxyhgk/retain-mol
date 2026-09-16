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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');
var ketcherProvider = require('../ketcherProvider.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var HISTORY_SIZE = 32;
var EditorHistory = function () {
  function EditorHistory(editor) {
    _classCallCheck__default["default"](this, EditorHistory);
    _defineProperty__default["default"](this, "historyStack", []);
    _defineProperty__default["default"](this, "historyPointer", 0);
    _defineProperty__default["default"](this, "editor", void 0);
    this.editor = editor;
    this.historyPointer = 0;
  }
  _createClass__default["default"](EditorHistory, [{
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
      (_ketcherProvider$getK = ketcherProvider.ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK === void 0 || _ketcherProvider$getK.changeEvent.dispatch();
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
      (_ketcherProvider$getK2 = ketcherProvider.ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK2 === void 0 || _ketcherProvider$getK2.changeEvent.dispatch();
      assert.assert(this.editor);
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
      (_ketcherProvider$getK3 = ketcherProvider.ketcherProvider.getKetcher(this.editor.ketcherId)) === null || _ketcherProvider$getK3 === void 0 || _ketcherProvider$getK3.changeEvent.dispatch();
      assert.assert(this.editor);
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
_defineProperty__default["default"](EditorHistory, "instances", new WeakMap());

exports.EditorHistory = EditorHistory;
//# sourceMappingURL=EditorHistory.js.map
