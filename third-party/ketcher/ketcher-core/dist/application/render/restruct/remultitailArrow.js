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

var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var reobject = require('./reobject.js');
var multitailArrow = require('../../../domain/entities/multitailArrow.js');
var multitailArrow$1 = require('../../../domain/constants/multitailArrow.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var draw = require('../draw.js');
var pathBuilder = require('../pathBuilder.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var pool = require('../../../domain/entities/pool.js');
var vec2 = require('../../../domain/entities/vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var _excluded = ["tails"],
  _excluded2 = ["topSpine", "bottomSpine", "tails"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MULTITAIL_ARROW_TEST_ID = 'multitail-arrow';
var RXN_ARROW_TEST_ID = 'rxn-arrow';
exports.MultitailArrowRefName = void 0;
(function (MultitailArrowRefName) {
  MultitailArrowRefName["HEAD"] = "head";
  MultitailArrowRefName["TAILS"] = "tails";
  MultitailArrowRefName["TOP_TAIL"] = "topTail";
  MultitailArrowRefName["BOTTOM_TAIL"] = "bottomTail";
  MultitailArrowRefName["SPINE"] = "spine";
})(exports.MultitailArrowRefName || (exports.MultitailArrowRefName = {}));
var ReMultitailArrow = function (_ReObject) {
  _inherits__default["default"](ReMultitailArrow, _ReObject);
  function ReMultitailArrow(multitailArrow) {
    var _this;
    _classCallCheck__default["default"](this, ReMultitailArrow);
    _this = _callSuper(this, ReMultitailArrow, [multitailArrow$1.MULTITAIL_ARROW_KEY]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "multitailArrow", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "testSelectionPoints", []);
    _this.multitailArrow = multitailArrow;
    return _this;
  }
  _createClass__default["default"](ReMultitailArrow, [{
    key: "getFrameOffset",
    value: function getFrameOffset(options) {
      return ReMultitailArrow.FRAME_OFFSET * options.microModeScale;
    }
  }, {
    key: "getSelectionPointOffset",
    value: function getSelectionPointOffset(options) {
      return ReMultitailArrow.SELECTION_POINT_OFFSET_FROM_SPINE * options.microModeScale;
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions(renderOptions) {
      var positions = this.multitailArrow.getReferencePositions();
      var tails = new pool.Pool();
      positions.tails.forEach(function (item, key) {
        tails.set(key, scale.Scale.modelToCanvas(item, renderOptions));
      });
      return {
        head: scale.Scale.modelToCanvas(positions.head, renderOptions),
        topTail: scale.Scale.modelToCanvas(positions.topTail, renderOptions),
        bottomTail: scale.Scale.modelToCanvas(positions.bottomTail, renderOptions),
        topSpine: scale.Scale.modelToCanvas(positions.topSpine, renderOptions),
        bottomSpine: scale.Scale.modelToCanvas(positions.bottomSpine, renderOptions),
        tails: tails
      };
    }
  }, {
    key: "getReferenceLines",
    value: function getReferenceLines(renderOptions) {
      var referencePositions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getReferencePositions(renderOptions);
      return this.multitailArrow.getReferenceLines(referencePositions);
    }
  }, {
    key: "buildFrame",
    value: function buildFrame(renderOptions) {
      var offset = this.getFrameOffset(renderOptions);
      var _this$getReferencePos = this.getReferencePositions(renderOptions),
        topSpine = _this$getReferencePos.topSpine,
        bottomSpine = _this$getReferencePos.bottomSpine,
        topTail = _this$getReferencePos.topTail,
        bottomTail = _this$getReferencePos.bottomTail,
        head = _this$getReferencePos.head,
        tails = _this$getReferencePos.tails;
      var builder = new pathBuilder.PathBuilder();
      var tailsPoints = Array.from(tails.values()).sort(function (a, b) {
        return a.y - b.y;
      });
      var start = topSpine.add(new vec2.Vec2(offset, offset));
      builder.addMovement(start).addLine(topSpine.add(new vec2.Vec2(offset, -offset + ReMultitailArrow.CUBIC_BEZIER_OFFSET))).addQuadraticBezierCurve(topSpine.add(new vec2.Vec2(offset, -offset)), topSpine.add(new vec2.Vec2(offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET, -offset)));
      ReMultitailArrow.drawSingleLineHover(builder, offset, topSpine, topTail, -1, -1);
      tailsPoints.forEach(function (tailPoint) {
        ReMultitailArrow.drawSingleLineHover(builder, offset, new vec2.Vec2(topSpine.x, tailPoint.y), tailPoint, -1, -1);
      });
      ReMultitailArrow.drawSingleLineHover(builder, offset, bottomSpine, bottomTail, -1, -1);
      builder.addLine(bottomSpine.add(new vec2.Vec2(offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET, offset))).addQuadraticBezierCurve(bottomSpine.add(new vec2.Vec2(offset, offset)), bottomSpine.add(new vec2.Vec2(offset, offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET)));
      ReMultitailArrow.drawSingleLineHover(builder, offset, new vec2.Vec2(topSpine.x, head.y), head, 1, 1);
      builder.addLine(start);
      return builder.build();
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var path = this.buildFrame(render.options);
      var paths = render.ctab.render.paper.path(path).attr(_objectSpread({}, render.options.hoverStyle));
      if (typeof this.multitailArrow.arrowId === 'number') {
        var _paths$node;
        (_paths$node = paths.node) === null || _paths$node === void 0 || _paths$node.setAttribute('data-arrow-id', String(this.multitailArrow.arrowId));
      }
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, paths);
      return paths;
    }
  }, {
    key: "getSelectionPointsFromReferencePoint",
    value: function getSelectionPointsFromReferencePoint(point, topSpine, name, spineOffset) {
      var spineOffsetWithDirection = topSpine.x > point.x ? -spineOffset : spineOffset;
      return _defineProperty__default["default"](_defineProperty__default["default"]({}, "".concat(name, "-resize"), point), "".concat(name, "-move"), new vec2.Vec2(topSpine.x + spineOffsetWithDirection, point.y));
    }
  }, {
    key: "addTestSelectionPoints",
    value: function addTestSelectionPoints(reStruct, paper, renderOptions) {
      var _this2 = this;
      var OFFSET = this.getSelectionPointOffset(renderOptions);
      var _this$getReferencePos2 = this.getReferencePositions(renderOptions),
        topTail = _this$getReferencePos2.topTail,
        bottomTail = _this$getReferencePos2.bottomTail,
        tails = _this$getReferencePos2.tails,
        head = _this$getReferencePos2.head,
        topSpine = _this$getReferencePos2.topSpine;
      var headLineStartOffset = Math.min(ReMultitailArrow.HEAD_LINE_START_OFFSET, Math.max(0, head.x - topSpine.x));
      var headLineStartX = topSpine.x + headLineStartOffset;
      var spineMovePoint = new vec2.Vec2(topSpine.x + ReMultitailArrow.SPINE_MOVE_POINT_X_OFFSET, head.y);
      var headMovePoint = new vec2.Vec2(headLineStartX + (head.x - headLineStartX) / 2, head.y);
      var selectionPointSet = paper.set();
      var selectionPoints = [];
      var spineMoveSelectionPoint = null;
      var points = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
        'spine-move': spineMovePoint
      }, this.getSelectionPointsFromReferencePoint(topTail, topSpine, 'topTail', OFFSET)), this.getSelectionPointsFromReferencePoint(bottomTail, topSpine, 'bottomTail', OFFSET)), this.getSelectionPointsFromReferencePoint(head, topSpine, 'head', OFFSET)), Array.from(tails.entries()).reduce(function (acc, _ref2) {
        var _ref3 = _slicedToArray__default["default"](_ref2, 2),
          key = _ref3[0],
          value = _ref3[1];
        return _objectSpread(_objectSpread({}, acc), _this2.getSelectionPointsFromReferencePoint(value, topSpine, "".concat(multitailArrow.MultitailArrow.TAILS_NAME, "-").concat(key), OFFSET));
      }, {}));
      points['head-move'] = headMovePoint;
      Object.entries(points).forEach(function (_ref4) {
        var _element$node;
        var _ref5 = _slicedToArray__default["default"](_ref4, 2),
          key = _ref5[0],
          point = _ref5[1];
        var isSpineMovePoint = key === 'spine-move';
        var selectionPointRadius = ReMultitailArrow.SELECTION_POINT_RADIUS;
        var element = paper.circle(point.x, point.y, selectionPointRadius).attr({
          fill: '#000',
          stroke: '#000',
          'stroke-width': 0,
          'fill-opacity': isSpineMovePoint ? 0 : 1,
          'stroke-opacity': isSpineMovePoint ? 0 : 1,
          opacity: ReMultitailArrow.HIDDEN_SELECTION_POINT_OPACITY,
          'pointer-events': 'all'
        });
        if (isSpineMovePoint) {
          spineMoveSelectionPoint = element;
        }
        if ((_element$node = element.node) !== null && _element$node !== void 0 && _element$node.setAttribute) {
          element.node.setAttribute('data-testid', key);
          element.node.setAttribute('pointer-events', 'all');
          if (typeof _this2.multitailArrow.arrowId === 'number') {
            element.node.setAttribute('data-arrow-id', String(_this2.multitailArrow.arrowId));
          }
        }
        selectionPoints.push(element);
        selectionPointSet.push(element);
      });
      this.testSelectionPoints = selectionPoints;
      reStruct.addReObjectPath(generalEnumTypes.LayerMap.indices, this.visel, selectionPointSet);
      if (spineMoveSelectionPoint) {
        reStruct.movePathOnTopOfLayer(spineMoveSelectionPoint, generalEnumTypes.LayerMap.indices);
      }
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(reStruct, paper, options) {
      var path = this.buildFrame(options);
      var selectionSet = paper.set();
      var paths = reStruct.render.paper.path(path).attr(_objectSpread({}, options.selectionStyle));
      if (typeof this.multitailArrow.arrowId === 'number') {
        var _paths$node2;
        (_paths$node2 = paths.node) === null || _paths$node2 === void 0 || _paths$node2.setAttribute('data-arrow-id', String(this.multitailArrow.arrowId));
      }
      selectionSet.push(paths);
      return selectionSet;
    }
  }, {
    key: "show",
    value: function show(reStruct, renderOptions) {
      var _path$node, _path$node2;
      reStruct.clearVisel(this.visel);
      this.testSelectionPoints = [];
      var pathBuilder$1 = new pathBuilder.PathBuilder();
      var headPathBuilder = new pathBuilder.PathBuilder();
      var _this$getReferencePos3 = this.getReferencePositions(renderOptions),
        topTail = _this$getReferencePos3.topTail,
        topSpine = _this$getReferencePos3.topSpine,
        bottomSpine = _this$getReferencePos3.bottomSpine,
        head = _this$getReferencePos3.head,
        tails = _this$getReferencePos3.tails;
      var topTailOffsetX = topSpine.sub(topTail).x;
      var headLineStartOffset = Math.min(ReMultitailArrow.HEAD_LINE_START_OFFSET, Math.max(0, head.x - topSpine.x));
      var arrowStart = new vec2.Vec2(topSpine.x + headLineStartOffset, head.y);
      var arrowLength = head.x - arrowStart.x;
      var _getArrowHeadDimensio = draw.getArrowHeadDimensions(renderOptions),
        arrowHeadLength = _getArrowHeadDimensio.arrowHeadLength,
        arrowHeadWidth = _getArrowHeadDimensio.arrowHeadWidth;
      pathBuilder$1.addMultitailArrowBase(topSpine.y, bottomSpine.y, topSpine.x, topTailOffsetX);
      headPathBuilder.addFilledTriangleArrowPathParts(arrowStart, arrowLength, arrowHeadLength, arrowHeadWidth);
      tails.forEach(function (tail) {
        pathBuilder$1.addLine(tail, {
          x: topSpine.x,
          y: tail.y
        });
      });
      var path = reStruct.render.paper.path(pathBuilder$1.build());
      var header = reStruct.render.paper.path(headPathBuilder.build());
      (_path$node = path.node) === null || _path$node === void 0 || _path$node.setAttribute('data-testid', RXN_ARROW_TEST_ID);
      (_path$node2 = path.node) === null || _path$node2 === void 0 || _path$node2.setAttribute('data-arrowtype', MULTITAIL_ARROW_TEST_ID);
      if (typeof this.multitailArrow.arrowId === 'number') {
        var _path$node3, _header$node;
        (_path$node3 = path.node) === null || _path$node3 === void 0 || _path$node3.setAttribute('data-arrow-id', String(this.multitailArrow.arrowId));
        (_header$node = header.node) === null || _header$node === void 0 || _header$node.setAttribute('data-arrow-id', String(this.multitailArrow.arrowId));
      }
      path.attr(renderOptions.lineattr);
      header.attr(_objectSpread(_objectSpread({}, renderOptions.lineattr), {}, {
        fill: '#000'
      }));
      reStruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, [path, header], null, true);
      this.addTestSelectionPoints(reStruct, reStruct.render.paper, renderOptions);
    }
  }, {
    key: "showPoints",
    value: function showPoints() {
      this.testSelectionPoints.forEach(function (point) {
        point.attr({
          opacity: ReMultitailArrow.VISIBLE_SELECTION_POINT_OPACITY
        });
      });
    }
  }, {
    key: "hidePoints",
    value: function hidePoints() {
      this.testSelectionPoints.forEach(function (point) {
        point.attr({
          opacity: ReMultitailArrow.HIDDEN_SELECTION_POINT_OPACITY
        });
      });
    }
  }, {
    key: "getClosestArrowPartPosition",
    value: function getClosestArrowPartPosition(point, entities, isLine) {
      return entities.reduce(function (acc, _ref6) {
        var _ref7 = _slicedToArray__default["default"](_ref6, 2),
          name = _ref7[0],
          value = _ref7[1];
        var distance = isLine ? point.calculateDistanceToLine(value) : vec2.Vec2.dist(point, value);
        var tailId = ReMultitailArrow.getTailIdFromRefName(name);
        var refName;
        if (typeof tailId === 'number') {
          refName = exports.MultitailArrowRefName.TAILS;
        } else if ([exports.MultitailArrowRefName.HEAD, exports.MultitailArrowRefName.BOTTOM_TAIL, exports.MultitailArrowRefName.TOP_TAIL].includes(name)) {
          refName = name;
        } else {
          refName = exports.MultitailArrowRefName.SPINE;
        }
        return distance < acc.distance ? {
          distance: distance,
          ref: refName !== exports.MultitailArrowRefName.SPINE ? {
            name: refName,
            isLine: isLine,
            tailId: tailId
          } : null
        } : acc;
      }, {
        distance: Infinity,
        ref: null
      });
    }
  }, {
    key: "getTailArrayFromPool",
    value: function getTailArrayFromPool(tails) {
      return Array.from(tails.entries()).map(function (_ref8) {
        var _ref9 = _slicedToArray__default["default"](_ref8, 2),
          key = _ref9[0],
          value = _ref9[1];
        return ["".concat(multitailArrow.MultitailArrow.TAILS_NAME, "-").concat(key), value];
      });
    }
  }, {
    key: "calculateDistanceToPoint",
    value: function calculateDistanceToPoint(point, renderOptions, maxDistanceToPoint) {
      var referencePositions = this.getReferencePositions(renderOptions);
      var referenceLines = this.getReferenceLines(renderOptions, referencePositions);
      var tails = referenceLines.tails,
        rest = _objectWithoutProperties__default["default"](referenceLines, _excluded);
      var tailsAndHeadLines = Object.entries(rest).concat(this.getTailArrayFromPool(tails));
      var lineResult = this.getClosestArrowPartPosition(point, tailsAndHeadLines, true);
      if (lineResult.distance < maxDistanceToPoint) {
        referencePositions.topSpine;
          referencePositions.bottomSpine;
          var tailsPoints = referencePositions.tails,
          validReferencePositions = _objectWithoutProperties__default["default"](referencePositions, _excluded2);
        var tailsAnddHeadPoints = Object.entries(validReferencePositions).concat(this.getTailArrayFromPool(tailsPoints));
        var pointsResult = this.getClosestArrowPartPosition(point, tailsAnddHeadPoints, false);
        if (pointsResult.distance < maxDistanceToPoint / 2 || pointsResult.distance < maxDistanceToPoint && pointsResult.distance <= lineResult.distance) {
          return pointsResult;
        }
      }
      return lineResult;
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }, {
    key: "getTailIdFromRefName",
    value: function getTailIdFromRefName(name) {
      if (name.startsWith(exports.MultitailArrowRefName.TAILS)) {
        return parseInt(name.replace("".concat(exports.MultitailArrowRefName.TAILS, "-"), ''));
      }
      return null;
    }
  }, {
    key: "drawSingleLineHover",
    value: function drawSingleLineHover(builder, offset, lineStart, lineEnd, verticalDirection, horizontalDirection) {
      var cubicBezierOffset = horizontalDirection * ReMultitailArrow.CUBIC_BEZIER_OFFSET;
      var start = lineStart.add(new vec2.Vec2(offset * horizontalDirection, offset * verticalDirection));
      var end = start.add(new vec2.Vec2(0, 2 * offset * -verticalDirection));
      builder.addLine(start).addLine(lineEnd.add(new vec2.Vec2(0, offset * verticalDirection))).addQuadraticBezierCurve(lineEnd.add(new vec2.Vec2(cubicBezierOffset, offset * verticalDirection)), lineEnd.add(new vec2.Vec2(cubicBezierOffset, 0))).addQuadraticBezierCurve(lineEnd.add(new vec2.Vec2(cubicBezierOffset, offset * -verticalDirection)), lineEnd.add(new vec2.Vec2(0, offset * -verticalDirection))).addLine(end);
    }
  }]);
  return ReMultitailArrow;
}(reobject["default"]);
_defineProperty__default["default"](ReMultitailArrow, "CUBIC_BEZIER_OFFSET", 6);
_defineProperty__default["default"](ReMultitailArrow, "FRAME_OFFSET", 0.175);
_defineProperty__default["default"](ReMultitailArrow, "SELECTION_POINT_OFFSET_FROM_SPINE", 0.1);
_defineProperty__default["default"](ReMultitailArrow, "SPINE_MOVE_POINT_X_OFFSET", -1);
_defineProperty__default["default"](ReMultitailArrow, "HEAD_LINE_START_OFFSET", 1);
_defineProperty__default["default"](ReMultitailArrow, "SELECTION_POINT_RADIUS", 1);
_defineProperty__default["default"](ReMultitailArrow, "HIDDEN_SELECTION_POINT_OPACITY", 0);
_defineProperty__default["default"](ReMultitailArrow, "VISIBLE_SELECTION_POINT_OPACITY", 1);

exports.ReMultitailArrow = ReMultitailArrow;
//# sourceMappingURL=remultitailArrow.js.map
