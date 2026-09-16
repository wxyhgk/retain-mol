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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../../application/editor/editorSingleton.modern.js';
import '../atom.modern.js';
import '../atomList.modern.js';
import '../bond.modern.js';
import '../fixedPrecision.modern.js';
import '../fragment.modern.js';
import '../functionalGroup.modern.js';
import '../halfBond.modern.js';
import '../loop.modern.js';
import '../rgroup.modern.js';
import '../rgroupAttachmentPoint.modern.js';
import '../rxnArrow.modern.js';
import '../rxnPlus.modern.js';
import '../sgroup.modern.js';
import '../sgroupForest.modern.js';
import '../simpleObject.modern.js';
import '../struct.modern.js';
import '../text.modern.js';
import '../pile.modern.js';
import '../vec2.modern.js';
import '../box2Abs.modern.js';
import '../pool.modern.js';
import '../image.modern.js';
import '../multitailArrow.modern.js';
import '../highlight.modern.js';
import '../sGroupAttachmentPoint.modern.js';
import '../monomerMicromolecule.modern.js';
import '../Peptide.modern.js';
import '../BaseMonomer.modern.js';
import '../Chem.modern.js';
import '../Sugar.modern.js';
import { RNABase } from '../RNABase.modern.js';
import '../Phosphate.modern.js';
import '../Axis.modern.js';
import { Nucleoside } from '../Nucleoside.modern.js';
import { Nucleotide } from '../Nucleotide.modern.js';
import '../monomer-chains/types.modern.js';
import '../monomer-chains/Chain.modern.js';
import '../monomer-chains/ChainsCollection.modern.js';
import '../MonomerSequenceNode.modern.js';
import '../EmptySequenceNode.modern.js';
import { LinkerSequenceNode } from '../LinkerSequenceNode.modern.js';
import '../UnresolvedMonomer.modern.js';
import '../UnsplitNucleotide.modern.js';
import '../PolymerBond.modern.js';
import '../AmbiguousMonomer.modern.js';
import '../MonomerToAtomBond.modern.js';
import '../HydrogenBond.modern.js';
import '../SGroupDrawingEntity.modern.js';
import '../BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { Atom } from '../CoreAtom.modern.js';
import '../CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../constants/elements.modern.js';
import '../../constants/element.types.modern.js';
import '../../constants/generics.modern.js';
import '../../constants/chains.modern.js';
import '../../constants/monomers.modern.js';
import { SnakeLayoutCellWidth } from '../../constants/layout.modern.js';
import { SingleMonomerSnakeLayoutNode } from './SingleMonomerSnakeLayoutNode.modern.js';
import { SugarWithBaseSnakeLayoutNode } from './SugarWithBaseSnakeLayoutNode.modern.js';
import { isNumber } from 'lodash';
import { isRnaBaseApplicableForAntisense } from '../../helpers/monomers.modern.js';
import { provideEditorSettings } from '../../../application/editor/editorSettings.modern.js';
import { getStructureBbox } from '../structureBbox.modern.js';
import { isTwoStrandedSnakeLayoutNode } from './types.modern.js';
import { SnakeLayoutModelChain } from './SnakeLayoutModelChain.modern.js';
import { EmptySnakeLayoutNode } from './EmptySnakeLayoutNode.modern.js';
import { MoleculeSnakeLayoutNode } from './MoleculeSnakeLayoutNode.modern.js';

var SnakeLayoutModel = function () {
  function SnakeLayoutModel(chainsCollection, drawingEntitiesManager) {
    var needFillMolecules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    _classCallCheck(this, SnakeLayoutModel);
    _defineProperty(this, "nodes", []);
    _defineProperty(this, "chains", []);
    _defineProperty(this, "monomerToTwoStrandedSnakeLayoutNode", new Map());
    this.fillNodes(chainsCollection);
    this.fillChains();
    if (needFillMolecules) {
      this.fillMolecules(drawingEntitiesManager);
    }
  }
  _createClass(SnakeLayoutModel, [{
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
      if (node instanceof Nucleotide) {
        if (isAntisense) {
          nodes.push(new SingleMonomerSnakeLayoutNode(node.phosphate));
          nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
        } else {
          nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
          nodes.push(new SingleMonomerSnakeLayoutNode(node.phosphate));
        }
      } else if (node instanceof Nucleoside) {
        nodes.push(new SugarWithBaseSnakeLayoutNode(node.sugar, node.rnaBase));
      } else if (node instanceof LinkerSequenceNode) {
        if (isAntisense) {
          node.monomers.reverse().forEach(function (monomer) {
            nodes.push(new SingleMonomerSnakeLayoutNode(monomer));
          });
        } else {
          node.monomers.forEach(function (monomer) {
            nodes.push(new SingleMonomerSnakeLayoutNode(monomer));
          });
        }
      } else {
        nodes.push(new SingleMonomerSnakeLayoutNode(node.monomer));
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
      var editor = provideEditorInstance();
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
              return [].concat(_toConsumableArray(foundMonomersInNode), _toConsumableArray(monomer.hydrogenBonds.reduce(function (foundMonomersConnectedHydrogenBonds, hydrogenBond) {
                var _editor$drawingEntiti, _monomerToChain$get;
                var monomerConnectedByHydrogenBond = hydrogenBond.getAnotherMonomer(monomer);
                return monomerConnectedByHydrogenBond && (isRnaBaseApplicableForAntisense(monomerConnectedByHydrogenBond) && isRnaBaseApplicableForAntisense(monomer) || ((_editor$drawingEntiti = editor.drawingEntitiesManager.antisenseMonomerToSenseChain.get(monomer)) === null || _editor$drawingEntiti === void 0 ? void 0 : _editor$drawingEntiti.firstMonomer) === ((_monomerToChain$get = monomerToChain.get(monomerConnectedByHydrogenBond)) === null || _monomerToChain$get === void 0 ? void 0 : _monomerToChain$get.firstMonomer)) ? [].concat(_toConsumableArray(foundMonomersConnectedHydrogenBonds), [monomerConnectedByHydrogenBond]) : foundMonomersConnectedHydrogenBonds;
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
            if (firstSenseMonomerConnectedByHydrogenBond && (!isNumber(lastTwoStrandedNodeWithHydrogenBondIndex) || twoStrandedSnakeLayoutNodeIndex > lastTwoStrandedNodeWithHydrogenBondIndex)) {
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
              return monomer instanceof RNABase && monomer.hydrogenBonds.length !== 0;
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
      var lineLength = SettingsManager.editorLineLength['snake-layout-mode'];
      var currentIndexInSequenceModelChain = 0;
      var currentSequenceModelChain = new SnakeLayoutModelChain();
      var currentSequenceModelRow = {
        snakeLayoutModelItems: []
      };
      var previousSenseNodeChain;
      this.nodes.forEach(function (sequenceModelItem) {
        var currentSenseChain = sequenceModelItem.chain;
        if (previousSenseNodeChain !== currentSenseChain) {
          currentSequenceModelChain = new SnakeLayoutModelChain();
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
      var lineLength = SettingsManager.editorLineLength['snake-layout-mode'];
      var handledMonomerConnectedToMolecules = new Set();
      var handledMolecules = [];
      this.chains.forEach(function (chain, chainIndex) {
        var newChain = new SnakeLayoutModelChain();
        chain.forEachRow(function (row, rowIndex) {
          newChain.addRow(row);
          var nodeIndexToMolecules = new Map();
          var isLastRowOfLastChain = chainIndex === _this5.chains.length - 1 && rowIndex === chain.rowsLength - 1;
          row.snakeLayoutModelItems.forEach(function (node, nodeIndex) {
            var _node$senseNode$monom, _node$senseNode, _node$antisenseNode$m, _node$antisenseNode;
            if (!isTwoStrandedSnakeLayoutNode(node)) {
              return;
            }
            var monomers = [].concat(_toConsumableArray((_node$senseNode$monom = (_node$senseNode = node.senseNode) === null || _node$senseNode === void 0 ? void 0 : _node$senseNode.monomers) !== null && _node$senseNode$monom !== void 0 ? _node$senseNode$monom : []), _toConsumableArray((_node$antisenseNode$m = (_node$antisenseNode = node.antisenseNode) === null || _node$antisenseNode === void 0 ? void 0 : _node$antisenseNode.monomers) !== null && _node$antisenseNode$m !== void 0 ? _node$antisenseNode$m : []));
            monomers.forEach(function (monomer) {
              monomer.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
                var molecule = drawingEntitiesManager.getConnectedMolecule(monomerToAtomBond.atom, [Atom]);
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
              var molecule = drawingEntitiesManager.getConnectedMolecule(atom, [Atom]);
              handledMonomerConnectedToMolecules.add(atom.monomer);
              if (!nodeIndexToMolecules.has(row.snakeLayoutModelItems.length)) {
                nodeIndexToMolecules.set(row.snakeLayoutModelItems.length, []);
              }
              (_nodeIndexToMolecules2 = nodeIndexToMolecules.get(row.snakeLayoutModelItems.length)) === null || _nodeIndexToMolecules2 === void 0 || _nodeIndexToMolecules2.push(molecule);
            });
          }
          var editorSettings = provideEditorSettings();
          var cellSizeInAngstroms = SnakeLayoutCellWidth / editorSettings.macroModeScale;
          var currentRowToHandle = {
            snakeLayoutModelItems: []
          };
          var nextCellIndexToFill = 0;
          var emptyRowsToAdd = 0;
          nodeIndexToMolecules.forEach(function (molecules) {
            molecules.forEach(function (molecule) {
              var moleculeBbox = getStructureBbox(molecule);
              var cellsNeededHorizontally = Math.ceil((moleculeBbox.width + cellSizeInAngstroms / 2) / cellSizeInAngstroms);
              var cellsNeededVertically = Math.ceil((moleculeBbox.height + cellSizeInAngstroms / 2) / cellSizeInAngstroms);
              var isThereEnoughSpaceInCurrentRow = nextCellIndexToFill + cellsNeededHorizontally <= lineLength;
              var freeCellsInCurrentRow = lineLength - nextCellIndexToFill;
              if (!isThereEnoughSpaceInCurrentRow) {
                for (var i = 0; i < freeCellsInCurrentRow; i++) {
                  currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode());
                }
                newChain.addRow(currentRowToHandle);
                currentRowToHandle = {
                  snakeLayoutModelItems: []
                };
                nextCellIndexToFill = 0;
                for (var _i = 0; _i < emptyRowsToAdd; _i++) {
                  newChain.addRow({
                    snakeLayoutModelItems: row.snakeLayoutModelItems.map(function (_) {
                      return new EmptySnakeLayoutNode();
                    })
                  });
                }
                emptyRowsToAdd = 0;
              }
              currentRowToHandle.snakeLayoutModelItems.push(new MoleculeSnakeLayoutNode(molecule));
              for (var _i2 = 1; _i2 < cellsNeededHorizontally; _i2++) {
                currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode());
              }
              nextCellIndexToFill += cellsNeededHorizontally;
              emptyRowsToAdd = Math.max(emptyRowsToAdd, cellsNeededVertically - 1);
            });
          });
          if (currentRowToHandle.snakeLayoutModelItems.length) {
            for (var i = currentRowToHandle.snakeLayoutModelItems.length; i < lineLength; i++) {
              currentRowToHandle.snakeLayoutModelItems.push(new EmptySnakeLayoutNode());
            }
            newChain.addRow(currentRowToHandle);
          }
          if (emptyRowsToAdd > 0) {
            for (var _i3 = 0; _i3 < emptyRowsToAdd; _i3++) {
              newChain.addRow({
                snakeLayoutModelItems: row.snakeLayoutModelItems.map(function (_) {
                  return new EmptySnakeLayoutNode();
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

export { SnakeLayoutModel };
//# sourceMappingURL=SnakeLayoutModel.modern.js.map
