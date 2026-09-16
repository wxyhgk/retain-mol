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
var constants = require('./constants.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var CoreBond = require('../../../../domain/entities/CoreBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var SingleDoubleBondPathRenderer = function () {
  function SingleDoubleBondPathRenderer() {
    _classCallCheck__default["default"](this, SingleDoubleBondPathRenderer);
  }
  _createClass__default["default"](SingleDoubleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var sectionsNumber = vec2.Vec2.dist(startPosition, endPosition) / Number((constants.BondSpace + constants.BondWidth).toFixed());
      if (!(sectionsNumber & 1)) {
        sectionsNumber += 1;
      }
      var path = '';
      var midLineStartPosition = startPosition;
      for (var i = 1; i <= sectionsNumber; ++i) {
        var midLineEndPosition = vec2.Vec2.lc2(startPosition, (sectionsNumber - i) / sectionsNumber, endPosition, i / sectionsNumber);
        if (i & 1) {
          path += "\n          M".concat(midLineStartPosition.x, ",").concat(midLineStartPosition.y, "\n          L").concat(midLineEndPosition.x, ",").concat(midLineEndPosition.y, "\n        ");
        } else {
          var topLineStartPosition = midLineStartPosition.addScaled(firstHalfEdge.leftNormal, constants.LinesOffset);
          var topLineEndPosition = midLineEndPosition.addScaled(firstHalfEdge.leftNormal, constants.LinesOffset);
          var bottomLineStartPosition = midLineStartPosition.addScaled(firstHalfEdge.leftNormal, -constants.LinesOffset);
          var bottomLineEndPosition = midLineEndPosition.addScaled(firstHalfEdge.leftNormal, -constants.LinesOffset);
          path += "\n          M".concat(topLineStartPosition.x, ",").concat(topLineStartPosition.y, "\n          L").concat(topLineEndPosition.x, ",").concat(topLineEndPosition.y, "\n          M").concat(bottomLineStartPosition.x, ",").concat(bottomLineStartPosition.y, "\n          L").concat(bottomLineEndPosition.x, ",").concat(bottomLineEndPosition.y, "\n        ");
        }
        midLineStartPosition = midLineEndPosition;
      }
      var svgPath = {
        d: path,
        attrs: {
          'stroke-dasharray': constants.BondDashArrayMap[CoreBond.BondType.SingleDouble],
          'stroke-width': "".concat(constants.BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return SingleDoubleBondPathRenderer;
}();

exports["default"] = SingleDoubleBondPathRenderer;
//# sourceMappingURL=SingleDoubleBondPathRenderer.js.map
