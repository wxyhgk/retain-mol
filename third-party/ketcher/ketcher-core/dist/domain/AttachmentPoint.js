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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../application/editor/editorSingleton.js');
var vec2 = require('./entities/vec2.js');
var d3 = require('d3');
require('../utilities/runAsyncAction.js');
require('../utilities/KetcherLogger.js');
require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
var assert = require('../utilities/assert.js');
var attachmentPointCalculations = require('./helpers/attachmentPointCalculations.js');
var monomers = require('./types/monomers.js');
require('./types/entities.js');
var MonomerToAtomBond = require('./entities/MonomerToAtomBond.js');
var _ = require('lodash');
var monomers$1 = require('./helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var _AttachmentPoint;
var AttachmentPoint = function () {
  function AttachmentPoint(constructorParams, skipInit) {
    var _constructorParams$ca, _constructorParams$mo, _constructorParams$mo2, _constructorParams$is, _constructorParams$is2;
    _classCallCheck__default["default"](this, AttachmentPoint);
    _defineProperty__default["default"](this, "rootElement", void 0);
    _defineProperty__default["default"](this, "attachmentPoint", void 0);
    _defineProperty__default["default"](this, "monomer", void 0);
    _defineProperty__default["default"](this, "bodyWidth", void 0);
    _defineProperty__default["default"](this, "bodyHeight", void 0);
    _defineProperty__default["default"](this, "attachmentPointName", void 0);
    _defineProperty__default["default"](this, "canvasOffset", void 0);
    _defineProperty__default["default"](this, "centerOfMonomer", void 0);
    _defineProperty__default["default"](this, "element", void 0);
    _defineProperty__default["default"](this, "hoverableArea", void 0);
    _defineProperty__default["default"](this, "initialAngle", 0);
    _defineProperty__default["default"](this, "isUsed", void 0);
    _defineProperty__default["default"](this, "isDragTarget", void 0);
    _defineProperty__default["default"](this, "isDragCircleHover", void 0);
    _defineProperty__default["default"](this, "isSnake", void 0);
    _defineProperty__default["default"](this, "applyZoomForPositionCalculation", void 0);
    this.rootElement = constructorParams.rootElement;
    this.monomer = constructorParams.monomer;
    this.bodyWidth = constructorParams.bodyWidth;
    this.bodyHeight = constructorParams.bodyHeight;
    this.canvasOffset = ((_constructorParams$ca = constructorParams.canvas.node()) === null || _constructorParams$ca === void 0 ? void 0 : _constructorParams$ca.getBoundingClientRect()) || new DOMRect(0, 0, 0, 0);
    this.attachmentPointName = constructorParams.attachmentPointName;
    this.centerOfMonomer = (_constructorParams$mo = (_constructorParams$mo2 = constructorParams.monomer.renderer) === null || _constructorParams$mo2 === void 0 ? void 0 : _constructorParams$mo2.center) !== null && _constructorParams$mo !== void 0 ? _constructorParams$mo : new vec2.Vec2(0, 0, 0);
    this.isSnake = constructorParams.isSnake;
    this.isUsed = constructorParams.isUsed;
    this.isDragTarget = (_constructorParams$is = constructorParams.isDragTarget) !== null && _constructorParams$is !== void 0 ? _constructorParams$is : false;
    this.isDragCircleHover = (_constructorParams$is2 = constructorParams.isDragCircleHover) !== null && _constructorParams$is2 !== void 0 ? _constructorParams$is2 : false;
    this.initialAngle = constructorParams.angle;
    this.applyZoomForPositionCalculation = constructorParams.applyZoomForPositionCalculation;
    this.attachmentPoint = null;
    if (!skipInit) {
      this.appendAttachmentPoint();
    }
  }
  _createClass__default["default"](AttachmentPoint, [{
    key: "editorEvents",
    get: function get() {
      return editorSingleton.provideEditorInstance().events;
    }
  }, {
    key: "fill",
    get: function get() {
      if (this.isDragTarget || this.monomer.isAttachmentPointPotentiallyUsed(this.attachmentPointName)) {
        return AttachmentPoint.colors.fillPotentially;
      } else if (this.monomer.isAttachmentPointUsed(this.attachmentPointName)) {
        return AttachmentPoint.colors.fillUsed;
      } else {
        return AttachmentPoint.colors.fill;
      }
    }
  }, {
    key: "stroke",
    get: function get() {
      if (this.monomer.isAttachmentPointPotentiallyUsed(this.attachmentPointName)) {
        return AttachmentPoint.colors.strokePotentially;
      } else if (this.monomer.isAttachmentPointUsed(this.attachmentPointName)) {
        return AttachmentPoint.colors.strokeUsed;
      } else {
        return AttachmentPoint.colors.stroke;
      }
    }
  }, {
    key: "removeAttachmentPoint",
    value: function removeAttachmentPoint() {
      var _this$element;
      (_this$element = this.element) === null || _this$element === void 0 || _this$element.remove();
    }
  }, {
    key: "renderAttachmentPointByCoordinates",
    value: function renderAttachmentPointByCoordinates(attachmentOnBorder, attachmentPointCoordinates, labelCoordinatesOnMonomer) {
      var fill = this.fill;
      var stroke = this.stroke;
      this.attachmentPoint = this.rootElement.append('g').data([this]).style('pointer-events', 'none').style('cursor', 'pointer').attr('class', 'dynamic-element');
      var attachmentPointElement = this.attachmentPoint.append('g');
      attachmentPointElement.append('line').attr('x1', attachmentOnBorder.x).attr('y1', attachmentOnBorder.y).attr('x2', attachmentPointCoordinates.x).attr('y2', attachmentPointCoordinates.y).attr('stroke', this.isDragTarget ? '#167782' : stroke).attr('stroke-linecap', 'round').attr('stroke-width', '1px');
      var circleStroke = 'white';
      if (this.isDragTarget) {
        circleStroke = '#167782';
      } else if (fill === 'white') {
        circleStroke = '#0097A8';
      }
      attachmentPointElement.append('circle').attr('r', this.isDragCircleHover ? AttachmentPoint.dragTargetRadius : AttachmentPoint.radius).attr('cx', attachmentPointCoordinates.x).attr('cy', attachmentPointCoordinates.y).attr('stroke', circleStroke).attr('stroke-width', '1px').attr('data-testid', 'monomer-attachment-point').attr('data-attachment-point-alias', this.attachmentPointName).attr('data-parent-monomer-id', this.monomer.id).attr('data-monomerid', this.monomer.id).attr('fill', this.isDragTarget ? 'white' : fill);
      var labelGroup = this.attachmentPoint.append('text');
      labelGroup.text(this.attachmentPointName).attr('x', labelCoordinatesOnMonomer.x).attr('y', labelCoordinatesOnMonomer.y).style('font-size', '6px').style('fill', '#585858').style('user-select', 'none');
      return this.attachmentPoint;
    }
  }, {
    key: "renderHoverableArea",
    value: function renderHoverableArea(monomerCenter, attachmentPointCenter, angleDegrees, hasBond) {
      var _this = this;
      if (!this.element) {
        return;
      }
      var rotation = angleDegrees + 90;
      var halfWidth = 8;
      var areaHeight = Math.sqrt(Math.pow(monomerCenter.x - attachmentPointCenter.x, 2) + Math.pow(monomerCenter.y - attachmentPointCenter.y, 2));
      var points = [{
        x: -AttachmentPoint.radius,
        y: AttachmentPoint.radius + 2
      }, {
        x: AttachmentPoint.radius,
        y: AttachmentPoint.radius + 2
      }, {
        x: halfWidth,
        y: -areaHeight + 10
      }, {
        x: -halfWidth,
        y: -areaHeight + 10
      }, {
        x: -AttachmentPoint.radius,
        y: AttachmentPoint.radius + 2
      }];
      var lineFunction = d3.line().x(function (_ref) {
        var x = _ref.x;
        return x;
      }).y(function (_ref2) {
        var y = _ref2.y;
        return y;
      });
      var hoverableAreaElement = this.element.append('g');
      hoverableAreaElement.append('path').attr('d', lineFunction(points) + 'z').attr('stroke', 'black').attr('stroke-width', '1px').attr('fill', '#0097A8').style('opacity', '0').style('pointer-events', hasBond ? 'none' : 'auto').attr('transform', "translate(".concat(attachmentPointCenter.x, ",").concat(attachmentPointCenter.y, ")rotate(").concat(rotation, ")"));
      hoverableAreaElement.on('mouseover', function (event) {
        event.attachmentPointName = _this.attachmentPointName;
        _this.editorEvents.mouseOverAttachmentPoint.dispatch(event);
      }).on('mouseleave', function (event) {
        _this.editorEvents.mouseLeaveAttachmentPoint.dispatch(event);
      }).on('mousemove', function (event) {
        _this.editorEvents.mouseMoveAttachmentPoint.dispatch(event);
      }).on('mousedown', function (event) {
        event.attachmentPointName = _this.attachmentPointName;
        _this.editorEvents.mouseDownAttachmentPoint.dispatch(event);
      }).on('mouseup', function (event) {
        event.attachmentPointName = _this.attachmentPointName;
        _this.editorEvents.mouseUpAttachmentPoint.dispatch(event);
      });
      return hoverableAreaElement;
    }
  }, {
    key: "appendAttachmentPoint",
    value: function appendAttachmentPoint() {
      var angleDegrees;
      var angleRadians;
      var polymerBond = this.monomer.attachmentPointsToBonds[this.attachmentPointName];
      var editor = editorSingleton.provideEditorInstance();
      var firstMonomer = polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond ? polymerBond.monomer : polymerBond === null || polymerBond === void 0 ? void 0 : polymerBond.firstMonomer;
      var flip = this.monomer.id === (firstMonomer === null || firstMonomer === void 0 ? void 0 : firstMonomer.id);
      var isAttachmentpointR1 = this.attachmentPointName === monomers.AttachmentPointName.R1;
      var isAttachmentpointR2 = this.attachmentPointName === monomers.AttachmentPointName.R2;
      if (!polymerBond) {
        angleDegrees = this.initialAngle;
      } else if (!(polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond) && !monomers$1.isBondBetweenSugarAndBaseOfRna(polymerBond) && (this.isSnake && !polymerBond.isHorizontal || editor.mode.modeName === 'snake-layout-mode' && polymerBond.isSideChainConnection)) {
        var bondRenderer = polymerBond === null || polymerBond === void 0 ? void 0 : polymerBond.renderer;
        var sideConnectionEndpointDirection = bondRenderer.getSideConnectionEndpointAngle(this.monomer);
        if (isAttachmentpointR1) {
          angleRadians = Math.PI * 2;
        } else if (isAttachmentpointR2) {
          angleRadians = Math.PI;
        } else if (_.isNumber(sideConnectionEndpointDirection)) {
          angleRadians = sideConnectionEndpointDirection;
        } else {
          angleRadians = this.rotateToAngle(polymerBond, flip);
        }
        angleDegrees = vec2.Vec2.radiansToDegrees(angleRadians);
      } else {
        angleRadians = this.rotateToAngle(polymerBond, flip);
        angleDegrees = vec2.Vec2.radiansToDegrees(angleRadians);
      }
      var _this$getCoordinates = this.getCoordinates(angleDegrees),
        _this$getCoordinates2 = _slicedToArray__default["default"](_this$getCoordinates, 3),
        attachmentToBorderCoordinates = _this$getCoordinates2[0],
        attachmentPointCoordinates = _this$getCoordinates2[1],
        labelCoordinates = _this$getCoordinates2[2];
      var attachmentToCenterCoordinates = attachmentPointCalculations.canvasToMonomerCoordinates(this.centerOfMonomer, this.centerOfMonomer, this.bodyWidth, this.bodyHeight);
      var attachmentPoint = this.renderAttachmentPointByCoordinates(attachmentToBorderCoordinates, attachmentPointCoordinates, labelCoordinates);
      this.element = attachmentPoint;
      var hoverableArea = this.renderHoverableArea(attachmentToCenterCoordinates, attachmentPointCoordinates, angleDegrees, Boolean(polymerBond));
      this.hoverableArea = hoverableArea;
      return attachmentPoint;
    }
  }, {
    key: "raise",
    value: function raise() {
      var _this$element2;
      (_this$element2 = this.element) === null || _this$element2 === void 0 || _this$element2.raise();
    }
  }, {
    key: "updateAttachmentPointStyleForHover",
    value: function updateAttachmentPointStyleForHover() {
      var _this$attachmentPoint, _this$attachmentPoint2;
      (_this$attachmentPoint = this.attachmentPoint) === null || _this$attachmentPoint === void 0 || _this$attachmentPoint.select('line').style('stroke', this.stroke);
      (_this$attachmentPoint2 = this.attachmentPoint) === null || _this$attachmentPoint2 === void 0 || _this$attachmentPoint2.select('circle').style('fill', this.fill).attr('stroke', this.fill === 'white' ? '#0097A8' : 'white');
    }
  }, {
    key: "rotateToAngle",
    value: function rotateToAngle(polymerBond) {
      var flip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var angleRadians = 0;
      if (flip) {
        angleRadians = vec2.Vec2.oxAngleForVector(polymerBond.endPosition, polymerBond.position);
      } else {
        angleRadians = vec2.Vec2.oxAngleForVector(polymerBond.position, polymerBond.endPosition);
      }
      return angleRadians;
    }
  }, {
    key: "getCoordinates",
    value: function getCoordinates(angleDegrees) {
      var _this$catchThePoint = this.catchThePoint(angleDegrees),
        _this$catchThePoint2 = _slicedToArray__default["default"](_this$catchThePoint, 3),
        pointOnBorder = _this$catchThePoint2[0],
        pointOfAttachment = _this$catchThePoint2[1],
        labelPoint = _this$catchThePoint2[2];
      var attachmentToBorderCoordinates = attachmentPointCalculations.canvasToMonomerCoordinates(pointOnBorder, this.centerOfMonomer, this.bodyWidth, this.bodyHeight);
      var attachmentPointCoordinates = attachmentPointCalculations.canvasToMonomerCoordinates(pointOfAttachment, this.centerOfMonomer, this.bodyWidth, this.bodyHeight);
      var labelCoordinates = attachmentPointCalculations.canvasToMonomerCoordinates(labelPoint, this.centerOfMonomer, this.bodyWidth, this.bodyHeight);
      return [attachmentToBorderCoordinates, attachmentPointCoordinates, labelCoordinates];
    }
  }, {
    key: "updateCoords",
    value: function updateCoords() {
      var _polymerBond$firstMon, _this$attachmentPoint3, _this$attachmentPoint4, _this$attachmentPoint5;
      var polymerBond = this.monomer.attachmentPointsToBonds[this.attachmentPointName];
      if (!polymerBond || polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond) {
        return;
      }
      var flip = this.monomer.id === (polymerBond === null || polymerBond === void 0 || (_polymerBond$firstMon = polymerBond.firstMonomer) === null || _polymerBond$firstMon === void 0 ? void 0 : _polymerBond$firstMon.id);
      var angleRadians = this.rotateToAngle(polymerBond, flip);
      var angleDegrees = vec2.Vec2.radiansToDegrees(angleRadians);
      var _this$getCoordinates3 = this.getCoordinates(angleDegrees),
        _this$getCoordinates4 = _slicedToArray__default["default"](_this$getCoordinates3, 3),
        attachmentToBorderCoordinates = _this$getCoordinates4[0],
        attachmentPointCoordinates = _this$getCoordinates4[1],
        labelCoordinates = _this$getCoordinates4[2];
      (_this$attachmentPoint3 = this.attachmentPoint) === null || _this$attachmentPoint3 === void 0 || _this$attachmentPoint3.select('line').attr('x1', attachmentToBorderCoordinates.x).attr('y1', attachmentToBorderCoordinates.y).attr('x2', attachmentPointCoordinates.x).attr('y2', attachmentPointCoordinates.y);
      (_this$attachmentPoint4 = this.attachmentPoint) === null || _this$attachmentPoint4 === void 0 || _this$attachmentPoint4.select('circle').attr('cx', attachmentPointCoordinates.x).attr('cy', attachmentPointCoordinates.y).attr('stroke', 'white').attr('fill', AttachmentPoint.colors.fillPotentially);
      (_this$attachmentPoint5 = this.attachmentPoint) === null || _this$attachmentPoint5 === void 0 || _this$attachmentPoint5.select('text').attr('x', labelCoordinates.x).attr('y', labelCoordinates.y);
    }
  }, {
    key: "catchThePoint",
    value: function catchThePoint(rotationAngle) {
      assert.assert(this.monomer.renderer);
      var currentMonomerCenter = {
        x: this.monomer.renderer.center.x,
        y: this.monomer.renderer.center.y
      };
      this.initialAngle = rotationAngle;
      var findPointOnMonomerBorder = attachmentPointCalculations.getSearchFunction(this.initialAngle - 180, this.canvasOffset, this.monomer);
      var applyZoomForPositionCalculation = this.applyZoomForPositionCalculation;
      var pointOnBorder = findPointOnMonomerBorder(currentMonomerCenter, (this.bodyWidth + this.bodyHeight) / 2, applyZoomForPositionCalculation);
      var _findLabelPoint = attachmentPointCalculations.findLabelPoint(pointOnBorder, this.initialAngle - 180, AttachmentPoint.attachmentPointLength, AttachmentPoint.labelOffset, AttachmentPoint.labelSize, this.isUsed),
        _findLabelPoint2 = _slicedToArray__default["default"](_findLabelPoint, 2),
        labelPoint = _findLabelPoint2[0],
        pointOfAttachment = _findLabelPoint2[1];
      return [pointOnBorder, pointOfAttachment, labelPoint];
    }
  }, {
    key: "getElement",
    value: function getElement() {
      return this.element;
    }
  }, {
    key: "getAttachmentPointName",
    value: function getAttachmentPointName() {
      return this.attachmentPointName;
    }
  }, {
    key: "getHoverableArea",
    value: function getHoverableArea() {
      return this.hoverableArea;
    }
  }, {
    key: "getAngle",
    value: function getAngle() {
      if (this.initialAngle < 0 && this.isUsed) {
        return this.initialAngle + 360;
      }
      return this.initialAngle;
    }
  }]);
  return AttachmentPoint;
}();
_AttachmentPoint = AttachmentPoint;
_defineProperty__default["default"](AttachmentPoint, "attachmentPointVector", 6);
_defineProperty__default["default"](AttachmentPoint, "attachmentPointLength", Math.hypot(_AttachmentPoint.attachmentPointVector, _AttachmentPoint.attachmentPointVector));
_defineProperty__default["default"](AttachmentPoint, "labelOffset", 3.5);
_defineProperty__default["default"](AttachmentPoint, "radius", 3);
_defineProperty__default["default"](AttachmentPoint, "dragTargetRadius", 5);
_defineProperty__default["default"](AttachmentPoint, "labelSize", {
  x: 3.5,
  y: 2.5
});
_defineProperty__default["default"](AttachmentPoint, "DRAG_TARGET_INDICATOR_FONT_SIZE", '5px');
_defineProperty__default["default"](AttachmentPoint, "colors", {
  fillUsed: '#0097A8',
  fill: 'white',
  fillPotentially: '#167782',
  strokeUsed: '#0097A8',
  stroke: '#167782',
  strokePotentially: '#167782'
});

exports.AttachmentPoint = AttachmentPoint;
//# sourceMappingURL=AttachmentPoint.js.map
