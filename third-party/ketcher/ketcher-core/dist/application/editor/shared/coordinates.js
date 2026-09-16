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
var editorSettings = require('../editorSettings.js');
var Zoom = require('../tools/Zoom.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var Coordinates = function () {
  function Coordinates() {
    _classCallCheck__default["default"](this, Coordinates);
  }
  _createClass__default["default"](Coordinates, null, [{
    key: "canvasToModel",
    value: function canvasToModel(position) {
      var settings = editorSettings.provideEditorSettings();
      return position.scaled(1 / settings.macroModeScale);
    }
  }, {
    key: "viewToModel",
    value: function viewToModel(position) {
      var settings = editorSettings.provideEditorSettings();
      var pos = Zoom.ZoomTool.instance.invertZoom(position);
      return pos.scaled(1 / settings.macroModeScale);
    }
  }, {
    key: "modelToView",
    value: function modelToView(position) {
      var settings = editorSettings.provideEditorSettings();
      return Zoom.ZoomTool.instance.scaleCoordinates(position.scaled(settings.macroModeScale));
    }
  }, {
    key: "modelToCanvas",
    value: function modelToCanvas(position) {
      var settings = editorSettings.provideEditorSettings();
      return position.scaled(settings.macroModeScale);
    }
  }, {
    key: "canvasToView",
    value: function canvasToView(position) {
      return Zoom.ZoomTool.instance.scaleCoordinates(position);
    }
  }, {
    key: "viewToCanvas",
    value: function viewToCanvas(position) {
      return Zoom.ZoomTool.instance.invertZoom(position);
    }
  }]);
  return Coordinates;
}();

exports.Coordinates = Coordinates;
//# sourceMappingURL=coordinates.js.map
