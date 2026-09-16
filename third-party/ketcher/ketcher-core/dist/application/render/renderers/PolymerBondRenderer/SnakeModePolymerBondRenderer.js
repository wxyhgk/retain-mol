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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var SnakeMode = require('../../../editor/modes/SnakeMode.js');
var editorSingleton = require('../../../editor/editorSingleton.js');
var coordinates = require('../../../editor/shared/coordinates.js');
var SideChainConnectionBondRendererUtility = require('./SideChainConnectionBondRendererUtility.js');
var SVGPathDAttributeUtility = require('./SVGPathDAttributeUtility.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');
var monomers = require('../../../../domain/helpers/monomers.js');
var _ = require('lodash');
var BaseRenderer = require('../BaseRenderer.js');
var constants = require('../constants.js');
var helpers = require('./helpers.js');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');
var layout = require('../../../../domain/constants/layout.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var LineDirection;
(function (LineDirection) {
  LineDirection["Horizontal"] = "Horizontal";
  LineDirection["Vertical"] = "Vertical";
})(LineDirection || (LineDirection = {}));
var LINE_FROM_MONOMER_LENGTH = 15;
var VERTICAL_LINE_LENGTH = 21;
var RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH = 20;
var RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH = 210;
var SIDE_CONNECTION_BODY_ELEMENT_CLASS = 'polymer-bond-body';
var SnakeModePolymerBondRenderer = function (_BaseRenderer) {
  _inherits__default["default"](SnakeModePolymerBondRenderer, _BaseRenderer);
  function SnakeModePolymerBondRenderer(polymerBond) {
    var _this;
    _classCallCheck__default["default"](this, SnakeModePolymerBondRenderer);
    _this = _callSuper(this, SnakeModePolymerBondRenderer, [polymerBond]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "polymerBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isSnakeBond", false);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "path", '');
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousStateOfIsMonomersOnSameHorizontalLine", false);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "sideConnectionBondTurnPoint", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "hoverLineAreaElement", void 0);
    _this.polymerBond = polymerBond;
    _this.polymerBond.setRenderer(_assertThisInitialized__default["default"](_this));
    _this.calculateIsSnakeBond();
    return _this;
  }
  _createClass__default["default"](SnakeModePolymerBondRenderer, [{
    key: "editorEvents",
    get: function get() {
      return editorSingleton.provideEditorInstance().events;
    }
  }, {
    key: "isSnake",
    get: function get() {
      return true;
    }
  }, {
    key: "isHydrogenBond",
    get: function get() {
      return this.polymerBond instanceof HydrogenBond.HydrogenBond;
    }
  }, {
    key: "rootBBox",
    get: function get() {
      var _this$rootElement;
      var rootNode = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.node();
      if (!rootNode) return undefined;
      return rootNode.getBBox();
    }
  }, {
    key: "width",
    get: function get() {
      var _this$rootBBox$width, _this$rootBBox;
      return (_this$rootBBox$width = (_this$rootBBox = this.rootBBox) === null || _this$rootBBox === void 0 ? void 0 : _this$rootBBox.width) !== null && _this$rootBBox$width !== void 0 ? _this$rootBBox$width : 0;
    }
  }, {
    key: "height",
    get: function get() {
      var _this$rootBBox$height, _this$rootBBox2;
      return (_this$rootBBox$height = (_this$rootBBox2 = this.rootBBox) === null || _this$rootBBox2 === void 0 ? void 0 : _this$rootBBox2.height) !== null && _this$rootBBox$height !== void 0 ? _this$rootBBox$height : 0;
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = coordinates.Coordinates.modelToCanvas(this.polymerBond.startPosition);
      var endPositionInPixels = coordinates.Coordinates.modelToCanvas(this.polymerBond.endPosition);
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels
      };
    }
  }, {
    key: "getSideConnectionEndpointAngle",
    value: function getSideConnectionEndpointAngle(monomer) {
      var _cells$0$connections,
        _this2 = this,
        _cells$connections;
      var editor = editorSingleton.provideEditorInstance();
      var matrix = editor.drawingEntitiesManager.canvasMatrix;
      var cells = matrix === null || matrix === void 0 ? void 0 : matrix.polymerBondToCells.get(this.polymerBond);
      var startCellDirection = cells === null || cells === void 0 || (_cells$0$connections = cells[0].connections) === null || _cells$0$connections === void 0 || (_cells$0$connections = _cells$0$connections.find(function (connection) {
        return connection.polymerBond === _this2.polymerBond;
      })) === null || _cells$0$connections === void 0 ? void 0 : _cells$0$connections.direction;
      var endCellDirection = cells === null || cells === void 0 || (_cells$connections = cells[cells.length - 1].connections) === null || _cells$connections === void 0 || (_cells$connections = _cells$connections.find(function (connection) {
        return connection.polymerBond === _this2.polymerBond;
      })) === null || _cells$connections === void 0 ? void 0 : _cells$connections.direction;
      var startCellMonomer = cells === null || cells === void 0 ? void 0 : cells[0].monomer;
      var endpointDirection = monomer === startCellMonomer ? startCellDirection : endCellDirection;
      var startCellNormalizedDirection = _.isNumber(startCellDirection) ? startCellDirection : startCellDirection === null || startCellDirection === void 0 ? void 0 : startCellDirection.y;
      var endCellNormalizedDirection = _.isNumber(endCellDirection) ? endCellDirection : endCellDirection === null || endCellDirection === void 0 ? void 0 : endCellDirection.y;
      var normalizedDirection = _.isNumber(endpointDirection) ? endpointDirection : endpointDirection === null || endpointDirection === void 0 ? void 0 : endpointDirection.y;
      var endpointAngle = normalizedDirection === 0 ? -Math.PI / 2 : Math.PI / 2;
      if (startCellDirection === 90 && endCellDirection === 90) {
        return monomer === startCellMonomer ? -Math.PI / 2 : Math.PI / 2;
      }
      if (startCellNormalizedDirection === 0 && endCellNormalizedDirection === 270) {
        return Math.PI / 2;
      }
      return endpointAngle;
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
      if (this.previousStateOfIsMonomersOnSameHorizontalLine !== this.polymerBond.isHorizontal) {
        this.remove();
        this.show();
      } else {
        assert.assert(this.rootElement);
        this.moveStart();
        this.moveEnd();
      }
      this.previousStateOfIsMonomersOnSameHorizontalLine = this.polymerBond.isHorizontal;
    }
  }, {
    key: "appendBond",
    value: function appendBond(rootElement) {
      var editor = editorSingleton.provideEditorInstance();
      var matrix = editor.drawingEntitiesManager.canvasMatrix;
      var cells = matrix === null || matrix === void 0 ? void 0 : matrix.polymerBondToCells.get(this.polymerBond);
      if ((this.polymerBond.isSideChainConnection || this.isSideChainLikeBackbone) && (!this.isHydrogenBond || editor.mode instanceof SnakeMode.SnakeMode) && cells) {
        this.appendSideConnectionBond(rootElement, cells);
      } else if (this.isSnakeBond && this.polymerBond.finished && !this.polymerBond.isHorizontal) {
        this.appendSnakeBond(rootElement);
      } else {
        this.appendBondGraph(rootElement);
      }
      return this.bodyElement;
    }
  }, {
    key: "appendSnakeBond",
    value: function appendSnakeBond(rootElement) {
      var _this$polymerBond$sec, _this$polymerBond$sec2;
      var startPosition = this.scaledPosition.startPosition;
      var endPosition = this.scaledPosition.endPosition;
      this.updateSnakeBondPath(startPosition, endPosition);
      this.bodyElement = rootElement.append('path').attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8').attr('stroke-width', 1).attr('class', 'selection-area').attr('d', this.path).attr('fill-opacity', 0).attr('pointer-events', 'stroke').attr('data-testid', 'bond').attr('data-bondtype', 'covalent').attr('data-bondid', this.polymerBond.id).attr('data-frommonomerid', this.polymerBond.firstMonomer.id).attr('data-tomonomerid', (_this$polymerBond$sec = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec === void 0 ? void 0 : _this$polymerBond$sec.id).attr('data-fromattachmentpoint', this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond)).attr('data-toattachmentpoint', (_this$polymerBond$sec2 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec2 === void 0 ? void 0 : _this$polymerBond$sec2.getAttachmentPointByBond(this.polymerBond));
      return this.bodyElement;
    }
  }, {
    key: "appendSideConnectionBond",
    value: function appendSideConnectionBond(rootElement, cells) {
      var _this3 = this,
        _firstCell$node,
        _this$sideConnectionB,
        _this$polymerBond$sec3;
      var firstCell = cells[0];
      var firstCellConnection = firstCell.connections.find(function (connection) {
        return connection.polymerBond === _this3.polymerBond;
      });
      var isVerticalConnection = firstCellConnection.isVertical;
      var isStraightVerticalConnection = (cells.length === 2 || cells.reduce(function (isStraight, cell, index) {
        if (!isStraight || index === 0 || index === cells.length - 1) {
          return isStraight;
        }
        return cell.x === firstCell.x && !cell.monomer;
      }, true)) && isVerticalConnection;
      var isFirstMonomerOfBondInFirstCell = (_firstCell$node = firstCell.node) === null || _firstCell$node === void 0 ? void 0 : _firstCell$node.monomers.includes(this.polymerBond.firstMonomer);
      var isTwoNeighborRowsConnection = cells.every(function (cell) {
        return cell.y === firstCell.y || cell.y === firstCell.y + 1;
      });
      var startPosition = isFirstMonomerOfBondInFirstCell ? this.scaledPosition.startPosition : this.scaledPosition.endPosition;
      var endPosition = isFirstMonomerOfBondInFirstCell ? this.scaledPosition.endPosition : this.scaledPosition.startPosition;
      var xDirection = startPosition.x >= ((_this$sideConnectionB = this.sideConnectionBondTurnPoint) !== null && _this$sideConnectionB !== void 0 ? _this$sideConnectionB : endPosition.x) ? 180 : 0;
      var pathDAttributeValue = SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateMoveTo(startPosition.x, startPosition.y) + ' ';
      var cos = Math.cos(xDirection * Math.PI / 180);
      var previousConnection;
      var previousCell;
      var horizontalPartIntersectionsOffset = firstCellConnection.xOffset;
      var areCellsOnSameRow = cells.every(function (cell) {
        return cell.y === firstCell.y;
      });
      var isSecondCellEmpty = cells[1].node === null;
      if (areCellsOnSameRow) {
        {
          var absoluteLineY = startPosition.y - SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.bondEndLength - horizontalPartIntersectionsOffset * 3;
          pathDAttributeValue += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateAbsoluteLine(startPosition.x, absoluteLineY) + ' ';
        }
        pathDAttributeValue += SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.generateBend(0, -1, cos, -1) + ' ';
      } else {
        {
          var _absoluteLineY = startPosition.y + SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.bondEndLength + horizontalPartIntersectionsOffset * 3;
          pathDAttributeValue += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateAbsoluteLine(startPosition.x, _absoluteLineY) + ' ';
        }
        if (!isStraightVerticalConnection && !isSecondCellEmpty && !isTwoNeighborRowsConnection) {
          pathDAttributeValue += SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.generateBend(0, 1, cos, 1) + ' ';
        }
      }
      if (isVerticalConnection && !isStraightVerticalConnection) {
        var _this$sideConnectionB2;
        var direction = this.sideConnectionBondTurnPoint && startPosition.x < this.sideConnectionBondTurnPoint ? 0 : 180;
        var result = SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
          cell: firstCell,
          connection: firstCellConnection,
          direction: direction,
          horizontal: true,
          turnPoint: (_this$sideConnectionB2 = this.sideConnectionBondTurnPoint) !== null && _this$sideConnectionB2 !== void 0 ? _this$sideConnectionB2 : 0,
          turnPointIsUsed: this.sideConnectionBondTurnPoint !== undefined
        });
        pathDAttributeValue += result.pathPart;
        this.sideConnectionBondTurnPoint = result.turnPoint;
      }
      var maxHorizontalOffset = 0;
      cells.forEach(function (cell, cellIndex) {
        var cellConnection = cell.connections.find(function (connection) {
          return connection.polymerBond === _this3.polymerBond;
        });
        var isLastCell = cellIndex === cells.length - 1;
        var _xDirection = xDirection;
        if (_this3.sideConnectionBondTurnPoint) {
          _xDirection = endPosition.x < _this3.sideConnectionBondTurnPoint ? 180 : 0;
        }
        var maxXOffset = cell.connections.reduce(function (max, connection) {
          return connection.isVertical || max > connection.xOffset ? max : connection.xOffset;
        }, 0);
        maxHorizontalOffset = maxHorizontalOffset > maxXOffset ? maxHorizontalOffset : maxXOffset;
        if (isLastCell) {
          if (isStraightVerticalConnection) {
            return;
          }
          var directionObject = cellConnection.direction;
          var yDirection = isVerticalConnection ? 90 : directionObject.y;
          var sin = Math.sin(yDirection * Math.PI / 180);
          var _cos = Math.cos(_xDirection * Math.PI / 180);
          if (!areCellsOnSameRow) {
            {
              var _cellConnection$yOffs;
              var _absoluteLineY2 = endPosition.y - SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.cellHeight / 2 - SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.smoothCornerSize - sin * ((_cellConnection$yOffs = cellConnection.yOffset) !== null && _cellConnection$yOffs !== void 0 ? _cellConnection$yOffs : 0) * 3 - (isTwoNeighborRowsConnection ? maxHorizontalOffset - cellConnection.xOffset : cellConnection.xOffset) * 3;
              pathDAttributeValue += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateVerticalAbsoluteLine(_absoluteLineY2) + ' ';
            }
            pathDAttributeValue += SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.generateBend(0, sin, _cos, 1) + ' ';
          }
          pathDAttributeValue += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateHorizontalAbsoluteLine(endPosition.x - SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.smoothCornerSize * _cos) + ' ';
          pathDAttributeValue += SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.generateBend(_cos, 0, _cos, 1) + ' ';
          return;
        }
        if (cell.node === null) {
          return;
        }
        if (previousConnection && previousConnection.direction !== cellConnection.direction) {
          var _this3$sideConnection;
          var horizontal = new Set([0, 180]).has(previousConnection.direction);
          var _direction = horizontal ? xDirection :
          previousConnection.direction;
          var _result = SideChainConnectionBondRendererUtility.SideChainConnectionBondRendererUtility.calculatePathPartAndTurnPoint({
            cell: previousCell,
            connection: previousConnection,
            direction: _direction,
            horizontal: horizontal,
            turnPoint: (_this3$sideConnection = _this3.sideConnectionBondTurnPoint) !== null && _this3$sideConnection !== void 0 ? _this3$sideConnection : 0,
            turnPointIsUsed: _this3.sideConnectionBondTurnPoint !== undefined
          });
          pathDAttributeValue += _result.pathPart;
          _this3.sideConnectionBondTurnPoint = _result.turnPoint;
        }
        previousCell = cell;
        previousConnection = cellConnection;
      });
      pathDAttributeValue += SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateAbsoluteLine(endPosition.x, endPosition.y) + ' ';
      this.bodyElement = rootElement.append('path').attr('class', "".concat(SIDE_CONNECTION_BODY_ELEMENT_CLASS)).attr('stroke', this.isHydrogenBond || this.isSideChainLikeBackbone ? '#333333' : '#43B5C0').attr('stroke-width', 1).attr('d', pathDAttributeValue).attr('fill', 'none').attr('stroke-dasharray', this.isHydrogenBond ? '2' : '0').attr('pointer-events', 'all').attr('data-testid', 'bond').attr('data-bondtype', this.isHydrogenBond ? 'hydrogen' : 'covalent').attr('data-bondid', this.polymerBond.id).attr('data-frommonomerid', this.polymerBond.firstMonomer.id).attr('data-tomonomerid', (_this$polymerBond$sec3 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec3 === void 0 ? void 0 : _this$polymerBond$sec3.id);
      if (!this.isHydrogenBond && this.bodyElement) {
        var _this$polymerBond$fir, _this$polymerBond$sec4, _this$polymerBond$sec5;
        this.bodyElement.attr('data-fromattachmentpoint', (_this$polymerBond$fir = this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond)) !== null && _this$polymerBond$fir !== void 0 ? _this$polymerBond$fir : '').attr('data-toattachmentpoint', (_this$polymerBond$sec4 = (_this$polymerBond$sec5 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec5 === void 0 ? void 0 : _this$polymerBond$sec5.getAttachmentPointByBond(this.polymerBond)) !== null && _this$polymerBond$sec4 !== void 0 ? _this$polymerBond$sec4 : '');
      }
      this.path = pathDAttributeValue;
      return this.bodyElement;
    }
  }, {
    key: "getMonomerWidth",
    value: function getMonomerWidth() {
      var _this$polymerBond$fir2, _this$polymerBond$fir3;
      return (_this$polymerBond$fir2 = (_this$polymerBond$fir3 = this.polymerBond.firstMonomer.renderer) === null || _this$polymerBond$fir3 === void 0 ? void 0 : _this$polymerBond$fir3.monomerSize.width) !== null && _this$polymerBond$fir2 !== void 0 ? _this$polymerBond$fir2 : 0;
    }
  }, {
    key: "getMonomerHeight",
    value: function getMonomerHeight() {
      var _this$polymerBond$fir4, _this$polymerBond$fir5;
      return (_this$polymerBond$fir4 = (_this$polymerBond$fir5 = this.polymerBond.firstMonomer.renderer) === null || _this$polymerBond$fir5 === void 0 ? void 0 : _this$polymerBond$fir5.monomerSize.height) !== null && _this$polymerBond$fir4 !== void 0 ? _this$polymerBond$fir4 : 0;
    }
  }, {
    key: "isSideChainLikeBackbone",
    get: function get() {
      return !this.polymerBond.isSideChainConnection && this.polymerBond.isOverlappedByMonomer;
    }
  }, {
    key: "updateSnakeBondPath",
    value: function updateSnakeBondPath(_startPosition, _endPosition) {
      var reCheckAttachmentPoint = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var isR1TheCurrentAttachmentPointOfFirstMonomer = this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond) === 'R1' || this.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(this.polymerBond) === 'R1';
      var isAntisense = this.polymerBond.firstMonomer.monomerItem.isAntisense;
      var startPosition = isAntisense ? _endPosition : _startPosition;
      var endPosition = isAntisense ? _startPosition : _endPosition;
      var distanceY = Math.abs(endPosition.y - startPosition.y);
      var verticalLineLength = distanceY - layout.SnakeLayoutCellWidth / 2 - 5;
      if (isAntisense) {
        verticalLineLength = RNA_ANTISENSE_CHAIN_VERTICAL_LINE_LENGTH;
      } else if (this.polymerBond.firstMonomer.monomerItem.isSense && this.polymerBond.hasAntisenseInRow) {
        verticalLineLength = RNA_SENSE_CHAIN_VERTICAL_LINE_LENGTH;
      }
      if (this.isSecondMonomerBottomRight(startPosition, endPosition)) {
        if (isR1TheCurrentAttachmentPointOfFirstMonomer && reCheckAttachmentPoint) {
          this.updateSnakeBondPath(endPosition, startPosition, false);
          return;
        }
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2, startPosition);
        this.path = this.path.concat(helpers.generateCornerFromLeftToBottom());
        this.addLine(LineDirection.Vertical, endPosition.y - startPosition.y - helpers.DOUBLE_CORNER_LENGTH);
        this.path = this.path.concat(helpers.generateCornerFromTopToRight());
        this.addLine(LineDirection.Horizontal, endPosition.x - startPosition.x - helpers.DOUBLE_CORNER_LENGTH - LINE_FROM_MONOMER_LENGTH - this.getMonomerWidth() / 2);
      } else if (this.isSecondMonomerTopRight(startPosition, endPosition)) {
        if (isR1TheCurrentAttachmentPointOfFirstMonomer && reCheckAttachmentPoint) {
          this.updateSnakeBondPath(endPosition, startPosition, false);
          return;
        }
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2, startPosition);
        this.path = this.path.concat(helpers.generateCornerFromLeftToTop());
        this.addLine(LineDirection.Vertical, endPosition.y - startPosition.y - helpers.DOUBLE_CORNER_LENGTH + this.getMonomerHeight() / 2);
        this.path = this.path.concat(helpers.generateCornerFromBottomToRight());
        this.addLine(LineDirection.Horizontal, endPosition.x - startPosition.x - helpers.DOUBLE_CORNER_LENGTH - LINE_FROM_MONOMER_LENGTH - this.getMonomerWidth() / 2);
      } else if (this.isSecondMonomerBottomLeft(startPosition, endPosition)) {
        var _this$polymerBond$nex;
        if (isR1TheCurrentAttachmentPointOfFirstMonomer && reCheckAttachmentPoint) {
          this.updateSnakeBondPath(endPosition, startPosition, false);
          return;
        }
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH - (this.polymerBond.firstMonomer.monomerItem.isAntisense ? 10 : 0) + this.getMonomerWidth() / 2, startPosition);
        this.path = this.path.concat(helpers.generateCornerFromLeftToBottom());
        this.addLine(LineDirection.Vertical, verticalLineLength);
        this.path = this.path.concat(helpers.generateCornerFromTopToLeft());
        this.addLine(LineDirection.Horizontal, -(startPosition.x - ((_this$polymerBond$nex = this.polymerBond.nextRowPositionX) !== null && _this$polymerBond$nex !== void 0 ? _this$polymerBond$nex : endPosition.x) + LINE_FROM_MONOMER_LENGTH * 2 + this.getMonomerWidth()));
        this.path = this.path.concat(helpers.generateCornerFromRightToBottom());
        this.addLine(LineDirection.Vertical, endPosition.y - startPosition.y - helpers.CORNER_LENGTH * 4 - verticalLineLength);
        this.path = this.path.concat(helpers.generateCornerFromTopToRight());
        this.addLine(LineDirection.Horizontal, this.polymerBond.nextRowPositionX ? endPosition.x - this.polymerBond.nextRowPositionX + this.getMonomerWidth() : LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2);
      } else if (this.isSecondMonomerTopLeft(startPosition, endPosition)) {
        if (isR1TheCurrentAttachmentPointOfFirstMonomer && reCheckAttachmentPoint) {
          this.updateSnakeBondPath(endPosition, startPosition, false);
          return;
        }
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2, startPosition);
        this.path = this.path.concat(helpers.generateCornerFromLeftToBottom());
        this.addLine(LineDirection.Vertical, this.getMonomerHeight());
        this.path = this.path.concat(helpers.generateCornerFromTopToLeft());
        this.addLine(LineDirection.Horizontal, -(startPosition.x - endPosition.x + LINE_FROM_MONOMER_LENGTH * 2 + this.getMonomerWidth()));
        this.path = this.path.concat(helpers.generateCornerFromRightToTop());
        this.addLine(LineDirection.Vertical, endPosition.y - startPosition.y - this.getMonomerHeight());
        this.path = this.path.concat(helpers.generateCornerFromBottomToRight());
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2);
      } else if (this.isSecondMonomerLeft(startPosition, endPosition)) {
        if (isR1TheCurrentAttachmentPointOfFirstMonomer && reCheckAttachmentPoint) {
          this.updateSnakeBondPath(endPosition, startPosition, false);
          return;
        }
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2, startPosition);
        this.path = this.path.concat(helpers.generateCornerFromLeftToBottom());
        this.addLine(LineDirection.Vertical, endPosition.y - startPosition.y + this.getMonomerHeight());
        this.path = this.path.concat(helpers.generateCornerFromTopToLeft());
        this.addLine(LineDirection.Horizontal, -(startPosition.x - endPosition.x + LINE_FROM_MONOMER_LENGTH * 2 + this.getMonomerWidth()));
        this.path = this.path.concat(helpers.generateCornerFromRightToTop());
        this.addLine(LineDirection.Vertical, -this.getMonomerHeight());
        this.path = this.path.concat(helpers.generateCornerFromBottomToRight());
        this.addLine(LineDirection.Horizontal, LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth() / 2);
      } else {
        this.addRandomLine(startPosition, endPosition);
      }
    }
  }, {
    key: "isSecondMonomerTopRight",
    value: function isSecondMonomerTopRight(startPosition, endPosition) {
      return startPosition.y - endPosition.y > helpers.DOUBLE_CORNER_LENGTH && endPosition.x - startPosition.x > helpers.DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth();
    }
  }, {
    key: "isSecondMonomerBottomRight",
    value: function isSecondMonomerBottomRight(startPosition, endPosition) {
      return endPosition.y - startPosition.y > helpers.DOUBLE_CORNER_LENGTH && endPosition.x - startPosition.x > helpers.DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth();
    }
  }, {
    key: "isSecondMonomerBottomLeft",
    value: function isSecondMonomerBottomLeft(startPosition, endPosition) {
      return endPosition.y - startPosition.y >= 2 * (VERTICAL_LINE_LENGTH + helpers.DOUBLE_CORNER_LENGTH) && endPosition.x - startPosition.x <= helpers.DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth();
    }
  }, {
    key: "isSecondMonomerTopLeft",
    value: function isSecondMonomerTopLeft(startPosition, endPosition) {
      return startPosition.y - endPosition.y > 0 && endPosition.x - startPosition.x <= helpers.DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth();
    }
  }, {
    key: "isSecondMonomerLeft",
    value: function isSecondMonomerLeft(startPosition, endPosition) {
      return startPosition.y - endPosition.y < 0 && startPosition.y - endPosition.y > -2 * (VERTICAL_LINE_LENGTH + helpers.DOUBLE_CORNER_LENGTH) && endPosition.x - startPosition.x <= helpers.DOUBLE_CORNER_LENGTH + LINE_FROM_MONOMER_LENGTH + this.getMonomerWidth();
    }
  }, {
    key: "addLine",
    value: function addLine(lineDirection, length, startPosition) {
      var start = startPosition ? SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateMoveTo(Math.round(startPosition.x), Math.round(startPosition.y)) : this.path;
      var line = lineDirection === LineDirection.Horizontal ? "l".concat(length, ", 0") : "l 0, ".concat(length);
      this.path = "".concat(start, " ").concat(line);
    }
  }, {
    key: "addRandomLine",
    value: function addRandomLine(startPosition, endPosition) {
      var start = SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateMoveTo(Math.round(startPosition.x), Math.round(startPosition.y));
      var line = SVGPathDAttributeUtility.SVGPathDAttributeUtility.generateAbsoluteLine(Math.round(endPosition.x), Math.round(endPosition.y));
      this.path = "".concat(start, " ").concat(line);
    }
  }, {
    key: "appendBondGraph",
    value: function appendBondGraph(rootElement) {
      var _this$polymerBond$sec6;
      this.bodyElement = rootElement.append('line').attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8').attr('stroke-width', 1).attr('stroke-dasharray', this.isHydrogenBond ? '2' : '0').attr('class', 'selection-area').attr('x1', this.scaledPosition.startPosition.x).attr('y1', this.scaledPosition.startPosition.y).attr('x2', this.scaledPosition.endPosition.x).attr('y2', this.scaledPosition.endPosition.y).attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none').attr('data-testid', 'bond').attr('data-bondtype', this.isHydrogenBond ? 'hydrogen' : 'covalent').attr('data-bondid', this.polymerBond.id).attr('data-frommonomerid', this.polymerBond.firstMonomer.id).attr('data-tomonomerid', (_this$polymerBond$sec6 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec6 === void 0 ? void 0 : _this$polymerBond$sec6.id);
      if (!this.isHydrogenBond && this.bodyElement) {
        var _this$polymerBond$fir6, _this$polymerBond$sec7, _this$polymerBond$sec8;
        this.bodyElement.attr('data-fromattachmentpoint', (_this$polymerBond$fir6 = this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond)) !== null && _this$polymerBond$fir6 !== void 0 ? _this$polymerBond$fir6 : '').attr('data-toattachmentpoint', (_this$polymerBond$sec7 = (_this$polymerBond$sec8 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec8 === void 0 ? void 0 : _this$polymerBond$sec8.getAttachmentPointByBond(this.polymerBond)) !== null && _this$polymerBond$sec7 !== void 0 ? _this$polymerBond$sec7 : '');
      }
      return this.bodyElement;
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this4 = this;
      return this.canvas.insert('g', ".monomer").data([this]).on('mouseover', function (event) {
        _this4.editorEvents.mouseOverPolymerBond.dispatch(event);
        _this4.editorEvents.mouseOverDrawingEntity.dispatch(event);
      }).on('mousemove', function (event) {
        _this4.editorEvents.mouseOnMovePolymerBond.dispatch(event);
      }).on('mouseout', function (event) {
        _this4.editorEvents.mouseLeavePolymerBond.dispatch(event);
        _this4.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      }).attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none');
    }
  }, {
    key: "show",
    value: function show(_theme) {
      var _this$rootElement2;
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (force) {
        this.sideConnectionBondTurnPoint = undefined;
      }
      this.rootElement = (_this$rootElement2 = this.rootElement) !== null && _this$rootElement2 !== void 0 ? _this$rootElement2 : this.appendRootElement();
      this.appendBond(this.rootElement);
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "isSideConnectionBondDrawn",
    get: function get() {
      return (this.polymerBond.isSideChainConnection || this.isSideChainLikeBackbone) && this.path;
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (this.polymerBond.selected) {
        var _this$selectionElemen;
        (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
        if (this.isSnakeBond && !this.polymerBond.isHorizontal || this.isSideConnectionBondDrawn) {
          var _this$rootElement3;
          this.selectionElement = (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.insert('path', ':first-child').attr('stroke', '#57FF8F').attr('stroke-width', 2).attr('fill-opacity', 0).attr('d', this.path).attr('class', 'dynamic-element');
        } else {
          var _this$rootElement4;
          this.selectionElement = (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 ? void 0 : _this$rootElement4.insert('line', ':first-child').attr('stroke', constants.SELECTION_COLOR).attr('x1', this.scaledPosition.startPosition.x).attr('y1', this.scaledPosition.startPosition.y).attr('x2', this.scaledPosition.endPosition.x).attr('y2', this.scaledPosition.endPosition.y).attr('stroke-width', '5').attr('class', 'dynamic-element');
        }
      } else {
        var _this$selectionElemen2;
        (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.remove();
      }
    }
  }, {
    key: "moveEnd",
    value: function moveEnd() {
      if (this.isSnakeBond && !this.polymerBond.isHorizontal && this.polymerBond.finished) {
        this.moveSnakeBondEnd();
      } else {
        this.moveGraphBondEnd();
      }
    }
  }, {
    key: "moveSnakeBond",
    value: function moveSnakeBond() {
      var _this$selectionElemen3;
      var startPosition = this.scaledPosition.startPosition;
      var endPosition = this.scaledPosition.endPosition;
      this.updateSnakeBondPath(startPosition, endPosition);
      assert.assert(this.bodyElement);
      assert.assert(this.hoverAreaElement);
      this.bodyElement.attr('d', this.path);
      this.hoverAreaElement.attr('d', this.path);
      (_this$selectionElemen3 = this.selectionElement) === null || _this$selectionElemen3 === void 0 || _this$selectionElemen3.attr('d', this.path);
    }
  }, {
    key: "moveSnakeBondEnd",
    value: function moveSnakeBondEnd() {
      this.moveSnakeBond();
    }
  }, {
    key: "moveGraphBondEnd",
    value: function moveGraphBondEnd() {
      var _this$hoverCircleArea, _this$selectionElemen4;
      assert.assert(this.bodyElement);
      assert.assert(this.hoverLineAreaElement);
      this.bodyElement.attr('x2', this.scaledPosition.endPosition.x).attr('y2', this.scaledPosition.endPosition.y);
      this.hoverLineAreaElement.attr('x2', this.scaledPosition.endPosition.x).attr('y2', this.scaledPosition.endPosition.y);
      (_this$hoverCircleArea = this.hoverCircleAreaElement) === null || _this$hoverCircleArea === void 0 || _this$hoverCircleArea.attr('cx', this.scaledPosition.endPosition.x).attr('cy', this.scaledPosition.endPosition.y);
      (_this$selectionElemen4 = this.selectionElement) === null || _this$selectionElemen4 === void 0 || (_this$selectionElemen4 = _this$selectionElemen4.attr('x2', this.scaledPosition.endPosition.x)) === null || _this$selectionElemen4 === void 0 || _this$selectionElemen4.attr('y2', this.scaledPosition.endPosition.y);
    }
  }, {
    key: "moveStart",
    value: function moveStart() {
      if (this.isSnakeBond && !this.polymerBond.isHorizontal) {
        this.moveSnakeBondStart();
      } else {
        this.moveGraphBondStart();
      }
    }
  }, {
    key: "moveSnakeBondStart",
    value: function moveSnakeBondStart() {
      this.moveSnakeBond();
    }
  }, {
    key: "moveGraphBondStart",
    value: function moveGraphBondStart() {
      var _this$selectionElemen5;
      assert.assert(this.bodyElement);
      assert.assert(this.hoverLineAreaElement);
      this.bodyElement.attr('x1', this.scaledPosition.startPosition.x).attr('y1', this.scaledPosition.startPosition.y);
      this.hoverLineAreaElement.attr('x1', this.scaledPosition.startPosition.x).attr('y1', this.scaledPosition.startPosition.y);
      (_this$selectionElemen5 = this.selectionElement) === null || _this$selectionElemen5 === void 0 || (_this$selectionElemen5 = _this$selectionElemen5.attr('x1', this.scaledPosition.startPosition.x)) === null || _this$selectionElemen5 === void 0 || _this$selectionElemen5.attr('y1', this.scaledPosition.startPosition.y);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      if (this.isSnakeBond && !this.polymerBond.isHorizontal || this.isSideConnectionBondDrawn) {
        var _this$rootElement5;
        this.hoverAreaElement = (_this$rootElement5 = this.rootElement) === null || _this$rootElement5 === void 0 ? void 0 : _this$rootElement5.append('path').attr('stroke', 'transparent').attr('d', this.path).attr('fill-opacity', 0).attr('stroke-width', '5');
      } else {
        var _this$rootElement6, _this$rootElement7;
        this.hoverLineAreaElement = (_this$rootElement6 = this.rootElement) === null || _this$rootElement6 === void 0 ? void 0 : _this$rootElement6.append('line').attr('stroke', 'transparent').attr('x1', this.scaledPosition.startPosition.x).attr('y1', this.scaledPosition.startPosition.y).attr('x2', this.scaledPosition.endPosition.x).attr('y2', this.scaledPosition.endPosition.y).attr('stroke-width', '10');
        this.hoverAreaElement = this.hoverLineAreaElement;
        this.hoverCircleAreaElement = (_this$rootElement7 = this.rootElement) === null || _this$rootElement7 === void 0 ? void 0 : _this$rootElement7.append('circle').attr('cursor', 'pointer').attr('r', '1').attr('fill', 'transparent').attr('pointer-events', 'none').attr('stroke-width', '10').attr('cx', this.scaledPosition.endPosition.x).attr('cy', this.scaledPosition.endPosition.y);
      }
    }
  }, {
    key: "updateAllSideConnectionBondsColor",
    value: function updateAllSideConnectionBondsColor(getColor) {
      var editor = editorSingleton.provideEditorInstance();
      var allSideConnectionBondsBodyElements = editor.canvas.querySelectorAll(".".concat(SIDE_CONNECTION_BODY_ELEMENT_CLASS));
      Array.from(allSideConnectionBondsBodyElements).forEach(function (bondBodyElement) {
        var renderer = bondBodyElement.__data__;
        bondBodyElement.setAttribute('stroke', getColor(renderer));
      });
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      assert.assert(this.bodyElement);
      if (this.polymerBond.isSideChainConnection) {
        this.updateAllSideConnectionBondsColor(function (renderer) {
          return renderer.isHydrogenBond ? 'lightgrey' : '#C0E2E6';
        });
      }
      this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', constants.SELECTION_HOVERED_COLOR);
      }
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      assert.assert(this.bodyElement);
      assert.assert(this.hoverAreaElement);
      if (this.polymerBond.isSideChainConnection) {
        this.updateAllSideConnectionBondsColor(function (renderer) {
          return renderer.polymerBond.isSideChainConnection && !renderer.isHydrogenBond ? '#43B5C0' : '#333333';
        });
      }
      this.bodyElement.attr('stroke', this.polymerBond.isSideChainConnection && !this.isHydrogenBond ? '#43B5C0' : '#333333').attr('pointer-events', 'stroke');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', constants.SELECTION_COLOR);
      }
      return this.hoverAreaElement.attr('stroke', 'transparent');
    }
  }, {
    key: "calculateIsSnakeBond",
    value: function calculateIsSnakeBond() {
      if (this.polymerBond.isSideChainConnection) {
        this.isSnakeBond = false;
        return;
      }
      if (monomers.getSugarFromRnaBase(this.polymerBond.firstMonomer) || monomers.getSugarFromRnaBase(this.polymerBond.secondMonomer)) {
        this.isSnakeBond = false;
        return;
      }
      this.isSnakeBond = true;
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$bodyElement;
      var isSideChainConnection = (_this$bodyElement = this.bodyElement) === null || _this$bodyElement === void 0 || (_this$bodyElement = _this$bodyElement.attr('class')) === null || _this$bodyElement === void 0 ? void 0 : _this$bodyElement.includes(SIDE_CONNECTION_BODY_ELEMENT_CLASS);
      _get__default["default"](_getPrototypeOf__default["default"](SnakeModePolymerBondRenderer.prototype), "remove", this).call(this);
      if (this.polymerBond.hovered) {
        this.editorEvents.mouseLeaveMonomer.dispatch();
      }
      if (isSideChainConnection) {
        this.updateAllSideConnectionBondsColor(function (renderer) {
          return renderer.polymerBond.isSideChainConnection && !renderer.isHydrogenBond ? '#43B5C0' : '#333333';
        });
      }
    }
  }]);
  return SnakeModePolymerBondRenderer;
}(BaseRenderer.BaseRenderer);

exports.SnakeModePolymerBondRenderer = SnakeModePolymerBondRenderer;
//# sourceMappingURL=SnakeModePolymerBondRenderer.js.map
