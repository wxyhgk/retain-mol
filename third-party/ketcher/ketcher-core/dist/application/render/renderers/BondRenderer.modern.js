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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../editor/editorSingleton.modern.js';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { Coordinates } from '../../editor/shared/coordinates.modern.js';
import { BondType, BondStereo } from '../../../domain/entities/CoreBond.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import SingleBondPathRenderer from './BondPathRenderer/SingleBondPathRenderer.modern.js';
import SingleUpBondPathRenderer from './BondPathRenderer/SingleUpBondPathRenderer.modern.js';
import SingleDownBondPathRenderer from './BondPathRenderer/SingleDownBondPathRenderer.modern.js';
import DoubleBondPathRenderer from './BondPathRenderer/DoubleBondPathRenderer.modern.js';
import DoubleCisTransBondPathRenderer from './BondPathRenderer/DoubleCisTransBondPathRenderer.modern.js';
import TripleBondPathRenderer from './BondPathRenderer/TripleBondPathRenderer.modern.js';
import SingleDoubleBondPathRenderer from './BondPathRenderer/SingleDoubleBondPathRenderer.modern.js';
import SingleUpDownBondPathRenderer from './BondPathRenderer/SingleUpDownBondPathRenderer.modern.js';
import util from '../util.modern.js';
import { SELECTION_COLOR, SELECTION_HOVERED_COLOR } from './constants.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BOND_WIDTH = 2;
var SCALE_FACTOR = 40;
var LINE_WIDTH = SCALE_FACTOR / 20;
var BOND_SPACE = SCALE_FACTOR / 7;
var FONT_SIZE_LABEL = Math.ceil(1.9 * (SCALE_FACTOR / 6));
var TOPOLOGY_OFFSET_X_MULTIPLIER = 2;
var TOPOLOGY_OFFSET_Y_MULTIPLIER = 1;
var BondRenderer = function (_BaseRenderer) {
  _inherits(BondRenderer, _BaseRenderer);
  function BondRenderer(bond) {
    var _this;
    _classCallCheck(this, BondRenderer);
    _this = _callSuper(this, BondRenderer, [bond]);
    _defineProperty(_assertThisInitialized(_this), "bond", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _this.bond = bond;
    bond.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(BondRenderer, [{
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = Scale.modelToCanvas(this.bond.startPosition, this.editorSettings);
      var endPositionInPixels = Scale.modelToCanvas(this.bond.endPosition, this.editorSettings);
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels
      };
    }
  }, {
    key: "scaledCenter",
    get: function get() {
      return Scale.modelToCanvas(this.bond.center, this.editorSettings);
    }
  }, {
    key: "getDoubleBondShiftForChain",
    value: function getDoubleBondShiftForChain(firstHalfEdge, secondHalfEdge) {
      if (!firstHalfEdge || !secondHalfEdge) return 0;
      var nLeft = (firstHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) + (secondHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0);
      var nRight = (secondHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) + (firstHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0);
      if (nLeft > nRight) return -1;
      if (nLeft < nRight) return 1;
      if ((firstHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) + (firstHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0) === 1) return 1;
      return 0;
    }
  }, {
    key: "getDoubleBondShiftForLoop",
    value: function getDoubleBondShiftForLoop(loop1HalfEdgesAmount, loop2HalfEdgesAmount, loop1DoubleBondsAmount, loop2DoubleBondsAmount) {
      var BENZENE_RING_BONDS_AMOUNT = 6;
      if (loop1HalfEdgesAmount === BENZENE_RING_BONDS_AMOUNT && loop2HalfEdgesAmount !== BENZENE_RING_BONDS_AMOUNT && (loop1DoubleBondsAmount > 1 || loop2DoubleBondsAmount === 1)) return -1;
      if (loop2HalfEdgesAmount === BENZENE_RING_BONDS_AMOUNT && loop1HalfEdgesAmount !== BENZENE_RING_BONDS_AMOUNT && (loop2DoubleBondsAmount > 1 || loop1DoubleBondsAmount === 1)) return 1;
      if (loop2HalfEdgesAmount * loop1DoubleBondsAmount > loop1HalfEdgesAmount * loop2DoubleBondsAmount) return -1;
      if (loop2HalfEdgesAmount * loop1DoubleBondsAmount < loop1HalfEdgesAmount * loop2DoubleBondsAmount) return 1;
      if (loop2HalfEdgesAmount > loop1HalfEdgesAmount) return -1;
      return 1;
    }
  }, {
    key: "getDoubleBondShift",
    value: function getDoubleBondShift(viewModel, firstHalfEdge, secondHalfEdge) {
      if (!firstHalfEdge || !secondHalfEdge) {
        return this.getDoubleBondShiftForChain(firstHalfEdge, secondHalfEdge);
      }
      var loop1Id = firstHalfEdge.loopId || -1;
      var loop2Id = secondHalfEdge.loopId || -1;
      var loop1 = viewModel.loops.get(loop1Id);
      var loop2 = viewModel.loops.get(loop2Id);
      if (loop1 && loop2) {
        return this.getDoubleBondShiftForLoop(loop1.halfEdges.length, loop2.halfEdges.length, loop1.doubleBondsAmount, loop2.doubleBondsAmount);
      } else if (loop1) {
        return -1;
      } else if (loop2) {
        return 1;
      } else {
        return this.getDoubleBondShiftForChain(firstHalfEdge, secondHalfEdge);
      }
    }
  }, {
    key: "shiftPositionIfAtomLabelVisible",
    value: function shiftPositionIfAtomLabelVisible(position, atom, halfEdge) {
      var _atom$renderer, _atom$renderer2;
      if (!((_atom$renderer = atom.renderer) !== null && _atom$renderer !== void 0 && _atom$renderer.isLabelVisible)) {
        return position;
      }
      var atomLabelBBoxes = (_atom$renderer2 = atom.renderer) === null || _atom$renderer2 === void 0 ? void 0 : _atom$renderer2.labelBBoxes;
      var atomPositionInPixels = atom.renderer.scaledPosition;
      var shiftValue = 0;
      atomLabelBBoxes === null || atomLabelBBoxes === void 0 || atomLabelBBoxes.forEach(function (labelSymbolBBox) {
        var relativeLabelSymbolBox2Abs = new Box2Abs(labelSymbolBBox.x, labelSymbolBBox.y, labelSymbolBBox.x + labelSymbolBBox.width, labelSymbolBBox.y + labelSymbolBBox.height);
        var absoluteLabelSymbolBox2Abs = relativeLabelSymbolBox2Abs.translate(atomPositionInPixels);
        shiftValue = Math.max(shiftValue, util.shiftRayBox(atomPositionInPixels, halfEdge.direction, absoluteLabelSymbolBox2Abs));
      });
      return position.addScaled(halfEdge.direction, BOND_WIDTH + shiftValue);
    }
  }, {
    key: "cipElementId",
    get: function get() {
      return "cip-bond-".concat(this.bond.id);
    }
  }, {
    key: "getBondFromMoleculeStruct",
    value: function getBondFromMoleculeStruct() {
      var _this$bond$firstAtom$;
      return (_this$bond$firstAtom$ = this.bond.firstAtom.monomer.monomerItem.struct) === null || _this$bond$firstAtom$ === void 0 ? void 0 : _this$bond$firstAtom$.bonds.get(this.bond.bondIdInMicroMode);
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$rootElement;
      var pathShape = this.getSelectionContour();
      if (!pathShape) {
        return;
      }
      if (this.selectionElement) {
        this.selectionElement.attr('d', pathShape);
      } else {
        var _this$canvas;
        this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('path', ':first-child').attr('d', pathShape).attr('fill', SELECTION_COLOR).attr('class', 'dynamic-element');
      }
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || (_this$rootElement = _this$rootElement.select("#".concat(this.cipElementId, " rect"))) === null || _this$rootElement === void 0 || _this$rootElement.attr('fill', SELECTION_COLOR);
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen, _this$rootElement2;
      (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
      this.selectionElement = undefined;
      (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 || (_this$rootElement2 = _this$rootElement2.select("#".concat(this.cipElementId, " rect"))) === null || _this$rootElement2 === void 0 || _this$rootElement2.attr('fill', '#f5f5f5');
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      var _this$canvas2;
      if (this.hoverElement) {
        return this.hoverElement;
      }
      var pathShape = this.getSelectionContour();
      if (!pathShape) {
        return;
      }
      this.hoverElement = (_this$canvas2 = this.canvas) === null || _this$canvas2 === void 0 ? void 0 : _this$canvas2.insert('path', ':first-child').attr('d', pathShape).attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1.2).attr('class', 'dynamic-element');
      return this.hoverElement;
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "redrawHover",
    value: function redrawHover() {
      if (this.drawingEntity.hovered) {
        var hoverElement = this.appendHover();
        if (hoverElement) {
          this.hoverElement = hoverElement;
        }
        if (this.bond.selected) {
          var _this$selectionElemen2;
          (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.attr('fill', SELECTION_HOVERED_COLOR);
        }
      } else {
        this.removeHover();
        this.hoverElement = undefined;
        if (this.bond.selected) {
          var _this$selectionElemen3;
          (_this$selectionElemen3 = this.selectionElement) === null || _this$selectionElemen3 === void 0 || _this$selectionElemen3.attr('fill', SELECTION_COLOR);
        }
      }
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.bond.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var rootElement = this.canvas.append('g').data([this]).attr('data-testid', 'bond').attr('data-bondtype', this.bond.type).attr('data-bondstereo', this.bond.stereo).attr('data-bondid', this.bond.id).attr('data-fromatomid', this.bond.firstAtom.id).attr('data-toatomid', this.bond.secondAtom.id);
      var bondFromStruct = this.getBondFromMoleculeStruct();
      if (bondFromStruct) {
        rootElement.attr('data-topology', bondFromStruct.topology);
        rootElement.attr('data-reacting-center', bondFromStruct.reactingCenterStatus);
      }
      rootElement.attr('transform', "translate(".concat(this.scaledPosition.startPosition.x, ", ").concat(this.scaledPosition.startPosition.y, ")"));
      return rootElement;
    }
  }, {
    key: "getSelectionPoints",
    value: function getSelectionPoints() {
      var editor = provideEditorInstance();
      var viewModel = editor.viewModel;
      var halfEdges = viewModel.bondsToHalfEdges.get(this.bond);
      var firstHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[0];
      var secondHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[1];
      var bond = this.bond;
      var bondSpacingInPx = 6;
      var stereoBondWidth = 6;
      var regularSelectionThikness = bondSpacingInPx + BOND_WIDTH;
      if (!firstHalfEdge || !secondHalfEdge) {
        KetcherLogger.warn('Failed to draw selection for bond. There is no no half edges.');
        return [];
      }
      var halfEdgeStart = Coordinates.modelToCanvas(firstHalfEdge.position);
      var halfEdgeEnd = Coordinates.modelToCanvas(secondHalfEdge.position);
      halfEdgeStart = this.shiftPositionIfAtomLabelVisible(halfEdgeStart, this.bond.firstAtom, firstHalfEdge);
      halfEdgeEnd = this.shiftPositionIfAtomLabelVisible(halfEdgeEnd, this.bond.secondAtom, secondHalfEdge);
      var isStereoBond = bond.stereo !== 0 && bond.stereo !== 3;
      var addPadding = isStereoBond ? 0 : -2;
      var contourStart = Vec2.getLinePoint(halfEdgeEnd, halfEdgeStart, addPadding);
      var contourEnd = Vec2.getLinePoint(halfEdgeStart, halfEdgeEnd, addPadding);
      var stereoBondStartHeightCoef = 0.5;
      var bondPadding = 0.5;
      var addStart = isStereoBond ? stereoBondWidth * stereoBondStartHeightCoef : regularSelectionThikness + bondPadding;
      var stereoBondEndHeightCoef = 1;
      var addEnd = isStereoBond ? stereoBondWidth + regularSelectionThikness * stereoBondEndHeightCoef / stereoBondWidth : regularSelectionThikness + bondPadding;
      var contourPaddedStart = Vec2.getLinePoint(contourStart, contourEnd, addEnd);
      var contourPaddedEnd = Vec2.getLinePoint(contourEnd, contourStart, addStart);
      var startPoint = contourStart.add(new Vec2(addEnd, 0));
      var endPoint = contourEnd.add(new Vec2(addStart, 0));
      var padStartPoint = contourPaddedStart.add(new Vec2(addEnd, 0));
      var padEndPoint = contourPaddedEnd.add(new Vec2(addStart, 0));
      var angle = Math.atan2(firstHalfEdge.direction.y, firstHalfEdge.direction.x) * 180 / Math.PI;
      var startTop = startPoint.rotateAroundOrigin(angle + 90, new Vec2(contourStart.x, contourStart.y));
      var startBottom = startPoint.rotateAroundOrigin(angle - 90, new Vec2(contourStart.x, contourStart.y));
      var startPadTop = padStartPoint.rotateAroundOrigin(angle + 90, contourPaddedStart);
      var startPadBottom = padStartPoint.rotateAroundOrigin(angle - 90, contourPaddedStart);
      var endTop = endPoint.rotateAroundOrigin(angle + 90, contourEnd);
      var endBottom = endPoint.rotateAroundOrigin(angle - 90, contourEnd);
      var endPadTop = padEndPoint.rotateAroundOrigin(angle + 90, contourPaddedEnd);
      var endPadBottom = padEndPoint.rotateAroundOrigin(angle - 90, contourPaddedEnd);
      return [startPadTop, startTop, endTop, endPadTop, endPadBottom, endBottom, startPadBottom, startBottom];
    }
  }, {
    key: "getHoverContourPath",
    value: function getHoverContourPath() {
      return this.getSelectionContour();
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour() {
      var selectionPoints = this.getSelectionPoints();
      if (selectionPoints.length !== 8) {
        return undefined;
      }
      var _selectionPoints = _slicedToArray(selectionPoints, 8),
        startPadTop = _selectionPoints[0],
        startTop = _selectionPoints[1],
        endTop = _selectionPoints[2],
        endPadTop = _selectionPoints[3],
        endPadBottom = _selectionPoints[4],
        endBottom = _selectionPoints[5],
        startPadBottom = _selectionPoints[6],
        startBottom = _selectionPoints[7];
      return "\n      M ".concat(startTop.x, " ").concat(startTop.y, "\n      L ").concat(endTop.x, " ").concat(endTop.y, "\n      C ").concat(endPadTop.x, " ").concat(endPadTop.y, ", ").concat(endPadBottom.x, " ").concat(endPadBottom.y, ", ").concat(endBottom.x, " ").concat(endBottom.y, "\n      L ").concat(startBottom.x, " ").concat(startBottom.y, "\n      C ").concat(startPadBottom.x, " ").concat(startPadBottom.y, ", ").concat(startPadTop.x, " ").concat(startPadTop.y, ", ").concat(startTop.x, " ").concat(startTop.y, "\n    ");
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
      if (!this.rootElement) {
        return;
      }
      this.drawSelection();
      this.move();
    }
  }, {
    key: "createBondHoverablePath",
    value: function createBondHoverablePath(paths) {
      var _this2 = this;
      if (!this.rootElement) {
        return;
      }
      paths.forEach(function (_ref) {
        var _this2$rootElement;
        var d = _ref.d,
          attrs = _ref.attrs;
        var path = (_this2$rootElement = _this2.rootElement) === null || _this2$rootElement === void 0 ? void 0 : _this2$rootElement.append('path').attr('d', d).attr('stroke', 'black').attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
        Object.entries(attrs).forEach(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
            key = _ref3[0],
            value = _ref3[1];
          path === null || path === void 0 || path.attr(key, value);
        });
      });
      var combinedPath = paths.reduce(function (acc, _ref4) {
        var d = _ref4.d;
        return acc + d;
      }, '');
      var combinedPathWidth = paths.reduce(function (acc, _ref5) {
        var _attrs$strokeWidth;
        var attrs = _ref5.attrs;
        var strokeWidth = Number((_attrs$strokeWidth = attrs['stroke-width']) !== null && _attrs$strokeWidth !== void 0 ? _attrs$strokeWidth : BOND_WIDTH);
        return acc + strokeWidth;
      }, 0);
      var hoverPath = this.rootElement.append('path').attr('d', combinedPath).attr('fill', 'none').attr('stroke', 'transparent')
      .attr('stroke-width', "".concat(combinedPathWidth * 4));
      hoverPath.on('mouseenter', function (event) {
        provideEditorInstance().events.mouseOverDrawingEntity.dispatch(event);
        _this2.appendHover();
      }).on('mouseleave', function (event) {
        provideEditorInstance().events.mouseLeaveDrawingEntity.dispatch(event);
        _this2.removeHover();
      });
    }
  }, {
    key: "halfEdges",
    get: function get() {
      var editor = provideEditorInstance();
      var viewModel = editor.viewModel;
      return viewModel.bondsToHalfEdges.get(this.bond);
    }
  }, {
    key: "bondVectors",
    get: function get() {
      var halfEdges = this.halfEdges;
      var firstHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[0];
      var secondHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[1];
      if (!firstHalfEdge || !secondHalfEdge) {
        return undefined;
      }
      var startPosition = new Vec2(0, 0);
      var endPosition = Coordinates.modelToCanvas(secondHalfEdge.position).sub(this.scaledPosition.startPosition);
      startPosition = this.shiftPositionIfAtomLabelVisible(startPosition, this.bond.firstAtom, firstHalfEdge);
      endPosition = this.shiftPositionIfAtomLabelVisible(endPosition, this.bond.secondAtom, secondHalfEdge);
      return {
        startPosition: startPosition,
        endPosition: endPosition,
        firstHalfEdge: firstHalfEdge,
        secondHalfEdge: secondHalfEdge
      };
    }
  }, {
    key: "show",
    value: function show() {
      var editor = provideEditorInstance();
      var viewModel = editor.viewModel;
      this.rootElement = this.rootElement || this.appendRootElement();
      var bondVectors = this.bondVectors;
      if (!bondVectors) {
        KetcherLogger.warn('Failed to draw a bond. No half edges found.');
        return;
      }
      var bondSVGPaths = [];
      switch (this.bond.type) {
        case BondType.Single:
          if (this.bond.stereo === BondStereo.Up) {
            bondSVGPaths = SingleUpBondPathRenderer.preparePaths(bondVectors, viewModel);
          } else if (this.bond.stereo === BondStereo.Down) {
            bondSVGPaths = SingleDownBondPathRenderer.preparePaths(bondVectors);
          } else if (this.bond.stereo === BondStereo.Either) {
            bondSVGPaths = SingleUpDownBondPathRenderer.preparePaths(bondVectors);
          } else {
            bondSVGPaths = SingleBondPathRenderer.preparePaths(bondVectors);
          }
          break;
        case BondType.Double:
          if (this.bond.stereo === BondStereo.CisTrans) {
            bondSVGPaths = DoubleCisTransBondPathRenderer.preparePaths(bondVectors);
          } else {
            bondSVGPaths = DoubleBondPathRenderer.preparePaths(bondVectors, this.getDoubleBondShift(viewModel, bondVectors.firstHalfEdge, bondVectors.secondHalfEdge));
          }
          break;
        case BondType.Triple:
          bondSVGPaths = TripleBondPathRenderer.preparePaths(bondVectors);
          break;
        case BondType.Aromatic:
        case BondType.SingleAromatic:
        case BondType.DoubleAromatic:
          {
            var firstHalfEdge = bondVectors.firstHalfEdge;
            var secondHalfEdge = bondVectors.secondHalfEdge;
            var firstLoop = firstHalfEdge && firstHalfEdge.loopId >= 0 ? viewModel.loops.get(firstHalfEdge.loopId) : null;
            var secondLoop = secondHalfEdge && secondHalfEdge.loopId >= 0 ? viewModel.loops.get(secondHalfEdge.loopId) : null;
            var inConvexAromaticLoop = (firstLoop === null || firstLoop === void 0 ? void 0 : firstLoop.aromatic) && (firstLoop === null || firstLoop === void 0 ? void 0 : firstLoop.isConvex) || (secondLoop === null || secondLoop === void 0 ? void 0 : secondLoop.aromatic) && (secondLoop === null || secondLoop === void 0 ? void 0 : secondLoop.isConvex);
            if (inConvexAromaticLoop) {
              bondSVGPaths = SingleBondPathRenderer.preparePaths(bondVectors);
            } else {
              bondSVGPaths = DoubleBondPathRenderer.preparePaths(bondVectors, this.getDoubleBondShift(viewModel, bondVectors.firstHalfEdge, bondVectors.secondHalfEdge), this.bond.type);
            }
            break;
          }
        case BondType.SingleDouble:
          bondSVGPaths = SingleDoubleBondPathRenderer.preparePaths(bondVectors);
          break;
        case BondType.Any:
        case BondType.Dative:
        case BondType.Hydrogen:
          bondSVGPaths = SingleBondPathRenderer.preparePaths(bondVectors, this.bond.type);
          break;
      }
      this.createBondHoverablePath(bondSVGPaths);
      this.appendBondProperties();
      this.appendStereochemistry();
    }
  }, {
    key: "topologyElementId",
    get: function get() {
      return "topology-bond-".concat(this.bond.id);
    }
  }, {
    key: "reactingCenterElementId",
    get: function get() {
      return "reacting-center-bond-".concat(this.bond.id);
    }
  }, {
    key: "appendBondProperties",
    value: function appendBondProperties() {
      var bondFromStruct = this.getBondFromMoleculeStruct();
      if (!bondFromStruct) {
        return;
      }
      this.appendTopologyMark(bondFromStruct);
      this.appendReactingCenterMark(bondFromStruct);
    }
  }, {
    key: "appendTopologyMark",
    value: function appendTopologyMark(bondFromStruct) {
      if (!this.rootElement) {
        return;
      }
      var mark = null;
      if (bondFromStruct.customQuery) {
        mark = bondFromStruct.customQuery;
        if (bondFromStruct.customQuery.length > 8) {
          mark = "".concat(bondFromStruct.customQuery.substring(0, 8), "...");
        }
      } else if (bondFromStruct.topology === Bond.PATTERN.TOPOLOGY.RING) {
        mark = 'rng';
      } else if (bondFromStruct.topology === Bond.PATTERN.TOPOLOGY.CHAIN) {
        mark = 'chn';
      }
      if (!mark) {
        return;
      }
      var halfEdges = this.halfEdges;
      var firstHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[0];
      var secondHalfEdge = halfEdges === null || halfEdges === void 0 ? void 0 : halfEdges[1];
      if (!firstHalfEdge || !secondHalfEdge) {
        return;
      }
      var bondVectors = this.bondVectors;
      if (!bondVectors) {
        return;
      }
      var center = bondVectors.endPosition.add(bondVectors.startPosition).scaled(0.5);
      var direction = bondVectors.endPosition.sub(bondVectors.startPosition).normalized();
      var normal = new Vec2(-direction.y, direction.x);
      var doubleBondShift = this.getDoubleBondShift(provideEditorInstance().viewModel, firstHalfEdge, secondHalfEdge);
      var fixed = LINE_WIDTH;
      if (doubleBondShift > 0) {
        normal = normal.scaled(-doubleBondShift);
      } else if (doubleBondShift === 0) {
        fixed += BOND_SPACE / 2;
      }
      var offset = new Vec2(TOPOLOGY_OFFSET_X_MULTIPLIER, TOPOLOGY_OFFSET_Y_MULTIPLIER).scaled(BOND_SPACE);
      if (bondFromStruct.type === Bond.PATTERN.TYPE.TRIPLE) {
        fixed += BOND_SPACE;
      }
      var position = center.add(new Vec2(normal.x * (offset.x + fixed), normal.y * (offset.y + fixed)));
      var topologyGroup = this.rootElement.append('g').attr('id', this.topologyElementId);
      var topologyText = topologyGroup.append('text').text(mark).attr('font-family', 'Arial').attr('font-size', "".concat(FONT_SIZE_LABEL, "px")).attr('fill', '#000').attr('pointer-events', 'none');
      var textNode = topologyText.node();
      if (textNode) {
        var box = textNode.getBBox();
        topologyText.attr('x', position.x - box.width / 2).attr('y', position.y + box.height / 4);
      }
    }
  }, {
    key: "appendReactingCenterMark",
    value: function appendReactingCenterMark(bondFromStruct) {
      if (!this.rootElement) {
        return;
      }
      var reactingCenterStatus = bondFromStruct.reactingCenterStatus;
      if (reactingCenterStatus === null || reactingCenterStatus === undefined || reactingCenterStatus === Bond.PATTERN.REACTING_CENTER.UNMARKED) {
        return;
      }
      var bondVectors = this.bondVectors;
      if (!bondVectors) {
        return;
      }
      var center = bondVectors.endPosition.add(bondVectors.startPosition).scaled(0.5);
      var direction = bondVectors.endPosition.sub(bondVectors.startPosition).normalized();
      var normal = new Vec2(-direction.y, direction.x);
      var lw = LINE_WIDTH;
      var bs = BOND_SPACE / 2;
      var alongIntRc = lw;
      var alongIntMadeBroken = 2 * lw;
      var alongSz = 1.5 * bs;
      var acrossInt = 1.5 * bs;
      var acrossSz = 3.0 * bs;
      var tiltTan = 0.2;
      var points = [];
      switch (reactingCenterStatus) {
        case Bond.PATTERN.REACTING_CENTER.NOT_CENTER:
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, tiltTan * acrossSz));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, -tiltTan * acrossSz));
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, -tiltTan * acrossSz));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, tiltTan * acrossSz));
          break;
        case Bond.PATTERN.REACTING_CENTER.CENTER:
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, tiltTan * acrossSz).addScaled(direction, alongIntRc));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, -tiltTan * acrossSz).addScaled(direction, alongIntRc));
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, tiltTan * acrossSz).addScaled(direction, -alongIntRc));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, -tiltTan * acrossSz).addScaled(direction, -alongIntRc));
          points.push(center.addScaled(direction, alongSz).addScaled(normal, acrossInt));
          points.push(center.addScaled(direction, -alongSz).addScaled(normal, acrossInt));
          points.push(center.addScaled(direction, alongSz).addScaled(normal, -acrossInt));
          points.push(center.addScaled(direction, -alongSz).addScaled(normal, -acrossInt));
          break;
        case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN:
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, alongIntMadeBroken));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, alongIntMadeBroken));
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, -alongIntMadeBroken));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, -alongIntMadeBroken));
          break;
        case Bond.PATTERN.REACTING_CENTER.ORDER_CHANGED:
          points.push(center.addScaled(normal, acrossSz));
          points.push(center.addScaled(normal, -acrossSz));
          break;
        case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, alongIntMadeBroken));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, alongIntMadeBroken));
          points.push(center.addScaled(normal, acrossSz).addScaled(direction, -alongIntMadeBroken));
          points.push(center.addScaled(normal, -acrossSz).addScaled(direction, -alongIntMadeBroken));
          points.push(center.addScaled(normal, acrossSz));
          points.push(center.addScaled(normal, -acrossSz));
          break;
        default:
          return;
      }
      if (points.length === 0) {
        return;
      }
      var pathD = '';
      for (var i = 0; i < points.length; i += 2) {
        var p1 = points[i];
        var p2 = points[i + 1];
        if (p1 && p2) {
          pathD += "M".concat(p1.x, ",").concat(p1.y, "L").concat(p2.x, ",").concat(p2.y);
        }
      }
      this.rootElement.append('path').attr('id', this.reactingCenterElementId).attr('d', pathD).attr('stroke', 'black').attr('stroke-width', LINE_WIDTH).attr('fill', 'none').attr('pointer-events', 'none');
    }
  }, {
    key: "appendStereochemistry",
    value: function appendStereochemistry() {
      var _this$rootElement3;
      var cipValue = this.bond.cip;
      if (!cipValue) {
        return;
      }
      var cipGroup = (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 || (_this$rootElement3 = _this$rootElement3.append('g')) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.attr('id', this.cipElementId);
      var cipText = cipGroup === null || cipGroup === void 0 ? void 0 : cipGroup.append('text').text("(".concat(cipValue, ")")).attr('font-family', 'Arial').attr('font-size', '13px').attr('pointer-events', 'none');
      var textNode = cipText === null || cipText === void 0 ? void 0 : cipText.node();
      if (textNode) {
        var _cipText$attr;
        var box = textNode.getBBox();
        cipText === null || cipText === void 0 || (_cipText$attr = cipText.attr('x', 0)) === null || _cipText$attr === void 0 || _cipText$attr.attr('y', -box.y);
        var rectWidth = box.width + 2;
        var rectHeight = box.height + 2;
        cipGroup === null || cipGroup === void 0 || cipGroup.insert('rect', 'text').attr('x', 0).attr('y', 0).attr('width', rectWidth).attr('height', rectHeight).attr('rx', 3).attr('ry', 3).attr('fill', '#f5f5f5');
        cipGroup === null || cipGroup === void 0 || cipGroup.attr('transform', "\n        translate(".concat(-this.scaledPosition.startPosition.x, ", ").concat(-this.scaledPosition.startPosition.y, ")\n        translate(").concat(this.scaledCenter.x - rectWidth / 2, ", ").concat(this.scaledCenter.y - rectHeight / 2, ")\n        "));
      }
    }
  }, {
    key: "remove",
    value: function remove() {
      _get(_getPrototypeOf(BondRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "setVisibility",
    value: function setVisibility(isVisible) {
      var _this$rootElement4, _this$selectionElemen4;
      _get(_getPrototypeOf(BondRenderer.prototype), "setVisibility", this).call(this, isVisible);
      var display = isVisible ? '' : 'none';
      (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 || _this$rootElement4.style('display', display);
      (_this$selectionElemen4 = this.selectionElement) === null || _this$selectionElemen4 === void 0 || _this$selectionElemen4.style('display', display);
    }
  }, {
    key: "move",
    value: function move() {
      if (!this.rootElement) {
        return;
      }
      this.remove();
      this.show();
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
    }
  }]);
  return BondRenderer;
}(BaseRenderer);

export { BondRenderer };
//# sourceMappingURL=BondRenderer.modern.js.map
