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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../application/editor/editorSingleton.js');
require('../atom.js');
require('../atomList.js');
require('../bond.js');
require('../fixedPrecision.js');
require('../fragment.js');
require('../functionalGroup.js');
require('../halfBond.js');
require('../loop.js');
require('../rgroup.js');
require('../rgroupAttachmentPoint.js');
require('../rxnArrow.js');
require('../rxnPlus.js');
require('../sgroup.js');
require('../sgroupForest.js');
require('../simpleObject.js');
require('../struct.js');
require('../text.js');
require('../pile.js');
require('../vec2.js');
require('../box2Abs.js');
require('../pool.js');
require('../image.js');
require('../multitailArrow.js');
require('../highlight.js');
require('../sGroupAttachmentPoint.js');
require('../monomerMicromolecule.js');
require('../Peptide.js');
require('../BaseMonomer.js');
require('../Chem.js');
require('../Sugar.js');
var RNABase = require('../RNABase.js');
require('../Phosphate.js');
require('../Axis.js');
var Nucleoside = require('../Nucleoside.js');
var Nucleotide = require('../Nucleotide.js');
require('../monomer-chains/types.js');
require('../monomer-chains/Chain.js');
require('../monomer-chains/ChainsCollection.js');
require('../MonomerSequenceNode.js');
require('../EmptySequenceNode.js');
var LinkerSequenceNode = require('../LinkerSequenceNode.js');
require('../UnresolvedMonomer.js');
require('../UnsplitNucleotide.js');
require('../PolymerBond.js');
require('../AmbiguousMonomer.js');
require('../MonomerToAtomBond.js');
require('../HydrogenBond.js');
require('../SGroupDrawingEntity.js');
require('../BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../Command.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
var SettingsManager = require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var CoreAtom = require('../CoreAtom.js');
require('../CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');
var layout = require('../../constants/layout.js');
var SingleMonomerSnakeLayoutNode = require('./SingleMonomerSnakeLayoutNode.js');
var SugarWithBaseSnakeLayoutNode = require('./SugarWithBaseSnakeLayoutNode.js');
var _ = require('lodash');
var monomers = require('../../helpers/monomers.js');
var editorSettings = require('../../../application/editor/editorSettings.js');
var structureBbox = require('../structureBbox.js');
var types = require('./types.js');
var SnakeLayoutModelChain = require('./SnakeLayoutModelChain.js');
var EmptySnakeLayoutNode = require('./EmptySnakeLayoutNode.js');
var MoleculeSnakeLayoutNode = require('./MoleculeSnakeLayoutNode.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SnakeLayoutModel = function () {
  function SnakeLayoutModel(chainsCollection, drawingEntitiesManager) {
    var needFillMolecules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    _classCallCheck__default["default"](this, SnakeLayoutModel);
    _defineProperty__default["default"](this, "nodes", []);
    _defineProperty__default["default"](this, "chains", []);
    _defineProperty__default["default"](this, "monomerToTwoStrandedSnakeLayoutNode", new Map());
    this.fillNodes(chainsCollection);
    this.fillChains();
    if (needFillMolecules) {
      this.fillMolecules(drawingEntitiesManager);
    }
  }
  _createClass__default["default"](SnakeLayoutModel, [{
    key: "addNode",
    value: function addNode(snakeLayoutNode, chain) {
      var _this = this;
      var twoStrandedSnakeLayoutNode = {
        senseNode: snakeLayoutNode,
        chain: chain
      };
      this.nodes.push(twoStrandedSnakeLayoutNode);
      snakeLayoutNode.monomers.forEach(function (monomer) {
        _this.monomerToTwoStrandedSnakeLayoutNode.set(monomer, twoStrandedSnakeLayoutNode);
      });
    }
  }, {
    key: "getSnakeLayoutNodesFromChainNode",
    value: function getSnakeLayoutNodesFromChainNode(node) {
      var isAntisense = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var nodes = [];
      if (node instanceof Nucleotide.Nucleotide) {
        if (isAntisense) {
          nodes.push(new SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode(node.phosphate));
          nodes.push(new SugarWithBaseSnakeLayoutNode.SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
        } else {
          nodes.push(new SugarWithBaseSnakeLayoutNode.SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
          nodes.push(new SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode(node.phosphate));
        }
      } else if (node instanceof Nucleoside.Nucleoside) {
        nodes.push(new SugarWithBaseSnakeLayoutNode.SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
      } else if (node instanceof LinkerSequenceNode.LinkerSequenceNode) {
        if (isAntisense) {
          node.monomers.reverse().forEach(function (monomer) {
            nodes.push(new SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode(monomer));
          });
        } else {
          node.monomers.forEach(function (monomer) {
            nodes.push(new SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode(monomer));
          });
        }
      } else {
        nodes.push(new SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode(node.monomer));
      }
      return nodes;
    }
  }, {
    key: "fillSenseNodes",
    value: function fillSenseNodes(chainsCollection) {
      var _this2 = this;
      chainsCollection.chains.forEach(function (chain) {
        if (chain.isAntisense) {
          return;
        }
        chain.forEachNode(function (_ref) {
          var node = _ref.node;
          var snakeLayoutNodes = _this2.getSnakeLayoutNodesFromChainNode(node);
          snakeLayoutNodes.forEach(function (snakeLayoutNode) {
            _this2.addNode(snakeLayoutNode, chain);
          });
        });
      });
    }
  }, {
    key: "fillAntisenseNodes",
    value: function fillAntisenseNodes(chainsCollection) {
      var _this3 = this;
      var handledChainNodes = new Set();
      var monomerToChain = chainsCollection.monomerToChain;
      var editor = editorSingleton.provideEditorInstance();
      chainsCollection.chains.forEach(function (chain) {
        if (!chain.isAntisense) {
          return;
        }
        var nodesBeforeHydrogenConnectionToBase = [];
        var lastTwoStrandedNodeWithHydrogenBond;
        chain.forEachNodeReversed(function (_ref2) {
          var node = _ref2.node;
          if (handledChainNodes.has(node)) {
            return;
          }
          var snakeLayoutNodes = _this3.getSnakeLayoutNodesFromChainNode(node, true);
          snakeLayoutNodes.forEach(function (snakeLayoutNode) {
            var senseMonomersConnectedByHydrogenBond = snakeLayoutNode.monomers.reduce(function (foundMonomersInNode, monomer) {
              return [].concat(_toConsumableArray__default["default"](foundMonomersInNode), _toConsumableArray__default["default"](monomer.hydrogenBonds.reduce(function (foundMonomersConnectedHydrogenBonds, hydrogenBond) {
                var _editor$drawingEntiti, _monomerToChain$get;
                var monomerConnectedByHydrogenBond = hydrogenBond.getAnotherMonomer(monomer);
                return monomerConnectedByHydrogenBond && (monomers.isRnaBaseApplicableForAntisense(monomerConnectedByHydrogenBond) && monomers.isRnaBaseApplicableForAntisense(monomer) || ((_editor$drawingEntiti = editor.drawingEntitiesManager.antisenseMonomerToSenseChain.get(monomer)) === null || _editor$drawingEntiti === void 0 ? void 0 : _editor$drawingEntiti.firstMonomer) === ((_monomerToChain$get = monomerToChain.get(monomerConnectedByHydrogenBond)) === null || _monomerToChain$get === void 0 ? void 0 : _monomerToChain$get.firstMonomer)) ? [].concat(_toConsumableArray__default["default"](foundMonomersConnectedHydrogenBonds), [monomerConnectedByHydrogenBond]) : foundMonomersConnectedHydrogenBonds;
              }, [])));
            }, []);
            var firstSenseMonomerConnectedByHydrogenBond = senseMonomersConnectedByHydrogenBond[0];
            var twoStrandedSnakeLayoutNode = firstSenseMonomerConnectedByHydrogenBond ? _this3.monomerToTwoStrandedSnakeLayoutNode.get(firstSenseMonomerConnectedByHydrogenBond) : undefined;
            var twoStrandedSnakeLayoutNodeIndex = _this3.nodes.findIndex(function (node) {
              return node === twoStrandedSnakeLayoutNode;
            });
            var lastTwoStrandedNodeWithHydrogenBondIndex = _this3.nodes.findIndex(function (node) {
              return node === lastTwoStrandedNodeWithHydrogenBond;
            });
            if (firstSenseMonomerConnectedByHydrogenBond && (!_.isNumber(lastTwoStrandedNodeWithHydrogenBondIndex) || twoStrandedSnakeLayoutNodeIndex > lastTwoStrandedNodeWithHydrogenBondIndex)) {
              nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
              lastTwoStrandedNodeWithHydrogenBond = _this3.nodes[twoStrandedSnakeLayoutNodeIndex];
              for (var i = 0; i < nodesBeforeHydrogenConnectionToBase.length; i++) {
                var _lastTwoStrandedNodeW, _currentTwoStrandedSn;
                twoStrandedSnakeLayoutNodeIndex = _this3.nodes.findIndex(function (node) {
                  return node === twoStrandedSnakeLayoutNode;
                });
                var currentTwoStrandedSnakeLayoutNodeIndex = twoStrandedSnakeLayoutNodeIndex - i;
                var currentTwoStrandedSnakeLayoutNode = _this3.nodes[currentTwoStrandedSnakeLayoutNodeIndex];
                var currentNodeBeforeHydrogenConnectionToBase = nodesBeforeHydrogenConnectionToBase[nodesBeforeHydrogenConnectionToBase.length - 1 - i];
                var firstMonomerInLastTwoStrandedNodeWithHydrogenBond = (_lastTwoStrandedNodeW = lastTwoStrandedNodeWithHydrogenBond) === null || _lastTwoStrandedNodeW === void 0 || (_lastTwoStrandedNodeW = _lastTwoStrandedNodeW.senseNode) === null || _lastTwoStrandedNodeW === void 0 ? void 0 : _lastTwoStrandedNodeW.monomers[0];
                var firstMonomerInCurrentTwoStrandedSnakeLayoutNode = currentTwoStrandedSnakeLayoutNode === null || currentTwoStrandedSnakeLayoutNode === void 0 || (_currentTwoStrandedSn = currentTwoStrandedSnakeLayoutNode.senseNode) === null || _currentTwoStrandedSn === void 0 ? void 0 : _currentTwoStrandedSn.monomers[0];
                var isNodeInSameChain = firstMonomerInLastTwoStrandedNodeWithHydrogenBond && firstMonomerInCurrentTwoStrandedSnakeLayoutNode && monomerToChain.get(firstMonomerInLastTwoStrandedNodeWithHydrogenBond) === monomerToChain.get(firstMonomerInCurrentTwoStrandedSnakeLayoutNode);
                if (currentTwoStrandedSnakeLayoutNode && !currentTwoStrandedSnakeLayoutNode.antisenseNode && isNodeInSameChain) {
                  currentTwoStrandedSnakeLayoutNode.antisenseNode = currentNodeBeforeHydrogenConnectionToBase;
                } else if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
                  _this3.nodes.unshift({
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                    chain: lastTwoStrandedNodeWithHydrogenBond.chain
                  });
                } else {
                  _this3.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex + 1, 0, {
                    antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                    chain: lastTwoStrandedNodeWithHydrogenBond.chain
                  });
                }
              }
              nodesBeforeHydrogenConnectionToBase = [];
            } else {
              nodesBeforeHydrogenConnectionToBase.push(snakeLayoutNode);
            }
          });
          handledChainNodes.add(node);
        });
        if (nodesBeforeHydrogenConnectionToBase.length && lastTwoStrandedNodeWithHydrogenBond) {
          for (var i = 0; i < nodesBeforeHydrogenConnectionToBase.length; i++) {
            var _lastTwoStrandedNodeW2, _currentTwoStrandedSn2, _currentTwoStrandedSn3;
            var lastTwoStrandedNodeWithHydrogenBondIndex = _this3.nodes.findIndex(function (node) {
              return node === lastTwoStrandedNodeWithHydrogenBond;
            });
            var currentTwoStrandedSnakeLayoutNodeIndex = lastTwoStrandedNodeWithHydrogenBondIndex + 1 + i;
            var currentTwoStrandedSnakeLayoutNode = _this3.nodes[currentTwoStrandedSnakeLayoutNodeIndex];
            var currentAntisenseSnakeLayoutNode = nodesBeforeHydrogenConnectionToBase[i];
            var firstMonomerInLastTwoStrandedNodeWithHydrogenBond = (_lastTwoStrandedNodeW2 = lastTwoStrandedNodeWithHydrogenBond) === null || _lastTwoStrandedNodeW2 === void 0 || (_lastTwoStrandedNodeW2 = _lastTwoStrandedNodeW2.senseNode) === null || _lastTwoStrandedNodeW2 === void 0 ? void 0 : _lastTwoStrandedNodeW2.monomers[0];
            var firstMonomerInCurrentTwoStrandedSnakeLayoutNode = currentTwoStrandedSnakeLayoutNode === null || currentTwoStrandedSnakeLayoutNode === void 0 || (_currentTwoStrandedSn2 = currentTwoStrandedSnakeLayoutNode.senseNode) === null || _currentTwoStrandedSn2 === void 0 ? void 0 : _currentTwoStrandedSn2.monomers[0];
            var isNodeInSameChain = firstMonomerInLastTwoStrandedNodeWithHydrogenBond && firstMonomerInCurrentTwoStrandedSnakeLayoutNode && monomerToChain.get(firstMonomerInLastTwoStrandedNodeWithHydrogenBond) === monomerToChain.get(firstMonomerInCurrentTwoStrandedSnakeLayoutNode);
            var hasAnotherAntisenseConnection = currentTwoStrandedSnakeLayoutNode === null || currentTwoStrandedSnakeLayoutNode === void 0 || (_currentTwoStrandedSn3 = currentTwoStrandedSnakeLayoutNode.senseNode) === null || _currentTwoStrandedSn3 === void 0 ? void 0 : _currentTwoStrandedSn3.monomers.some(function (monomer) {
              return monomer instanceof RNABase.RNABase && monomer.hydrogenBonds.length !== 0;
            });
            if (currentTwoStrandedSnakeLayoutNode && isNodeInSameChain && !hasAnotherAntisenseConnection) {
              currentTwoStrandedSnakeLayoutNode.antisenseNode = currentAntisenseSnakeLayoutNode;
            } else if (currentTwoStrandedSnakeLayoutNode && (!isNodeInSameChain || hasAnotherAntisenseConnection)) {
              _this3.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
                antisenseNode: currentAntisenseSnakeLayoutNode,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain
              });
            } else {
              _this3.nodes.push({
                antisenseNode: currentAntisenseSnakeLayoutNode,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain
              });
            }
          }
          lastTwoStrandedNodeWithHydrogenBond = undefined;
        }
      });
    }
  }, {
    key: "fillNodes",
    value: function fillNodes(chainsCollection) {
      this.fillSenseNodes(chainsCollection);
      this.fillAntisenseNodes(chainsCollection);
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(callback) {
      this.nodes.forEach(callback);
    }
  }, {
    key: "forEachChain",
    value: function forEachChain(callback) {
      this.chains.forEach(callback);
    }
  }, {
    key: "fillChains",
    value: function fillChains() {
      var _this4 = this;
      var lineLength = SettingsManager.SettingsManager.editorLineLength['snake-layout-mode'];
      var currentIndexInSequenceModelChain = 0;
      var currentSequenceModelChain = new SnakeLayoutModelChain.SnakeLayoutModelChain();
      var currentSequenceModelRow = {
        snakeLayoutModelItems: []
      };
      var previousSenseNodeChain;
      this.nodes.forEach(function (sequenceModelItem) {
        var currentSenseChain = sequenceModelItem.chain;
        if (previousSenseNodeChain !== currentSenseChain) {
          currentSequenceModelChain = new SnakeLayoutModelChain.SnakeLayoutModelChain();
          _this4.chains.push(currentSequenceModelChain);
          currentIndexInSequenceModelChain = 0;
        }
        if (currentIndexInSequenceModelChain % lineLength === 0) {
          currentSequenceModelRow = {
            snakeLayoutModelItems: []
          };
          currentSequenceModelChain.addRow(currentSequenceModelRow);
        }
        currentSequenceModelRow.snakeLayoutModelItems.push(sequenceModelItem);
        previousSenseNodeChain = currentSenseChain;
        currentIndexInSequenceModelChain++;
      });
    }
  }, {
    key: "fillMolecules",
    value: function fillMolecules(drawingEntitiesManager) {
      var _this5 = this;
      var lineLength = SettingsManager.SettingsManager.editorLineLength['snake-layout-mode'];
      var handledMonomerConnectedToMolecules = new Set();
      var handledMolecules = [];
      this.chains.forEach(function (chain, chainIndex) {
        var newChain = new SnakeLayoutModelChain.SnakeLayoutModelChain();
        chain.forEachRow(function (row, rowIndex) {
          newChain.addRow(row);
          var nodeIndexToMolecules = new Map();
          var isLastRowOfLastChain = chainIndex === _this5.chains.length - 1 && rowIndex === chain.rowsLength - 1;
          row.snakeLayoutModelItems.forEach(function (node, nodeIndex) {
            var _node$senseNode$monom, _node$senseNode, _node$antisenseNode$m, _node$antisenseNode;
            if (!types.isTwoStrandedSnakeLayoutNode(node)) {
              return;
            }
            var monomers = [].concat(_toConsumableArray__default["default"]((_node$senseNode$monom = (_node$senseNode = node.senseNode) === null || _node$senseNode === void 0 ? void 0 : _node$senseNode.monomers) !== null && _node$senseNode$monom !== void 0 ? _node$senseNode$monom : []), _toConsumableArray__default["default"]((_node$antisenseNode$m = (_node$antisenseNode = node.antisenseNode) === null || _node$antisenseNode === void 0 ? void 0 : _node$antisenseNode.monomers) !== null && _node$antisenseNode$m !== void 0 ? _node$antisenseNode$m : []));
            monomers.forEach(function (monomer) {
              monomer.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
                var molecule = drawingEntitiesManager.getConnectedMolecule(monomerToAtomBond.atom, [CoreAtom.Atom]);
                if (!handledMonomerConnectedToMolecules.has(monomerToAtomBond.atom.monomer)) {
                  handledMonomerConnectedToMolecules.add(monomerToAtomBond.atom.monomer);
                }
                if (!nodeIndexToMolecules.has(nodeIndex)) {
                  nodeIndexToMolecules.set(nodeIndex, []);
                }
                var isHandledMolecule = molecule.find(function (atom) {
                  return handledMolecules.find(function (atomConnectedToMonomer) {
                    return atomConnectedToMonomer.id === atom.id;
                  });
                });
                if (!isHandledMolecule) {
                  var _nodeIndexToMolecules;
                  handledMolecules.push(molecule[0]);
                  (_nodeIndexToMolecules = nodeIndexToMolecules.get(nodeIndex)) === null || _nodeIndexToMolecules === void 0 || _nodeIndexToMolecules.push(molecule);
                }
              });
            });
          });
          if (isLastRowOfLastChain) {
            drawingEntitiesManager.atoms.forEach(function (atom) {
              var _nodeIndexToMolecules2;
              if (handledMonomerConnectedToMolecules.has(atom.monomer)) {
                return;
              }
              var molecule = drawingEntitiesManager.getConnectedMolecule(atom, [CoreAtom.Atom]);
              handledMonomerConnectedToMolecules.add(atom.monomer);
              if (!nodeIndexToMolecules.has(row.snakeLayoutModelItems.length)) {
                nodeIndexToMolecules.set(row.snakeLayoutModelItems.length, []);
              }
              (_nodeIndexToMolecules2 = nodeIndexToMolecules.get(row.snakeLayoutModelItems.length)) === null || _nodeIndexToMolecules2 === void 0 || _nodeIndexToMolecules2.push(molecule);
            });
          }
          var editorSettings$1 = editorSettings.provideEditorSettings();
          var cellSizeInAngstroms = layout.SnakeLayoutCellWidth / editorSettings$1.macroModeScale;
          var currentRowToHandle = {
            snakeLayoutModelItems: []
          };
          var nextCellIndexToFill = 0;
          var emptyRowsToAdd = 0;
          nodeIndexToMolecules.forEach(function (molecules) {
            molecules.forEach(function (molecule) {
              var moleculeBbox = structureBbox.getStructureBbox(molecule);
              var cellsNeededHorizontally = Math.ceil((moleculeBbox.width + cellSizeInAngstroms / 2) / cellSizeInAngstroms);
              var cellsNeededVertically = Math.ceil((moleculeBbox.height + cellSizeInAngstroms / 2) / cellSizeInAngstroms);
              var isThereEnoughSpaceInCurrentRow = nextCellIndexToFill + cellsNeededHorizontally <= lineLength;
              var freeCellsInCurrentRow = lineLength - nextCellIndexToFill;
              if (!isThereEnoughSpaceInCurrentRow) {
                for (var i = 0; i < freeCellsInCurrentRow; i++) {
                  currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode.EmptySnakeLayoutNode());
                }
                newChain.addRow(currentRowToHandle);
                currentRowToHandle = {
                  snakeLayoutModelItems: []
                };
                nextCellIndexToFill = 0;
                for (var _i = 0; _i < emptyRowsToAdd; _i++) {
                  newChain.addRow({
                    snakeLayoutModelItems: row.snakeLayoutModelItems.map(function (_) {
                      return new EmptySnakeLayoutNode.EmptySnakeLayoutNode();
                    })
                  });
                }
                emptyRowsToAdd = 0;
              }
              currentRowToHandle.snakeLayoutModelItems.push(new MoleculeSnakeLayoutNode.MoleculeSnakeLayoutNode(molecule));
              for (var _i2 = 1; _i2 < cellsNeededHorizontally; _i2++) {
                currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode.EmptySnakeLayoutNode());
              }
              nextCellIndexToFill += cellsNeededHorizontally;
              emptyRowsToAdd = Math.max(emptyRowsToAdd, cellsNeededVertically - 1);
            });
          });
          if (currentRowToHandle.snakeLayoutModelItems.length) {
            for (var i = currentRowToHandle.snakeLayoutModelItems.length; i < lineLength; i++) {
              currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode.EmptySnakeLayoutNode());
            }
            newChain.addRow(currentRowToHandle);
          }
          if (emptyRowsToAdd > 0) {
            for (var _i3 = 0; _i3 < emptyRowsToAdd; _i3++) {
              newChain.addRow({
                snakeLayoutModelItems: row.snakeLayoutModelItems.map(function (_) {
                  return new EmptySnakeLayoutNode.EmptySnakeLayoutNode();
                })
              });
            }
          }
        });
        _this5.chains.splice(chainIndex, 1, newChain);
      });
    }
  }]);
  return SnakeLayoutModel;
}();

exports.SnakeLayoutModel = SnakeLayoutModel;
//# sourceMappingURL=SnakeLayoutModel.js.map
