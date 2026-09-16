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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../../editor/editorSingleton.modern.js';
import { SELECTION_COLOR } from '../constants.modern.js';
import '../../../../domain/entities/atom.modern.js';
import '../../../../domain/entities/atomList.modern.js';
import '../../../../domain/entities/bond.modern.js';
import '../../../../domain/entities/fixedPrecision.modern.js';
import '../../../../domain/entities/fragment.modern.js';
import '../../../../domain/entities/functionalGroup.modern.js';
import '../../../../domain/entities/halfBond.modern.js';
import '../../../../domain/entities/loop.modern.js';
import '../../../../domain/entities/rgroup.modern.js';
import '../../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../../domain/entities/rxnArrow.modern.js';
import '../../../../domain/entities/rxnPlus.modern.js';
import '../../../../domain/entities/sgroup.modern.js';
import '../../../../domain/entities/sgroupForest.modern.js';
import '../../../../domain/entities/simpleObject.modern.js';
import '../../../../domain/entities/struct.modern.js';
import '../../../../domain/entities/text.modern.js';
import '../../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/entities/box2Abs.modern.js';
import '../../../../domain/entities/pool.modern.js';
import '../../../../domain/entities/image.modern.js';
import '../../../../domain/entities/multitailArrow.modern.js';
import '../../../../domain/entities/highlight.modern.js';
import '../../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../../domain/entities/Peptide.modern.js';
import '../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../../domain/entities/Sugar.modern.js';
import '../../../../domain/entities/RNABase.modern.js';
import { Phosphate } from '../../../../domain/entities/Phosphate.modern.js';
import '../../../../domain/entities/Axis.modern.js';
import '../../../../domain/entities/Nucleoside.modern.js';
import '../../../../domain/entities/Nucleotide.modern.js';
import '../../../../domain/entities/monomer-chains/types.modern.js';
import '../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../domain/entities/MonomerSequenceNode.modern.js';
import { EmptySequenceNode } from '../../../../domain/entities/EmptySequenceNode.modern.js';
import { LinkerSequenceNode } from '../../../../domain/entities/LinkerSequenceNode.modern.js';
import { UnresolvedMonomer } from '../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../domain/entities/UnsplitNucleotide.modern.js';
import { PolymerBond } from '../../../../domain/entities/PolymerBond.modern.js';
import '../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../domain/entities/SGroupDrawingEntity.modern.js';
import { BackBoneSequenceNode } from '../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../../domain/entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import { MONOMER_CONST } from '../../../../domain/constants/monomers.modern.js';
import { BaseSequenceRenderer } from './BaseSequenceRenderer.modern.js';
import { sequenceRendererStore } from './SequenceRendererStore.modern.js';
import { isNumber } from 'lodash';
import { AmbiguousMonomerSequenceNode } from '../../../../domain/entities/AmbiguousMonomerSequenceNode.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';
var CARET_X_OFFSET_BEFORE_NODE = -17;
var CARET_X_OFFSET_AFTER_NODE = 3;
var BaseSequenceItemRenderer = function (_BaseSequenceRenderer) {
  _inherits(BaseSequenceItemRenderer, _BaseSequenceRenderer);
  function BaseSequenceItemRenderer(node, firstNodeInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, monomerSize, scaledMonomerPosition, twoStrandedNode) {
    var _this;
    var previousRowsWithAntisense = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    _classCallCheck(this, BaseSequenceItemRenderer);
    _this = _callSuper(this, BaseSequenceItemRenderer, [node.monomer]);
    _defineProperty(_assertThisInitialized(_this), "node", void 0);
    _defineProperty(_assertThisInitialized(_this), "firstNodeInChainPosition", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerIndexInChain", void 0);
    _defineProperty(_assertThisInitialized(_this), "isLastMonomerInChain", void 0);
    _defineProperty(_assertThisInitialized(_this), "chain", void 0);
    _defineProperty(_assertThisInitialized(_this), "nodeIndexOverall", void 0);
    _defineProperty(_assertThisInitialized(_this), "editingNodeIndexOverall", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerSize", void 0);
    _defineProperty(_assertThisInitialized(_this), "scaledMonomerPosition", void 0);
    _defineProperty(_assertThisInitialized(_this), "twoStrandedNode", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousRowsWithAntisense", void 0);
    _defineProperty(_assertThisInitialized(_this), "textElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "counterElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionRectangle", void 0);
    _defineProperty(_assertThisInitialized(_this), "spacerElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "backgroundElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "caretElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "antisenseNodeRenderer", void 0);
    _this.node = node;
    _this.firstNodeInChainPosition = firstNodeInChainPosition;
    _this.monomerIndexInChain = monomerIndexInChain;
    _this.isLastMonomerInChain = isLastMonomerInChain;
    _this.chain = chain;
    _this.nodeIndexOverall = nodeIndexOverall;
    _this.editingNodeIndexOverall = editingNodeIndexOverall;
    _this.monomerSize = monomerSize;
    _this.scaledMonomerPosition = scaledMonomerPosition;
    _this.twoStrandedNode = twoStrandedNode;
    _this.previousRowsWithAntisense = previousRowsWithAntisense;
    return _this;
  }
  _createClass(BaseSequenceItemRenderer, [{
    key: "isEditingSymbol",
    value: function isEditingSymbol(editingNodeIndexOverall) {
      return this.nodeIndexOverall === (isNumber(editingNodeIndexOverall) ? editingNodeIndexOverall : this.editingNodeIndexOverall);
    }
  }, {
    key: "isNextSymbolEditing",
    value: function isNextSymbolEditing(editingNodeIndexOverall) {
      return this.nodeIndexOverall + 1 === (isNumber(editingNodeIndexOverall) ? editingNodeIndexOverall : this.editingNodeIndexOverall);
    }
  }, {
    key: "isSingleEmptyNode",
    get: function get() {
      return sequenceRendererStore.sequenceViewModel.length === 1 && this.node instanceof EmptySequenceNode;
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      return undefined;
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }, {
    key: "currentChain",
    get: function get() {
      return this.chain;
    }
  }, {
    key: "currentChainNodesWithoutEmptyNodes",
    get: function get() {
      return this.chain.nodes.filter(function (node) {
        return !(node instanceof EmptySequenceNode);
      });
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      return this.scaledMonomerPosition;
    }
  }, {
    key: "scaledMonomerPositionForSequence",
    get: function get() {
      var lineLength = SettingsManager.editorLineLength['sequence-layout-mode'];
      var indexInRow = this.monomerIndexInChain % lineLength;
      var rowIndex = Math.floor(this.monomerIndexInChain / lineLength);
      return new Vec2(this.firstNodeInChainPosition.x + indexInRow * 20 + Math.floor(indexInRow / this.nthSeparationInRow) * 10, this.firstNodeInChainPosition.y + 47 * rowIndex + 53 * this.previousRowsWithAntisense);
    }
  }, {
    key: "center",
    get: function get() {
      return this.scaledMonomerPositionForSequence.add(new Vec2(4.5, 0, 0));
    }
  }, {
    key: "isSequenceEditModeTurnedOn",
    get: function get() {
      return provideEditorInstance().isSequenceEditMode;
    }
  }, {
    key: "isSequenceEditInRnaBuilderModeTurnedOn",
    get: function get() {
      return provideEditorInstance().isSequenceEditInRNABuilderMode;
    }
  }, {
    key: "isAntisenseEditMode",
    get: function get() {
      return provideEditorInstance().mode.isAntisenseEditMode;
    }
  }, {
    key: "isSyncEditMode",
    get: function get() {
      return provideEditorInstance().mode.isSyncEditMode;
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var rootElement = this.canvas.append('g').data([this]).attr('class', 'sequence-item').attr('data-testid', 'sequence-item').attr('data-symbol-id', this.node.monomer.id).attr('data-chain-id', this.chain.id).attr('data-symbol-alias', this.symbolToDisplay).attr('data-side-connection-number', this.node.monomers.reduce(function (acc, monomer) {
        return acc + monomer.covalentBonds.filter(function (bond) {
          return bond instanceof PolymerBond && bond.isSideChainConnection;
        }).length;
      }, 0)).attr('data-has-left-connection', Boolean(this.node.firstMonomerInNode.attachmentPointsToBonds.R1)).attr('data-has-right-connection', Boolean(this.node.lastMonomerInNode.attachmentPointsToBonds.R2)).attr('data-hydrogen-connection-number', this.node.monomers.reduce(function (acc, monomer) {
        return acc + monomer.hydrogenBonds.length;
      }, 0)).attr('data-isAntisense', this.isAntisenseNode).attr('data-nodeIndexOverall', this.nodeIndexOverall).attr('transition', 'transform 0.2s').attr('transform', "translate(".concat(this.scaledMonomerPositionForSequence.x, ", ").concat(this.scaledMonomerPositionForSequence.y, ")"));
      if (this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
        rootElement.attr('pointer-events', 'all').attr('cursor', 'text');
      }
      return rootElement;
    }
  }, {
    key: "appendBackgroundElement",
    value: function appendBackgroundElement() {
      var _this$rootElement;
      var backgroundElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('rect').attr('width', 16).attr('height', 20).attr('y', -16).attr('x', -2).attr('rx', 2).attr('data-element-type', 'background').attr('cursor', this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode ? 'text' : 'default');
      backgroundElement === null || backgroundElement === void 0 || backgroundElement.attr('fill', 'transparent');
      return backgroundElement;
    }
  }, {
    key: "appendSpacerElement",
    value: function appendSpacerElement() {
      var _this$rootElement2;
      var spacerGroupElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.append('g').attr('transform', 'translate(14, -16)').attr('data-element-type', 'spacer');
      spacerGroupElement === null || spacerGroupElement === void 0 || spacerGroupElement.append('rect').attr('width', 4).attr('height', 20).attr('cursor', this.isSequenceEditInRnaBuilderModeTurnedOn ? 'default' : 'text').attr('fill', 'transparent');
      return spacerGroupElement;
    }
  }, {
    key: "nthSeparationInRow",
    get: function get() {
      return 10;
    }
  }, {
    key: "isAntisenseNode",
    get: function get() {
      var _this$twoStrandedNode;
      return this.node === ((_this$twoStrandedNode = this.twoStrandedNode) === null || _this$twoStrandedNode === void 0 ? void 0 : _this$twoStrandedNode.antisenseNode);
    }
  }, {
    key: "hasAntisenseInChain",
    get: function get() {
      return Boolean(this.twoStrandedNode.antisenseNode);
    }
  }, {
    key: "getNodeIndexInSubgroup",
    value: function getNodeIndexInSubgroup() {
      var _this2 = this;
      var nodeIndex = 0;
      this.chain.subChains.some(function (subChain) {
        if (!_this2.isSubChainNode(_this2.node)) return false;
        var nodeIndexInSubChain = subChain.nodes.indexOf(_this2.node);
        if (nodeIndexInSubChain === -1) return false;
        var nonLinkerNodeGroups = subChain.nodes.reduce(function (groups, node) {
          if (node instanceof LinkerSequenceNode || node.monomer instanceof Phosphate || _this2.checkIfNodeIsAmbiguousMonomerNotPeptide(node)) {
            if (groups[groups.length - 1].length > 0) {
              groups.push([]);
            }
          } else {
            groups[groups.length - 1].push(node);
          }
          return groups;
        }, [[]]);
        var currentGroup = nonLinkerNodeGroups.find(function (group) {
          return group.includes(_this2.node);
        });
        if (!currentGroup) return false;
        nodeIndex = currentGroup.indexOf(_this2.node) + 1;
        return true;
      });
      return nodeIndex;
    }
  }, {
    key: "counterNumber",
    get: function get() {
      var _this$twoStrandedNode2,
        _this$twoStrandedNode3,
        _this3 = this;
      var antisenseNodeIndex = (_this$twoStrandedNode2 = this.twoStrandedNode) === null || _this$twoStrandedNode2 === void 0 ? void 0 : _this$twoStrandedNode2.antisenseNodeIndex;
      var senseNodeIndex = (_this$twoStrandedNode3 = this.twoStrandedNode) === null || _this$twoStrandedNode3 === void 0 ? void 0 : _this$twoStrandedNode3.senseNodeIndex;
      var numberToDisplay;
      var calculateNumberToDisplay = function calculateNumberToDisplay(subChain) {
        if (!_this3.isSubChainNode(_this3.node)) return false;
        var nodeIndex = subChain.nodes.indexOf(_this3.node);
        if (nodeIndex === -1) return false;
        if (_this3.node.monomer instanceof Phosphate) return false;
        var linkerNodeIndex = subChain.nodes.findIndex(function (node) {
          return node instanceof LinkerSequenceNode;
        });
        var phosphateNodeIndex = subChain.nodes.findIndex(function (_ref) {
          var monomer = _ref.monomer;
          return monomer instanceof Phosphate;
        });
        var ambiguousMonomerNonPeptideNodeIndex = subChain.nodes.findIndex(_this3.checkIfNodeIsAmbiguousMonomerNotPeptide);
        if (linkerNodeIndex !== -1 || phosphateNodeIndex !== -1 || ambiguousMonomerNonPeptideNodeIndex !== -1) {
          if (linkerNodeIndex < nodeIndex || phosphateNodeIndex < nodeIndex || ambiguousMonomerNonPeptideNodeIndex < nodeIndex) {
            numberToDisplay = _this3.getNodeIndexInSubgroup();
          } else {
            numberToDisplay = nodeIndex + 1;
          }
        } else if (nodeIndex === 0 || nodeIndex === subChain.nodes.length - 1 || nodeIndex === subChain.nodes.length - 2 && subChain.nodes[subChain.nodes.length - 1].monomer instanceof Phosphate || _this3.isNthNodeInChain) {
          numberToDisplay = nodeIndex + 1;
        }
        return numberToDisplay !== undefined;
      };
      this.chain.subChains.some(calculateNumberToDisplay);
      if (isNumber(numberToDisplay)) {
        return numberToDisplay;
      }
      if (this.isAntisenseNode && isNumber(antisenseNodeIndex)) {
        return antisenseNodeIndex + 1;
      }
      return senseNodeIndex + 1;
    }
  }, {
    key: "appendCounterElement",
    value: function appendCounterElement(rootElement) {
      return rootElement.append('text').attr('x', '2').attr('y', this.node.monomer.monomerItem.isAntisense ? '24' : '-24').text(this.counterNumber).attr('font-family', 'Courier New').attr('font-size', '12px').attr('font-weight', '700').attr('style', 'user-select: none').attr('fill', '#7C7C7F');
    }
  }, {
    key: "redrawCounter",
    value: function redrawCounter(editingNodeIndexOverall) {
      var _this$counterElement;
      if (!this.rootElement) {
        return;
      }
      (_this$counterElement = this.counterElement) === null || _this$counterElement === void 0 || _this$counterElement.remove();
      this.counterElement = undefined;
      if (this.needDisplayCounter(editingNodeIndexOverall)) {
        this.counterElement = this.appendCounterElement(this.rootElement);
      }
    }
  }, {
    key: "needDisplayCounter",
    value: function needDisplayCounter(editingNodeIndexOverall) {
      return !this.inIgnoreList(this.node) &&
      !this.isSubChainNodeBeginningOfChain && (
      this.isBeginningOfSubChain || this.isLastInSubChain || this.currentNodeNearBreakingNode || (!this.isSyncEditMode || !this.hasAntisenseInChain || !(this.counterNumber > 9 && (this.isNextSymbolEditing(editingNodeIndexOverall) || this.isEditingSymbol(editingNodeIndexOverall)))) && (this.isNthNodeInChain || this.isLastMonomerInChain));
    }
  }, {
    key: "checkIfNodeIsAmbiguousMonomerPeptide",
    value: function checkIfNodeIsAmbiguousMonomerPeptide(node) {
      return node instanceof AmbiguousMonomerSequenceNode && node.monomer.monomerClass === MONOMER_CONST.AMINO_ACID;
    }
  }, {
    key: "checkIfNodeIsAmbiguousMonomerNotPeptide",
    value: function checkIfNodeIsAmbiguousMonomerNotPeptide(node) {
      return node instanceof AmbiguousMonomerSequenceNode && node.monomer.monomerClass !== MONOMER_CONST.AMINO_ACID;
    }
  }, {
    key: "currentNodeNearBreakingNode",
    get: function get() {
      var _this4 = this;
      return this.chain.subChains.some(function (subChain) {
        if (!_this4.isSubChainNode(_this4.node) || _this4.checkIfNodeIsAmbiguousMonomerPeptide(_this4.node)) return false;
        var nodeIndex = subChain.nodes.indexOf(_this4.node);
        if (nodeIndex === -1) return false;
        return nodeIndex > 0 && subChain.nodes[nodeIndex - 1] instanceof LinkerSequenceNode || nodeIndex < subChain.nodes.length - 1 && subChain.nodes[nodeIndex + 1] instanceof LinkerSequenceNode || nodeIndex > 0 && _this4.checkIfNodeIsAmbiguousMonomerNotPeptide(subChain.nodes[nodeIndex - 1]) || nodeIndex < subChain.nodes.length - 1 && _this4.checkIfNodeIsAmbiguousMonomerNotPeptide(subChain.nodes[nodeIndex + 1]);
      });
    }
  }, {
    key: "inIgnoreList",
    value: function inIgnoreList(node) {
      return (
        node instanceof LinkerSequenceNode ||
        node instanceof EmptySequenceNode || node instanceof BackBoneSequenceNode ||
        this.checkIfNodeIsAmbiguousMonomerNotPeptide(this.node) ||
        node.monomer instanceof Phosphate ||
        node.monomer instanceof UnresolvedMonomer
      );
    }
  }, {
    key: "subChainWithNode",
    get: function get() {
      var _this5 = this;
      if (!this.isSubChainNode(this.node)) return null;
      var subChain = this.chain.subChains.find(function (subChain) {
        if (!_this5.isSubChainNode(_this5.node)) return false;
        return subChain.nodes.includes(_this5.node);
      });
      if (!subChain) return null;
      return subChain;
    }
  }, {
    key: "ignoredNodesBeforeFirstNodeInSubChain",
    get: function get() {
      var _this6 = this;
      if (!this.isSubChainNode(this.node)) return [];
      if (!this.subChainWithNode) return [];
      var nodeIndex = this.subChainWithNode.nodes.indexOf(this.node);
      if (nodeIndex === -1) return [];
      var nodesBefore = this.subChainWithNode.nodes.slice(0, nodeIndex);
      if (nodesBefore.some(function (node) {
        return !_this6.inIgnoreList(node);
      })) {
        return [];
      }
      return nodesBefore;
    }
  }, {
    key: "hasOnlyIgnoredNodesBeforeNodeInSubChain",
    get: function get() {
      return !!this.ignoredNodesBeforeFirstNodeInSubChain.length;
    }
  }, {
    key: "ignoredNodesAfterLastNodeInSubChain",
    get: function get() {
      var _this7 = this;
      if (!this.isSubChainNode(this.node)) return [];
      if (!this.subChainWithNode) return [];
      var nodeIndex = this.subChainWithNode.nodes.indexOf(this.node);
      if (nodeIndex === -1) return [];
      var nodesAfter = this.subChainWithNode.nodes.slice(nodeIndex + 1);
      if (nodesAfter.some(function (node) {
        return !_this7.inIgnoreList(node);
      })) {
        return [];
      }
      return nodesAfter;
    }
  }, {
    key: "hasOnlyIgnoredNodesAfterNodeInChain",
    get: function get() {
      return !!this.ignoredNodesAfterLastNodeInSubChain.length;
    }
  }, {
    key: "isSubChainNodeBeginningOfChain",
    get: function get() {
      return this.isSubChainNode(this.node) && !this.inIgnoreList(this.node) && this.isNodeInFirstSubChain && this.isBeginningOfSubChain;
    }
  }, {
    key: "isBeginningOfChain",
    get: function get() {
      return this.monomerIndexInChain === 0;
    }
  }, {
    key: "isNodeInFirstSubChain",
    get: function get() {
      if (!this.isSubChainNode(this.node)) return false;
      return this.chain.subChains[0].nodes.indexOf(this.node) !== -1;
    }
  }, {
    key: "isBeginningOfSubChain",
    get: function get() {
      var _this8 = this;
      return this.chain.subChains.some(function (subChain) {
        var firstNode = subChain.nodes[0];
        return !_this8.inIgnoreList(_this8.node) && (firstNode === _this8.node || _this8.hasOnlyIgnoredNodesBeforeNodeInSubChain);
      });
    }
  }, {
    key: "isLastInSubChain",
    get: function get() {
      var _this9 = this;
      return this.chain.subChains.some(function (subChain) {
        var lastNode = subChain.nodes[subChain.nodes.length - 1];
        return !_this9.inIgnoreList(_this9.node) && (_this9.node === lastNode || _this9.hasOnlyIgnoredNodesAfterNodeInChain);
      });
    }
  }, {
    key: "isNthNodeInChain",
    get: function get() {
      return this.isAntisenseNode ? (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 1 : (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0;
    }
  }, {
    key: "showCaret",
    value: function showCaret() {
      var _this$spacerElement;
      var xOffset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CARET_X_OFFSET_BEFORE_NODE;
      this.caretElement = (_this$spacerElement = this.spacerElement) === null || _this$spacerElement === void 0 ? void 0 : _this$spacerElement.append('g');
      if (this.isSyncEditMode && this.isAntisenseNode) {
        var _this$caretElement, _this$caretElement2;
        (_this$caretElement = this.caretElement) === null || _this$caretElement === void 0 || _this$caretElement.append('path').attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z').attr('fill', '#fff').attr('transform', "translate(\n          ".concat(-21, ",\n          ", 20, "\n          )")).attr('stroke', '#7C7C7F');
        (_this$caretElement2 = this.caretElement) === null || _this$caretElement2 === void 0 || _this$caretElement2.append('path').attr('d', 'M4.80005 1L8.43402 7.29423L1.16607 7.29423L4.80005 1Z').attr('fill', '#fff').attr('transform', 'translate(-12 -34) rotate(180)').attr('stroke', '#7C7C7F');
      }
      if (this.isAntisenseEditMode ? this.isAntisenseNode : !this.isAntisenseNode) {
        var _this$caretElement3;
        (_this$caretElement3 = this.caretElement) === null || _this$caretElement3 === void 0 || _this$caretElement3.append('line').attr('x1', xOffset).attr('y1', -1).attr('x2', xOffset).attr('y2', 21).attr('stroke', '#333').attr('class', 'blinking');
      }
    }
  }, {
    key: "showCaretAfterNode",
    value: function showCaretAfterNode() {
      this.showCaret(CARET_X_OFFSET_AFTER_NODE);
    }
  }, {
    key: "removeCaret",
    value: function removeCaret() {
      var _this$caretElement4;
      (_this$caretElement4 = this.caretElement) === null || _this$caretElement4 === void 0 || _this$caretElement4.remove();
      this.caretElement = undefined;
    }
  }, {
    key: "redrawCaret",
    value: function redrawCaret(editingNodeIndexOverall) {
      var afterRowEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.removeCaret();
      if (this.isSequenceEditModeTurnedOn && this.isEditingSymbol(editingNodeIndexOverall) || this.isSingleEmptyNode) {
        if (afterRowEnd) {
          this.showCaretAfterNode();
        } else {
          this.showCaret();
        }
      }
    }
  }, {
    key: "redrawBackgroundElementColor",
    value: function redrawBackgroundElementColor() {
      var _this$backgroundEleme;
      (_this$backgroundEleme = this.backgroundElement) === null || _this$backgroundEleme === void 0 || _this$backgroundEleme.attr('fill', this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode ? '#FF7A001A' : 'transparent');
    }
  }, {
    key: "appendChainStartArrow",
    value: function appendChainStartArrow() {
      var _this$rootElement3;
      (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 || _this$rootElement3.append('use').attr('x', -17).attr('y', -27).attr('data-testid', 'sequence-start-arrow').attr('href', "#".concat(CHAIN_START_ARROW_SYMBOL_ID));
    }
  }, {
    key: "drawGreyOverlay",
    value: function drawGreyOverlay() {
      var _this$rootElement4;
      (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 || _this$rootElement4.attr('opacity', '0.2');
    }
  }, {
    key: "show",
    value: function show() {
      this.rootElement = this.appendRootElement();
      if (this.isBeginningOfChain && this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
        this.appendChainStartArrow();
      }
      this.spacerElement = this.appendSpacerElement();
      this.backgroundElement = this.appendBackgroundElement();
      this.redrawCaret();
      this.textElement = this.rootElement.append('text').text(this.symbolToDisplay).attr('font-family', 'Courier New').attr('font-size', '20px').attr('font-weight', '700').attr('fill', this.isSequenceEditInRnaBuilderModeTurnedOn ? '24545A' : '#333333').attr('style', 'user-select: none;').attr('data-element-type', 'text').attr('cursor', this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode ? 'text' : 'default');
      this.redrawCounter();
      this.drawSelection();
      if (this.isSequenceEditInRnaBuilderModeTurnedOn && !this.node.monomer.selected || !this.isSyncEditMode && this.isSequenceEditModeTurnedOn && this.hasAntisenseInChain && (this.isAntisenseNode && !this.isAntisenseEditMode || !this.isAntisenseNode && this.isAntisenseEditMode)) {
        this.drawGreyOverlay();
      }
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.node.monomer.selected && !this.isSingleEmptyNode) {
        this.appendSelection();
        this.raiseElement();
      } else {
        this.removeSelection();
      }
      if (this.node.modified) {
        this.drawModification();
      }
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$rootElement5, _this$backgroundEleme2;
      this.selectionRectangle = this.selectionRectangle || ((_this$rootElement5 = this.rootElement) === null || _this$rootElement5 === void 0 ? void 0 : _this$rootElement5.insert('rect', ':first-child'));
      if (this.isSequenceEditInRnaBuilderModeTurnedOn) {
        var _this$selectionRectan;
        (_this$selectionRectan = this.selectionRectangle) === null || _this$selectionRectan === void 0 || _this$selectionRectan.attr('fill', '#99D6DC').attr('x', -3).attr('y', -21).attr('width', 18).attr('height', 30).attr('rx', 3).attr('class', 'dynamic-element');
      } else {
        var _this$selectionRectan2;
        (_this$selectionRectan2 = this.selectionRectangle) === null || _this$selectionRectan2 === void 0 || _this$selectionRectan2.attr('fill', SELECTION_COLOR).attr('x', -4).attr('y', -16).attr('width', 20).attr('height', 20).attr('class', 'dynamic-element');
      }
      (_this$backgroundEleme2 = this.backgroundElement) === null || _this$backgroundEleme2 === void 0 || _this$backgroundEleme2.attr('fill', 'none');
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionRectan3;
      (_this$selectionRectan3 = this.selectionRectangle) === null || _this$selectionRectan3 === void 0 || _this$selectionRectan3.remove();
      this.selectionRectangle = undefined;
    }
  }, {
    key: "raiseElement",
    value: function raiseElement() {
      var _this$selectionRectan4;
      (_this$selectionRectan4 = this.selectionRectangle) === null || _this$selectionRectan4 === void 0 || _this$selectionRectan4.lower();
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$rootElement6;
      (_this$rootElement6 = this.rootElement) === null || _this$rootElement6 === void 0 || _this$rootElement6.remove();
      this.rootElement = undefined;
      this.removeSelection();
    }
  }, {
    key: "setEnumeration",
    value: function setEnumeration() {
    }
  }, {
    key: "redrawEnumeration",
    value: function redrawEnumeration() {
    }
  }, {
    key: "redrawAttachmentPoints",
    value: function redrawAttachmentPoints() {
    }
  }, {
    key: "redrawAttachmentPointsCoordinates",
    value: function redrawAttachmentPointsCoordinates() {
    }
  }, {
    key: "enumeration",
    get: function get() {
      return null;
    }
  }, {
    key: "redrawChainBeginning",
    value: function redrawChainBeginning() {
    }
  }, {
    key: "hoverAttachmentPoint",
    value: function hoverAttachmentPoint() {
    }
  }, {
    key: "updateAttachmentPoints",
    value: function updateAttachmentPoints() {
    }
  }, {
    key: "drawBackgroundElementHover",
    value: function drawBackgroundElementHover() {
      if (this.isSequenceEditModeTurnedOn || this.isSingleEmptyNode) {
        return;
      }
      if (this.node.monomer.selected) {
        var _this$selectionRectan5;
        (_this$selectionRectan5 = this.selectionRectangle) === null || _this$selectionRectan5 === void 0 || _this$selectionRectan5.attr('fill', '#35f073');
      } else {
        var _this$backgroundEleme3;
        (_this$backgroundEleme3 = this.backgroundElement) === null || _this$backgroundEleme3 === void 0 || _this$backgroundEleme3.attr('fill', '#E1E8E9');
      }
      if (this.node.modified) {
        this.drawModification();
      }
    }
  }, {
    key: "removeBackgroundElementHover",
    value: function removeBackgroundElementHover() {
      if (this.node.monomer.selected) {
        var _this$selectionRectan6;
        (_this$selectionRectan6 = this.selectionRectangle) === null || _this$selectionRectan6 === void 0 || _this$selectionRectan6.attr('fill', this.isSequenceEditInRnaBuilderModeTurnedOn ? '#99D6DC' : SELECTION_COLOR);
      } else {
        var _this$backgroundEleme4;
        (_this$backgroundEleme4 = this.backgroundElement) === null || _this$backgroundEleme4 === void 0 || _this$backgroundEleme4.attr('fill', 'none');
      }
      if (this.node.modified) {
        this.drawModification();
      }
    }
  }, {
    key: "isSubChainNode",
    value: function isSubChainNode(node) {
      return (node === null || node === void 0 ? void 0 : node.monomers) !== undefined;
    }
  }, {
    key: "setAntisenseNodeRenderer",
    value: function setAntisenseNodeRenderer(antisenseNodeRenderer) {
      this.antisenseNodeRenderer = antisenseNodeRenderer;
    }
  }]);
  return BaseSequenceItemRenderer;
}(BaseSequenceRenderer);

export { BaseSequenceItemRenderer };
//# sourceMappingURL=BaseSequenceItemRenderer.modern.js.map
