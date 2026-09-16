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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');
var coordinates = require('../../../editor/shared/coordinates.js');
var d3 = require('d3');
var TransientView = require('./TransientView.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var minimalAngleDifference = function minimalAngleDifference(a, b) {
  var diff = b - a;
  while (diff <= -Math.PI) {
    diff += 2 * Math.PI;
  }
  while (diff > Math.PI) {
    diff -= 2 * Math.PI;
  }
  return diff;
};
var AngleSnapView = function (_TransientView) {
  _inherits__default["default"](AngleSnapView, _TransientView);
  function AngleSnapView() {
    _classCallCheck__default["default"](this, AngleSnapView);
    return _callSuper(this, AngleSnapView, arguments);
  }
  _createClass__default["default"](AngleSnapView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var _arc$slice, _arc;
      var connectedMonomer = params.connectedMonomer,
        polymerBond = params.polymerBond,
        isBondLengthSnapped = params.isBondLengthSnapped;
      var connectedPosition = connectedMonomer.position;
      var movingMonomer = polymerBond.firstMonomer === connectedMonomer ? polymerBond.secondMonomer : polymerBond.firstMonomer;
      if (!movingMonomer) {
        return;
      }
      var movingPosition = movingMonomer.position;
      var connectedPositionInPixels = coordinates.Coordinates.modelToCanvas(connectedPosition);
      var movingPositionInPixels = coordinates.Coordinates.modelToCanvas(movingPosition);
      transientLayer.append('line').attr('x1', connectedPositionInPixels.x).attr('y1', connectedPositionInPixels.y).attr('x2', connectedPositionInPixels.x).attr('y2', connectedPositionInPixels.y - 40).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('stroke-dasharray', '4').style('opacity', 0.75);
      if (!isBondLengthSnapped) {
        transientLayer.append('line').attr('x1', connectedPositionInPixels.x).attr('y1', connectedPositionInPixels.y).attr('x2', movingPositionInPixels.x).attr('y2', movingPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 1).attr('stroke-dasharray', polymerBond instanceof HydrogenBond.HydrogenBond ? '2' : '0');
      }
      var bondAngle = Math.atan2(movingPositionInPixels.y - connectedPositionInPixels.y, movingPositionInPixels.x - connectedPositionInPixels.x);
      var alignerAngle = -Math.PI / 2;
      if (Math.abs(bondAngle - alignerAngle) < 1e-8) {
        return;
      }
      var startAngle = bondAngle + Math.PI / 2;
      var endAngle = alignerAngle + Math.PI / 2;
      var diff = minimalAngleDifference(startAngle, endAngle);
      var arcPath = (_arc$slice = (_arc = d3.arc()({
        innerRadius: 30,
        outerRadius: 30,
        startAngle: startAngle + diff,
        endAngle: startAngle
      })) === null || _arc === void 0 ? void 0 : _arc.slice(0, -1)) !== null && _arc$slice !== void 0 ? _arc$slice : null;
      transientLayer.append('path').attr('d', arcPath).attr('transform', "translate(".concat(connectedPositionInPixels.x, ", ").concat(connectedPositionInPixels.y, ")")).attr('fill', 'none').attr('opacity', 0.75).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)');
    }
  }]);
  return AngleSnapView;
}(TransientView.TransientView);
_defineProperty__default["default"](AngleSnapView, "viewName", 'AngleSnapView');

exports.AngleSnapView = AngleSnapView;
//# sourceMappingURL=AngleSnapView.js.map
