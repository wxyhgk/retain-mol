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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var vec2 = require('../../../domain/entities/vec2.js');
var draw = require('../draw.js');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
var image = require('../../../domain/constants/image.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var REFERENCE_POINT_LINE_WIDTH_MULTIPLIER = 0.4;
var ReImage = function (_ReObject) {
  _inherits__default["default"](ReImage, _ReObject);
  function ReImage(image$1) {
    var _this;
    _classCallCheck__default["default"](this, ReImage);
    _this = _callSuper(this, ReImage, [image.IMAGE_KEY]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "image", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionPointsSet", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionHitTargetsSet", void 0);
    _this.image = image$1;
    return _this;
  }
  _createClass__default["default"](ReImage, [{
    key: "setSelectionPointsVisibility",
    value: function setSelectionPointsVisibility(visible) {
      var _this$selectionPoints;
      (_this$selectionPoints = this.selectionPointsSet) === null || _this$selectionPoints === void 0 || _this$selectionPoints.attr({
        opacity: visible ? 1 : 0,
        'pointer-events': visible ? 'all' : 'none'
      });
    }
  }, {
    key: "getScaledPointWithOffset",
    value: function getScaledPointWithOffset(originalPoint, renderOptions) {
      var scaledPoint = scale.Scale.modelToCanvas(originalPoint, renderOptions);
      return scaledPoint.add(renderOptions.offset);
    }
  }, {
    key: "getScale",
    value: function getScale(renderOptions) {
      return renderOptions.microModeScale / 8;
    }
  }, {
    key: "getDimensions",
    value: function getDimensions(renderOptions) {
      return vec2.Vec2.diff(this.getScaledPointWithOffset(this.image.getBottomRightPosition(), renderOptions), this.getScaledPointWithOffset(this.image.getTopLeftPosition(), renderOptions));
    }
  }, {
    key: "getSelectionReferencePositions",
    value: function getSelectionReferencePositions(renderOptions) {
      var scale$1 = this.getScale(renderOptions) + 1;
      var _this$image$getCorner = this.image.getCornerPositions().map(function (position) {
          return scale.Scale.modelToCanvas(position, renderOptions);
        }),
        _this$image$getCorner2 = _slicedToArray__default["default"](_this$image$getCorner, 4),
        topLeftPosition = _this$image$getCorner2[0],
        topRightPosition = _this$image$getCorner2[1],
        bottomRightPosition = _this$image$getCorner2[2],
        bottomLeftPosition = _this$image$getCorner2[3];
      var selectionTopLeftPosition = topLeftPosition.sub(new vec2.Vec2(scale$1, scale$1));
      var selectionTopRightPosition = topRightPosition.add(new vec2.Vec2(scale$1, -1 * scale$1));
      var selectionBottomRightPosition = bottomRightPosition.add(new vec2.Vec2(scale$1, scale$1));
      var selectionBottomLeftPosition = bottomLeftPosition.add(new vec2.Vec2(-1 * scale$1, scale$1));
      return {
        topLeftPosition: selectionTopLeftPosition,
        topMiddlePosition: vec2.Vec2.centre(selectionTopLeftPosition, selectionTopRightPosition),
        topRightPosition: selectionTopRightPosition,
        rightMiddlePosition: vec2.Vec2.centre(selectionTopRightPosition, selectionBottomRightPosition),
        bottomRightPosition: selectionBottomRightPosition,
        bottomMiddlePosition: vec2.Vec2.centre(selectionBottomLeftPosition, selectionBottomRightPosition),
        bottomLeftPosition: selectionBottomLeftPosition,
        leftMiddlePosition: vec2.Vec2.centre(selectionTopLeftPosition, selectionBottomLeftPosition)
      };
    }
  }, {
    key: "drawSelectionLine",
    value: function drawSelectionLine(paper, renderOptions) {
      var selectionSet = paper.set();
      var scale = this.getScale(renderOptions);
      var _this$getSelectionRef = this.getSelectionReferencePositions(renderOptions),
        topLeftPosition = _this$getSelectionRef.topLeftPosition,
        topRightPosition = _this$getSelectionRef.topRightPosition,
        bottomRightPosition = _this$getSelectionRef.bottomRightPosition,
        bottomLeftPosition = _this$getSelectionRef.bottomLeftPosition;
      var polygon = [topLeftPosition, topRightPosition, bottomRightPosition, bottomLeftPosition];
      var styleOptions = renderOptions.selectionStyleSimpleObject;
      var strokeWidth = Number(styleOptions['stroke-width']) + scale * REFERENCE_POINT_LINE_WIDTH_MULTIPLIER;
      selectionSet.push(draw["default"].selectionPolygon(paper, polygon, renderOptions).attr(_objectSpread(_objectSpread({}, renderOptions.selectionStyleSimpleObject), {}, {
        'stroke-linecap': 'square',
        'stroke-width': strokeWidth
      })));
      return selectionSet;
    }
  }, {
    key: "drawSelectionPoints",
    value: function drawSelectionPoints(reStruct, paper, renderOptions) {
      var _this2 = this;
      this.selectionPointsSet = paper.set();
      this.selectionHitTargetsSet = paper.set();
      var scale = this.getScale(renderOptions);
      var strokeWidth = scale * REFERENCE_POINT_LINE_WIDTH_MULTIPLIER;
      var imageId = reStruct.molecule.images.keyOf(this.image);
      var visibleHandleReferencePositions = this.getSelectionReferencePositions(renderOptions);
      Object.keys(visibleHandleReferencePositions).forEach(function (key) {
        var _element$node, _hitTarget$node;
        var visiblePosition = visibleHandleReferencePositions[key];
        var element = paper.circle(visiblePosition.x, visiblePosition.y, scale).attr({
          fill: 'transparent',
          stroke: '#000',
          'stroke-width': strokeWidth,
          opacity: 0
        });
        var hitTarget = paper.circle(visiblePosition.x, visiblePosition.y, scale).attr({
          fill: '#000',
          stroke: '#000',
          'stroke-width': 0,
          'fill-opacity': 0,
          'stroke-opacity': 0,
          opacity: 1,
          'pointer-events': 'all'
        });
        if ((_element$node = element.node) !== null && _element$node !== void 0 && _element$node.setAttribute) {
          element.node.setAttribute('pointer-events', 'none');
        }
        if ((_hitTarget$node = hitTarget.node) !== null && _hitTarget$node !== void 0 && _hitTarget$node.setAttribute) {
          hitTarget.node.setAttribute('data-testid', "imageResize-".concat(key));
          hitTarget.node.setAttribute('data-image-id', imageId);
          hitTarget.node.setAttribute('pointer-events', 'all');
        }
        _this2.selectionPointsSet.push(element);
        _this2.selectionHitTargetsSet.push(hitTarget);
      });
      this.setSelectionPointsVisibility(false);
      reStruct.addReObjectPath(generalEnumTypes.LayerMap.indices, this.visel, this.selectionHitTargetsSet);
      reStruct.addReObjectPath(generalEnumTypes.LayerMap.indices, this.visel, this.selectionPointsSet);
    }
  }, {
    key: "show",
    value: function show(restruct, renderOptions, nextPath) {
      var scaledTopLeftWithOffset = this.getScaledPointWithOffset(this.image.getTopLeftPosition(), renderOptions);
      var dimensions = this.getDimensions(renderOptions);
      this.drawSelectionPoints(restruct, restruct.render.paper, renderOptions);
      var image = restruct.render.paper.image(this.image.bitmap, scaledTopLeftWithOffset.x, scaledTopLeftWithOffset.y, dimensions.x, dimensions.y);
      image.node.setAttribute('data-testid', 'image');
      image.node.setAttribute('data-image-id', restruct.molecule.images.keyOf(this.image));
      restruct.addReObjectPath(generalEnumTypes.LayerMap.images, this.visel, image);
      if (nextPath) {
        image.insertBefore(nextPath);
      }
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var offset = this.getScale(render.options) * (1 + REFERENCE_POINT_LINE_WIDTH_MULTIPLIER);
      var STROKE_WIDTH = 0.6;
      var FILL_WIDTH = 2 * offset - STROKE_WIDTH;
      var _this$getSelectionRef2 = this.getSelectionReferencePositions(render.options),
        topLeftPosition = _this$getSelectionRef2.topLeftPosition,
        bottomRightPosition = _this$getSelectionRef2.bottomRightPosition;
      var outerBorderOffset = new vec2.Vec2(offset, offset);
      var topLeftCorner = topLeftPosition.sub(outerBorderOffset);
      var dimensions = bottomRightPosition.sub(topLeftPosition);
      var dimensionsWithBorders = dimensions.add(outerBorderOffset.scaled(2));
      var paths = [render.paper.rect(topLeftCorner.x, topLeftCorner.y, dimensionsWithBorders.x, dimensionsWithBorders.y).attr(_objectSpread(_objectSpread({}, render.options.hoverStyle), {}, {
        fill: 'none'
      })), render.paper.rect(topLeftPosition.x, topLeftPosition.y, dimensions.x, dimensions.y).attr(_objectSpread(_objectSpread({}, render.options.innerHoverStyle), {}, {
        'stroke-width': FILL_WIDTH
      }))];
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, paths);
      return paths;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(_reStruct, paper, options) {
      return this.drawSelectionLine(paper, options);
    }
  }, {
    key: "getVBoxObj",
    value: function getVBoxObj() {
      return new box2Abs.Box2Abs(this.image.getTopLeftPosition(), this.image.getBottomRightPosition());
    }
  }, {
    key: "showPoints",
    value: function showPoints() {
      this.setSelectionPointsVisibility(true);
    }
  }, {
    key: "hidePoints",
    value: function hidePoints() {
      this.setSelectionPointsVisibility(false);
    }
  }, {
    key: "calculateDistanceToPoint",
    value: function calculateDistanceToPoint(point, renderOptions) {
      if (this.isPointInsidePolygon(point, renderOptions)) {
        return 0;
      }
      var _this$getSelectionRef3 = this.getSelectionReferencePositions(renderOptions),
        topLeftPosition = _this$getSelectionRef3.topLeftPosition,
        topRightPosition = _this$getSelectionRef3.topRightPosition,
        bottomRightPosition = _this$getSelectionRef3.bottomRightPosition,
        bottomLeftPosition = _this$getSelectionRef3.bottomLeftPosition;
      return Math.min(point.calculateDistanceToLine([topLeftPosition, topRightPosition]), point.calculateDistanceToLine([topRightPosition, bottomRightPosition]), point.calculateDistanceToLine([bottomRightPosition, bottomLeftPosition]), point.calculateDistanceToLine([bottomLeftPosition, topLeftPosition]));
    }
  }, {
    key: "calculateClosestReferencePosition",
    value: function calculateClosestReferencePosition(point, renderOptions) {
      var entries = Object.entries(this.getSelectionReferencePositions(renderOptions));
      return entries.reduce(function (acc, _ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          key = _ref2[0],
          position = _ref2[1];
        var offset = vec2.Vec2.diff(position, point);
        var distance = offset.length();
        if (distance < acc.distance) {
          return {
            distance: distance,
            ref: {
              name: key,
              offset: scale.Scale.canvasToModel(offset, renderOptions)
            }
          };
        } else {
          return acc;
        }
      }, {
        ref: null,
        distance: Number.POSITIVE_INFINITY
      });
    }
  }, {
    key: "isPointInsidePolygon",
    value: function isPointInsidePolygon(point, renderOptions) {
      var referencePositions = this.getSelectionReferencePositions(renderOptions);
      return point.isInsidePolygon([referencePositions.topLeftPosition, referencePositions.topRightPosition, referencePositions.bottomRightPosition, referencePositions.bottomLeftPosition]);
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReImage;
}(reobject["default"]);

exports.ReImage = ReImage;
//# sourceMappingURL=reImage.js.map
