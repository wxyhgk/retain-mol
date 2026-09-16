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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var SingleDownBondPathRenderer = function () {
  function SingleDownBondPathRenderer() {
    _classCallCheck__default["default"](this, SingleDownBondPathRenderer);
  }
  _createClass__default["default"](SingleDownBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var direction = endPosition.sub(startPosition);
      var bondLength = direction.length() + 0.2;
      var normalizedDirection = direction.normalized();
      var offsetBetweenLines = 1.2 * constants.BondWidth;
      var numberOfLines = Math.max(Math.floor((bondLength - constants.BondWidth) / (constants.BondWidth + offsetBetweenLines)), 0) + 2;
      var step = bondLength / (numberOfLines - 1);
      var halfOfBondEndWidth = 0.7 * constants.StereoBondWidth;
      var path = '';
      for (var i = 0; i < numberOfLines; ++i) {
        var lineCenter = startPosition.addScaled(normalizedDirection, step * i);
        var firstLineEnd = lineCenter.addScaled(firstHalfEdge.leftNormal, halfOfBondEndWidth * (i + 0.5) / (numberOfLines - 0.5));
        var secondLineEnd = lineCenter.addScaled(firstHalfEdge.leftNormal, -halfOfBondEndWidth * (i + 0.5) / (numberOfLines - 0.5));
        path += "\n            M".concat(firstLineEnd.x, ",").concat(firstLineEnd.y, "\n            L").concat(secondLineEnd.x, ",").concat(secondLineEnd.y, "\n          ");
      }
      var svgPath = {
        d: path,
        attrs: {
          'stroke-width': '2'
        }
      };
      return [svgPath];
    }
  }]);
  return SingleDownBondPathRenderer;
}();

exports["default"] = SingleDownBondPathRenderer;
//# sourceMappingURL=SingleDownBondPathRenderer.js.map
