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
var coordinates = require('../../../editor/shared/coordinates.js');
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
var STYLE = {
  HANDLE_MARGIN: 15,
  HANDLE_RADIUS: 10,
  INITIAL_COLOR: '#B4B9D6',
  ACTIVE_COLOR: '#365CFF',
  RECT_RADIUS: 20,
  RECT_PADDING: 30,
  PROTRACTOR_RADIUS_STEP: 5,
  PROTRACTOR_CURSOR_OFFSET: 12,
  PROTRACTOR_COLOR: '#E1E5EA',
  DEGREE_FONT_SIZE: 12,
  DEGREE_TEXT_MARGIN: 10,
  DEGREE_LINE_LENGTH: 15,
  MIN_RADIUS_FOR_TEXT: 65,
  CURRENT_ANGLE_X_OFFSET: 20,
  CURRENT_ANGLE_Y_OFFSET: 10
};
var LEFT_ARROW_PATH = 'M12.7034 14.8189L9.39616 17.6218L9.13674 16.1892C8.12927 16.0487 7.17132 15.6644 6.34605 15.0697C5.52078 14.475 4.85314 13.6878 4.40108 12.7766C3.94903 11.8653 3.72622 10.8575 3.75201 9.84062C3.7778 8.82373 4.0514 7.8285 4.54906 6.94133L5.8121 7.65148C5.45018 8.29719 5.24246 9.01784 5.20516 9.75712C5.16786 10.4964 5.302 11.2343 5.59709 11.9132C5.89218 12.592 6.34023 13.1935 6.90624 13.6705C7.47225 14.1475 8.1409 14.4872 8.85993 14.6631L8.62297 13.3587L12.7034 14.8189Z';
var RIGHT_ARROW_PATH = 'M15.4493 13.0588L14.1862 12.3486C14.5482 11.7029 14.7559 10.9823 14.7932 10.243C14.8305 9.50371 14.6963 8.76582 14.4012 8.08695C14.1062 7.40809 13.6581 6.80665 13.0921 6.32962C12.5261 5.85259 11.8574 5.51288 11.1384 5.33704L11.3754 6.64501L7.29492 5.18124L10.6022 2.37834L10.8616 3.81095C11.8691 3.95145 12.827 4.33573 13.6523 4.93043C14.4776 5.52513 15.1452 6.31227 15.5973 7.22353C16.0493 8.13478 16.2721 9.1426 16.2463 10.1595C16.2205 11.1764 15.9469 12.1716 15.4493 13.0588Z';
var getDegreeDifference = function getDegreeDifference(a, b) {
  var diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};
var normalizeDegrees = function normalizeDegrees(degrees) {
  var wrapped = (degrees % 360 + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
};
var normalizeRadians = function normalizeRadians(angle) {
  var wrapped = angle % (2 * Math.PI);
  if (wrapped > Math.PI) return wrapped - 2 * Math.PI;
  if (wrapped <= -Math.PI) return wrapped + 2 * Math.PI;
  return wrapped;
};
var getPointOnCircle = function getPointOnCircle(center, radius, angle) {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle)
  };
};
var getRotationArcPath = function getRotationArcPath(center, radius, startAngle, rotationAngle) {
  var normalizedAngle = normalizeRadians(rotationAngle);
  var start = getPointOnCircle(center, radius, startAngle);
  var end = getPointOnCircle(center, radius, startAngle + normalizedAngle);
  var largeArcFlag = Math.abs(normalizedAngle) > Math.PI ? 1 : 0;
  var sweepFlag = normalizedAngle < 0 ? 0 : 1;
  return "M".concat(start.x, ",").concat(start.y) + "A".concat(radius, ",").concat(radius, " 0 ").concat(largeArcFlag, ",").concat(sweepFlag, " ").concat(end.x, ",").concat(end.y);
};
var RotationView = function (_TransientView) {
  _inherits__default["default"](RotationView, _TransientView);
  function RotationView() {
    _classCallCheck__default["default"](this, RotationView);
    return _callSuper(this, RotationView, arguments);
  }
  _createClass__default["default"](RotationView, null, [{
    key: "subscribeRotationHandle",
    value: function subscribeRotationHandle(listener) {
      RotationView.rotationHandleSubscribers.add(listener);
      return function () {
        return RotationView.rotationHandleSubscribers["delete"](listener);
      };
    }
  }, {
    key: "subscribeRotationCenter",
    value: function subscribeRotationCenter(listener) {
      RotationView.rotationCenterSubscribers.add(listener);
      return function () {
        return RotationView.rotationCenterSubscribers["delete"](listener);
      };
    }
  }, {
    key: "show",
    value: function show(transientLayer, params) {
      var _cursorInCanvas$x, _cursorInCanvas$y;
      var center = params.center,
        boundingBox = params.boundingBox,
        _params$rotationAngle = params.rotationAngle,
        rotationAngle = _params$rotationAngle === void 0 ? 0 : _params$rotationAngle,
        _params$isRotating = params.isRotating,
        isRotating = _params$isRotating === void 0 ? false : _params$isRotating,
        cursor = params.cursor,
        startAngleParam = params.startAngle;
      if (!isRotating || !RotationView.wasRotating) {
        RotationView.lastSnappingRadius = undefined;
      }
      RotationView.wasRotating = isRotating;
      var rectStartX = boundingBox.left - STYLE.RECT_PADDING;
      var rectStartY = boundingBox.top - STYLE.RECT_PADDING;
      var rectWidth = boundingBox.width + STYLE.RECT_PADDING * 2;
      var rectHeight = boundingBox.height + STYLE.RECT_PADDING * 2;
      if (!isRotating) {
        transientLayer.append('rect').attr('x', rectStartX).attr('y', rectStartY).attr('width', rectWidth).attr('height', rectHeight).attr('rx', STYLE.RECT_RADIUS).attr('ry', STYLE.RECT_RADIUS).attr('fill', 'none').attr('stroke', STYLE.INITIAL_COLOR).attr('stroke-dasharray', '3,1').attr('style', 'pointer-events: none');
      }
      var cursorInCanvas = isRotating && cursor ? coordinates.Coordinates.viewToCanvas(cursor) : undefined;
      var handleCenterX = isRotating ? (_cursorInCanvas$x = cursorInCanvas === null || cursorInCanvas === void 0 ? void 0 : cursorInCanvas.x) !== null && _cursorInCanvas$x !== void 0 ? _cursorInCanvas$x : center.x : boundingBox.left + boundingBox.width / 2;
      var handleCenterY = (_cursorInCanvas$y = cursorInCanvas === null || cursorInCanvas === void 0 ? void 0 : cursorInCanvas.y) !== null && _cursorInCanvas$y !== void 0 ? _cursorInCanvas$y : rectStartY - STYLE.HANDLE_MARGIN - STYLE.HANDLE_RADIUS;
      var linkPath = isRotating ? "M".concat(center.x, ",").concat(center.y, "L").concat(handleCenterX, ",").concat(handleCenterY) : "M".concat(handleCenterX, ",").concat(handleCenterY, "l0,").concat(STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN);
      var linkLine = transientLayer.append('path').attr('d', linkPath).attr('stroke', isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR).attr('stroke-dasharray', '4,4').attr('fill', 'none').attr('style', 'pointer-events: none');
      var crossColor = isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR;
      var crossGroup = transientLayer.append('g').attr('class', 'rotation-center-handle').attr('data-testid', 'rotation-center-handle').attr('style', 'pointer-events: all');
      var crossHitBoxSize = 24;
      crossGroup.append('rect').attr('x', center.x - crossHitBoxSize / 2).attr('y', center.y - crossHitBoxSize / 2).attr('width', crossHitBoxSize).attr('height', crossHitBoxSize).attr('fill', 'transparent').attr('stroke', 'none').attr('style', 'pointer-events: all').on('mousedown', function (event) {
        event.stopPropagation();
        event.preventDefault();
        RotationView.rotationCenterSubscribers.forEach(function (listener) {
          return listener({
            type: 'down',
            event: event
          });
        });
      }).on('mousemove', function (event) {
        if (event.buttons !== 1) return;
        RotationView.rotationCenterSubscribers.forEach(function (listener) {
          return listener({
            type: 'drag',
            event: event
          });
        });
      });
      crossGroup.append('path').attr('d', "M".concat(center.x - 8, ",").concat(center.y, "h16M").concat(center.x, ",").concat(center.y - 8, "v16")).attr('stroke', crossColor).attr('stroke-width', 2).attr('stroke-linecap', 'round').attr('style', 'pointer-events: none');
      if (!isRotating) {
        var hoverLinkPath = "M".concat(handleCenterX, ",").concat(handleCenterY, "L").concat(center.x, ",").concat(center.y);
        crossGroup.on('mouseenter', function () {
          crossGroup.select('path').attr('stroke', STYLE.ACTIVE_COLOR);
          linkLine.attr('d', hoverLinkPath).attr('stroke', STYLE.ACTIVE_COLOR);
        }).on('mouseleave', function () {
          crossGroup.select('path').attr('stroke', STYLE.INITIAL_COLOR);
          linkLine.attr('d', linkPath).attr('stroke', STYLE.INITIAL_COLOR);
        });
      }
      var handleGroup = transientLayer.append('g').attr('class', 'rotation-handle').attr('data-testid', 'rotation-handle').attr('transform', "translate(".concat(handleCenterX, ",").concat(handleCenterY, ")")).on('mousedown', function (event) {
        event.stopPropagation();
        event.preventDefault();
        RotationView.rotationHandleSubscribers.forEach(function (listener) {
          return listener({
            type: 'down',
            event: event
          });
        });
      }).on('mousedown', function (event) {
        if (event.buttons !== 1) return;
        RotationView.rotationHandleSubscribers.forEach(function (listener) {
          return listener({
            type: 'drag',
            event: event
          });
        });
      });
      handleGroup.append('circle').attr('r', STYLE.HANDLE_RADIUS).attr('fill', isRotating ? STYLE.ACTIVE_COLOR : STYLE.INITIAL_COLOR).attr('stroke', 'none').attr('style', "cursor: ".concat(isRotating ? 'grabbing' : 'grab'));
      var arrowGroup = handleGroup.append('g');
      arrowGroup.append('path').attr('d', LEFT_ARROW_PATH).attr('fill', isRotating ? 'none' : 'white').attr('transform', 'translate(-10,-10)');
      arrowGroup.append('path').attr('d', RIGHT_ARROW_PATH).attr('fill', isRotating ? 'none' : 'white').attr('transform', 'translate(-10,-10)');
      if (!isRotating) {
        handleGroup.on('mouseenter', function () {
          handleGroup.select('circle').attr('fill', STYLE.ACTIVE_COLOR);
        }).on('mouseleave', function () {
          handleGroup.select('circle').attr('fill', STYLE.INITIAL_COLOR);
        });
      }
      if (isRotating) {
        var centerInView = coordinates.Coordinates.canvasToView(center);
        var fallbackRadius = Math.sqrt(Math.pow(handleCenterY - centerInView.y, 2) + Math.pow(handleCenterX - centerInView.x, 2)) - STYLE.HANDLE_MARGIN - STYLE.HANDLE_RADIUS;
        var cursorDistance = cursor ? Math.sqrt(Math.pow(cursor.x - centerInView.x, 2) + Math.pow(cursor.y - centerInView.y, 2)) : undefined;
        var rawRadius = cursorDistance === undefined ? fallbackRadius : Math.max(cursorDistance - STYLE.PROTRACTOR_CURSOR_OFFSET, 0);
        var snappedToStep = Math.round(rawRadius / STYLE.PROTRACTOR_RADIUS_STEP) * STYLE.PROTRACTOR_RADIUS_STEP;
        var radius = snappedToStep > 0 ? snappedToStep : 0;
        var lastSnappingRadius = RotationView.lastSnappingRadius;
        if (radius > 0) {
          if (lastSnappingRadius === undefined) {
            RotationView.lastSnappingRadius = radius;
          } else {
            var upperThreshold = lastSnappingRadius * 1.4;
            var lowerThreshold = lastSnappingRadius / 1.4;
            if (radius >= upperThreshold || radius <= lowerThreshold) {
              RotationView.lastSnappingRadius = radius;
            } else {
              radius = lastSnappingRadius;
            }
          }
        }
        if (radius > 0) {
          transientLayer.append('circle').attr('cx', center.x).attr('cy', center.y).attr('r', radius).attr('fill', 'none').attr('stroke', STYLE.PROTRACTOR_COLOR).attr('stroke-dasharray', '4,4').attr('style', 'pointer-events: none');
          var startAngle = startAngleParam !== null && startAngleParam !== void 0 ? startAngleParam : -Math.PI / 2;
          var toRadians = function toRadians(deg) {
            return deg * Math.PI / 180;
          };
          var predefinedDegrees = [0, 30, 45, 60, 90, 120, 135, 150, 180, -150, -135, -120, -90, -60, -45, -30];
          var currentDegrees = normalizeDegrees(Math.round(rotationAngle * 180 / Math.PI));
          var tickLength = radius >= STYLE.MIN_RADIUS_FOR_TEXT ? STYLE.DEGREE_LINE_LENGTH : STYLE.DEGREE_LINE_LENGTH / 2;
          predefinedDegrees.forEach(function (degree) {
            var diff = getDegreeDifference(degree, currentDegrees);
            var angle = startAngle + toRadians(degree);
            var lineStartX = center.x + radius * Math.cos(angle);
            var lineStartY = center.y + radius * Math.sin(angle);
            var lineEndX = center.x + (radius + tickLength) * Math.cos(angle);
            var lineEndY = center.y + (radius + tickLength) * Math.sin(angle);
            transientLayer.append('path').attr('d', "M".concat(lineStartX, ",").concat(lineStartY, "L").concat(lineEndX, ",").concat(lineEndY)).attr('stroke', diff > 90 ? 'none' : STYLE.PROTRACTOR_COLOR).attr('stroke-dasharray', '4,4').attr('style', 'pointer-events: none');
            if (radius < STYLE.MIN_RADIUS_FOR_TEXT) {
              return;
            }
            var textRadius = radius + STYLE.DEGREE_TEXT_MARGIN + tickLength;
            var textX = center.x + textRadius * Math.cos(angle);
            var textY = center.y + textRadius * Math.sin(angle);
            var textFill;
            if (diff > 90) {
              textFill = 'none';
            } else if (degree !== 0 && degree === currentDegrees) {
              textFill = STYLE.ACTIVE_COLOR;
            } else {
              textFill = STYLE.INITIAL_COLOR;
            }
            transientLayer.append('text').attr('x', textX).attr('y', textY).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', "".concat(STYLE.DEGREE_FONT_SIZE, "px")).attr('fill', textFill).text("".concat(degree, "\xB0"));
          });
          transientLayer.append('path').attr('d', getRotationArcPath(center, radius, startAngle, rotationAngle)).attr('fill', 'none').attr('stroke', STYLE.ACTIVE_COLOR).attr('stroke-width', 1).attr('style', 'pointer-events: none');
          var angleInDegrees = normalizeDegrees(Math.round(rotationAngle * 180 / Math.PI));
          var textAngle = startAngle;
          var textRadius = radius + 20;
          var textX = center.x + textRadius * Math.cos(textAngle) + STYLE.CURRENT_ANGLE_X_OFFSET;
          var textY = center.y + textRadius * Math.sin(textAngle) + STYLE.CURRENT_ANGLE_Y_OFFSET;
          transientLayer.append('text').attr('x', textX).attr('y', textY).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '16px').attr('fill', '#333333').text("".concat(angleInDegrees, "\xB0"));
        }
      }
    }
  }]);
  return RotationView;
}(TransientView.TransientView);
_defineProperty__default["default"](RotationView, "lastSnappingRadius", void 0);
_defineProperty__default["default"](RotationView, "wasRotating", false);
_defineProperty__default["default"](RotationView, "rotationHandleSubscribers", new Set());
_defineProperty__default["default"](RotationView, "rotationCenterSubscribers", new Set());
_defineProperty__default["default"](RotationView, "viewName", 'RotationView');

exports.RotationView = RotationView;
//# sourceMappingURL=RotationView.js.map
