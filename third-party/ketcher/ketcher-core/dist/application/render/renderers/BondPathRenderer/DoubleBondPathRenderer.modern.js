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
import { BondSpace, BondDashArrayMap, BondWidth, LinesOffset } from './constants.modern.js';
import { getBondLineShift } from '../../restruct/rebond.modern.js';
import { BondType } from '../../../../domain/entities/CoreBond.modern.js';

var DoubleBondPathRenderer = function () {
  function DoubleBondPathRenderer() {
    _classCallCheck(this, DoubleBondPathRenderer);
  }
  _createClass(DoubleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors, shift, type) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge,
        secondHalfEdge = bondVectors.secondHalfEdge;
      var firstLinePartShift = LinesOffset + shift * LinesOffset;
      var secondLinePartShift = -LinesOffset + shift * LinesOffset;
      var firstLineStartPosition = startPosition.addScaled(firstHalfEdge.leftNormal, firstLinePartShift);
      var firstLineEndPosition = endPosition.addScaled(firstHalfEdge.leftNormal, firstLinePartShift);
      var secondLineStartPosition = startPosition.addScaled(firstHalfEdge.leftNormal, secondLinePartShift);
      var secondLineEndPosition = endPosition.addScaled(firstHalfEdge.leftNormal, secondLinePartShift);
      if (shift > 0) {
        var _firstHalfEdge$firstA, _firstHalfEdge$second;
        firstLineStartPosition = (_firstHalfEdge$firstA = firstHalfEdge.firstAtom.renderer) !== null && _firstHalfEdge$firstA !== void 0 && _firstHalfEdge$firstA.isLabelVisible ? firstLineStartPosition : firstLineStartPosition.addScaled(firstHalfEdge.direction, BondSpace * getBondLineShift(firstHalfEdge.cosToRightNeighborHalfEdge, firstHalfEdge.sinToRightNeighborHalfEdge));
        firstLineEndPosition = (_firstHalfEdge$second = firstHalfEdge.secondAtom.renderer) !== null && _firstHalfEdge$second !== void 0 && _firstHalfEdge$second.isLabelVisible ? firstLineEndPosition : firstLineEndPosition.addScaled(firstHalfEdge.direction, -BondSpace * getBondLineShift(secondHalfEdge.cosToLeftNeighborHalfEdge, secondHalfEdge.sinToLeftNeighborHalfEdge));
      } else if (shift < 0) {
        var _firstHalfEdge$firstA2, _firstHalfEdge$second2;
        secondLineStartPosition = (_firstHalfEdge$firstA2 = firstHalfEdge.firstAtom.renderer) !== null && _firstHalfEdge$firstA2 !== void 0 && _firstHalfEdge$firstA2.isLabelVisible ? secondLineStartPosition : secondLineStartPosition.addScaled(firstHalfEdge.direction, BondSpace * getBondLineShift(firstHalfEdge.cosToLeftNeighborHalfEdge, firstHalfEdge.sinToLeftNeighborHalfEdge));
        secondLineEndPosition = (_firstHalfEdge$second2 = firstHalfEdge.secondAtom.renderer) !== null && _firstHalfEdge$second2 !== void 0 && _firstHalfEdge$second2.isLabelVisible ? secondLineEndPosition : secondLineEndPosition.addScaled(firstHalfEdge.direction, -BondSpace * getBondLineShift(secondHalfEdge.cosToRightNeighborHalfEdge, secondHalfEdge.sinToRightNeighborHalfEdge));
      }
      var strokeDasharray = type !== undefined ? BondDashArrayMap[type] : 'none';
      if (type === BondType.Double || type === BondType.DoubleAromatic) {
        var svgPath = {
          d: "\n          M".concat(firstLineStartPosition.x, ",").concat(firstLineStartPosition.y, "\n          L").concat(firstLineEndPosition.x, ",").concat(firstLineEndPosition.y, "\n          M").concat(secondLineStartPosition.x, ",").concat(secondLineStartPosition.y, "\n          L").concat(secondLineEndPosition.x, ",").concat(secondLineEndPosition.y, "\n        "),
          attrs: {
            stroke: 'black',
            'stroke-dasharray': strokeDasharray,
            'stroke-width': "".concat(BondWidth)
          }
        };
        return [svgPath];
      } else {
        var solidAttrs = {
          stroke: 'black',
          'stroke-width': "".concat(BondWidth)
        };
        var dashedAttrs = {
          'stroke-dasharray': strokeDasharray,
          'stroke-width': "".concat(BondWidth)
        };
        var firstSvgPath = {
          d: "\n          M".concat(firstLineStartPosition.x, ",").concat(firstLineStartPosition.y, "\n          L").concat(firstLineEndPosition.x, ",").concat(firstLineEndPosition.y, "\n        "),
          attrs: shift > 0 ? dashedAttrs : solidAttrs
        };
        var secondSvgPath = {
          d: "\n          M".concat(secondLineStartPosition.x, ",").concat(secondLineStartPosition.y, "\n          L").concat(secondLineEndPosition.x, ",").concat(secondLineEndPosition.y, "\n        "),
          attrs: shift > 0 ? solidAttrs : dashedAttrs
        };
        return shift > 0 ? [firstSvgPath, secondSvgPath] : [secondSvgPath, firstSvgPath];
      }
    }
  }]);
  return DoubleBondPathRenderer;
}();

export { DoubleBondPathRenderer as default };
//# sourceMappingURL=DoubleBondPathRenderer.modern.js.map
