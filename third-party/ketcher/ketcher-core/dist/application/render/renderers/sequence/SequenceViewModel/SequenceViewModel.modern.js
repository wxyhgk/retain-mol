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
import { provideEditorInstance } from '../../../../editor/editorSingleton.modern.js';
import '../../../../../domain/entities/atom.modern.js';
import '../../../../../domain/entities/atomList.modern.js';
import '../../../../../domain/entities/bond.modern.js';
import '../../../../../domain/entities/fixedPrecision.modern.js';
import '../../../../../domain/entities/fragment.modern.js';
import '../../../../../domain/entities/functionalGroup.modern.js';
import '../../../../../domain/entities/halfBond.modern.js';
import '../../../../../domain/entities/loop.modern.js';
import '../../../../../domain/entities/rgroup.modern.js';
import '../../../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../../../domain/entities/rxnArrow.modern.js';
import '../../../../../domain/entities/rxnPlus.modern.js';
import '../../../../../domain/entities/sgroup.modern.js';
import '../../../../../domain/entities/sgroupForest.modern.js';
import '../../../../../domain/entities/simpleObject.modern.js';
import '../../../../../domain/entities/struct.modern.js';
import '../../../../../domain/entities/text.modern.js';
import '../../../../../domain/entities/pile.modern.js';
import '../../../../../domain/entities/vec2.modern.js';
import '../../../../../domain/entities/box2Abs.modern.js';
import '../../../../../domain/entities/pool.modern.js';
import '../../../../../domain/entities/image.modern.js';
import '../../../../../domain/entities/multitailArrow.modern.js';
import '../../../../../domain/entities/highlight.modern.js';
import '../../../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../../../domain/entities/Peptide.modern.js';
import '../../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../../domain/entities/Chem.modern.js';
import '../../../../../domain/entities/Sugar.modern.js';
import { RNABase } from '../../../../../domain/entities/RNABase.modern.js';
import '../../../../../domain/entities/Phosphate.modern.js';
import '../../../../../domain/entities/Axis.modern.js';
import '../../../../../domain/entities/Nucleoside.modern.js';
import '../../../../../domain/entities/Nucleotide.modern.js';
import '../../../../../domain/entities/monomer-chains/types.modern.js';
import { Chain } from '../../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../../domain/entities/MonomerSequenceNode.modern.js';
import { EmptySequenceNode } from '../../../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../../../domain/entities/PolymerBond.modern.js';
import '../../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../../domain/entities/SGroupDrawingEntity.modern.js';
import { BackBoneSequenceNode } from '../../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../../../domain/entities/Command.modern.js';
import '../../../../../utilities/runAsyncAction.modern.js';
import '../../../../../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../../../../../utilities/SettingsManager.modern.js';
import '../../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../../utilities/clipboardUtils.modern.js';
import '../../../../../domain/entities/CoreAtom.modern.js';
import '../../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../../domain/constants/elements.modern.js';
import '../../../../../domain/constants/element.types.modern.js';
import '../../../../../domain/constants/generics.modern.js';
import '../../../../../domain/constants/chains.modern.js';
import '../../../../../domain/constants/monomers.modern.js';
import { SequenceViewModelChain } from './SequenceViewModelChain.modern.js';
import { isNumber } from 'lodash';
import { getNextConnectedNode, getPreviousConnectedNode } from '../../../../../domain/helpers/chains.modern.js';
import { isRnaBaseApplicableForAntisense } from '../../../../../domain/helpers/monomers.modern.js';

var SequenceViewModel = function () {
  function SequenceViewModel(chainsCollection) {
    _classCallCheck(this, SequenceViewModel);
    _defineProperty(this, "chainsCollection", void 0);
    _defineProperty(this, "nodes", []);
    _defineProperty(this, "chains", []);
    _defineProperty(this, "monomerToTwoStrandedSnakeLayoutNode", new Map());
    _defineProperty(this, "chainToHasAntisense", new Map());
    this.chainsCollection = chainsCollection;
    this.fillNodes(chainsCollection);
    this.fillChains();
    this.postProcessNodes(chainsCollection);
    if (this.chains.length === 0) {
      this.addEmptyChain(0);
    }
  }
  _createClass(SequenceViewModel, [{
    key: "addNode",
    value: function addNode(senseNode, senseNodeIndex, chain) {
      var _this = this;
      var twoStrandedNode = {
        senseNode: senseNode,
        senseNodeIndex: senseNodeIndex,
        chain: chain
      };
      this.nodes.push(twoStrandedNode);
      senseNode.monomers.forEach(function (monomer) {
        _this.monomerToTwoStrandedSnakeLayoutNode.set(monomer, twoStrandedNode);
      });
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
          var node = _ref.node,
            nodeIndex = _ref.nodeIndex;
          _this2.addNode(node, nodeIndex, chain);
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
        var lastSenseChain = _this3.nodes[_this3.nodes.length - 1].chain;
        var lastSenseNodeIndex = _this3.nodes.length - 1;
        chain.forEachNodeReversed(function (_ref2) {
          var node = _ref2.node;
          if (handledChainNodes.has(node)) {
            return;
          }
          var senseMonomersConnectedByHydrogenBond = node.monomers.reduce(function (foundMonomersInNode, monomer) {
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
            nodesBeforeHydrogenConnectionToBase.push(node);
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
              lastSenseNodeIndex = currentTwoStrandedSnakeLayoutNodeIndex > 0 ? currentTwoStrandedSnakeLayoutNodeIndex : lastTwoStrandedNodeWithHydrogenBondIndex;
              lastSenseChain = (currentTwoStrandedSnakeLayoutNode === null || currentTwoStrandedSnakeLayoutNode === void 0 ? void 0 : currentTwoStrandedSnakeLayoutNode.chain) || lastSenseChain;
              if (currentTwoStrandedSnakeLayoutNode && !currentTwoStrandedSnakeLayoutNode.antisenseNode && isNodeInSameChain) {
                currentTwoStrandedSnakeLayoutNode.antisenseNode = currentNodeBeforeHydrogenConnectionToBase;
                currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
              } else if (currentTwoStrandedSnakeLayoutNodeIndex < 0) {
                _this3.nodes.unshift({
                  antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                  antisenseChain: chain,
                  senseNodeIndex: lastSenseNodeIndex,
                  chain: lastTwoStrandedNodeWithHydrogenBond.chain
                });
              } else {
                _this3.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex + 1, 0, {
                  antisenseNode: currentNodeBeforeHydrogenConnectionToBase,
                  antisenseChain: chain,
                  senseNodeIndex: lastSenseNodeIndex,
                  chain: lastTwoStrandedNodeWithHydrogenBond.chain
                });
              }
            }
            nodesBeforeHydrogenConnectionToBase = [];
          } else {
            nodesBeforeHydrogenConnectionToBase.push(node);
          }
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
              currentTwoStrandedSnakeLayoutNode.antisenseChain = chain;
            } else if (currentTwoStrandedSnakeLayoutNode && (!isNodeInSameChain || hasAnotherAntisenseConnection)) {
              _this3.nodes.splice(currentTwoStrandedSnakeLayoutNodeIndex, 0, {
                antisenseNode: currentAntisenseSnakeLayoutNode,
                antisenseChain: chain,
                senseNodeIndex: lastSenseNodeIndex,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain
              });
            } else {
              _this3.nodes.push({
                antisenseNode: currentAntisenseSnakeLayoutNode,
                antisenseChain: chain,
                senseNodeIndex: lastSenseNodeIndex,
                chain: lastTwoStrandedNodeWithHydrogenBond.chain
              });
            }
          }
          lastTwoStrandedNodeWithHydrogenBond = undefined;
        }
      });
    }
  }, {
    key: "postProcessNodes",
    value: function postProcessNodes(chainsCollection) {
      var monomerToNode = chainsCollection.monomerToNode;
      var lastHandledSenseNode;
      var lastHandledAntisenseNode;
      var antisenseNodeIndex = 0;
      var lastHandledAntisenseChain;
      for (var i = this.nodes.length - 1; i >= 0; i--) {
        var node = this.nodes[i];
        var senseNode = node.senseNode;
        var antisenseNode = node.antisenseNode;
        if (!senseNode) {
          var previousConnectedSenseNode = lastHandledSenseNode ? getPreviousConnectedNode(lastHandledSenseNode, monomerToNode) : undefined;
          if (!lastHandledSenseNode || !previousConnectedSenseNode) {
            node.senseNode = new EmptySequenceNode();
          } else {
            node.senseNode = new BackBoneSequenceNode(previousConnectedSenseNode, lastHandledSenseNode);
          }
        }
        if (!antisenseNode && this.chainToHasAntisense.get(node.chain)) {
          var nextConnectedAntisenseNode = lastHandledAntisenseNode ? getNextConnectedNode(lastHandledAntisenseNode, monomerToNode) : undefined;
          if (!lastHandledAntisenseNode || !nextConnectedAntisenseNode) {
            node.antisenseNode = new EmptySequenceNode();
          } else {
            node.antisenseNode = new BackBoneSequenceNode(lastHandledAntisenseNode, nextConnectedAntisenseNode);
          }
        } else if (!lastHandledAntisenseChain || node.antisenseChain && node.antisenseChain !== lastHandledAntisenseChain) {
          antisenseNodeIndex = 0;
          node.antisenseNodeIndex = antisenseNodeIndex;
          antisenseNodeIndex++;
        } else {
          node.antisenseNodeIndex = antisenseNodeIndex;
          antisenseNodeIndex++;
        }
        var isRealSenseNode = senseNode && !(senseNode instanceof BackBoneSequenceNode) && !(senseNode instanceof EmptySequenceNode);
        lastHandledSenseNode = isRealSenseNode ? senseNode : lastHandledSenseNode;
        lastHandledAntisenseNode = antisenseNode || lastHandledAntisenseNode;
        lastHandledAntisenseChain = node.antisenseChain || lastHandledAntisenseChain;
      }
    }
  }, {
    key: "fillAdditionalSpacesInAntisense",
    value: function fillAdditionalSpacesInAntisense(chainsCollection) {
      var monomerToNode = chainsCollection.monomerToNode;
      var previousTwoStrandedNode;
      var previousHandledSenseNode;
      var nodesToInsert = [];
      this.nodes.forEach(function (node, nodeIndex) {
        var _previousTwoStrandedN, _previousTwoStrandedN2, _previousTwoStrandedN3;
        if ((_previousTwoStrandedN = previousTwoStrandedNode) !== null && _previousTwoStrandedN !== void 0 && _previousTwoStrandedN.antisenseNode && node.antisenseNode && ((_previousTwoStrandedN2 = previousTwoStrandedNode) === null || _previousTwoStrandedN2 === void 0 ? void 0 : _previousTwoStrandedN2.chain) === node.chain && ((_previousTwoStrandedN3 = previousTwoStrandedNode) === null || _previousTwoStrandedN3 === void 0 ? void 0 : _previousTwoStrandedN3.antisenseChain) !== node.antisenseChain) {
          var nextConnectedSenseNode = getNextConnectedNode(previousHandledSenseNode, monomerToNode);
          if (nextConnectedSenseNode) {
            nodesToInsert.push({
              index: nodeIndex,
              node: {
                senseNode: new BackBoneSequenceNode(previousHandledSenseNode, nextConnectedSenseNode),
                senseNodeIndex: previousTwoStrandedNode.senseNodeIndex,
                antisenseNode: new EmptySequenceNode(),
                chain: node.chain
              }
            });
          }
        }
        previousTwoStrandedNode = node;
        previousHandledSenseNode = node.senseNode || previousHandledSenseNode;
      });
      for (var i = nodesToInsert.length - 1; i >= 0; i--) {
        this.nodes.splice(nodesToInsert[i].index, 0, nodesToInsert[i].node);
      }
    }
  }, {
    key: "fillNodes",
    value: function fillNodes(chainsCollection) {
      this.fillSenseNodes(chainsCollection);
      this.fillAntisenseNodes(chainsCollection);
      this.fillAdditionalSpacesInAntisense(chainsCollection);
    }
  }, {
    key: "fillChains",
    value: function fillChains() {
      var _this4 = this;
      var lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
      var currentIndexInSequenceModelChain = 0;
      var currentSequenceModelChain = new SequenceViewModelChain();
      var currentSequenceModelRow = {
        sequenceViewModelItems: []
      };
      var previousSenseNodeChain;
      this.nodes.forEach(function (sequenceModelItem) {
        var currentSenseChain = sequenceModelItem.chain;
        if (previousSenseNodeChain !== currentSenseChain) {
          currentSequenceModelChain = new SequenceViewModelChain();
          _this4.chains.push(currentSequenceModelChain);
          currentIndexInSequenceModelChain = 0;
        }
        if (currentIndexInSequenceModelChain % lineLength === 0) {
          currentSequenceModelRow = {
            sequenceViewModelItems: []
          };
          currentSequenceModelChain.addRow(currentSequenceModelRow);
        }
        currentSequenceModelRow.sequenceViewModelItems.push(sequenceModelItem);
        previousSenseNodeChain = currentSenseChain;
        currentIndexInSequenceModelChain++;
      });
      this.chains.forEach(function (sequenceViewModelChain) {
        var hasAntisense = sequenceViewModelChain.hasAntisense;
        if (hasAntisense) {
          _this4.chainToHasAntisense.set(sequenceViewModelChain.lastNode.chain, true);
        }
        var lastNode = sequenceViewModelChain.lastNode;
        var length = sequenceViewModelChain.length;
        var rowToAddEmptyNode = sequenceViewModelChain.lastRow;
        if (rowToAddEmptyNode.sequenceViewModelItems.length === lineLength) {
          rowToAddEmptyNode = {
            sequenceViewModelItems: []
          };
          sequenceViewModelChain.addRow(rowToAddEmptyNode);
        }
        rowToAddEmptyNode.sequenceViewModelItems.push({
          senseNode: new EmptySequenceNode(),
          antisenseNode: sequenceViewModelChain.hasAntisense ? new EmptySequenceNode() : undefined,
          senseNodeIndex: length,
          chain: lastNode === null || lastNode === void 0 ? void 0 : lastNode.chain
        });
      });
    }
  }, {
    key: "firstTwoStrandedNode",
    get: function get() {
      var _this$chains$;
      return (_this$chains$ = this.chains[0]) === null || _this$chains$ === void 0 ? void 0 : _this$chains$.firstNode;
    }
  }, {
    key: "lastTwoStrandedNode",
    get: function get() {
      var lastChain = this.chains[this.chains.length - 1];
      return lastChain === null || lastChain === void 0 ? void 0 : lastChain.lastNode;
    }
  }, {
    key: "length",
    get: function get() {
      return this.chains.reduce(function (acc, chain) {
        return acc + chain.length;
      }, 0);
    }
  }, {
    key: "hasOnlyOneNewChain",
    get: function get() {
      return this.length === 1 && this.chains[0].isNewSequenceChain;
    }
  }, {
    key: "addEmptyChain",
    value: function addEmptyChain(emptyChainIndex) {
      var _Chain$createChainWit = Chain.createChainWithEmptyNode(),
        emptyChain = _Chain$createChainWit.emptyChain,
        emptySequenceNode = _Chain$createChainWit.emptySequenceNode;
      var chainWithEmptyNode = new SequenceViewModelChain();
      chainWithEmptyNode.addRow({
        sequenceViewModelItems: [{
          senseNode: emptySequenceNode,
          senseNodeIndex: 0,
          chain: emptyChain
        }]
      });
      this.chains.splice(emptyChainIndex, 0, chainWithEmptyNode);
      return chainWithEmptyNode;
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(callback) {
      var nodeIndexOverall = 0;
      this.chains.forEach(function (chain, chainIndex) {
        chain.forEachNode(function (twoStrandedNode, nodeIndex) {
          callback({
            twoStrandedNode: twoStrandedNode,
            nodeIndex: nodeIndex,
            nodeIndexOverall: nodeIndexOverall,
            chain: chain,
            chainIndex: chainIndex
          });
          nodeIndexOverall++;
        });
      });
    }
  }, {
    key: "getNodeIndex",
    value: function getNodeIndex(node) {
      var nodeIndex = -1;
      this.forEachNode(function (_ref3) {
        var twoStrandedNode = _ref3.twoStrandedNode,
          nodeIndexOverall = _ref3.nodeIndexOverall;
        if (twoStrandedNode === node) {
          nodeIndex = nodeIndexOverall;
        }
      });
      return nodeIndex;
    }
  }]);
  return SequenceViewModel;
}();

export { SequenceViewModel };
//# sourceMappingURL=SequenceViewModel.modern.js.map
