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
var editorSingleton = require('../../../../editor/editorSingleton.js');
require('../../../../../domain/entities/atom.js');
require('../../../../../domain/entities/atomList.js');
require('../../../../../domain/entities/bond.js');
require('../../../../../domain/entities/fixedPrecision.js');
require('../../../../../domain/entities/fragment.js');
require('../../../../../domain/entities/functionalGroup.js');
require('../../../../../domain/entities/halfBond.js');
require('../../../../../domain/entities/loop.js');
require('../../../../../domain/entities/rgroup.js');
require('../../../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../../../domain/entities/rxnArrow.js');
require('../../../../../domain/entities/rxnPlus.js');
require('../../../../../domain/entities/sgroup.js');
require('../../../../../domain/entities/sgroupForest.js');
require('../../../../../domain/entities/simpleObject.js');
require('../../../../../domain/entities/struct.js');
require('../../../../../domain/entities/text.js');
require('../../../../../domain/entities/pile.js');
require('../../../../../domain/entities/vec2.js');
require('../../../../../domain/entities/box2Abs.js');
require('../../../../../domain/entities/pool.js');
require('../../../../../domain/entities/image.js');
require('../../../../../domain/entities/multitailArrow.js');
require('../../../../../domain/entities/highlight.js');
require('../../../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../../../domain/entities/monomerMicromolecule.js');
require('../../../../../domain/entities/Peptide.js');
require('../../../../../domain/entities/BaseMonomer.js');
require('../../../../../domain/entities/Chem.js');
require('../../../../../domain/entities/Sugar.js');
var RNABase = require('../../../../../domain/entities/RNABase.js');
require('../../../../../domain/entities/Phosphate.js');
require('../../../../../domain/entities/Axis.js');
require('../../../../../domain/entities/Nucleoside.js');
require('../../../../../domain/entities/Nucleotide.js');
require('../../../../../domain/entities/monomer-chains/types.js');
var Chain = require('../../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../../../domain/entities/MonomerSequenceNode.js');
var EmptySequenceNode = require('../../../../../domain/entities/EmptySequenceNode.js');
require('../../../../../domain/entities/LinkerSequenceNode.js');
require('../../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../../domain/entities/UnsplitNucleotide.js');
require('../../../../../domain/entities/PolymerBond.js');
require('../../../../../domain/entities/AmbiguousMonomer.js');
require('../../../../../domain/entities/MonomerToAtomBond.js');
require('../../../../../domain/entities/HydrogenBond.js');
require('../../../../../domain/entities/SGroupDrawingEntity.js');
var BackBoneSequenceNode = require('../../../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../../../../../domain/entities/Command.js');
require('../../../../../utilities/runAsyncAction.js');
require('../../../../../utilities/KetcherLogger.js');
var SettingsManager = require('../../../../../utilities/SettingsManager.js');
require('../../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../../utilities/clipboardUtils.js');
require('../../../../../domain/entities/CoreAtom.js');
require('../../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../../domain/constants/elements.js');
require('../../../../../domain/constants/element.types.js');
require('../../../../../domain/constants/generics.js');
require('../../../../../domain/constants/chains.js');
require('../../../../../domain/constants/monomers.js');
var SequenceViewModelChain = require('./SequenceViewModelChain.js');
var _ = require('lodash');
var chains = require('../../../../../domain/helpers/chains.js');
var monomers = require('../../../../../domain/helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SequenceViewModel = function () {
  function SequenceViewModel(chainsCollection) {
    _classCallCheck__default["default"](this, SequenceViewModel);
    _defineProperty__default["default"](this, "chainsCollection", void 0);
    _defineProperty__default["default"](this, "nodes", []);
    _defineProperty__default["default"](this, "chains", []);
    _defineProperty__default["default"](this, "monomerToTwoStrandedSnakeLayoutNode", new Map());
    _defineProperty__default["default"](this, "chainToHasAntisense", new Map());
    this.chainsCollection = chainsCollection;
    this.fillNodes(chainsCollection);
    this.fillChains();
    this.postProcessNodes(chainsCollection);
    if (this.chains.length === 0) {
      this.addEmptyChain(0);
    }
  }
  _createClass__default["default"](SequenceViewModel, [{
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
      var editor = editorSingleton.provideEditorInstance();
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
              return monomer instanceof RNABase.RNABase && monomer.hydrogenBonds.length !== 0;
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
          var previousConnectedSenseNode = lastHandledSenseNode ? chains.getPreviousConnectedNode(lastHandledSenseNode, monomerToNode) : undefined;
          if (!lastHandledSenseNode || !previousConnectedSenseNode) {
            node.senseNode = new EmptySequenceNode.EmptySequenceNode();
          } else {
            node.senseNode = new BackBoneSequenceNode.BackBoneSequenceNode(previousConnectedSenseNode, lastHandledSenseNode);
          }
        }
        if (!antisenseNode && this.chainToHasAntisense.get(node.chain)) {
          var nextConnectedAntisenseNode = lastHandledAntisenseNode ? chains.getNextConnectedNode(lastHandledAntisenseNode, monomerToNode) : undefined;
          if (!lastHandledAntisenseNode || !nextConnectedAntisenseNode) {
            node.antisenseNode = new EmptySequenceNode.EmptySequenceNode();
          } else {
            node.antisenseNode = new BackBoneSequenceNode.BackBoneSequenceNode(lastHandledAntisenseNode, nextConnectedAntisenseNode);
          }
        } else if (!lastHandledAntisenseChain || node.antisenseChain && node.antisenseChain !== lastHandledAntisenseChain) {
          antisenseNodeIndex = 0;
          node.antisenseNodeIndex = antisenseNodeIndex;
          antisenseNodeIndex++;
        } else {
          node.antisenseNodeIndex = antisenseNodeIndex;
          antisenseNodeIndex++;
        }
        var isRealSenseNode = senseNode && !(senseNode instanceof BackBoneSequenceNode.BackBoneSequenceNode) && !(senseNode instanceof EmptySequenceNode.EmptySequenceNode);
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
          var nextConnectedSenseNode = chains.getNextConnectedNode(previousHandledSenseNode, monomerToNode);
          if (nextConnectedSenseNode) {
            nodesToInsert.push({
              index: nodeIndex,
              node: {
                senseNode: new BackBoneSequenceNode.BackBoneSequenceNode(previousHandledSenseNode, nextConnectedSenseNode),
                senseNodeIndex: previousTwoStrandedNode.senseNodeIndex,
                antisenseNode: new EmptySequenceNode.EmptySequenceNode(),
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
      var lineLength = SettingsManager.SettingsManager.editorLineLength['sequence-layout-mode'];
      var currentIndexInSequenceModelChain = 0;
      var currentSequenceModelChain = new SequenceViewModelChain.SequenceViewModelChain();
      var currentSequenceModelRow = {
        sequenceViewModelItems: []
      };
      var previousSenseNodeChain;
      this.nodes.forEach(function (sequenceModelItem) {
        var currentSenseChain = sequenceModelItem.chain;
        if (previousSenseNodeChain !== currentSenseChain) {
          currentSequenceModelChain = new SequenceViewModelChain.SequenceViewModelChain();
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
          senseNode: new EmptySequenceNode.EmptySequenceNode(),
          antisenseNode: sequenceViewModelChain.hasAntisense ? new EmptySequenceNode.EmptySequenceNode() : undefined,
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
      var _Chain$createChainWit = Chain.Chain.createChainWithEmptyNode(),
        emptyChain = _Chain$createChainWit.emptyChain,
        emptySequenceNode = _Chain$createChainWit.emptySequenceNode;
      var chainWithEmptyNode = new SequenceViewModelChain.SequenceViewModelChain();
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

exports.SequenceViewModel = SequenceViewModel;
//# sourceMappingURL=SequenceViewModel.js.map
