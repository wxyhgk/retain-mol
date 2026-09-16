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
var index = require('../operations/modes/index.js');
var Zoom = require('./Zoom.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var ClearTool = function () {
  function ClearTool(editor) {
    _classCallCheck__default["default"](this, ClearTool);
    _defineProperty__default["default"](this, "editor", void 0);
    this.editor = editor;
    this.editor = editor;
    if (!this.editor.drawingEntitiesManager.hasDrawingEntities) {
      return;
    }
    var history = EditorHistory.EditorHistory.getInstance(editor);
    var mode = editor.mode;
    var modelChanges = this.editor.drawingEntitiesManager.deleteAllEntities();
    if (mode.modeName === 'sequence-layout-mode') {
      modelChanges.addOperation(new index.ReinitializeModeOperation());
    }
    this.editor.transientDrawingView.clear();
    this.editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);
    Zoom.ZoomTool.instance.resetZoom();
  }
  _createClass__default["default"](ClearTool, [{
    key: "destroy",
    value: function destroy() {
    }
  }]);
  return ClearTool;
}();

exports.ClearTool = ClearTool;
//# sourceMappingURL=Clear.js.map
