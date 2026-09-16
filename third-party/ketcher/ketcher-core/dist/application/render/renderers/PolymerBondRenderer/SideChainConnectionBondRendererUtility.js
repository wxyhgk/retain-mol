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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var SVGPathDAttributeUtility = require('./SVGPathDAttributeUtility.js');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');
var layout = require('../../../../domain/constants/layout.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SideChainConnectionBondRendererUtility = function () {
  function SideChainConnectionBondRendererUtility() {
    _classCallCheck__default["default"](this, SideChainConnectionBondRendererUtility);
  }
  _createClass__default["default"](SideChainConnectionBondRendererUtility, null, [{
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
      var xOffset = layout.SnakeLayoutCellWidth / 2 * cos;
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
        pathPart += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(absoluteLineX) + ' ';
      } else {
        var absoluteLineY = endOfPathPart - this.smoothCornerSize * cos;
        pathPart += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateVerticalAbsoluteLine(absoluteLineY) + ' ';
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
      return SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateQuadraticRelativeCurve(size * dx1, size * dy1, size * dx, size * dy);
    }
  }]);
  return SideChainConnectionBondRendererUtility;
}();
_defineProperty__default["default"](SideChainConnectionBondRendererUtility, "bondEndLength", 15);
_defineProperty__default["default"](SideChainConnectionBondRendererUtility, "cellHeight", 40);
_defineProperty__default["default"](SideChainConnectionBondRendererUtility, "smoothCornerSize", 5);

exports.SideChainConnectionBondRendererUtility = SideChainConnectionBondRendererUtility;
//# sourceMappingURL=SideChainConnectionBondRendererUtility.js.map
