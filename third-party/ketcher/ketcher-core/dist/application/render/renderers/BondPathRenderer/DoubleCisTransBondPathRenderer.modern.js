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
import { BondWidth } from './constants.modern.js';

var DoubleCisTransBondPathRenderer = function () {
  function DoubleCisTransBondPathRenderer() {
    _classCallCheck(this, DoubleCisTransBondPathRenderer);
  }
  _createClass(DoubleCisTransBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var normal = firstHalfEdge.leftNormal;
      var firstLineStart = startPosition.addScaled(normal, BondWidth);
      var firstLineEnd = endPosition.addScaled(normal, -BondWidth);
      var secondLineStart = startPosition.addScaled(normal, -BondWidth);
      var secondLineEnd = endPosition.addScaled(normal, BondWidth);
      var svgPath = {
        d: "\n          M".concat(firstLineStart.x, ",").concat(firstLineStart.y, "\n          L").concat(firstLineEnd.x, ",").concat(firstLineEnd.y, "\n          M").concat(secondLineStart.x, ",").concat(secondLineStart.y, "\n          L").concat(secondLineEnd.x, ",").concat(secondLineEnd.y, "\n        "),
        attrs: {
          'stroke-width': "".concat(BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return DoubleCisTransBondPathRenderer;
}();

export { DoubleCisTransBondPathRenderer as default };
//# sourceMappingURL=DoubleCisTransBondPathRenderer.modern.js.map
