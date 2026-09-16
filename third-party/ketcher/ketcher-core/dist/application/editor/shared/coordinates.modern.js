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
import { provideEditorSettings } from '../editorSettings.modern.js';
import { ZoomTool } from '../tools/Zoom.modern.js';

var Coordinates = function () {
  function Coordinates() {
    _classCallCheck(this, Coordinates);
  }
  _createClass(Coordinates, null, [{
    key: "canvasToModel",
    value: function canvasToModel(position) {
      var settings = provideEditorSettings();
      return position.scaled(1 / settings.macroModeScale);
    }
  }, {
    key: "viewToModel",
    value: function viewToModel(position) {
      var settings = provideEditorSettings();
      var pos = ZoomTool.instance.invertZoom(position);
      return pos.scaled(1 / settings.macroModeScale);
    }
  }, {
    key: "modelToView",
    value: function modelToView(position) {
      var settings = provideEditorSettings();
      return ZoomTool.instance.scaleCoordinates(position.scaled(settings.macroModeScale));
    }
  }, {
    key: "modelToCanvas",
    value: function modelToCanvas(position) {
      var settings = provideEditorSettings();
      return position.scaled(settings.macroModeScale);
    }
  }, {
    key: "canvasToView",
    value: function canvasToView(position) {
      return ZoomTool.instance.scaleCoordinates(position);
    }
  }, {
    key: "viewToCanvas",
    value: function viewToCanvas(position) {
      return ZoomTool.instance.invertZoom(position);
    }
  }]);
  return Coordinates;
}();

export { Coordinates };
//# sourceMappingURL=coordinates.modern.js.map
