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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { SVGPathDAttributeUtility } from './SVGPathDAttributeUtility.modern.js';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';
import { SnakeLayoutCellWidth } from '../../../../domain/constants/layout.modern.js';

var SideChainConnectionBondRendererUtility = function () {
  function SideChainConnectionBondRendererUtility() {
    _classCallCheck(this, SideChainConnectionBondRendererUtility);
  }
  _createClass(SideChainConnectionBondRendererUtility, null, [{
    key: "calculatePathPartAndTurnPoint",
    value: function calculatePathPartAndTurnPoint(_ref) {
      var cell = _ref.cell,
        connection = _ref.connection,
        direction = _ref.direction,
        horizontal = _ref.horizontal,
        turnPoint = _ref.turnPoint,
        turnPointIsUsed = _ref.turnPointIsUsed;
      var sin = Math.sin(direction * Math.PI / 180);
      var cos = Math.cos(direction * Math.PI / 180);
      var xOffset = SnakeLayoutCellWidth / 2 * cos;
      var yOffset = this.cellHeight / 2 * sin;
      var maxXOffset = cell.connections.reduce(function (max, connection) {
        return max > connection.xOffset ? max : connection.xOffset;
      }, 0);
      var maxYOffset = cell.connections.reduce(function (max, connection) {
        var connectionYOffset = connection.yOffset || 0;
        return max > connectionYOffset ? max : connectionYOffset;
      }, 0);
      var endOfPathPart;
      if (horizontal && turnPointIsUsed) {
        endOfPathPart = turnPoint;
      } else {
        var _cell$monomer$rendere = cell.monomer.renderer,
          monomerSize = _cell$monomer$rendere.monomerSize,
          scaledMonomerPosition = _cell$monomer$rendere.scaledMonomerPosition;
        endOfPathPart = horizontal ? scaledMonomerPosition.x + monomerSize.width / 2 + xOffset : scaledMonomerPosition.y + monomerSize.height / 2 + yOffset;
      }
      var turnPointInternal = endOfPathPart;
      if (horizontal) {
        endOfPathPart += -(connection.yOffset || 0) * 3 + cos * -connection.xOffset * 3 + cos * (maxXOffset + 1) * 3 + (maxYOffset + 1) * 3;
      }
      var pathPart = '';
      if (horizontal) {
        var absoluteLineX = endOfPathPart - this.smoothCornerSize * cos;
        pathPart += SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(absoluteLineX) + ' ';
      } else {
        var absoluteLineY = endOfPathPart - this.smoothCornerSize * cos;
        pathPart += SVGPathDAttributeUtility.generateVerticalAbsoluteLine(absoluteLineY) + ' ';
      }
      pathPart += this.generateBend(cos, sin, cos, 1) + ' ';
      return {
        pathPart: pathPart,
        turnPoint: turnPointInternal
      };
    }
  }, {
    key: "generateBend",
    value: function generateBend(dx1, dy1, dx, dy) {
      var size = this.smoothCornerSize;
      return SVGPathDAttributeUtility.generateQuadraticRelativeCurve(size * dx1, size * dy1, size * dx, size * dy);
    }
  }]);
  return SideChainConnectionBondRendererUtility;
}();
_defineProperty(SideChainConnectionBondRendererUtility, "bondEndLength", 15);
_defineProperty(SideChainConnectionBondRendererUtility, "cellHeight", 40);
_defineProperty(SideChainConnectionBondRendererUtility, "smoothCornerSize", 5);

export { SideChainConnectionBondRendererUtility };
//# sourceMappingURL=SideChainConnectionBondRendererUtility.modern.js.map
