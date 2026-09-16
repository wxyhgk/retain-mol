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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var MonomerToAtomBond = require('../MonomerToAtomBond.js');
var Matrix = require('./Matrix.js');
var Connection = require('./Connection.js');
var Cell = require('./Cell.js');
var _ = require('lodash');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var CanvasMatrix = function () {
  function CanvasMatrix(chainsCollection) {
    var matrixConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      initialMatrix: new Matrix.Matrix()
    };
    _classCallCheck__default["default"](this, CanvasMatrix);
    _defineProperty__default["default"](this, "chainsCollection", void 0);
    _defineProperty__default["default"](this, "matrixConfig", void 0);
    _defineProperty__default["default"](this, "matrix", void 0);
    _defineProperty__default["default"](this, "initialMatrixWidth", void 0);
    _defineProperty__default["default"](this, "monomerToCell", new Map());
    _defineProperty__default["default"](this, "polymerBondToCells", new Map());
    _defineProperty__default["default"](this, "polymerBondToConnections", new Map());
    this.chainsCollection = chainsCollection;
    this.matrixConfig = matrixConfig;
    this.matrix = new Matrix.Matrix();
    this.initialMatrixWidth = this.matrixConfig.initialMatrix.width;
    this.fillCells();
  }
  _createClass__default["default"](CanvasMatrix, [{
    key: "fillConnectionsOffset",
    value: function fillConnectionsOffset(direction) {
      var _this = this;
      var increaseOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (connection, increaseValue) {
        if (_.isNumber(increaseValue)) {
          connection.xOffset = increaseValue;
        } else {
          connection.xOffset++;
        }
      };
      var getOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (connection) {
        return connection.xOffset;
      };
      var currentConnections = new Map();
      var iterationMethod;
      if (direction === 180) {
        iterationMethod = this.matrix.forEach.bind(this.matrix);
      } else if (direction === 0) {
        iterationMethod = this.matrix.forEachRightToLeft.bind(this.matrix);
      } else {
        iterationMethod = this.matrix.forEachBottomToTop.bind(this.matrix);
      }
      iterationMethod(function (cell) {
        var biggestOffsetInCell = cell.connections.reduce(function (biggestOffset, connection) {
          return getOffset(connection) > biggestOffset ? getOffset(connection) : biggestOffset;
        }, 0);
        cell.connections.forEach(function (connection) {
          if (connection.direction !== direction || connection.connectedNode) {
            return;
          }
          if (!currentConnections.has(connection.polymerBond)) {
            var polymerBondConnections = _this.polymerBondToConnections.get(connection.polymerBond);
            polymerBondConnections === null || polymerBondConnections === void 0 || polymerBondConnections.forEach(function (polymerBondConnection) {
              increaseOffset(polymerBondConnection, biggestOffsetInCell);
            });
            currentConnections.set(connection.polymerBond, new Set(polymerBondConnections));
          }
        });
        cell.connections.forEach(function (connection) {
          if (!connection.connectedNode || connection.direction !== direction && !currentConnections.has(connection.polymerBond)) {
            return;
          }
          if (currentConnections.has(connection.polymerBond)) {
            currentConnections["delete"](connection.polymerBond);
            currentConnections.forEach(function (connections) {
              Array.from(connections.values()).forEach(function (currentConnection) {
                increaseOffset(currentConnection);
              });
            });
          } else {
            currentConnections.set(connection.polymerBond, new Set(_this.polymerBondToConnections.get(connection.polymerBond)));
          }
        });
        if (cell.x === 0 && direction !== 90 || cell.y === 0 && direction === 90) {
          currentConnections.clear();
        }
        Array.from(currentConnections.keys()).forEach(function (polymerBond) {
          var polymerBondConnections = _this.polymerBondToConnections.get(polymerBond);
          if (polymerBondConnections !== null && polymerBondConnections !== void 0 && polymerBondConnections.every(function (connection) {
            return !cell.connections.includes(connection);
          })) {
            currentConnections["delete"](polymerBond);
          }
        });
      });
    }
  }, {
    key: "fillRightConnectionsOffset",
    value: function fillRightConnectionsOffset() {
      var _this2 = this;
      var direction = 0;
      var handledConnections = new Set();
      this.matrix.forEach(function (cell) {
        var biggestOffsetInCell = cell.connections.reduce(function (biggestOffset, connection) {
          return connection.xOffset > biggestOffset ? connection.xOffset : biggestOffset;
        }, 0);
        cell.connections.forEach(function (connection) {
          if (connection.direction !== direction) {
            return;
          }
          if (connection.xOffset <= biggestOffsetInCell) {
            var polymerBondConnections = _this2.polymerBondToConnections.get(connection.polymerBond);
            polymerBondConnections === null || polymerBondConnections === void 0 || polymerBondConnections.forEach(function (polymerBondConnection) {
              polymerBondConnection.xOffset = biggestOffsetInCell;
            });
            handledConnections.add(connection.polymerBond);
          }
        });
      });
      handledConnections.forEach(function (polymerBond) {
        var polymerBondConnections = _this2.polymerBondToConnections.get(polymerBond);
        polymerBondConnections === null || polymerBondConnections === void 0 || polymerBondConnections.forEach(function (polymerBondConnection) {
          if (polymerBondConnection.direction !== direction) {
            return;
          }
          polymerBondConnection.xOffset++;
        });
      });
    }
  }, {
    key: "fillCells",
    value: function fillCells() {
      var _this3 = this;
      for (var rowNumber = 0; rowNumber < this.matrixConfig.initialMatrix.height; rowNumber++) {
        for (var columnNumber = 0; columnNumber < this.initialMatrixWidth; columnNumber++) {
          var initialMatrixCell = this.matrixConfig.initialMatrix.get(rowNumber, columnNumber);
          if (!initialMatrixCell) {
            this.matrix.set(rowNumber, columnNumber, new Cell.Cell(null, [], columnNumber, rowNumber));
            continue;
          }
          var cell = new Cell.Cell(initialMatrixCell.node, [], columnNumber, rowNumber, initialMatrixCell.monomer);
          this.matrix.set(rowNumber, columnNumber, cell);
          if (initialMatrixCell.monomer) {
            this.monomerToCell.set(initialMatrixCell.monomer, cell);
          }
        }
      }
      var monomerToNode = this.chainsCollection.monomerToNode;
      var handledConnections = new Set();
      this.matrix.forEach(function (cell) {
        var monomer = cell.monomer;
        monomer === null || monomer === void 0 || monomer.forEachBond(function (polymerBond) {
          if (polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond) {
            return;
          }
          if ((polymerBond.isSideChainConnection || polymerBond.isOverlappedByMonomer) && !handledConnections.has(polymerBond)) {
            var _this3$polymerBondToC5, _this3$polymerBondToC6;
            var anotherMonomer = polymerBond.getAnotherMonomer(monomer);
            var connectedNode = monomerToNode.get(anotherMonomer);
            var connectedCell = _this3.monomerToCell.get(anotherMonomer);
            if (!connectedCell) {
              return;
            }
            var xDistance = connectedCell.x - cell.x;
            var yDistance = connectedCell.y - cell.y;
            var xDirection = xDistance > 0 ? 0 : 180;
            var yDirection = yDistance > 0 ? 90 : 270;
            var xDistanceAbsolute = Math.abs(xDistance);
            var yDistanceAbsolute = Math.abs(yDistance);
            var isVertical = xDistanceAbsolute === 0;
            var connection = new Connection.Connection(connectedNode, isVertical ? 90 : xDirection, isVertical, polymerBond, 0, 0);
            cell.connections.push(connection);
            _this3.polymerBondToCells.set(polymerBond, [cell]);
            _this3.polymerBondToConnections.set(polymerBond, [connection]);
            var nextCellX = cell.x;
            var nextCellY = cell.y;
            while (xDistanceAbsolute > 1) {
              var _this3$polymerBondToC, _this3$polymerBondToC2;
              nextCellX += Math.sign(xDistance);
              var nextCellToHandle = _this3.matrix.get(nextCellY, nextCellX);
              connection = new Connection.Connection(null, xDirection, isVertical, polymerBond, 0, 0);
              nextCellToHandle.connections.push(connection);
              (_this3$polymerBondToC = _this3.polymerBondToCells.get(polymerBond)) === null || _this3$polymerBondToC === void 0 || _this3$polymerBondToC.push(nextCellToHandle);
              (_this3$polymerBondToC2 = _this3.polymerBondToConnections.get(polymerBond)) === null || _this3$polymerBondToC2 === void 0 || _this3$polymerBondToC2.push(connection);
              xDistanceAbsolute--;
            }
            while (yDistanceAbsolute > 1) {
              var _this3$polymerBondToC3, _this3$polymerBondToC4;
              nextCellY += Math.sign(yDistance);
              var _nextCellToHandle = _this3.matrix.get(nextCellY, nextCellX);
              connection = new Connection.Connection(null, yDirection, isVertical, polymerBond, 0, 0);
              _nextCellToHandle.connections.push(connection);
              (_this3$polymerBondToC3 = _this3.polymerBondToCells.get(polymerBond)) === null || _this3$polymerBondToC3 === void 0 || _this3$polymerBondToC3.push(_nextCellToHandle);
              (_this3$polymerBondToC4 = _this3.polymerBondToConnections.get(polymerBond)) === null || _this3$polymerBondToC4 === void 0 || _this3$polymerBondToC4.push(connection);
              yDistanceAbsolute--;
            }
            nextCellX += Math.sign(xDistance);
            nextCellY += Math.sign(yDistance);
            var lastCellToHandle = _this3.matrix.get(nextCellY, nextCellX);
            connection = new Connection.Connection(connectedNode, isVertical ? yDirection : {
              x: xDistance === 0 ? 0 : xDirection,
              y: yDirection
            }, isVertical, polymerBond, 0, 0);
            lastCellToHandle.connections.push(connection);
            (_this3$polymerBondToC5 = _this3.polymerBondToCells.get(polymerBond)) === null || _this3$polymerBondToC5 === void 0 || _this3$polymerBondToC5.push(lastCellToHandle);
            (_this3$polymerBondToC6 = _this3.polymerBondToConnections.get(polymerBond)) === null || _this3$polymerBondToC6 === void 0 || _this3$polymerBondToC6.push(connection);
            handledConnections.add(polymerBond);
          }
        });
      });
      this.fillConnectionsOffset(180);
      this.fillRightConnectionsOffset();
      this.fillConnectionsOffset(0);
      this.fillConnectionsOffset(90, function (connection, increaseValue) {
        if (_.isNumber(increaseValue)) {
          connection.yOffset = increaseValue;
        } else {
          connection.yOffset++;
        }
      }, function (connection) {
        return connection.yOffset;
      });
    }
  }]);
  return CanvasMatrix;
}();

exports.CanvasMatrix = CanvasMatrix;
//# sourceMappingURL=CanvasMatrix.js.map
