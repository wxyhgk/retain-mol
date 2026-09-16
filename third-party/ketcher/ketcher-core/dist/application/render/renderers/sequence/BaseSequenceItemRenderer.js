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
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../editor/editorSingleton.js');
var constants = require('../constants.js');
require('../../../../domain/entities/atom.js');
require('../../../../domain/entities/atomList.js');
require('../../../../domain/entities/bond.js');
require('../../../../domain/entities/fixedPrecision.js');
require('../../../../domain/entities/fragment.js');
require('../../../../domain/entities/functionalGroup.js');
require('../../../../domain/entities/halfBond.js');
require('../../../../domain/entities/loop.js');
require('../../../../domain/entities/rgroup.js');
require('../../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../../domain/entities/rxnArrow.js');
require('../../../../domain/entities/rxnPlus.js');
require('../../../../domain/entities/sgroup.js');
require('../../../../domain/entities/sgroupForest.js');
require('../../../../domain/entities/simpleObject.js');
require('../../../../domain/entities/struct.js');
require('../../../../domain/entities/text.js');
require('../../../../domain/entities/pile.js');
var vec2 = require('../../../../domain/entities/vec2.js');
require('../../../../domain/entities/box2Abs.js');
require('../../../../domain/entities/pool.js');
require('../../../../domain/entities/image.js');
require('../../../../domain/entities/multitailArrow.js');
require('../../../../domain/entities/highlight.js');
require('../../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../../domain/entities/monomerMicromolecule.js');
require('../../../../domain/entities/Peptide.js');
require('../../../../domain/entities/BaseMonomer.js');
require('../../../../domain/entities/Chem.js');
require('../../../../domain/entities/Sugar.js');
require('../../../../domain/entities/RNABase.js');
var Phosphate = require('../../../../domain/entities/Phosphate.js');
require('../../../../domain/entities/Axis.js');
require('../../../../domain/entities/Nucleoside.js');
require('../../../../domain/entities/Nucleotide.js');
require('../../../../domain/entities/monomer-chains/types.js');
require('../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../../domain/entities/MonomerSequenceNode.js');
var EmptySequenceNode = require('../../../../domain/entities/EmptySequenceNode.js');
var LinkerSequenceNode = require('../../../../domain/entities/LinkerSequenceNode.js');
var UnresolvedMonomer = require('../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../domain/entities/UnsplitNucleotide.js');
var PolymerBond = require('../../../../domain/entities/PolymerBond.js');
require('../../../../domain/entities/AmbiguousMonomer.js');
require('../../../../domain/entities/MonomerToAtomBond.js');
require('../../../../domain/entities/HydrogenBond.js');
require('../../../../domain/entities/SGroupDrawingEntity.js');
var BackBoneSequenceNode = require('../../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../../../../domain/entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
var SettingsManager = require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
var monomers = require('../../../../domain/constants/monomers.js');
var BaseSequenceRenderer = require('./BaseSequenceRenderer.js');
var SequenceRendererStore = require('./SequenceRendererStore.js');
var _ = require('lodash');
var AmbiguousMonomerSequenceNode = require('../../../../domain/entities/AmbiguousMonomerSequenceNode.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CHAIN_START_ARROW_SYMBOL_ID = 'sequence-start-arrow';
var CARET_X_OFFSET_BEFORE_NODE = -17;
var CARET_X_OFFSET_AFTER_NODE = 3;
var BaseSequenceItemRenderer = function (_BaseSequenceRenderer) {
  _inherits__default["default"](BaseSequenceItemRenderer, _BaseSequenceRenderer);
  function BaseSequenceItemRenderer(node, firstNodeInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, monomerSize, scaledMonomerPosition, twoStrandedNode) {
    var _this;
    var previousRowsWithAntisense = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0;
    _classCallCheck__default["default"](this, BaseSequenceItemRenderer);
    _this = _callSuper(this, BaseSequenceItemRenderer, [node.monomer]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "node", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "firstNodeInChainPosition", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerIndexInChain", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isLastMonomerInChain", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "chain", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "nodeIndexOverall", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "editingNodeIndexOverall", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerSize", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "scaledMonomerPosition", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "twoStrandedNode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousRowsWithAntisense", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "textElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "counterElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionRectangle", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "spacerElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "backgroundElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "caretElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "antisenseNodeRenderer", void 0);
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
  _createClass__default["default"](BaseSequenceItemRenderer, [{
    key: "isEditingSymbol",
    value: function isEditingSymbol(editingNodeIndexOverall) {
      return this.nodeIndexOverall === (_.isNumber(editingNodeIndexOverall) ? editingNodeIndexOverall : this.editingNodeIndexOverall);
    }
  }, {
    key: "isNextSymbolEditing",
    value: function isNextSymbolEditing(editingNodeIndexOverall) {
      return this.nodeIndexOverall + 1 === (_.isNumber(editingNodeIndexOverall) ? editingNodeIndexOverall : this.editingNodeIndexOverall);
    }
  }, {
    key: "isSingleEmptyNode",
    get: function get() {
      return SequenceRendererStore.sequenceRendererStore.sequenceViewModel.length === 1 && this.node instanceof EmptySequenceNode.EmptySequenceNode;
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
        return !(node instanceof EmptySequenceNode.EmptySequenceNode);
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
      var lineLength = SettingsManager.SettingsManager.editorLineLength['sequence-layout-mode'];
      var indexInRow = this.monomerIndexInChain % lineLength;
      var rowIndex = Math.floor(this.monomerIndexInChain / lineLength);
      return new vec2.Vec2(this.firstNodeInChainPosition.x + indexInRow * 20 + Math.floor(indexInRow / this.nthSeparationInRow) * 10, this.firstNodeInChainPosition.y + 47 * rowIndex + 53 * this.previousRowsWithAntisense);
    }
  }, {
    key: "center",
    get: function get() {
      return this.scaledMonomerPositionForSequence.add(new vec2.Vec2(4.5, 0, 0));
    }
  }, {
    key: "isSequenceEditModeTurnedOn",
    get: function get() {
      return editorSingleton.provideEditorInstance().isSequenceEditMode;
    }
  }, {
    key: "isSequenceEditInRnaBuilderModeTurnedOn",
    get: function get() {
      return editorSingleton.provideEditorInstance().isSequenceEditInRNABuilderMode;
    }
  }, {
    key: "isAntisenseEditMode",
    get: function get() {
      return editorSingleton.provideEditorInstance().mode.isAntisenseEditMode;
    }
  }, {
    key: "isSyncEditMode",
    get: function get() {
      return editorSingleton.provideEditorInstance().mode.isSyncEditMode;
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var rootElement = this.canvas.append('g').data([this]).attr('class', 'sequence-item').attr('data-testid', 'sequence-item').attr('data-symbol-id', this.node.monomer.id).attr('data-chain-id', this.chain.id).attr('data-symbol-alias', this.symbolToDisplay).attr('data-side-connection-number', this.node.monomers.reduce(function (acc, monomer) {
        return acc + monomer.covalentBonds.filter(function (bond) {
          return bond instanceof PolymerBond.PolymerBond && bond.isSideChainConnection;
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
          if (node instanceof LinkerSequenceNode.LinkerSequenceNode || node.monomer instanceof Phosphate.Phosphate || _this2.checkIfNodeIsAmbiguousMonomerNotPeptide(node)) {
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
        if (_this3.node.monomer instanceof Phosphate.Phosphate) return false;
        var linkerNodeIndex = subChain.nodes.findIndex(function (node) {
          return node instanceof LinkerSequenceNode.LinkerSequenceNode;
        });
        var phosphateNodeIndex = subChain.nodes.findIndex(function (_ref) {
          var monomer = _ref.monomer;
          return monomer instanceof Phosphate.Phosphate;
        });
        var ambiguousMonomerNonPeptideNodeIndex = subChain.nodes.findIndex(_this3.checkIfNodeIsAmbiguousMonomerNotPeptide);
        if (linkerNodeIndex !== -1 || phosphateNodeIndex !== -1 || ambiguousMonomerNonPeptideNodeIndex !== -1) {
          if (linkerNodeIndex < nodeIndex || phosphateNodeIndex < nodeIndex || ambiguousMonomerNonPeptideNodeIndex < nodeIndex) {
            numberToDisplay = _this3.getNodeIndexInSubgroup();
          } else {
            numberToDisplay = nodeIndex + 1;
          }
        } else if (nodeIndex === 0 || nodeIndex === subChain.nodes.length - 1 || nodeIndex === subChain.nodes.length - 2 && subChain.nodes[subChain.nodes.length - 1].monomer instanceof Phosphate.Phosphate || _this3.isNthNodeInChain) {
          numberToDisplay = nodeIndex + 1;
        }
        return numberToDisplay !== undefined;
      };
      this.chain.subChains.some(calculateNumberToDisplay);
      if (_.isNumber(numberToDisplay)) {
        return numberToDisplay;
      }
      if (this.isAntisenseNode && _.isNumber(antisenseNodeIndex)) {
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
      return node instanceof AmbiguousMonomerSequenceNode.AmbiguousMonomerSequenceNode && node.monomer.monomerClass === monomers.MONOMER_CONST.AMINO_ACID;
    }
  }, {
    key: "checkIfNodeIsAmbiguousMonomerNotPeptide",
    value: function checkIfNodeIsAmbiguousMonomerNotPeptide(node) {
      return node instanceof AmbiguousMonomerSequenceNode.AmbiguousMonomerSequenceNode && node.monomer.monomerClass !== monomers.MONOMER_CONST.AMINO_ACID;
    }
  }, {
    key: "currentNodeNearBreakingNode",
    get: function get() {
      var _this4 = this;
      return this.chain.subChains.some(function (subChain) {
        if (!_this4.isSubChainNode(_this4.node) || _this4.checkIfNodeIsAmbiguousMonomerPeptide(_this4.node)) return false;
        var nodeIndex = subChain.nodes.indexOf(_this4.node);
        if (nodeIndex === -1) return false;
        return nodeIndex > 0 && subChain.nodes[nodeIndex - 1] instanceof LinkerSequenceNode.LinkerSequenceNode || nodeIndex < subChain.nodes.length - 1 && subChain.nodes[nodeIndex + 1] instanceof LinkerSequenceNode.LinkerSequenceNode || nodeIndex > 0 && _this4.checkIfNodeIsAmbiguousMonomerNotPeptide(subChain.nodes[nodeIndex - 1]) || nodeIndex < subChain.nodes.length - 1 && _this4.checkIfNodeIsAmbiguousMonomerNotPeptide(subChain.nodes[nodeIndex + 1]);
      });
    }
  }, {
    key: "inIgnoreList",
    value: function inIgnoreList(node) {
      return (
        node instanceof LinkerSequenceNode.LinkerSequenceNode ||
        node instanceof EmptySequenceNode.EmptySequenceNode || node instanceof BackBoneSequenceNode.BackBoneSequenceNode ||
        this.checkIfNodeIsAmbiguousMonomerNotPeptide(this.node) ||
        node.monomer instanceof Phosphate.Phosphate ||
        node.monomer instanceof UnresolvedMonomer.UnresolvedMonomer
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
        (_this$selectionRectan2 = this.selectionRectangle) === null || _this$selectionRectan2 === void 0 || _this$selectionRectan2.attr('fill', constants.SELECTION_COLOR).attr('x', -4).attr('y', -16).attr('width', 20).attr('height', 20).attr('class', 'dynamic-element');
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
        (_this$selectionRectan6 = this.selectionRectangle) === null || _this$selectionRectan6 === void 0 || _this$selectionRectan6.attr('fill', this.isSequenceEditInRnaBuilderModeTurnedOn ? '#99D6DC' : constants.SELECTION_COLOR);
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
}(BaseSequenceRenderer.BaseSequenceRenderer);

exports.BaseSequenceItemRenderer = BaseSequenceItemRenderer;
//# sourceMappingURL=BaseSequenceItemRenderer.js.map
