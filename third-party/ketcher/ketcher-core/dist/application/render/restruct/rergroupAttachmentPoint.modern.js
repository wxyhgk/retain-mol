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
import { AttachmentPoints } from '../../../domain/entities/atom.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import ReObject from './reobject.modern.js';
import draw from '../draw.modern.js';
import { LayerMap } from './generalEnumTypes.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReRGroupAttachmentPoint = function (_ReObject) {
  _inherits(ReRGroupAttachmentPoint, _ReObject);
  function ReRGroupAttachmentPoint(item, reAtom) {
    var _this;
    _classCallCheck(this, ReRGroupAttachmentPoint);
    _this = _callSuper(this, ReRGroupAttachmentPoint, ['rgroupAttachmentPoint']);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _defineProperty(_assertThisInitialized(_this), "reAtom", void 0);
    _defineProperty(_assertThisInitialized(_this), "lineDirectionVector", new Vec2());
    _defineProperty(_assertThisInitialized(_this), "makeHighlightePlate", function (restruct, style) {
      var _restruct$render = restruct.render,
        paper = _restruct$render.paper,
        options = _restruct$render.options;
      var hoverPlatePath = _this.getHoverPlatePath(options, true);
      return paper.path(hoverPlatePath).attr(options.selectionStyle).attr(style);
    });
    _this.item = item;
    _this.reAtom = reAtom;
    return _this;
  }
  _createClass(ReRGroupAttachmentPoint, [{
    key: "normalizedLineDirectionVector",
    get: function get() {
      return this.lineDirectionVector.normalized();
    }
  }, {
    key: "normalizedCurveDirectionVector",
    get: function get() {
      return this.lineDirectionVector.rotate(Math.PI / 2).normalized();
    }
  }, {
    key: "startPoint",
    get: function get() {
      return this.reAtom.a.pp;
    }
  }, {
    key: "middlePoint",
    get: function get() {
      return this.outlineEndPoint.addScaled(this.normalizedLineDirectionVector, -ReRGroupAttachmentPoint.CURVE_OUTLINE_HEIGHT);
    }
  }, {
    key: "endPoint",
    get: function get() {
      return this.startPoint.add(this.lineDirectionVector);
    }
  }, {
    key: "outlineEndPoint",
    get: function get() {
      var length = this.lineDirectionVector.length() + ReRGroupAttachmentPoint.OUTLINE_PADDING;
      return this.startPoint.addScaled(this.normalizedLineDirectionVector, length);
    }
  }, {
    key: "getOutlinePoints",
    value: function getOutlinePoints() {
      var isHighlight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var highlightPadding = isHighlight ? -0.1 : 0;
      var curveOutlineWidth = ReRGroupAttachmentPoint.CURVE_OUTLINE_WIDTH + highlightPadding;
      var lineOutlineWidth = ReRGroupAttachmentPoint.LINE_OUTLINE_WIDTH + highlightPadding;
      var topLeftPadPoint = this.outlineEndPoint.addScaled(this.normalizedCurveDirectionVector, -curveOutlineWidth / 2);
      var topLeftPoint = topLeftPadPoint.addScaled(this.normalizedCurveDirectionVector, ReRGroupAttachmentPoint.OUTLINE_PADDING);
      var topRightPadPoint = this.outlineEndPoint.addScaled(this.normalizedCurveDirectionVector, curveOutlineWidth / 2);
      var topRightPoint = topRightPadPoint.addScaled(this.normalizedCurveDirectionVector, -ReRGroupAttachmentPoint.OUTLINE_PADDING);
      var middleMostLeftPadPoint = this.middlePoint.addScaled(this.normalizedCurveDirectionVector, -curveOutlineWidth / 2);
      var middleMostLeftPoint = middleMostLeftPadPoint.addScaled(this.normalizedCurveDirectionVector, ReRGroupAttachmentPoint.OUTLINE_PADDING);
      var middleMostRightPadPoint = this.middlePoint.addScaled(this.normalizedCurveDirectionVector, curveOutlineWidth / 2);
      var middleMostRightPoint = middleMostRightPadPoint.addScaled(this.normalizedCurveDirectionVector, -ReRGroupAttachmentPoint.OUTLINE_PADDING);
      var middleLeftPoint = this.middlePoint.addScaled(this.normalizedCurveDirectionVector, -lineOutlineWidth / 2);
      var middleRightPoint = this.middlePoint.addScaled(this.normalizedCurveDirectionVector, lineOutlineWidth / 2);
      var bottomLeftPadPoint = this.startPoint.addScaled(this.normalizedCurveDirectionVector, -lineOutlineWidth / 2);
      var bottomLeftPoint = bottomLeftPadPoint.addScaled(this.normalizedLineDirectionVector, ReRGroupAttachmentPoint.OUTLINE_PADDING);
      var bottomRightPadPoint = this.startPoint.addScaled(this.normalizedCurveDirectionVector, lineOutlineWidth / 2);
      var bottomRightPoint = bottomRightPadPoint.addScaled(this.normalizedLineDirectionVector, ReRGroupAttachmentPoint.OUTLINE_PADDING);
      return [topLeftPadPoint, topLeftPoint, topRightPoint, topRightPadPoint, middleMostRightPadPoint, middleMostRightPoint, middleRightPoint, bottomRightPoint, bottomRightPadPoint, bottomLeftPadPoint, bottomLeftPoint, middleLeftPoint, middleMostLeftPoint, middleMostLeftPadPoint];
    }
  }, {
    key: "getDistanceTo",
    value: function getDistanceTo(destination) {
      return Vec2.dist(destination, this.middlePoint);
    }
  }, {
    key: "show",
    value: function show(restruct, rgroupAttachmentPointId) {
      var directionVector = this.getAttachmentPointDirectionVector(restruct.molecule);
      if (!directionVector) {
        return;
      }
      this.lineDirectionVector = directionVector;
      var attachmentPointShape = showAttachmentPointShape(this.reAtom, restruct.render, directionVector, restruct.addReObjectPath.bind(restruct), this.visel);
      this.addTestAttributes(attachmentPointShape);
      var showLabel = isAttachmentPointLabelRequired(restruct);
      if (showLabel) {
        var labelText = this.item.type === 'primary' ? '1' : '2';
        showAttachmentPointLabel(this.reAtom, restruct.render, directionVector, restruct.addReObjectPath.bind(restruct), labelText, this.visel);
      }
      var highlights = restruct.molecule.highlights;
      var isHighlighted = false;
      var highlightColor = '';
      highlights.forEach(function (highlight) {
        var _highlight$rgroupAtta;
        var hasCurrentHighlight = (_highlight$rgroupAtta = highlight.rgroupAttachmentPoints) === null || _highlight$rgroupAtta === void 0 ? void 0 : _highlight$rgroupAtta.includes(rgroupAttachmentPointId);
        isHighlighted = isHighlighted || hasCurrentHighlight;
        if (hasCurrentHighlight) {
          highlightColor = highlight.color;
        }
      });
      if (isHighlighted) {
        var style = {
          fill: highlightColor,
          stroke: 'none'
        };
        var path = this.makeHighlightePlate(restruct, style);
        restruct.addReObjectPath(LayerMap.hovering, this.visel, path);
      }
    }
  }, {
    key: "addTestAttributes",
    value: function addTestAttributes(attachmentPointShape) {
      var _attachmentPointShape;
      var attachmentPointElement = attachmentPointShape.items ? (_attachmentPointShape = attachmentPointShape.items[0]) === null || _attachmentPointShape === void 0 ? void 0 : _attachmentPointShape.node : attachmentPointShape.node;
      if (!attachmentPointElement) {
        return;
      }
      attachmentPointElement.setAttribute('data-testid', 'attachment-point');
      attachmentPointElement.setAttribute('data-primary-or-secondary', this.item.type);
      attachmentPointElement.setAttribute('data-attached-to-atomid', String(this.item.atomId));
    }
  }, {
    key: "getHoverPlatePath",
    value: function getHoverPlatePath(options) {
      var isHighlight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var outlinePoints = this.getOutlinePoints(isHighlight);
      var scaledOutlinePoints = outlinePoints.map(function (point) {
        return Scale.modelToCanvas(point, options);
      });
      var _scaledOutlinePoints = _slicedToArray(scaledOutlinePoints, 14),
        topLeftPadPoint = _scaledOutlinePoints[0],
        topLeftPoint = _scaledOutlinePoints[1],
        topRightPoint = _scaledOutlinePoints[2],
        topRightPadPoint = _scaledOutlinePoints[3],
        middleMostRightPadPoint = _scaledOutlinePoints[4],
        middleMostRightPoint = _scaledOutlinePoints[5],
        middleRightPoint = _scaledOutlinePoints[6],
        bottomRightPoint = _scaledOutlinePoints[7],
        bottomRightPadPoint = _scaledOutlinePoints[8],
        bottomLeftPadPoint = _scaledOutlinePoints[9],
        bottomLeftPoint = _scaledOutlinePoints[10],
        middleLeftPoint = _scaledOutlinePoints[11],
        middleMostLeftPoint = _scaledOutlinePoints[12],
        middleMostLeftPadPoint = _scaledOutlinePoints[13];
      var pathString = "\n      M ".concat(topLeftPoint.x, " ").concat(topLeftPoint.y, "\n      L ").concat(topRightPoint.x, " ").concat(topRightPoint.y, "\n      C ").concat(topRightPadPoint.x, " ").concat(topRightPadPoint.y, ", ").concat(middleMostRightPadPoint.x, " ").concat(middleMostRightPadPoint.y, ", ").concat(middleMostRightPoint.x, " ").concat(middleMostRightPoint.y, "\n      L ").concat(middleRightPoint.x, " ").concat(middleRightPoint.y, "\n      L ").concat(bottomRightPoint.x, " ").concat(bottomRightPoint.y, "\n      C ").concat(bottomRightPadPoint.x, " ").concat(bottomRightPadPoint.y, ", ").concat(bottomLeftPadPoint.x, " ").concat(bottomLeftPadPoint.y, ", ").concat(bottomLeftPoint.x, " ").concat(bottomLeftPoint.y, "\n      L ").concat(middleLeftPoint.x, " ").concat(middleLeftPoint.y, "\n      L ").concat(middleMostLeftPoint.x, " ").concat(middleMostLeftPoint.y, "\n      C ").concat(middleMostLeftPadPoint.x, " ").concat(middleMostLeftPadPoint.y, ", ").concat(topLeftPadPoint.x, " ").concat(topLeftPadPoint.y, ", ").concat(topLeftPoint.x, " ").concat(topLeftPoint.y, "\n    ");
      return pathString;
    }
  }, {
    key: "makeHoverPlate",
    value: function makeHoverPlate(render) {
      var hoverPlatePath = this.getHoverPlatePath(render.options);
      return render.paper.path(hoverPlatePath).attr(render.options.hoverStyle);
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(_restruct, paper, options) {
      var hoverPlatePath = this.getHoverPlatePath(options);
      return paper.path(hoverPlatePath).attr(options.selectionStyle);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var hoverPlate = this.makeHoverPlate(render);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, hoverPlate);
      return hoverPlate;
    }
  }, {
    key: "getAttachmentPointDirectionVector",
    value: function getAttachmentPointDirectionVector(struct) {
      if (!this.reAtom.hasAttachmentPoint()) {
        return;
      }
      if (this.isTrisectionAttachmentPoint()) {
        return trisectionLargestSector(this.reAtom, struct, this.item.type);
      } else {
        var hasOnlyOneBond = this.reAtom.a.neighbors.length === 1;
        var directionVector = hasOnlyOneBond ? getAttachmentDirectionForOnlyOneBond(this.reAtom, struct) : this.reAtom.bisectLargestSector(struct);
        return directionVector;
      }
    }
  }, {
    key: "isTrisectionAttachmentPoint",
    value: function isTrisectionAttachmentPoint() {
      return this.reAtom.a.attachmentPoints === AttachmentPoints.BothSides;
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReRGroupAttachmentPoint;
}(ReObject);
_defineProperty(ReRGroupAttachmentPoint, "LINE_OUTLINE_WIDTH", 0.36);
_defineProperty(ReRGroupAttachmentPoint, "OUTLINE_PADDING", 0.15);
_defineProperty(ReRGroupAttachmentPoint, "CURVE_OUTLINE_WIDTH", 1.0);
_defineProperty(ReRGroupAttachmentPoint, "CURVE_OUTLINE_HEIGHT", 0.42);
function showAttachmentPointShape(atom, _ref, directionVector, addReObjectPath, visel) {
  var options = _ref.options,
    paper = _ref.paper;
  var atomPositionVector = Scale.modelToCanvas(atom.a.pp, options);
  var shiftedAtomPositionVector = atom.getShiftedSegmentPosition(options, directionVector);
  var attachmentPointEnd = atomPositionVector.addScaled(directionVector, options.microModeScale * 0.85);
  var resultShape = draw.rgroupAttachmentPoint(paper, shiftedAtomPositionVector, attachmentPointEnd, directionVector, options);
  addReObjectPath(LayerMap.indices, visel, resultShape, atomPositionVector, true);
  return resultShape;
}
function trisectionLargestSector(atom, struct, attachmentPointType) {
  var _atom$getLargestSecto = atom.getLargestSectorFromNeighbors(struct),
    largestAngle = _atom$getLargestSecto.largestAngle,
    neighborAngle = _atom$getLargestSecto.neighborAngle;
  var firstTrisectorAngle = neighborAngle + largestAngle / 3;
  var secondTrisectorAngle = neighborAngle + largestAngle * 2 / 3;
  return attachmentPointType === 'primary' ? newVectorFromAngle(firstTrisectorAngle) : newVectorFromAngle(secondTrisectorAngle);
}
function newVectorFromAngle(angle) {
  return new Vec2(Math.cos(angle), Math.sin(angle));
}
function isAttachmentPointLabelRequired(restruct) {
  return restruct.molecule.atoms.some(function (_ref2) {
    var attachmentPoints = _ref2.attachmentPoints;
    return attachmentPoints === AttachmentPoints.SecondSideOnly || attachmentPoints === AttachmentPoints.BothSides;
  });
}
function getAttachmentDirectionForOnlyOneBond(atom, struct) {
  var _struct$bonds$get;
  var DEGREE_120_FOR_ONE_BOND = 2 * Math.PI / 3;
  var DEGREE_180_FOR_TRIPLE_BOND = Math.PI;
  var onlyNeighbor = atom.a.neighbors[0];
  var neighbour = struct.halfBonds.get(onlyNeighbor);
  if (!neighbour) {
    throw new Error("HalfBond not found for neighbor id ".concat(onlyNeighbor, " while resolving R-group attachment point direction"));
  }
  var angle = neighbour.ang;
  var isTripleBond = ((_struct$bonds$get = struct.bonds.get(neighbour.bid)) === null || _struct$bonds$get === void 0 ? void 0 : _struct$bonds$get.type) === Bond.PATTERN.TYPE.TRIPLE;
  var finalAngle = angle + (isTripleBond ? DEGREE_180_FOR_TRIPLE_BOND : DEGREE_120_FOR_ONE_BOND);
  return newVectorFromAngle(finalAngle);
}
function showAttachmentPointLabel(atom, _ref3, directionVector, addReObjectPath, labelText, visel) {
  var options = _ref3.options,
    paper = _ref3.paper;
  var atomPositionVector = Scale.modelToCanvas(atom.a.pp, options);
  var labelPosition = getLabelPositionForAttachmentPoint(atomPositionVector, directionVector, options.microModeScale);
  var labelPath = draw.rgroupAttachmentPointLabel(paper, labelPosition, labelText, options, atom.color);
  addReObjectPath(LayerMap.indices, visel, labelPath, atomPositionVector, true);
}
function getLabelPositionForAttachmentPoint(atomPositionVector, directionVector, shapeHeight) {
  var normal = directionVector.rotateSC(1, 0);
  return atomPositionVector.addScaled(normal, 0.17 * shapeHeight).addScaled(directionVector, shapeHeight * 0.7);
}

export { ReRGroupAttachmentPoint };
//# sourceMappingURL=rergroupAttachmentPoint.modern.js.map
