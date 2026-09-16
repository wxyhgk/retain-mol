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

var TripleBondPathRenderer = function () {
  function TripleBondPathRenderer() {
    _classCallCheck__default["default"](this, TripleBondPathRenderer);
  }
  _createClass__default["default"](TripleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge;
      var topLineStartPosition = startPosition.addScaled(firstHalfEdge.leftNormal, constants.BondSpace);
      var topLineEndPosition = endPosition.addScaled(firstHalfEdge.leftNormal, constants.BondSpace);
      var bottomLineStartPosition = startPosition.addScaled(firstHalfEdge.leftNormal, -constants.BondSpace);
      var bottomLineEndPosition = endPosition.addScaled(firstHalfEdge.leftNormal, -constants.BondSpace);
      var svgPath = {
        d: "\n          M".concat(topLineStartPosition.x, ",").concat(topLineStartPosition.y, "\n          L").concat(topLineEndPosition.x, ",").concat(topLineEndPosition.y, "\n          M").concat(startPosition.x, ",").concat(startPosition.y, "\n          L").concat(endPosition.x, ",").concat(endPosition.y, "\n          M").concat(bottomLineStartPosition.x, ",").concat(bottomLineStartPosition.y, "\n          L").concat(bottomLineEndPosition.x, ",").concat(bottomLineEndPosition.y, "\n        "),
        attrs: {
          'stroke-width': "".concat(constants.BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return TripleBondPathRenderer;
}();

exports["default"] = TripleBondPathRenderer;
//# sourceMappingURL=TripleBondPathRenderer.js.map
