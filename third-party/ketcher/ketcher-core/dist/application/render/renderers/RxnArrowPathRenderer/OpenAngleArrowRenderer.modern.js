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
import { PathBuilder } from '../../pathBuilder.modern.js';
import svgPath from 'svgpath';
import { ARROW_HEAD_LENGHT, ARROW_HEAD_ATTR } from '../../draw.modern.js';
import { provideEditorSettings } from '../../../editor/editorSettings.modern.js';

var OpenAngleArrowRenderer = function () {
  function OpenAngleArrowRenderer() {
    _classCallCheck(this, OpenAngleArrowRenderer);
  }
  _createClass(OpenAngleArrowRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(start, arrowLength, arrowAngle) {
      var macroModeScale = provideEditorSettings().macroModeScale;
      var pathBuilder = new PathBuilder().addOpenArrowPathParts(start, arrowLength, ARROW_HEAD_LENGHT * macroModeScale, ARROW_HEAD_ATTR * macroModeScale);
      var transformedPath = svgPath(pathBuilder.build()).rotate(arrowAngle, start.x, start.y).toString();
      return [{
        d: transformedPath,
        attrs: {}
      }];
    }
  }]);
  return OpenAngleArrowRenderer;
}();

export { OpenAngleArrowRenderer };
//# sourceMappingURL=OpenAngleArrowRenderer.modern.js.map
