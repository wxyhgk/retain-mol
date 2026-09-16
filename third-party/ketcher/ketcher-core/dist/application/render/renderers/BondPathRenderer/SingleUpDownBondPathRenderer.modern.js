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
import { BondWidth, StereoBondWidth } from './constants.modern.js';

var SingleUpDownBondPathRenderer = function () {
  function SingleUpDownBondPathRenderer() {
    _classCallCheck(this, SingleUpDownBondPathRenderer);
  }
  _createClass(SingleUpDownBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var d = endPosition.sub(startPosition);
      var len = d.length();
      d = d.normalized();
      var interval = 0.6 * BondWidth;
      var linesNumber = Math.max(Math.floor((len - BondWidth) / (BondWidth + interval)), 0) + 2;
      var step = len / (linesNumber - 0.5);
      var bsp = 0.7 * StereoBondWidth;
      var path = "M".concat(startPosition.x, ",").concat(startPosition.y);
      var sectionStartPosition = startPosition;
      for (var i = 0; i < linesNumber; ++i) {
        sectionStartPosition = startPosition.addScaled(d, step * (i + 0.5)).addScaled(firstHalfEdge.leftNormal, (i & 1 ? -1 : +1) * bsp * (i + 0.5) / (linesNumber - 0.5));
        path += "L".concat(sectionStartPosition.x, ",").concat(sectionStartPosition.y);
      }
      var svgPath = {
        d: path,
        attrs: {
          fill: 'none',
          'stroke-width': "".concat(BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return SingleUpDownBondPathRenderer;
}();

export { SingleUpDownBondPathRenderer as default };
//# sourceMappingURL=SingleUpDownBondPathRenderer.modern.js.map
