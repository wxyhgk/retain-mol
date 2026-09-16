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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var BaseMode = require('./BaseMode.js');
require('../EditorHistory.js');
var coordinates = require('../shared/coordinates.js');
require('../editor.types.js');
require('../tools/select/SelectBase.js');
require('../tools/select/SelectRectangle.js');
require('../tools/select/SelectLasso.js');
require('../tools/select/SelectFragment.js');
var editorSingleton = require('../editorSingleton.js');
var Command = require('../../../domain/entities/Command.js');
var modesRegistry = require('./modesRegistry.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FlexMode = function (_BaseMode) {
  _inherits__default["default"](FlexMode, _BaseMode);
  function FlexMode(previousMode) {
    _classCallCheck__default["default"](this, FlexMode);
    return _callSuper(this, FlexMode, ['flex-layout-mode', previousMode]);
  }
  _createClass__default["default"](FlexMode, [{
    key: "initialize",
    value: function initialize() {
      var command = _get__default["default"](_getPrototypeOf__default["default"](FlexMode.prototype), "initialize", this).call(this);
      var editor = editorSingleton.provideEditorInstance();
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
      var editor = editorSingleton.provideEditorInstance();
      return coordinates.Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
    }
  }, {
    key: "applyAdditionalPasteOperations",
    value: function applyAdditionalPasteOperations(mergedDrawingEntities) {
      var command = new Command.Command();
      var editor = editorSingleton.provideEditorInstance();
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
}(BaseMode.BaseMode);
modesRegistry.registerMode('flex-layout-mode', FlexMode);

exports.FlexMode = FlexMode;
//# sourceMappingURL=FlexMode.js.map
