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
var EditorHistory = require('../EditorHistory.js');
require('../shared/coordinates.js');
require('../editor.types.js');
require('./select/SelectBase.js');
require('./select/SelectRectangle.js');
require('./select/SelectLasso.js');
require('./select/SelectFragment.js');
var BaseRenderer = require('../../render/renderers/BaseRenderer.js');
var BaseSequenceRenderer = require('../../render/renderers/sequence/BaseSequenceRenderer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var EraserTool = function () {
  function EraserTool(editor) {
    _classCallCheck__default["default"](this, EraserTool);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "name", 'eraser-tool');
    _defineProperty__default["default"](this, "history", void 0);
    this.editor = editor;
    this.editor = editor;
    this.history = EditorHistory.EditorHistory.getInstance(editor);
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
  _createClass__default["default"](EraserTool, [{
    key: "mousedown",
    value: function mousedown(event) {
      var selectedItemRenderer = event.target.__data__;
      if (selectedItemRenderer instanceof BaseSequenceRenderer.BaseSequenceRenderer) {
        return;
      }
      if (selectedItemRenderer instanceof BaseRenderer.BaseRenderer) {
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

exports.EraserTool = EraserTool;
//# sourceMappingURL=Erase.js.map
