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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var vec2 = require('../../../../domain/entities/vec2.js');
var coordinates = require('../../../editor/shared/coordinates.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var DistanceSnapView = function () {
  function DistanceSnapView() {
    _classCallCheck__default["default"](this, DistanceSnapView);
  }
  _createClass__default["default"](DistanceSnapView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var alignment = params.alignment,
        alignedMonomers = params.alignedMonomers;
      if (!alignment || !(alignedMonomers !== null && alignedMonomers !== void 0 && alignedMonomers.length)) {
        return;
      }
      var sortedMonomers = _toConsumableArray__default["default"](alignedMonomers);
      sortedMonomers.sort(function (a, b) {
        return alignment === 'horizontal' ? a.center.x - b.center.x : a.center.y - b.center.y;
      });
      var extremeMonomer = alignedMonomers.reduce(function (extremeMonomer, nextMonomer) {
        if (alignment === 'horizontal') {
          return nextMonomer.center.y > extremeMonomer.center.y ? nextMonomer : extremeMonomer;
        } else {
          return nextMonomer.center.x < extremeMonomer.center.x ? nextMonomer : extremeMonomer;
        }
      }, alignedMonomers[0]);
      var alignerPosition = new vec2.Vec2(alignment === 'horizontal' ? 0 : extremeMonomer.center.x - 1.5, alignment === 'horizontal' ? extremeMonomer.center.y + 1.5 : 0);
      var alignerPositionInPixels = coordinates.Coordinates.modelToCanvas(alignerPosition);
      var previousMonomerPositionInPixels;
      sortedMonomers.forEach(function (monomer, index, monomers) {
        var monomerPositionInPixels = coordinates.Coordinates.modelToCanvas(monomer.center);
        var nextMonomer = index < monomers.length - 1 ? monomers[index + 1] : null;
        var nextMonomerPositionInPixels = nextMonomer ? coordinates.Coordinates.modelToCanvas(nextMonomer.center) : null;
        if (alignment === 'horizontal') {
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', monomerPositionInPixels.y).attr('x2', monomerPositionInPixels.x).attr('y2', alignerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('stroke-dasharray', '4').style('opacity', 0.75);
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', alignerPositionInPixels.y - 3).attr('x2', monomerPositionInPixels.x).attr('y2', alignerPositionInPixels.y + 3).attr('stroke', '#365CFF').attr('stroke-width', 0.5).style('opacity', 0.75);
          if (nextMonomerPositionInPixels) {
            transientLayer.append('line').attr('x1', monomerPositionInPixels.x + 3).attr('y1', alignerPositionInPixels.y).attr('x2', nextMonomerPositionInPixels.x - 3).attr('y2', alignerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
          }
          if (previousMonomerPositionInPixels) {
            transientLayer.append('line').attr('x1', monomerPositionInPixels.x - 3).attr('y1', alignerPositionInPixels.y).attr('x2', previousMonomerPositionInPixels.x + 3).attr('y2', alignerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
          }
        } else {
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', monomerPositionInPixels.y).attr('x2', alignerPositionInPixels.x).attr('y2', monomerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('stroke-dasharray', '4').style('opacity', 0.75);
          transientLayer.append('line').attr('x1', alignerPositionInPixels.x - 3).attr('y1', monomerPositionInPixels.y).attr('x2', alignerPositionInPixels.x + 3).attr('y2', monomerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).style('opacity', 0.75);
          if (nextMonomerPositionInPixels) {
            transientLayer.append('line').attr('x1', alignerPositionInPixels.x).attr('y1', monomerPositionInPixels.y + 3).attr('x2', alignerPositionInPixels.x).attr('y2', nextMonomerPositionInPixels.y - 3).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
          }
          if (previousMonomerPositionInPixels) {
            transientLayer.append('line').attr('x1', alignerPositionInPixels.x).attr('y1', monomerPositionInPixels.y - 3).attr('x2', alignerPositionInPixels.x).attr('y2', previousMonomerPositionInPixels.y + 3).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
          }
        }
        previousMonomerPositionInPixels = monomerPositionInPixels;
      });
    }
  }]);
  return DistanceSnapView;
}();
_defineProperty__default["default"](DistanceSnapView, "viewName", 'DistanceSnapView');

exports.DistanceSnapView = DistanceSnapView;
//# sourceMappingURL=DistanceSnapView.js.map
