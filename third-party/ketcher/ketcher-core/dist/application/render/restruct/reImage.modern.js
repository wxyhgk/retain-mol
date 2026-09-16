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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import draw from '../draw.modern.js';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import { IMAGE_KEY } from '../../../domain/constants/image.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var REFERENCE_POINT_LINE_WIDTH_MULTIPLIER = 0.4;
var ReImage = function (_ReObject) {
  _inherits(ReImage, _ReObject);
  function ReImage(image) {
    var _this;
    _classCallCheck(this, ReImage);
    _this = _callSuper(this, ReImage, [IMAGE_KEY]);
    _defineProperty(_assertThisInitialized(_this), "image", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionPointsSet", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionHitTargetsSet", void 0);
    _this.image = image;
    return _this;
  }
  _createClass(ReImage, [{
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
      var scaledPoint = Scale.modelToCanvas(originalPoint, renderOptions);
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
      return Vec2.diff(this.getScaledPointWithOffset(this.image.getBottomRightPosition(), renderOptions), this.getScaledPointWithOffset(this.image.getTopLeftPosition(), renderOptions));
    }
  }, {
    key: "getSelectionReferencePositions",
    value: function getSelectionReferencePositions(renderOptions) {
      var scale = this.getScale(renderOptions) + 1;
      var _this$image$getCorner = this.image.getCornerPositions().map(function (position) {
          return Scale.modelToCanvas(position, renderOptions);
        }),
        _this$image$getCorner2 = _slicedToArray(_this$image$getCorner, 4),
        topLeftPosition = _this$image$getCorner2[0],
        topRightPosition = _this$image$getCorner2[1],
        bottomRightPosition = _this$image$getCorner2[2],
        bottomLeftPosition = _this$image$getCorner2[3];
      var selectionTopLeftPosition = topLeftPosition.sub(new Vec2(scale, scale));
      var selectionTopRightPosition = topRightPosition.add(new Vec2(scale, -1 * scale));
      var selectionBottomRightPosition = bottomRightPosition.add(new Vec2(scale, scale));
      var selectionBottomLeftPosition = bottomLeftPosition.add(new Vec2(-1 * scale, scale));
      return {
        topLeftPosition: selectionTopLeftPosition,
        topMiddlePosition: Vec2.centre(selectionTopLeftPosition, selectionTopRightPosition),
        topRightPosition: selectionTopRightPosition,
        rightMiddlePosition: Vec2.centre(selectionTopRightPosition, selectionBottomRightPosition),
        bottomRightPosition: selectionBottomRightPosition,
        bottomMiddlePosition: Vec2.centre(selectionBottomLeftPosition, selectionBottomRightPosition),
        bottomLeftPosition: selectionBottomLeftPosition,
        leftMiddlePosition: Vec2.centre(selectionTopLeftPosition, selectionBottomLeftPosition)
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
      selectionSet.push(draw.selectionPolygon(paper, polygon, renderOptions).attr(_objectSpread(_objectSpread({}, renderOptions.selectionStyleSimpleObject), {}, {
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
      reStruct.addReObjectPath(LayerMap.indices, this.visel, this.selectionHitTargetsSet);
      reStruct.addReObjectPath(LayerMap.indices, this.visel, this.selectionPointsSet);
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
      restruct.addReObjectPath(LayerMap.images, this.visel, image);
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
      var outerBorderOffset = new Vec2(offset, offset);
      var topLeftCorner = topLeftPosition.sub(outerBorderOffset);
      var dimensions = bottomRightPosition.sub(topLeftPosition);
      var dimensionsWithBorders = dimensions.add(outerBorderOffset.scaled(2));
      var paths = [render.paper.rect(topLeftCorner.x, topLeftCorner.y, dimensionsWithBorders.x, dimensionsWithBorders.y).attr(_objectSpread(_objectSpread({}, render.options.hoverStyle), {}, {
        fill: 'none'
      })), render.paper.rect(topLeftPosition.x, topLeftPosition.y, dimensions.x, dimensions.y).attr(_objectSpread(_objectSpread({}, render.options.innerHoverStyle), {}, {
        'stroke-width': FILL_WIDTH
      }))];
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, paths);
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
      return new Box2Abs(this.image.getTopLeftPosition(), this.image.getBottomRightPosition());
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
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          position = _ref2[1];
        var offset = Vec2.diff(position, point);
        var distance = offset.length();
        if (distance < acc.distance) {
          return {
            distance: distance,
            ref: {
              name: key,
              offset: Scale.canvasToModel(offset, renderOptions)
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
}(ReObject);

export { ReImage };
//# sourceMappingURL=reImage.modern.js.map
