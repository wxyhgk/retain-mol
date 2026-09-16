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
import { ARROW_HEAD_LENGHT, ARROW_HEAD_WIDTH, ARROW_OFFSET } from '../../draw.modern.js';
import { provideEditorSettings } from '../../../editor/editorSettings.modern.js';
import { toFixed } from '../../../../utilities/toFixed.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';

var EquilibriumOpenAngleArrowRenderer = function () {
  function EquilibriumOpenAngleArrowRenderer() {
    _classCallCheck(this, EquilibriumOpenAngleArrowRenderer);
  }
  _createClass(EquilibriumOpenAngleArrowRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(start, arrowLength, arrowAngle) {
      var macroModeScale = provideEditorSettings().macroModeScale;
      var arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
      var arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
      var arrowOffset = ARROW_OFFSET * macroModeScale;
      var endX = start.x + arrowLength;
      var pathParts = [];
      pathParts.push("M".concat(toFixed(start.x), ",").concat(toFixed(start.y - arrowOffset)) + "L".concat(toFixed(endX), ",").concat(toFixed(start.y - arrowOffset)) + "L".concat(toFixed(endX - arrowHeadLength), ",").concat(toFixed(start.y - arrowHeadWidth - arrowOffset)));
      pathParts.push("M".concat(toFixed(start.x), ",").concat(toFixed(start.y + arrowOffset)) + "L".concat(toFixed(endX), ",").concat(toFixed(start.y + arrowOffset)) + "M".concat(toFixed(start.x), ",").concat(toFixed(start.y + arrowOffset)) + "L".concat(toFixed(start.x + arrowHeadLength), ",").concat(toFixed(start.y + arrowOffset + arrowHeadWidth)));
      var transformedPath = svgPath(pathParts.join('')).rotate(arrowAngle, start.x, start.y).toString();
      return [{
        d: transformedPath,
        attrs: {}
      }];
    }
  }]);
  return EquilibriumOpenAngleArrowRenderer;
}();

export { EquilibriumOpenAngleArrowRenderer };
//# sourceMappingURL=EquilibriumOpenAngleArrowRenderer.modern.js.map
