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
import { BondSpace, BondWidth, LinesOffset, BondDashArrayMap } from './constants.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { BondType } from '../../../../domain/entities/CoreBond.modern.js';

var SingleDoubleBondPathRenderer = function () {
  function SingleDoubleBondPathRenderer() {
    _classCallCheck(this, SingleDoubleBondPathRenderer);
  }
  _createClass(SingleDoubleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var sectionsNumber = Vec2.dist(startPosition, endPosition) / Number((BondSpace + BondWidth).toFixed());
      if (!(sectionsNumber & 1)) {
        sectionsNumber += 1;
      }
      var path = '';
      var midLineStartPosition = startPosition;
      for (var i = 1; i <= sectionsNumber; ++i) {
        var midLineEndPosition = Vec2.lc2(startPosition, (sectionsNumber - i) / sectionsNumber, endPosition, i / sectionsNumber);
        if (i & 1) {
          path += "\n          M".concat(midLineStartPosition.x, ",").concat(midLineStartPosition.y, "\n          L").concat(midLineEndPosition.x, ",").concat(midLineEndPosition.y, "\n        ");
        } else {
          var topLineStartPosition = midLineStartPosition.addScaled(firstHalfEdge.leftNormal, LinesOffset);
          var topLineEndPosition = midLineEndPosition.addScaled(firstHalfEdge.leftNormal, LinesOffset);
          var bottomLineStartPosition = midLineStartPosition.addScaled(firstHalfEdge.leftNormal, -LinesOffset);
          var bottomLineEndPosition = midLineEndPosition.addScaled(firstHalfEdge.leftNormal, -LinesOffset);
          path += "\n          M".concat(topLineStartPosition.x, ",").concat(topLineStartPosition.y, "\n          L").concat(topLineEndPosition.x, ",").concat(topLineEndPosition.y, "\n          M").concat(bottomLineStartPosition.x, ",").concat(bottomLineStartPosition.y, "\n          L").concat(bottomLineEndPosition.x, ",").concat(bottomLineEndPosition.y, "\n        ");
        }
        midLineStartPosition = midLineEndPosition;
      }
      var svgPath = {
        d: path,
        attrs: {
          'stroke-dasharray': BondDashArrayMap[BondType.SingleDouble],
          'stroke-width': "".concat(BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return SingleDoubleBondPathRenderer;
}();

export { SingleDoubleBondPathRenderer as default };
//# sourceMappingURL=SingleDoubleBondPathRenderer.modern.js.map
