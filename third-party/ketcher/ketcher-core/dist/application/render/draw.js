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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var rxnArrow = require('../../domain/entities/rxnArrow.js');
var vec2 = require('../../domain/entities/vec2.js');
var options = require('./options.js');
var raphaelExt = require('./raphael-ext.js');
var svgPath = require('svgpath');
var util = require('./util.js');
var toFixed = require('../../utilities/toFixed.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var pathBuilder = require('./pathBuilder.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var svgPath__default = /*#__PURE__*/_interopDefaultLegacy(svgPath);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var ARROW_HEAD_LENGHT = 0.25;
var ARROW_HEAD_WIDTH = 0.125;
var ARROW_HEAD_ATTR = 0.1;
var ARROW_OFFSET = 0.1;
var ARROW_DASH_INTERVAL = 0.0875;
var ARROW_FAIL_SIGN_WIDTH = 0.2;
var ARROW_UNBALANCED_OFFSET = 0.2;
function getArrowHeadDimensions(options$1) {
  var _getOptionsWithConver = options.getOptionsWithConvertedUnits(options$1),
    microModeScale = _getOptionsWithConver.microModeScale;
  return {
    arrowHeadLength: ARROW_HEAD_LENGHT * microModeScale,
    arrowHeadWidth: ARROW_HEAD_WIDTH * microModeScale,
    arrowHeadAttr: ARROW_HEAD_ATTR * microModeScale,
    arrowOffset: ARROW_OFFSET * microModeScale
  };
}
function getUnbalancedArrowHeadOffset(options$1) {
  var _getOptionsWithConver2 = options.getOptionsWithConvertedUnits(options$1),
    microModeScale = _getOptionsWithConver2.microModeScale;
  return ARROW_UNBALANCED_OFFSET * microModeScale;
}
function rectangle(paper, points) {
  return paper.rect(toFixed.toFixed(Math.min(points[0].x, points[1].x)), toFixed.toFixed(Math.min(points[0].y, points[1].y)), toFixed.toFixed(Math.abs(points[1].x - points[0].x)), toFixed.toFixed(Math.abs(points[1].y - points[0].y)));
}
function rectangleArrowHighlightAndSelection(_paper, _ref, length, angle) {
  var _ref$pos = _slicedToArray__default["default"](_ref.pos, 1),
    start = _ref$pos[0],
    height = _ref.height;
  var endX = start.x + length;
  var wOffset = 5,
    hOffset = height || 8;
  var path = "M".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y - hOffset)) + "L".concat(toFixed.toFixed(endX + wOffset), ",").concat(toFixed.toFixed(start.y - hOffset)) + "L".concat(toFixed.toFixed(endX + wOffset), ",").concat(toFixed.toFixed(start.y + (!height ? hOffset : 0))) + "L".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y + (!height ? hOffset : 0)), "Z");
  return svgPath__default["default"](path).rotate(angle, start.x, start.y).toString();
}
function ellipse(paper, points) {
  var rad = vec2.Vec2.diff(points[1], points[0]);
  var rx = rad.x / 2;
  var ry = rad.y / 2;
  return paper.ellipse(points[0].x + rx, points[0].y + ry, Math.abs(rx), Math.abs(ry));
}
function polyline(paper, points) {
  var path = ['M', points[0].x, points[0].y];
  var _iterator = _createForOfIteratorHelper(points.slice(1)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var point = _step.value;
      path.push('L', point.x, point.y);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return paper.path(path);
}
function line(paper, points) {
  var path = ['M', points[0].x, points[0].y];
  path.push('L', points[1].x, points[1].y);
  return paper.path(path);
}
function arrow(paper, item, length, angle, options, isResizing) {
  var shouldApplySnappingStyle = isResizing && ['0', '-0', '90', '-90', '180', '-180'].includes(angle.toFixed());
  switch (item.mode) {
    case rxnArrow.RxnArrowMode.OpenAngle:
      {
        return arrowOpenAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.FilledTriangle:
      {
        return arrowFilledTriangle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.FilledBow:
      {
        return arrowFilledBow(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.DashedOpenAngle:
      {
        return arrowDashedOpenAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.Failed:
      {
        return arrowFailed(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.Retrosynthetic:
      {
        return arrowRetrosynthetic(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.BothEndsFilledTriangle:
      {
        return arrowBothEndsFilledTriangle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EquilibriumFilledHalfBow:
      {
        return arrowEquilibriumFilledHalfBow(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EquilibriumFilledTriangle:
      {
        return arrowEquilibriumFilledTriangle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EquilibriumOpenAngle:
      {
        return arrowEquilibriumOpenAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.UnbalancedEquilibriumFilledHalfBow:
      {
        return arrowUnbalancedEquilibriumFilledHalfBow(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle:
      {
        return arrowUnbalancedEquilibriumOpenHalfAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow:
      {
        return arrowUnbalancedEquilibriumLargeFilledHalfBow(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle:
      {
        return arrowUnbalancedEquilibriumFilledHalfTriangle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EllipticalArcFilledBow:
      {
        return arrowEllipticalArcFilledBow(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EllipticalArcFilledTriangle:
      {
        return arrowEllipticalArcFilledTriangle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EllipticalArcOpenAngle:
      {
        return arrowEllipticalArcOpenAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
    case rxnArrow.RxnArrowMode.EllipticalArcOpenHalfAngle:
      {
        return arrowEllipticalArcOpenHalfAngle(paper, item, length, angle, options, shouldApplySnappingStyle);
      }
  }
}
function arrowEllipticalArcFilledBow(paper, _ref2, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref2$pos = _slicedToArray__default["default"](_ref2.pos, 1),
    start = _ref2$pos[0],
    height = _ref2.height;
  var direction = height >= 0 ? 1 : -1;
  var _getArrowHeadDimensio = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio.arrowHeadWidth,
    arrowHeadAttr = _getArrowHeadDimensio.arrowHeadAttr;
  var length = direction * arrowHeadLength;
  var width = direction * arrowHeadWidth;
  var attr = direction * arrowHeadAttr;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "A".concat(arrowLength / 2, ",").concat(height, ",", 0, ",", 0, ",").concat(direction > 0 ? 1 : 0, ",").concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - width), ",").concat(toFixed.toFixed(start.y - length)) + "l".concat(toFixed.toFixed(width), ",").concat(toFixed.toFixed(attr)) + "l".concat(toFixed.toFixed(width), ",").concat(toFixed.toFixed(-attr)) + "l".concat(toFixed.toFixed(-width), ",").concat(length);
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowEllipticalArcFilledTriangle(paper, _ref3, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref3$pos = _slicedToArray__default["default"](_ref3.pos, 1),
    start = _ref3$pos[0],
    height = _ref3.height;
  var _getArrowHeadDimensio2 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio2.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio2.arrowHeadWidth;
  var direction = height >= 0 ? 1 : -1;
  var triangleLength = direction * arrowHeadLength;
  var triangleWidth = direction * arrowHeadWidth;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "A".concat(arrowLength / 2, ",").concat(height, ",", 0, ",", 0, ",").concat(direction > 0 ? 1 : 0, ",").concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - triangleWidth), ",").concat(toFixed.toFixed(start.y - triangleLength)) + "l".concat(toFixed.toFixed(triangleLength), ",").concat(toFixed.toFixed(0)) + "l".concat(toFixed.toFixed(-triangleWidth), ",").concat(toFixed.toFixed(triangleLength));
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowEllipticalArcOpenAngle(paper, _ref4, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref4$pos = _slicedToArray__default["default"](_ref4.pos, 1),
    start = _ref4$pos[0],
    height = _ref4.height;
  var direction = height >= 0 ? 1 : -1;
  var _getArrowHeadDimensio3 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio3.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio3.arrowHeadWidth;
  var width = direction * arrowHeadWidth;
  var length = direction * arrowHeadLength;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "A".concat(arrowLength / 2, ",").concat(height, ",", 0, ",", 0, ",").concat(direction > 0 ? 1 : 0, ",").concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - width), ",").concat(toFixed.toFixed(start.y - length)) + "M".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX + width), ", ").concat(toFixed.toFixed(start.y - length));
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowEllipticalArcOpenHalfAngle(paper, _ref5, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref5$pos = _slicedToArray__default["default"](_ref5.pos, 1),
    start = _ref5$pos[0],
    height = _ref5.height;
  var direction = height >= 0 ? 1 : -1;
  var _getArrowHeadDimensio4 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio4.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio4.arrowHeadWidth;
  var width = direction * arrowHeadWidth;
  var length = direction * arrowHeadLength;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "A".concat(arrowLength / 2, ",").concat(height, ",", 0, ",", 0, ",").concat(direction > 0 ? 1 : 0, ", ").concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX + width), ", ").concat(toFixed.toFixed(start.y - length));
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowOpenAngle(paper, _ref6, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref6$pos = _slicedToArray__default["default"](_ref6.pos, 1),
    start = _ref6$pos[0];
  var _getArrowHeadDimensio5 = getArrowHeadDimensions(options),
    arrowHeadAttr = _getArrowHeadDimensio5.arrowHeadAttr,
    arrowHeadLength = _getArrowHeadDimensio5.arrowHeadLength;
  var pathBuilder$1 = new pathBuilder.PathBuilder().addOpenArrowPathParts(start, arrowLength, arrowHeadLength, arrowHeadAttr);
  var transformedPath = svgPath__default["default"](pathBuilder$1.build()).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowFilledTriangle(paper, _ref7, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref7$pos = _slicedToArray__default["default"](_ref7.pos, 1),
    start = _ref7$pos[0];
  var _getArrowHeadDimensio6 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio6.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio6.arrowHeadWidth;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y), "Z");
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowFilledBow(paper, _ref8, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref8$pos = _slicedToArray__default["default"](_ref8.pos, 1),
    start = _ref8$pos[0];
  var _getArrowHeadDimensio7 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio7.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio7.arrowHeadWidth,
    arrowHeadAttr = _getArrowHeadDimensio7.arrowHeadAttr;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength + arrowHeadAttr), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y), "Z");
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowDashedOpenAngle(paper, _ref9, arrowLength, arrowAngle, options$1, shouldApplySnappingStyle) {
  var _ref9$pos = _slicedToArray__default["default"](_ref9.pos, 1),
    start = _ref9$pos[0];
  var _getArrowHeadDimensio8 = getArrowHeadDimensions(options$1),
    arrowHeadLength = _getArrowHeadDimensio8.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio8.arrowHeadWidth;
  var _getOptionsWithConver3 = options.getOptionsWithConvertedUnits(options$1),
    microModeScale = _getOptionsWithConver3.microModeScale;
  var dashInterval = ARROW_DASH_INTERVAL * microModeScale;
  var path = [];
  var endX = start.x + arrowLength;
  for (var i = 0; i < arrowLength / dashInterval; i++) {
    if (i % 2) {
      path.push("L".concat(toFixed.toFixed(start.x + i * dashInterval), ",").concat(toFixed.toFixed(start.y)));
    } else {
      path.push("M".concat(toFixed.toFixed(start.x + i * dashInterval), ",").concat(toFixed.toFixed(start.y)));
    }
  }
  path.push("M".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "M".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options$1.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options$1.arrowSnappingStyle));
}
function arrowFailed(paper, _ref0, arrowLength, arrowAngle, options$1, shouldApplySnappingStyle) {
  var _ref0$pos = _slicedToArray__default["default"](_ref0.pos, 1),
    start = _ref0$pos[0];
  var _getArrowHeadDimensio9 = getArrowHeadDimensions(options$1),
    arrowHeadLength = _getArrowHeadDimensio9.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio9.arrowHeadWidth,
    arrowHeadAttr = _getArrowHeadDimensio9.arrowHeadAttr;
  var _getOptionsWithConver4 = options.getOptionsWithConvertedUnits(options$1),
    microModeScale = _getOptionsWithConver4.microModeScale;
  var failSignWidth = ARROW_FAIL_SIGN_WIDTH * microModeScale;
  var endX = start.x + arrowLength;
  var arrowCenter = endX - (endX - start.x) / 2;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength + arrowHeadAttr), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y), "Z"));
  path.push("M".concat(toFixed.toFixed(arrowCenter + failSignWidth), ",").concat(toFixed.toFixed(start.y + failSignWidth)) + "L".concat(toFixed.toFixed(arrowCenter - failSignWidth), ",").concat(toFixed.toFixed(start.y - failSignWidth)));
  path.push("M".concat(toFixed.toFixed(arrowCenter + failSignWidth), ",").concat(toFixed.toFixed(start.y - failSignWidth)) + "L".concat(toFixed.toFixed(arrowCenter - failSignWidth), ",").concat(toFixed.toFixed(start.y + failSignWidth)));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options$1.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options$1.arrowSnappingStyle));
}
function arrowRetrosynthetic(paper, _ref1, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref1$pos = _slicedToArray__default["default"](_ref1.pos, 1),
    start = _ref1$pos[0];
  var _getArrowHeadDimensio0 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio0.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio0.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio0.arrowOffset;
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX + arrowHeadLength), ",").concat(toFixed.toFixed(start.y)));
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(endX + arrowHeadLength), ",").concat(toFixed.toFixed(start.y)));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowBothEndsFilledTriangle(paper, _ref10, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref10$pos = _slicedToArray__default["default"](_ref10.pos, 1),
    start = _ref10$pos[0];
  var _getArrowHeadDimensio1 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio1.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio1.arrowHeadWidth;
  var endX = start.x + arrowLength;
  var path = "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y)) + "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth)) + "L".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y));
  var transformedPath = svgPath__default["default"](path).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowEquilibriumFilledHalfBow(paper, _ref11, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref11$pos = _slicedToArray__default["default"](_ref11.pos, 1),
    start = _ref11$pos[0];
  var _getArrowHeadDimensio10 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio10.arrowHeadLength,
    arrowHeadAttr = _getArrowHeadDimensio10.arrowHeadAttr,
    arrowOffset = _getArrowHeadDimensio10.arrowOffset,
    arrowHeadWidth = _getArrowHeadDimensio10.arrowHeadWidth;
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength + arrowHeadAttr), ",").concat(toFixed.toFixed(start.y - arrowOffset), "Z"));
  path.push("M".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength - arrowHeadAttr), ",").concat(start.y + arrowOffset, "Z"));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowEquilibriumFilledTriangle(paper, _ref12, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref12$pos = _slicedToArray__default["default"](_ref12.pos, 1),
    start = _ref12$pos[0];
  var _getArrowHeadDimensio11 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio11.arrowHeadLength,
    arrowOffset = _getArrowHeadDimensio11.arrowOffset,
    arrowHeadWidth = _getArrowHeadDimensio11.arrowHeadWidth;
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset), "Z"));
  path.push("M".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset), "Z"));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowEquilibriumOpenAngle(paper, _ref13, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref13$pos = _slicedToArray__default["default"](_ref13.pos, 1),
    start = _ref13$pos[0];
  var _getArrowHeadDimensio12 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio12.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio12.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio12.arrowOffset;
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)));
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowOffset + arrowHeadWidth)));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowUnbalancedEquilibriumFilledHalfBow(paper, _ref14, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref14$pos = _slicedToArray__default["default"](_ref14.pos, 1),
    start = _ref14$pos[0];
  var _getArrowHeadDimensio13 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio13.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio13.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio13.arrowOffset,
    arrowHeadAttr = _getArrowHeadDimensio13.arrowHeadAttr;
  var unbalanceVal = getUnbalancedArrowHeadOffset(options);
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength + arrowHeadAttr), ",").concat(toFixed.toFixed(start.y - arrowOffset), "Z"));
  path.push("M".concat(toFixed.toFixed(endX - unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + unbalanceVal + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + unbalanceVal + arrowHeadLength - arrowHeadAttr), ",").concat(start.y + arrowOffset, "Z"));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowUnbalancedEquilibriumOpenHalfAngle(paper, _ref15, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref15$pos = _slicedToArray__default["default"](_ref15.pos, 1),
    start = _ref15$pos[0];
  var _getArrowHeadDimensio14 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio14.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio14.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio14.arrowOffset;
  var unbalanceVal = getUnbalancedArrowHeadOffset(options);
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)));
  path.push("M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX - unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset + arrowHeadWidth)));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), shouldApplySnappingStyle && {
    stroke: options.arrowSnappingStyle.stroke
  }));
}
function arrowUnbalancedEquilibriumLargeFilledHalfBow(paper, _ref16, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref16$pos = _slicedToArray__default["default"](_ref16.pos, 1),
    start = _ref16$pos[0];
  var _getArrowHeadDimensio15 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio15.arrowHeadLength,
    arrowHeadWidthNormal = _getArrowHeadDimensio15.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio15.arrowOffset,
    arrowHeadAttr = _getArrowHeadDimensio15.arrowHeadAttr;
  var unbalanceVal = getUnbalancedArrowHeadOffset(options);
  var arrowHeadWidth = arrowHeadWidthNormal * 1.5;
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength + arrowHeadAttr), ",").concat(toFixed.toFixed(start.y - arrowOffset), "Z"));
  path.push("M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX - unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength - arrowHeadAttr + unbalanceVal), ",").concat(start.y + arrowOffset, "Z"));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function arrowUnbalancedEquilibriumFilledHalfTriangle(paper, _ref17, arrowLength, arrowAngle, options, shouldApplySnappingStyle) {
  var _ref17$pos = _slicedToArray__default["default"](_ref17.pos, 1),
    start = _ref17$pos[0];
  var _getArrowHeadDimensio16 = getArrowHeadDimensions(options),
    arrowHeadLength = _getArrowHeadDimensio16.arrowHeadLength,
    arrowHeadWidth = _getArrowHeadDimensio16.arrowHeadWidth,
    arrowOffset = _getArrowHeadDimensio16.arrowOffset;
  var unbalanceVal = getUnbalancedArrowHeadOffset(options);
  var endX = start.x + arrowLength;
  var path = [];
  path.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowOffset), "Z"));
  path.push("M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX - unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "M".concat(toFixed.toFixed(start.x + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength + unbalanceVal), ",").concat(toFixed.toFixed(start.y + arrowHeadWidth + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength + unbalanceVal), ",").concat(start.y + arrowOffset, "Z"));
  var transformedPath = svgPath__default["default"](path.join('')).rotate(arrowAngle, start.x, start.y).toString();
  return paper.path(transformedPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    fill: '#000'
  }, shouldApplySnappingStyle && options.arrowSnappingStyle));
}
function plus(paper, point, options) {
  var s = options.microModeScale / 5;
  return paper.path('M{0},{4}L{0},{5}M{2},{1}L{3},{1}', toFixed.toFixed(point.x), toFixed.toFixed(point.y), toFixed.toFixed(point.x - s), toFixed.toFixed(point.x + s), toFixed.toFixed(point.y - s), toFixed.toFixed(point.y + s)).attr(options.lineattr);
}
function bondSingle(paper, halfBond1, halfBond2, options, isSnapping) {
  var color = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '#000';
  var a = halfBond1.p;
  var b = halfBond2.p;
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondSingleUp(paper, a, b2, b3, options, isSnapping) {
  var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '#000';
  return paper.path('M{0},{1}L{2},{3}L{4},{5}Z', toFixed.toFixed(a.x), toFixed.toFixed(a.y), toFixed.toFixed(b2.x), toFixed.toFixed(b2.y), toFixed.toFixed(b3.x), toFixed.toFixed(b3.y)).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondSingleStereoBold(paper, a1, a2, a3, a4, options, isSnapping) {
  var color = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '#000';
  var bond = paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z', toFixed.toFixed(a1.x), toFixed.toFixed(a1.y), toFixed.toFixed(a2.x), toFixed.toFixed(a2.y), toFixed.toFixed(a3.x), toFixed.toFixed(a3.y), toFixed.toFixed(a4.x), toFixed.toFixed(a4.y)).attr(options.lineattr).attr({
    stroke: color,
    fill: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
  return bond;
}
function bondDoubleStereoBold(paper, sgBondPath, b1, b2, options, isSnapping) {
  var color = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '#000';
  return paper.set([sgBondPath, paper.path('M{0},{1}L{2},{3}', toFixed.toFixed(b1.x), toFixed.toFixed(b1.y), toFixed.toFixed(b2.x), toFixed.toFixed(b2.y)).attr(options.lineattr).attr({
    stroke: color,
    fill: color
  }).attr(isSnapping ? options.bondSnappingStyle : {})]);
}
function bondSingleDown(paper, halfBond1, d, nlines, step, options, isSnapping) {
  var color = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '#000';
  var a = halfBond1.p;
  var n = halfBond1.norm;
  var bsp = 0.7 * options.stereoBond;
  var path = '';
  var p;
  var q;
  var r;
  for (var i = 0; i < nlines; ++i) {
    r = a.addScaled(d, step * i);
    p = r.addScaled(n, bsp * (i + 0.5) / (nlines - 0.5));
    q = r.addScaled(n, -bsp * (i + 0.5) / (nlines - 0.5));
    path += makeStroke(p, q);
  }
  return paper.path(path).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondSingleEither(paper, halfBond1, d, nlines, step, options, isSnapping) {
  var color = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '#000';
  var a = halfBond1.p;
  var n = halfBond1.norm;
  var bsp = 0.7 * options.stereoBond;
  var path = 'M' + toFixed.toFixed(a.x) + ',' + toFixed.toFixed(a.y);
  var r = a;
  for (var i = 0; i < nlines; ++i) {
    r = a.addScaled(d, step * (i + 0.5)).addScaled(n, (i & 1 ? -1 : +1) * bsp * (i + 0.5) / (nlines - 0.5));
    path += 'L' + toFixed.toFixed(r.x) + ',' + toFixed.toFixed(r.y);
  }
  return paper.path(path).attr(options.lineattr).attr({
    stroke: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondDouble(paper, a1, a2, b1, b2, cisTrans, options, isSnapping) {
  return paper.path(cisTrans ? 'M{0},{1}L{6},{7}M{4},{5}L{2},{3}' : 'M{0},{1}L{2},{3}M{4},{5}L{6},{7}', toFixed.toFixed(a1.x), toFixed.toFixed(a1.y), toFixed.toFixed(b1.x), toFixed.toFixed(b1.y), toFixed.toFixed(a2.x), toFixed.toFixed(a2.y), toFixed.toFixed(b2.x), toFixed.toFixed(b2.y)).attr(options.lineattr).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondSingleOrDouble(paper, halfBond1, halfBond2, nSect, options, isSnapping) {
  var a = halfBond1.p;
  var b = halfBond2.p;
  var n = halfBond1.norm;
  var bsp = options.bondSpace / 2;
  var path = '';
  var pi;
  var pp = a;
  for (var i = 1; i <= nSect; ++i) {
    pi = vec2.Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect);
    if (i & 1) {
      path += makeStroke(pp, pi);
    } else {
      path += makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp));
      path += makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp));
    }
    pp = pi;
  }
  return paper.path(path).attr(options.lineattr).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondTriple(paper, halfBond1, halfBond2, options, isSnapping) {
  var color = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '#000';
  var a = halfBond1.p;
  var b = halfBond2.p;
  var n = halfBond1.norm;
  var a2 = a.addScaled(n, options.bondSpace);
  var b2 = b.addScaled(n, options.bondSpace);
  var a3 = a.addScaled(n, -options.bondSpace);
  var b3 = b.addScaled(n, -options.bondSpace);
  return paper.path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3)).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondAromatic(paper, paths, bondShift, options, isSnapping) {
  var l1 = paper.path(paths[0]).attr(options.lineattr).attr(isSnapping ? options.bondSnappingStyle : {});
  var l2 = paper.path(paths[1]).attr(options.lineattr).attr(isSnapping ? options.bondSnappingStyle : {});
  if (bondShift !== undefined && bondShift !== null) {
    (bondShift > 0 ? l1 : l2).attr({
      'stroke-dasharray': '- '
    });
  }
  return paper.set([l1, l2]);
}
function bondAny(paper, halfBond1, halfBond2, options, isSnapping) {
  var a = halfBond1.p;
  var b = halfBond2.p;
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    'stroke-dasharray': '- '
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondHydrogen(paper, halfBond1, halfBond2, options, isSnapping) {
  var a = halfBond1.p;
  var b = halfBond2.p;
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    'stroke-dasharray': '.',
    'stroke-linecap': 'square'
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function bondDative(paper, halfBond1, halfBond2, options, isSnapping) {
  var a = halfBond1.p;
  var b = halfBond2.p;
  if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {
    return paper.path('');
  }
  var directionVec = vec2.Vec2.diff(b, a);
  if (directionVec.length() < 5) {
    var angleDegrees = Math.atan2(directionVec.y, directionVec.x) * (180 / Math.PI);
    return drawArrowSymbol(paper, b, options, angleDegrees);
  }
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    'arrow-end': 'block-midium-long'
  }).attr(isSnapping ? options.bondSnappingStyle : {});
}
function drawArrowSymbol(paper, point, options, angleDegrees) {
  var baseSize = options.microModeScale * 0.1;
  var arrowHalfWidth = baseSize / 1.32;
  var arrowHeight = baseSize * 2.5;
  var arrowBasePath = "M0,0 L".concat(-arrowHeight, ",").concat(-arrowHalfWidth, " L").concat(-arrowHeight, ",").concat(arrowHalfWidth, " Z");
  var finalPath = svgPath__default["default"](arrowBasePath).rotate(angleDegrees, 0, 0).translate(point.x, point.y).toString();
  return paper.path(finalPath).attr(_objectSpread(_objectSpread({}, options.lineattr), {}, {
    'stroke-width': 0,
    fill: options.lineattr.stroke
  }));
}
function reactingCenter(paper, points, options) {
  var pathDesc = '';
  var _iterator2 = _createForOfIteratorHelper(points.entries()),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _step2$value = _slicedToArray__default["default"](_step2.value, 2),
        index = _step2$value[0],
        point = _step2$value[1];
      if (index % 2 === 0) {
        var nextPoint = points[index + 1];
        if (nextPoint) {
          pathDesc += makeStroke(point, nextPoint);
        }
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return paper.path(pathDesc).attr(options.lineattr);
}
function bondMark(paper, point, mark, options) {
  var path = paper.text(point.x, point.y, mark).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: '#000'
  });
  var rbb = util["default"].relBox(path.getBBox());
  recenterText(path, rbb);
  return path;
}
function radicalCap(paper, point1, options) {
  var s = options.lineWidth * 0.9;
  var dw = s;
  var dh = 2 * s;
  return paper.path('M{0},{1}L{2},{3}L{4},{5}', toFixed.toFixed(point1.x - dw), toFixed.toFixed(point1.y + dh), toFixed.toFixed(point1.x), toFixed.toFixed(point1.y), toFixed.toFixed(point1.x + dw), toFixed.toFixed(point1.y + dh)).attr({
    stroke: '#000',
    'stroke-width': options.lineWidth * 0.7,
    'stroke-linecap': 'square',
    'stroke-linejoin': 'miter'
  });
}
function radicalBullet(paper, point1, options) {
  return paper.circle(toFixed.toFixed(point1.x), toFixed.toFixed(point1.y), options.lineWidth).attr({
    stroke: null,
    fill: '#000'
  });
}
function bracket(paper, bracketAngleDirection, bracketDirection, bondCenter, bracketWidth, bracketHeight, options) {
  bracketWidth = bracketWidth || 0.25;
  bracketHeight = bracketHeight || 1.0;
  var halfBracketHeight = 0.5;
  var bracketPoint0 = bondCenter.addScaled(bracketDirection, -halfBracketHeight * bracketHeight);
  var bracketPoint1 = bondCenter.addScaled(bracketDirection, halfBracketHeight * bracketHeight);
  var bracketArc0 = bracketPoint0.addScaled(bracketAngleDirection, -bracketWidth);
  var bracketArc1 = bracketPoint1.addScaled(bracketAngleDirection, -bracketWidth);
  return paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}', toFixed.toFixed(bracketArc0.x), toFixed.toFixed(bracketArc0.y), toFixed.toFixed(bracketPoint0.x), toFixed.toFixed(bracketPoint0.y), toFixed.toFixed(bracketPoint1.x), toFixed.toFixed(bracketPoint1.y), toFixed.toFixed(bracketArc1.x), toFixed.toFixed(bracketArc1.y)).attr(options.sgroupBracketStyle);
}
function selectionRectangle(paper, point1, point2, options) {
  return paper.rect(toFixed.toFixed(Math.min(point1.x, point2.x)), toFixed.toFixed(Math.min(point1.y, point2.y)), toFixed.toFixed(Math.abs(point2.x - point1.x)), toFixed.toFixed(Math.abs(point2.y - point1.y))).attr(options.lassoStyle);
}
function selectionPolygon(paper, r, options) {
  var v = r[r.length - 1];
  var pstr = 'M' + toFixed.toFixed(v.x) + ',' + toFixed.toFixed(v.y);
  var _iterator3 = _createForOfIteratorHelper(r),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var point = _step3.value;
      pstr += 'L' + toFixed.toFixed(point.x) + ',' + toFixed.toFixed(point.y);
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  return paper.path(pstr).attr(options.lassoStyle);
}
function selectionLine(paper, point1, point2, options) {
  return paper.path(makeStroke(point1, point2)).attr(options.lassoStyle);
}
function makeStroke(point1, point2) {
  return 'M' + toFixed.toFixed(point1.x) + ',' + toFixed.toFixed(point1.y) + 'L' + toFixed.toFixed(point2.x) + ',' + toFixed.toFixed(point2.y) + '	';
}
function dashedPath(point1, point2, dash) {
  var t0 = 0;
  var t1 = vec2.Vec2.dist(point1, point2);
  var d = vec2.Vec2.diff(point2, point1).normalized();
  var black = true;
  var path = '';
  var i = 0;
  while (t0 < t1) {
    var len = dash[i % dash.length];
    var t2 = t0 + Math.min(len, t1 - t0);
    if (black) {
      path += 'M ' + point1.addScaled(d, t0).coordStr() + ' L ' + point1.addScaled(d, t2).coordStr();
    }
    t0 += len;
    black = !black;
    i++;
  }
  return path;
}
function aromaticBondPaths(a2, a3, b2, b3, mask, dash) {
  var l1 = dash && mask & 1 ? dashedPath(a2, b2, dash) : makeStroke(a2, b2);
  var l2 = dash && mask & 2 ? dashedPath(a3, b3, dash) : makeStroke(a3, b3);
  return [l1, l2];
}
function recenterText(path, relativeBox) {
  if (raphaelExt["default"].vml) {
    var gap = relativeBox.height * 0.16;
    path.translateAbs(0, gap);
    relativeBox.y += gap;
  }
}
function rgroupAttachmentPoint(paper, shiftedAtomPositionVector, attachmentPointEnd, directionVector, options) {
  var linePath = paper.path('M{0},{1}L{2},{3}', toFixed.toFixed(shiftedAtomPositionVector.x), toFixed.toFixed(shiftedAtomPositionVector.y), toFixed.toFixed(attachmentPointEnd.x), toFixed.toFixed(attachmentPointEnd.y));
  var curvePath = paper.path(getSvgCurveShapeAttachmentPoint(attachmentPointEnd, directionVector, options.microModeScale));
  var resultShape = paper.set([curvePath, linePath]).attr(options.lineattr).attr({
    'stroke-width': options.bondThicknessInPx
  });
  return resultShape;
}
function getSvgCurveShapeAttachmentPoint(centerPosition, directionVector, basicSize) {
  var attachmentPointSvgPathString = "M13 1.5l-1.5 3.7c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.8 0l-1.8-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.6 4.2c-0.3 0.9-1.6 0.8-1.9 0l-1.2-3.5";
  var attachmentPointSvgPathSize = 39.8;
  var shapeScale = basicSize / attachmentPointSvgPathSize;
  var angleDegrees = Math.atan2(directionVector.y, directionVector.x) * 180 / Math.PI - 90;
  return svgPath__default["default"](attachmentPointSvgPathString).rotate(angleDegrees).scale(shapeScale).translate(centerPosition.x, centerPosition.y).toString();
}
function rgroupAttachmentPointLabel(paper, labelPosition, labelText, options, fill) {
  var labelPath = paper.text(labelPosition.x, labelPosition.y, labelText).attr({
    font: options.font,
    'font-size': options.fontszInPx * 0.9,
    fill: fill
  });
  return labelPath;
}
var draw = {
  recenterText: recenterText,
  arrow: arrow,
  plus: plus,
  aromaticBondPaths: aromaticBondPaths,
  bondSingle: bondSingle,
  bondSingleUp: bondSingleUp,
  bondSingleStereoBold: bondSingleStereoBold,
  bondDoubleStereoBold: bondDoubleStereoBold,
  bondSingleDown: bondSingleDown,
  bondSingleEither: bondSingleEither,
  bondDouble: bondDouble,
  bondSingleOrDouble: bondSingleOrDouble,
  bondTriple: bondTriple,
  bondAromatic: bondAromatic,
  bondAny: bondAny,
  bondHydrogen: bondHydrogen,
  bondDative: bondDative,
  reactingCenter: reactingCenter,
  bondMark: bondMark,
  radicalCap: radicalCap,
  radicalBullet: radicalBullet,
  bracket: bracket,
  selectionRectangle: selectionRectangle,
  selectionPolygon: selectionPolygon,
  selectionLine: selectionLine,
  ellipse: ellipse,
  rectangle: rectangle,
  rectangleArrowHighlightAndSelection: rectangleArrowHighlightAndSelection,
  polyline: polyline,
  line: line,
  rgroupAttachmentPoint: rgroupAttachmentPoint,
  rgroupAttachmentPointLabel: rgroupAttachmentPointLabel
};

exports.ARROW_DASH_INTERVAL = ARROW_DASH_INTERVAL;
exports.ARROW_FAIL_SIGN_WIDTH = ARROW_FAIL_SIGN_WIDTH;
exports.ARROW_HEAD_ATTR = ARROW_HEAD_ATTR;
exports.ARROW_HEAD_LENGHT = ARROW_HEAD_LENGHT;
exports.ARROW_HEAD_WIDTH = ARROW_HEAD_WIDTH;
exports.ARROW_OFFSET = ARROW_OFFSET;
exports.ARROW_UNBALANCED_OFFSET = ARROW_UNBALANCED_OFFSET;
exports["default"] = draw;
exports.getArrowHeadDimensions = getArrowHeadDimensions;
//# sourceMappingURL=draw.js.map
