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
var coordinates = require('../../../editor/shared/coordinates.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var BondSnapView = function () {
  function BondSnapView() {
    _classCallCheck__default["default"](this, BondSnapView);
  }
  _createClass__default["default"](BondSnapView, null, [{
    key: "show",
    value: function show(transientLayer, bond) {
      var startPositionInPixels = coordinates.Coordinates.modelToCanvas(bond.startPosition);
      var endPositionInPixels = coordinates.Coordinates.modelToCanvas(bond.endPosition);
      transientLayer.append('circle').attr('cx', startPositionInPixels.x).attr('cy', startPositionInPixels.y).attr('r', 4).attr('fill', 'white').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', startPositionInPixels.x).attr('cy', startPositionInPixels.y).attr('r', 3).attr('fill', '#365CFF').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', endPositionInPixels.x).attr('cy', endPositionInPixels.y).attr('r', 4).attr('fill', 'white').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', endPositionInPixels.x).attr('cy', endPositionInPixels.y).attr('r', 3).attr('fill', '#365CFF').attr('style', 'pointer-events: none');
      transientLayer.append('line').attr('x1', startPositionInPixels.x).attr('y1', startPositionInPixels.y).attr('x2', endPositionInPixels.x).attr('y2', endPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 1).attr('stroke-dasharray', bond instanceof HydrogenBond.HydrogenBond ? '2' : '0').attr('style', 'pointer-events: none');
    }
  }]);
  return BondSnapView;
}();
_defineProperty__default["default"](BondSnapView, "viewName", 'BondSnapView');

exports.BondSnapView = BondSnapView;
//# sourceMappingURL=BondSnapView.js.map
