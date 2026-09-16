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
import svgPath from 'svgpath';
import { ARROW_HEAD_WIDTH, ARROW_HEAD_LENGHT } from '../../draw.modern.js';
import { provideEditorSettings } from '../../../editor/editorSettings.modern.js';
import { toFixed } from '../../../../utilities/toFixed.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';

var FilledTriangleArrowRenderer = function () {
  function FilledTriangleArrowRenderer() {
    _classCallCheck(this, FilledTriangleArrowRenderer);
  }
  _createClass(FilledTriangleArrowRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(start, arrowLength, arrowAngle) {
      var macroModeScale = provideEditorSettings().macroModeScale;
      var arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
      var arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
      var endX = start.x + arrowLength;
      var path = "M".concat(toFixed(start.x), ",").concat(toFixed(start.y)) + "L".concat(toFixed(endX), ",").concat(toFixed(start.y)) + "L".concat(toFixed(endX - arrowHeadLength), ",").concat(toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed(endX - arrowHeadLength), ",").concat(toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed(endX), ",").concat(toFixed(start.y), "Z");
      var transformedPath = svgPath(path).rotate(arrowAngle, start.x, start.y).toString();
      return [{
        d: transformedPath,
        attrs: {
          fill: '#000'
        }
      }];
    }
  }]);
  return FilledTriangleArrowRenderer;
}();

export { FilledTriangleArrowRenderer };
//# sourceMappingURL=FilledTriangleArrowRenderer.modern.js.map
