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
var CoreBond = require('../../../../domain/entities/CoreBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var SingleBondPathRenderer = function () {
  function SingleBondPathRenderer() {
    _classCallCheck__default["default"](this, SingleBondPathRenderer);
  }
  _createClass__default["default"](SingleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors, type) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition;
      var strokeDasharray = type !== undefined ? constants.BondDashArrayMap[type] : 'none';
      var svgPath = {
        d: "\n          M".concat(startPosition.x, ",").concat(startPosition.y, "\n          L").concat(endPosition.x, ",").concat(endPosition.y, "\n        "),
        attrs: {
          'marker-end': type === CoreBond.BondType.Dative ? 'url(#arrow-marker)' : 'none',
          'stroke-dasharray': strokeDasharray,
          'stroke-width': "".concat(constants.BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return SingleBondPathRenderer;
}();

exports["default"] = SingleBondPathRenderer;
//# sourceMappingURL=SingleBondPathRenderer.js.map
