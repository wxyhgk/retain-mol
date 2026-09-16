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
var editorSingleton = require('../../../editor/editorSingleton.js');
var ChainsCollection = require('../../../../domain/entities/monomer-chains/ChainsCollection.js');
var SequenceNodeRendererFactory = require('./SequenceNodeRendererFactory.js');
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
var Sugar = require('../../../../domain/entities/Sugar.js');
require('../../../../domain/entities/RNABase.js');
var Phosphate = require('../../../../domain/entities/Phosphate.js');
require('../../../../domain/entities/Axis.js');
var Nucleoside = require('../../../../domain/entities/Nucleoside.js');
var Nucleotide = require('../../../../domain/entities/Nucleotide.js');
require('../../../../domain/entities/monomer-chains/types.js');
require('../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../domain/entities/MonomerSequenceNode.js');
var EmptySequenceNode = require('../../../../domain/entities/EmptySequenceNode.js');
require('../../../../domain/entities/LinkerSequenceNode.js');
require('../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../domain/entities/UnsplitNucleotide.js');
var PolymerBond = require('../../../../domain/entities/PolymerBond.js');
require('../../../../domain/entities/AmbiguousMonomer.js');
var MonomerToAtomBond = require('../../../../domain/entities/MonomerToAtomBond.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');
require('../../../../domain/entities/SGroupDrawingEntity.js');
var BackBoneSequenceNode = require('../../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
var Command = require('../../../../domain/entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
var SettingsManager = require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');
var PolymerBondSequenceRenderer = require('./PolymerBondSequenceRenderer.js');
var monomers = require('../../../../domain/helpers/monomers.js');
var BackBoneBondSequenceRenderer = require('./BackBoneBondSequenceRenderer.js');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');
var index = require('../../../editor/operations/modes/index.js');
var NewSequenceButton = require('./ui-controls/NewSequenceButton.js');
var _ = require('lodash');
var MonomerToAtomBondSequenceRenderer = require('./MonomerToAtomBondSequenceRenderer.js');
var SequenceViewModel = require('./SequenceViewModel/SequenceViewModel.js');
var SequenceRendererStore = require('./SequenceRendererStore.js');
var SequenceEventDelegationManager = require('./SequenceEventDelegationManager.js');
var Zoom = require('../../../editor/tools/Zoom.js');
var d3 = require('d3');
var constants = require('../../../editor/constants.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var SequenceRenderer = function () {
  function SequenceRenderer() {
    _classCallCheck__default["default"](this, SequenceRenderer);
  }
  _createClass__default["default"](SequenceRenderer, null, [{
    key: "caretPosition",
    get: function get() {
      return this.caretPositionValue;
    },
    set: function set(value) {
      this.caretPositionValue = value;
    }
  }, {
    key: "lastUserDefinedCaretPosition",
    get: function get() {
      return this.lastUserDefinedCaretPositionValue;
    },
    set: function set(value) {
      this.lastUserDefinedCaretPositionValue = value;
    }
  }, {
    key: "chainsCollection",
    get: function get() {
      return this.chainsCollectionValue;
    },
    set: function set(value) {
      this.chainsCollectionValue = value;
    }
  }, {
    key: "lastChainStartPosition",
    get: function get() {
      return this.lastChainStartPositionValue;
    },
    set: function set(value) {
      this.lastChainStartPositionValue = value;
    }
  }, {
    key: "sequenceViewModel",
    get: function get() {
      return SequenceRendererStore.sequenceRendererStore.sequenceViewModel;
    },
    set: function set(value) {
      SequenceRendererStore.sequenceRendererStore.setSequenceViewModel(value);
    }
  }, {
    key: "show",
    value: function show(chainsCollection, chainBeforeNewEmptyChainIndex) {
      this.clear();
      SequenceRenderer.chainsCollection = chainsCollection;
      this.sequenceViewModel = new SequenceViewModel.SequenceViewModel(chainsCollection);
      var newEmptyChain = this.addNewEmptyChainIfNeeded(chainBeforeNewEmptyChainIndex);
      this.removeNewSequenceButtons();
      this.showNodes(SequenceRenderer.sequenceViewModel);
      this.showBonds(SequenceRenderer.chainsCollection);
      this.attachDelegatedEvents();
      if (newEmptyChain) {
        this.setCaretToLastNodeInChain(newEmptyChain);
      }
    }
  }, {
    key: "setCaretToLastNodeInChain",
    value: function setCaretToLastNodeInChain(chain) {
      var emptyChainNodeIndex = this.sequenceViewModel.getNodeIndex(chain.lastNode);
      SequenceRenderer.setCaretPosition(emptyChainNodeIndex);
    }
  }, {
    key: "removeNewSequenceButtons",
    value: function removeNewSequenceButtons() {
      this.newSequenceButtons.forEach(function (newSequenceButton) {
        return newSequenceButton.remove();
      });
      this.newSequenceButtons = [];
    }
  }, {
    key: "addNewEmptyChainIfNeeded",
    value: function addNewEmptyChainIfNeeded(chainBeforeNewEmptyChainIndex) {
      if (this.sequenceViewModel.hasOnlyOneNewChain) {
        return;
      }
      var emptyChainIndex = _.isNumber(chainBeforeNewEmptyChainIndex) ? chainBeforeNewEmptyChainIndex + 1 : undefined;
      if (_.isNumber(emptyChainIndex)) {
        var emptyChain = this.sequenceViewModel.addEmptyChain(emptyChainIndex);
        return emptyChain;
      }
      return undefined;
    }
  }, {
    key: "showNodes",
    value: function showNodes(sequenceViewModel) {
      var _this = this;
      var currentChainStartPosition = new vec2.Vec2(41.5, 41.5);
      var currentMonomerIndexInChain = 0;
      var currentMonomerIndexOverall = 0;
      var hasAntisenseInRow = false;
      var previousRowsWithAntisense = 0;
      var isEditInRnaBuilderMode = editorSingleton.provideEditorInstance().isSequenceEditInRNABuilderMode;
      var handledNodes = new Set();
      sequenceViewModel.chains.forEach(function (chain, chainIndex) {
        currentMonomerIndexInChain = 0;
        chain.forEachRow(function (row) {
          hasAntisenseInRow = false;
          row.sequenceViewModelItems.forEach(function (chainItem) {
            var _node$monomers;
            var node = chainItem.senseNode;
            if (node && handledNodes.has(node)) {
              return;
            }
            var antisenseNodeRenderer;
            if (chainItem.antisenseNode && !handledNodes.has(chainItem.antisenseNode)) {
              var _chainItem$antisenseC, _chainItem$antisenseN, _chainItem$antisenseN2;
              antisenseNodeRenderer = SequenceNodeRendererFactory.SequenceNodeRendererFactory.fromNode(chainItem.antisenseNode, currentChainStartPosition.add(new vec2.Vec2(0, 30)), currentMonomerIndexInChain, chainItem.antisenseNode === chain.lastNode.senseNode, (_chainItem$antisenseC = chainItem.antisenseChain) !== null && _chainItem$antisenseC !== void 0 ? _chainItem$antisenseC : chainItem.chain, currentMonomerIndexOverall, SequenceRenderer.caretPosition, chainItem, (_chainItem$antisenseN = chainItem.antisenseNode) === null || _chainItem$antisenseN === void 0 || (_chainItem$antisenseN = _chainItem$antisenseN.monomer) === null || _chainItem$antisenseN === void 0 ? void 0 : _chainItem$antisenseN.renderer, previousRowsWithAntisense);
              antisenseNodeRenderer.show();
              (_chainItem$antisenseN2 = chainItem.antisenseNode.monomers) === null || _chainItem$antisenseN2 === void 0 || _chainItem$antisenseN2.forEach(function (monomer) {
                return monomer.setRenderer(antisenseNodeRenderer);
              });
              handledNodes.add(chainItem.antisenseNode);
              if (chainItem.antisenseNode instanceof EmptySequenceNode.EmptySequenceNode || chainItem.antisenseNode instanceof BackBoneSequenceNode.BackBoneSequenceNode) {
                chainItem.antisenseNode.setRenderer(antisenseNodeRenderer);
              }
              if (!hasAntisenseInRow) {
                hasAntisenseInRow = true;
              }
            }
            if (!node) {
              return;
            }
            var renderer = SequenceNodeRendererFactory.SequenceNodeRendererFactory.fromNode(node, currentChainStartPosition, currentMonomerIndexInChain, node === chainItem.chain.lastNode, chainItem.chain, currentMonomerIndexOverall, SequenceRenderer.caretPosition, chainItem, node.monomer.renderer, previousRowsWithAntisense);
            renderer.show();
            (_node$monomers = node.monomers) === null || _node$monomers === void 0 || _node$monomers.forEach(function (monomer) {
              return monomer.setRenderer(renderer);
            });
            currentMonomerIndexInChain++;
            currentMonomerIndexOverall++;
            handledNodes.add(node);
            if (antisenseNodeRenderer) {
              renderer.setAntisenseNodeRenderer(antisenseNodeRenderer);
            }
            if (node instanceof EmptySequenceNode.EmptySequenceNode || node instanceof BackBoneSequenceNode.BackBoneSequenceNode) {
              node.setRenderer(renderer);
            }
          });
          if (hasAntisenseInRow) {
            previousRowsWithAntisense++;
          }
        });
        currentChainStartPosition = SequenceRenderer.getNextChainPosition(currentChainStartPosition, chain.length);
        if (!isEditInRnaBuilderMode) {
          var _sequenceViewModel$ch, _sequenceViewModel$ch2;
          _this.showNewSequenceButton(chainIndex, Math.max(chain.lastRow.sequenceViewModelItems.length, (_sequenceViewModel$ch = (_sequenceViewModel$ch2 = sequenceViewModel.chains[chainIndex + 1]) === null || _sequenceViewModel$ch2 === void 0 || (_sequenceViewModel$ch2 = _sequenceViewModel$ch2.firstRow) === null || _sequenceViewModel$ch2 === void 0 ? void 0 : _sequenceViewModel$ch2.sequenceViewModelItems.length) !== null && _sequenceViewModel$ch !== void 0 ? _sequenceViewModel$ch : 0));
        }
      });
      if (this.caretPosition > currentMonomerIndexOverall) {
        this.setCaretPosition(currentMonomerIndexOverall);
      }
      this.lastChainStartPosition = currentChainStartPosition;
    }
  }, {
    key: "getNextChainPosition",
    value: function getNextChainPosition() {
      var currentChainStartPosition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SequenceRenderer.lastChainStartPosition;
      var previousChainLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SequenceRenderer.lastChainLength;
      var lineLength = SettingsManager.SettingsManager.editorLineLength['sequence-layout-mode'];
      return new vec2.Vec2(currentChainStartPosition.x, currentChainStartPosition.y + 80 + 47 * Math.floor((previousChainLength - 1) / lineLength));
    }
  }, {
    key: "showBonds",
    value: function showBonds(chainsCollection) {
      var _this2 = this;
      var handledMonomersToAttachmentPoints = new Map();
      var handledHydrogenBonds = new Set();
      var monomerToChain = chainsCollection.monomerToChain;
      chainsCollection.chains.forEach(function (chain) {
        chain.subChains.forEach(function (subChain) {
          subChain.nodes.forEach(function (node) {
            if (node instanceof EmptySequenceNode.EmptySequenceNode) {
              return;
            }
            node.monomers.forEach(function (monomer) {
              if (!handledMonomersToAttachmentPoints.has(monomer)) {
                handledMonomersToAttachmentPoints.set(monomer, new Set());
              }
              monomer.forEachBond(function (polymerBond, attachmentPointName) {
                if (polymerBond instanceof HydrogenBond.HydrogenBond) {
                  var isBondInOneChain = polymerBond.secondMonomer && monomerToChain.get(polymerBond.firstMonomer) === monomerToChain.get(polymerBond.secondMonomer);
                  if (handledHydrogenBonds.has(polymerBond) || isBondInOneChain) {
                    return;
                  }
                  var _bondRenderer = new PolymerBondSequenceRenderer.PolymerBondSequenceRenderer(polymerBond);
                  _this2.showBondRenderer(_bondRenderer);
                  polymerBond.setRenderer(_bondRenderer);
                  handledHydrogenBonds.add(polymerBond);
                  return;
                }
                var handledAttachmentPoints = handledMonomersToAttachmentPoints.get(monomer);
                if (polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond) {
                  var _bondRenderer2 = new MonomerToAtomBondSequenceRenderer.MonomerToAtomBondSequenceRenderer(polymerBond, node);
                  _this2.showBondRenderer(_bondRenderer2);
                  polymerBond.setRenderer(_bondRenderer2);
                  handledAttachmentPoints.add(attachmentPointName);
                  return;
                }
                if (!subChain.bonds.includes(polymerBond)) {
                  subChain.addBond(polymerBond);
                }
                if (!polymerBond.isSideChainConnection) {
                  polymerBond.setRenderer(new BackBoneBondSequenceRenderer.BackBoneBondSequenceRenderer(polymerBond));
                  return;
                }
                if (handledAttachmentPoints.has(attachmentPointName)) {
                  return;
                }
                var anotherMonomer = polymerBond.getAnotherEntity(monomer);
                if (monomer.renderer && monomer.renderer === anotherMonomer.renderer) {
                  return;
                }
                if (monomer instanceof Sugar.Sugar && monomers.getRnaBaseFromSugar(monomer) === anotherMonomer || anotherMonomer instanceof Sugar.Sugar && monomers.getRnaBaseFromSugar(anotherMonomer) === monomer) {
                  return;
                }
                var bondRenderer;
                var connectedSugarToBase = monomers.getSugarFromRnaBase(anotherMonomer);
                if (monomers.isRnaBaseOrAmbiguousRnaBase(anotherMonomer) && connectedSugarToBase) {
                  bondRenderer = new PolymerBondSequenceRenderer.PolymerBondSequenceRenderer(new PolymerBond.PolymerBond(monomer, connectedSugarToBase));
                } else {
                  bondRenderer = new PolymerBondSequenceRenderer.PolymerBondSequenceRenderer(polymerBond);
                }
                _this2.showBondRenderer(bondRenderer);
                polymerBond.setRenderer(bondRenderer);
                handledAttachmentPoints.add(attachmentPointName);
                if (!handledMonomersToAttachmentPoints.get(anotherMonomer)) {
                  handledMonomersToAttachmentPoints.set(anotherMonomer, new Set());
                }
                var anotherMonomerHandledAttachmentPoints = handledMonomersToAttachmentPoints.get(anotherMonomer);
                anotherMonomerHandledAttachmentPoints.add(anotherMonomer === null || anotherMonomer === void 0 ? void 0 : anotherMonomer.getAttachmentPointByBond(polymerBond));
              });
            });
          });
        });
        if (chain.isCyclic) {
          var _chain$firstMonomer;
          var polymerBond = (_chain$firstMonomer = chain.firstMonomer) === null || _chain$firstMonomer === void 0 ? void 0 : _chain$firstMonomer.attachmentPointsToBonds.R1;
          var bondRenderer = new PolymerBondSequenceRenderer.PolymerBondSequenceRenderer(polymerBond, chain.firstNode, chain.lastNonEmptyNode);
          _this2.showBondRenderer(bondRenderer);
          polymerBond.setRenderer(bondRenderer);
        }
      });
    }
  }, {
    key: "showBondRenderer",
    value: function showBondRenderer(bondRenderer) {
      bondRenderer.show();
      this.sequenceBondRenderers.add(bondRenderer);
    }
  }, {
    key: "isCaretAfterRowEnd",
    get: function get() {
      return this.isCaretAfterRowEndValue;
    },
    set: function set(value) {
      this.isCaretAfterRowEndValue = value;
    }
  }, {
    key: "setCaretPosition",
    value: function setCaretPosition(caretPosition, options) {
      var _options$afterRowEnd, _newActiveTwoStranded;
      this.isCaretAfterRowEnd = (_options$afterRowEnd = options === null || options === void 0 ? void 0 : options.afterRowEnd) !== null && _options$afterRowEnd !== void 0 ? _options$afterRowEnd : false;
      var editor = editorSingleton.provideEditorInstance();
      var oldActiveTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      if (oldActiveTwoStrandedNode) {
        var _oldActiveTwoStranded;
        var _renderer = (_oldActiveTwoStranded = oldActiveTwoStrandedNode.senseNode) === null || _oldActiveTwoStranded === void 0 ? void 0 : _oldActiveTwoStranded.renderer;
        assert.assert(_renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
        var afterRowEnd = this.isCaretAfterRowEnd && this.isCurrentCaretAtLastInFullRow;
        _renderer === null || _renderer === void 0 || _renderer.redrawCaret(caretPosition, afterRowEnd);
        if (_renderer.antisenseNodeRenderer) {
          var _renderer$antisenseNo;
          (_renderer$antisenseNo = _renderer.antisenseNodeRenderer) === null || _renderer$antisenseNo === void 0 || _renderer$antisenseNo.redrawCaret(caretPosition, afterRowEnd);
        }
      }
      SequenceRenderer.caretPosition = caretPosition;
      var newActiveTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      var renderer = newActiveTwoStrandedNode === null || newActiveTwoStrandedNode === void 0 || (_newActiveTwoStranded = newActiveTwoStrandedNode.senseNode) === null || _newActiveTwoStranded === void 0 ? void 0 : _newActiveTwoStranded.renderer;
      if (!newActiveTwoStrandedNode) {
        return;
      }
      assert.assert(renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      if (editor.isSequenceEditMode) {
        var _renderer$antisenseNo2;
        var _afterRowEnd = this.isCaretAfterRowEnd && this.isCurrentCaretAtLastInFullRow;
        renderer === null || renderer === void 0 || renderer.redrawCaret(caretPosition, _afterRowEnd);
        renderer === null || renderer === void 0 || (_renderer$antisenseNo2 = renderer.antisenseNodeRenderer) === null || _renderer$antisenseNo2 === void 0 || _renderer$antisenseNo2.redrawCaret(caretPosition, _afterRowEnd);
      }
      this.sequenceViewModel.forEachNode(function (_ref) {
        var _twoStrandedNode$sens, _twoStrandedNode$anti;
        var twoStrandedNode = _ref.twoStrandedNode;
        var senseRenderer = (_twoStrandedNode$sens = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens === void 0 ? void 0 : _twoStrandedNode$sens.renderer;
        var antisenseRenderer = (_twoStrandedNode$anti = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti === void 0 ? void 0 : _twoStrandedNode$anti.renderer;
        if (senseRenderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) {
          senseRenderer.redrawCounter(caretPosition);
        }
        if (antisenseRenderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) {
          antisenseRenderer.redrawCounter(caretPosition);
        }
      });
    }
  }, {
    key: "rerenderCaret",
    value: function rerenderCaret() {
      this.setCaretPosition(this.caretPosition);
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(forEachCallback) {
      var _this$sequenceViewMod;
      (_this$sequenceViewMod = this.sequenceViewModel) === null || _this$sequenceViewMod === void 0 || _this$sequenceViewMod.forEachNode(forEachCallback);
    }
  }, {
    key: "setCaretPositionBySequenceItemRenderer",
    value: function setCaretPositionBySequenceItemRenderer(sequenceItemRenderer) {
      var newCaretPosition = -1;
      SequenceRenderer.forEachNode(function (_ref2) {
        var _twoStrandedNode$sens2, _twoStrandedNode$anti2;
        var twoStrandedNode = _ref2.twoStrandedNode,
          nodeIndexOverall = _ref2.nodeIndexOverall;
        if (((_twoStrandedNode$sens2 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens2 === void 0 ? void 0 : _twoStrandedNode$sens2.renderer) === sequenceItemRenderer || ((_twoStrandedNode$anti2 = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti2 === void 0 ? void 0 : _twoStrandedNode$anti2.renderer) === sequenceItemRenderer) {
          newCaretPosition = nodeIndexOverall;
        }
      });
      this.setCaretPosition(newCaretPosition);
    }
  }, {
    key: "setCaretPositionByMonomer",
    value: function setCaretPositionByMonomer(monomer) {
      var newCaretPosition = -1;
      SequenceRenderer.forEachNode(function (_ref3) {
        var _twoStrandedNode$sens3, _twoStrandedNode$anti3;
        var twoStrandedNode = _ref3.twoStrandedNode,
          nodeIndexOverall = _ref3.nodeIndexOverall;
        if ((_twoStrandedNode$sens3 = twoStrandedNode.senseNode) !== null && _twoStrandedNode$sens3 !== void 0 && _twoStrandedNode$sens3.monomers.includes(monomer) || (_twoStrandedNode$anti3 = twoStrandedNode.antisenseNode) !== null && _twoStrandedNode$anti3 !== void 0 && _twoStrandedNode$anti3.monomers.includes(monomer)) {
          newCaretPosition = nodeIndexOverall;
        }
      });
      this.setCaretPosition(newCaretPosition);
    }
  }, {
    key: "setCaretPositionNextToMonomer",
    value: function setCaretPositionNextToMonomer(monomer) {
      var newCaretPosition = -1;
      SequenceRenderer.forEachNode(function (_ref4) {
        var _twoStrandedNode$sens4, _twoStrandedNode$anti4;
        var twoStrandedNode = _ref4.twoStrandedNode,
          nodeIndexOverall = _ref4.nodeIndexOverall;
        if ((_twoStrandedNode$sens4 = twoStrandedNode.senseNode) !== null && _twoStrandedNode$sens4 !== void 0 && _twoStrandedNode$sens4.monomers.includes(monomer) || (_twoStrandedNode$anti4 = twoStrandedNode.antisenseNode) !== null && _twoStrandedNode$anti4 !== void 0 && _twoStrandedNode$anti4.monomers.includes(monomer)) {
          newCaretPosition = nodeIndexOverall;
        }
      });
      if (newCaretPosition === -1) {
        return;
      }
      this.setCaretPosition(newCaretPosition + 1);
    }
  }, {
    key: "setCaretPositionByNode",
    value: function setCaretPositionByNode(nodeToCompare) {
      var newCaretPosition = -1;
      SequenceRenderer.forEachNode(function (_ref5) {
        var twoStrandedNode = _ref5.twoStrandedNode,
          nodeIndexOverall = _ref5.nodeIndexOverall;
        if (twoStrandedNode === nodeToCompare) {
          newCaretPosition = nodeIndexOverall;
        }
      });
      this.setCaretPosition(newCaretPosition);
    }
  }, {
    key: "getMonomersByCaretPositionRange",
    value: function getMonomersByCaretPositionRange(startCaretPosition, endCaretPosition) {
      var _this3 = this;
      var monomers = [];
      SequenceRenderer.forEachNode(function (_ref6) {
        var twoStrandedNode = _ref6.twoStrandedNode,
          nodeIndexOverall = _ref6.nodeIndexOverall;
        if (startCaretPosition <= nodeIndexOverall && nodeIndexOverall < (endCaretPosition !== null && endCaretPosition !== void 0 ? endCaretPosition : _this3.caretPosition)) {
          var _twoStrandedNode$sens5, _twoStrandedNode$anti5;
          if ((_twoStrandedNode$sens5 = twoStrandedNode.senseNode) !== null && _twoStrandedNode$sens5 !== void 0 && _twoStrandedNode$sens5.monomer) {
            var _twoStrandedNode$sens6;
            monomers.push((_twoStrandedNode$sens6 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens6 === void 0 ? void 0 : _twoStrandedNode$sens6.monomer);
          }
          if ((_twoStrandedNode$anti5 = twoStrandedNode.antisenseNode) !== null && _twoStrandedNode$anti5 !== void 0 && _twoStrandedNode$anti5.monomer) {
            var _twoStrandedNode$anti6;
            monomers.push((_twoStrandedNode$anti6 = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti6 === void 0 ? void 0 : _twoStrandedNode$anti6.monomer);
          }
        }
      });
      return monomers;
    }
  }, {
    key: "resetLastUserDefinedCaretPosition",
    value: function resetLastUserDefinedCaretPosition() {
      this.lastUserDefinedCaretPosition = this.caretPosition;
    }
  }, {
    key: "nodesGroupedByRows",
    get: function get() {
      var lineLength = SettingsManager.SettingsManager.editorLineLength['sequence-layout-mode'];
      var finalArray = [];
      var chainNodes = [];
      SequenceRenderer.forEachNode(function (_ref7) {
        var twoStrandedNode = _ref7.twoStrandedNode;
        chainNodes.push(twoStrandedNode);
        if (!(twoStrandedNode.senseNode instanceof EmptySequenceNode.EmptySequenceNode)) {
          return;
        }
        if (chainNodes.length > lineLength) {
          while (chainNodes.length > 0) {
            finalArray.push(chainNodes.splice(0, lineLength));
          }
        } else {
          finalArray.push(_toConsumableArray__default["default"](chainNodes));
        }
        chainNodes = [];
      });
      return finalArray;
    }
  }, {
    key: "getNodeIndexInRowByGlobalIndex",
    value: function getNodeIndexInRowByGlobalIndex(nodeIndexOverall) {
      var restNodes = nodeIndexOverall;
      var nodeIndexInRow;
      this.nodesGroupedByRows.forEach(function (row) {
        if (nodeIndexInRow === undefined && restNodes - row.length < 0) {
          nodeIndexInRow = restNodes;
        }
        restNodes -= row.length;
      });
      return nodeIndexInRow;
    }
  }, {
    key: "currentChainRow",
    get: function get() {
      var _this$nodesGroupedByR;
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return [];
      }
      return (_this$nodesGroupedByR = this.nodesGroupedByRows.find(function (idexRow) {
        return idexRow.includes(currentEdittingNode);
      })) !== null && _this$nodesGroupedByR !== void 0 ? _this$nodesGroupedByR : [];
    }
  }, {
    key: "previousRowOfNodes",
    get: function get() {
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return [];
      }
      var index = this.nodesGroupedByRows.findIndex(function (row) {
        return row.includes(currentEdittingNode);
      });
      return index > 0 ? this.nodesGroupedByRows[index - 1] : [];
    }
  }, {
    key: "nextRowOfNodes",
    get: function get() {
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return [];
      }
      var currentIndex = this.nodesGroupedByRows.findIndex(function (row) {
        return row.includes(currentEdittingNode);
      });
      return currentIndex !== -1 && currentIndex + 1 < this.nodesGroupedByRows.length ? this.nodesGroupedByRows[currentIndex + 1] : [];
    }
  }, {
    key: "moveCaretUp",
    value: function moveCaretUp() {
      var _this$getNodeIndexInR;
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return;
      }
      var currentNodeIndexInRow = this.currentChainRow.indexOf(currentEdittingNode);
      var newCaretPosition = this.caretPosition;
      var symbolsBeforeCaretInCurrentRow = currentNodeIndexInRow;
      var lastUserDefinedCursorPositionInRow = (_this$getNodeIndexInR = this.getNodeIndexInRowByGlobalIndex(this.lastUserDefinedCaretPosition)) !== null && _this$getNodeIndexInR !== void 0 ? _this$getNodeIndexInR : 0;
      newCaretPosition -= symbolsBeforeCaretInCurrentRow;
      newCaretPosition -= Math.max(this.previousRowOfNodes.length === 0 ? 0 : 1, this.previousRowOfNodes.length - lastUserDefinedCursorPositionInRow);
      SequenceRenderer.setCaretPosition(newCaretPosition);
    }
  }, {
    key: "moveCaretDown",
    value: function moveCaretDown() {
      var _this$getNodeIndexInR2;
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return;
      }
      var currentNodeIndexInRow = this.currentChainRow.indexOf(currentEdittingNode);
      var newCaretPosition = this.caretPosition;
      var lastUserDefinedCursorPositionInRow = (_this$getNodeIndexInR2 = this.getNodeIndexInRowByGlobalIndex(this.lastUserDefinedCaretPosition)) !== null && _this$getNodeIndexInR2 !== void 0 ? _this$getNodeIndexInR2 : 0;
      var symbolsAfterCaretInCurrentRow = this.currentChainRow.length - currentNodeIndexInRow;
      newCaretPosition += symbolsAfterCaretInCurrentRow;
      newCaretPosition += Math.min(lastUserDefinedCursorPositionInRow, this.nextRowOfNodes.length - 1);
      SequenceRenderer.setCaretPosition(newCaretPosition);
    }
  }, {
    key: "moveCaretForward",
    value: function moveCaretForward() {
      var _this$nextCaretPositi;
      var operation = new index.RestoreSequenceCaretPositionOperation(this.caretPosition, (_this$nextCaretPositi = this.nextCaretPosition) !== null && _this$nextCaretPositi !== void 0 ? _this$nextCaretPositi : this.caretPosition, function (position) {
        return SequenceRenderer.setCaretPosition(position);
      });
      SequenceRenderer.resetLastUserDefinedCaretPosition();
      return operation;
    }
  }, {
    key: "moveCaretBack",
    value: function moveCaretBack() {
      var _this$previousCaretPo;
      var operation = new index.RestoreSequenceCaretPositionOperation(this.caretPosition, (_this$previousCaretPo = this.previousCaretPosition) !== null && _this$previousCaretPo !== void 0 ? _this$previousCaretPo : this.caretPosition, function (position) {
        return SequenceRenderer.setCaretPosition(position);
      });
      SequenceRenderer.resetLastUserDefinedCaretPosition();
      return operation;
    }
  }, {
    key: "redrawCaretOnRenderer",
    value: function redrawCaretOnRenderer(renderer, afterRowEnd) {
      renderer.removeCaret();
      if (afterRowEnd) {
        renderer.showCaretAfterNode();
      } else {
        renderer.showCaret();
      }
    }
  }, {
    key: "redrawCaretOnBothStrands",
    value: function redrawCaretOnBothStrands(node, afterRowEnd) {
      var _node$senseNode;
      this.isCaretAfterRowEnd = afterRowEnd;
      var renderer = (_node$senseNode = node.senseNode) === null || _node$senseNode === void 0 ? void 0 : _node$senseNode.renderer;
      if (!(renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer)) {
        return;
      }
      this.redrawCaretOnRenderer(renderer, afterRowEnd);
      if (renderer.antisenseNodeRenderer) {
        this.redrawCaretOnRenderer(renderer.antisenseNodeRenderer, afterRowEnd);
      }
    }
  }, {
    key: "isCurrentCaretAtLastInFullRow",
    get: function get() {
      var currentNode = this.currentEdittingNode;
      var currentRow = this.currentChainRow;
      var lastNodeInRow = currentRow[currentRow.length - 1];
      return Boolean(currentNode) && currentNode === lastNodeInRow && !((lastNodeInRow === null || lastNodeInRow === void 0 ? void 0 : lastNodeInRow.senseNode) instanceof EmptySequenceNode.EmptySequenceNode);
    }
  }, {
    key: "moveCaretForwardOrToRowEnd",
    value: function moveCaretForwardOrToRowEnd() {
      if (this.isCaretAfterRowEnd) {
        this.isCaretAfterRowEnd = false;
        this.moveCaretForward();
        return;
      }
      if (this.isCurrentCaretAtLastInFullRow) {
        var lastNodeInRow = this.currentChainRow[this.currentChainRow.length - 1];
        if (!lastNodeInRow) {
          return;
        }
        this.redrawCaretOnBothStrands(lastNodeInRow, true);
      } else {
        this.moveCaretForward();
      }
    }
  }, {
    key: "moveCaretBackOrFromRowEnd",
    value: function moveCaretBackOrFromRowEnd() {
      if (this.isCaretAfterRowEnd) {
        var _currentNode = this.currentEdittingNode;
        if (_currentNode) {
          this.redrawCaretOnBothStrands(_currentNode, false);
        }
        return;
      }
      var currentNode = this.currentEdittingNode;
      if (!currentNode) {
        return;
      }
      var currentRow = this.currentChainRow;
      var currentNodeIndexInRow = currentRow.indexOf(currentNode);
      if (currentNodeIndexInRow === 0) {
        this.moveCaretBack();
        if (this.isCurrentCaretAtLastInFullRow) {
          var lastNodeInRow = this.currentChainRow[this.currentChainRow.length - 1];
          if (!lastNodeInRow) {
            return;
          }
          this.redrawCaretOnBothStrands(lastNodeInRow, true);
        }
        return;
      }
      this.moveCaretBack();
    }
  }, {
    key: "moveCaretToRowStart",
    value: function moveCaretToRowStart() {
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return;
      }
      var currentNodeIndexInRow = this.currentChainRow.indexOf(currentEdittingNode);
      SequenceRenderer.setCaretPosition(this.caretPosition - currentNodeIndexInRow);
      SequenceRenderer.resetLastUserDefinedCaretPosition();
    }
  }, {
    key: "moveCaretToRowEnd",
    value: function moveCaretToRowEnd() {
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return;
      }
      var currentRow = this.currentChainRow;
      var currentNodeIndexInRow = currentRow.indexOf(currentEdittingNode);
      var lastNodeInRow = currentRow[currentRow.length - 1];
      if (!lastNodeInRow) {
        return;
      }
      var isPartialRow = lastNodeInRow.senseNode instanceof EmptySequenceNode.EmptySequenceNode;
      var offset = currentRow.length - 1 - currentNodeIndexInRow;
      SequenceRenderer.setCaretPosition(this.caretPosition + offset, {
        afterRowEnd: !isPartialRow
      });
      SequenceRenderer.resetLastUserDefinedCaretPosition();
    }
  }, {
    key: "currentChainIndex",
    get: function get() {
      var _this4 = this;
      var currentChainIndex = -1;
      SequenceRenderer.forEachNode(function (_ref8) {
        var nodeIndexOverall = _ref8.nodeIndexOverall,
          chainIndex = _ref8.chainIndex;
        if (nodeIndexOverall === _this4.caretPosition) {
          currentChainIndex = chainIndex;
        }
      });
      return currentChainIndex;
    }
  }, {
    key: "lastNodeCaretPosition",
    get: function get() {
      if (SequenceRenderer.chainsCollection.chains.length === 0) {
        return undefined;
      }
      var lastNodeIndex = -1;
      SequenceRenderer.forEachNode(function () {
        lastNodeIndex++;
      });
      return lastNodeIndex === -1 ? undefined : lastNodeIndex;
    }
  }, {
    key: "getNodeByPointer",
    value: function getNodeByPointer(sequencePointer) {
      if (sequencePointer === undefined) return undefined;
      var nodeToReturn;
      SequenceRenderer.forEachNode(function (_ref9) {
        var twoStrandedNode = _ref9.twoStrandedNode,
          nodeIndexOverall = _ref9.nodeIndexOverall;
        if (nodeIndexOverall === sequencePointer) {
          nodeToReturn = twoStrandedNode;
        }
      });
      return nodeToReturn;
    }
  }, {
    key: "currentEdittingNode",
    get: function get() {
      return SequenceRenderer.getNodeByPointer(this.caretPosition);
    }
  }, {
    key: "currentChain",
    get: function get() {
      return SequenceRenderer.chainsCollection.chains[SequenceRenderer.currentChainIndex];
    }
  }, {
    key: "previousChain",
    get: function get() {
      return SequenceRenderer.sequenceViewModel.chains[SequenceRenderer.currentChainIndex - 1];
    }
  }, {
    key: "nextChain",
    get: function get() {
      return SequenceRenderer.chainsCollection.chains[SequenceRenderer.currentChainIndex + 1];
    }
  }, {
    key: "getLastNonEmptyNode",
    value: function getLastNonEmptyNode(chain) {
      var subChainBeforeLast = chain.subChains[chain.subChains.length - 2];
      return subChainBeforeLast.nodes[subChainBeforeLast.nodes.length - 1];
    }
  }, {
    key: "getLastNode",
    value: function getLastNode(chain) {
      var lastSubChain = chain.subChains[chain.subChains.length - 1];
      return lastSubChain.nodes[lastSubChain.nodes.length - 1];
    }
  }, {
    key: "nextNode",
    get: function get() {
      return SequenceRenderer.getNodeByPointer(SequenceRenderer.nextCaretPosition);
    }
  }, {
    key: "previousNode",
    get: function get() {
      return SequenceRenderer.getNodeByPointer(SequenceRenderer.previousCaretPosition);
    }
  }, {
    key: "nextNodeInSameChain",
    get: function get() {
      if (SequenceRenderer.nextCaretPosition === SequenceRenderer.caretPosition) {
        return undefined;
      }
      var currentNode = this.currentEdittingNode;
      var nextNodeInSameChain = SequenceRenderer.getNodeByPointer(SequenceRenderer.nextCaretPosition);
      return (nextNodeInSameChain === null || nextNodeInSameChain === void 0 ? void 0 : nextNodeInSameChain.chain) === (currentNode === null || currentNode === void 0 ? void 0 : currentNode.chain) ? nextNodeInSameChain : undefined;
    }
  }, {
    key: "previousNodeInSameChain",
    get: function get() {
      var currentEdittingNode = this.currentEdittingNode;
      if (!currentEdittingNode) {
        return undefined;
      }
      return SequenceRenderer.getPreviousNodeInSameChain(currentEdittingNode);
    }
  }, {
    key: "nextCaretPosition",
    get: function get() {
      var nodeOnNextPosition = SequenceRenderer.getNodeByPointer(this.caretPosition + 1);
      return nodeOnNextPosition ? this.caretPosition + 1 : undefined;
    }
  }, {
    key: "previousCaretPosition",
    get: function get() {
      var nodeOnPreviousPosition = SequenceRenderer.getNodeByPointer(this.caretPosition - 1);
      return nodeOnPreviousPosition ? this.caretPosition - 1 : undefined;
    }
  }, {
    key: "lastChain",
    get: function get() {
      return SequenceRenderer.chainsCollection.chains[SequenceRenderer.chainsCollection.chains.length - 1];
    }
  }, {
    key: "lastChainLength",
    get: function get() {
      return SequenceRenderer.lastChain.length;
    }
  }, {
    key: "startNewSequence",
    value: function startNewSequence(indexOfRowBefore) {
      var editor = editorSingleton.provideEditorInstance();
      var oldNewSequenceChainIndex = SequenceRenderer.sequenceViewModel.chains.findIndex(function (chain) {
        return chain.isNewSequenceChain;
      });
      var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(_toConsumableArray__default["default"](editor.drawingEntitiesManager.monomers.values()));
      chainsCollection.rearrange();
      SequenceRenderer.show(chainsCollection, oldNewSequenceChainIndex !== -1 && _.isNumber(indexOfRowBefore) && indexOfRowBefore > oldNewSequenceChainIndex ? indexOfRowBefore - 1 : indexOfRowBefore);
    }
  }, {
    key: "getPreviousNodeInSameChain",
    value: function getPreviousNodeInSameChain(nodeToCompare) {
      var previousNode;
      var previousNodeChainIndex = -1;
      var nodeToReturn;
      SequenceRenderer.forEachNode(function (_ref0) {
        var twoStrandedNode = _ref0.twoStrandedNode,
          chainIndex = _ref0.chainIndex;
        if (nodeToCompare === twoStrandedNode && chainIndex === previousNodeChainIndex) {
          nodeToReturn = previousNode;
        }
        previousNodeChainIndex = chainIndex;
        previousNode = twoStrandedNode;
      });
      return nodeToReturn;
    }
  }, {
    key: "getNextNodeInSameChain",
    value: function getNextNodeInSameChain(nodeToCompare) {
      var previousNode;
      var previousNodeChainIndex = -1;
      var nodeToReturn;
      SequenceRenderer.forEachNode(function (_ref1) {
        var twoStrandedNode = _ref1.twoStrandedNode,
          chainIndex = _ref1.chainIndex;
        if (nodeToCompare === previousNode && chainIndex === previousNodeChainIndex) {
          nodeToReturn = twoStrandedNode;
        }
        previousNodeChainIndex = chainIndex;
        previousNode = twoStrandedNode;
      });
      return nodeToReturn;
    }
  }, {
    key: "getPreviousNode",
    value: function getPreviousNode(nodeToCompare) {
      var previousNode;
      var nodeToReturn;
      SequenceRenderer.forEachNode(function (_ref10) {
        var twoStrandedNode = _ref10.twoStrandedNode;
        if (nodeToCompare === twoStrandedNode) {
          nodeToReturn = previousNode;
        }
        previousNode = twoStrandedNode;
      });
      return nodeToReturn;
    }
  }, {
    key: "getNextNode",
    value: function getNextNode(nodeToCompare) {
      var previousNode;
      var nodeToReturn;
      SequenceRenderer.forEachNode(function (_ref11) {
        var twoStrandedNode = _ref11.twoStrandedNode;
        if (previousNode === nodeToCompare) {
          nodeToReturn = twoStrandedNode;
        }
        previousNode = twoStrandedNode;
      });
      return nodeToReturn;
    }
  }, {
    key: "shiftArrowSelectionInEditMode",
    value: function shiftArrowSelectionInEditMode(event) {
      var editor = editorSingleton.provideEditorInstance();
      var modelChanges = new Command.Command();
      var arrowKey = event.code;
      if (arrowKey === 'ArrowRight') {
        var currentEdittingNode = this.currentEdittingNode;
        if (!(currentEdittingNode !== null && currentEdittingNode !== void 0 && currentEdittingNode.senseNode)) {
          return;
        }
        modelChanges = SequenceRenderer.getShiftArrowChanges(editor, currentEdittingNode);
        modelChanges.addOperation(this.moveCaretForward());
      } else if (arrowKey === 'ArrowLeft') {
        var previousNodeInSameChain = this.previousNodeInSameChain;
        if (previousNodeInSameChain !== null && previousNodeInSameChain !== void 0 && previousNodeInSameChain.senseNode) {
          modelChanges = SequenceRenderer.getShiftArrowChanges(editor, previousNodeInSameChain);
        } else if (SequenceRenderer.previousChain.lastNode) {
          var previousChainLastEmptyNode = SequenceRenderer.previousChain.lastNode;
          if (previousChainLastEmptyNode.senseNode) {
            var result = editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(previousChainLastEmptyNode.senseNode.monomer);
            modelChanges.merge(result.command);
          }
          if (previousChainLastEmptyNode.antisenseNode) {
            var _result = editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(previousChainLastEmptyNode.antisenseNode.monomer);
            modelChanges.merge(_result.command);
          }
        }
        modelChanges.addOperation(this.moveCaretBack());
      } else if (arrowKey === 'ArrowUp') {
        var previousCaretPosition = SequenceRenderer.caretPosition;
        SequenceRenderer.moveCaretUp();
        var newCaretPosition = SequenceRenderer.caretPosition;
        SequenceRenderer.forEachNode(function (_ref12) {
          var twoStrandedNode = _ref12.twoStrandedNode,
            nodeIndexOverall = _ref12.nodeIndexOverall;
          if (nodeIndexOverall < previousCaretPosition && nodeIndexOverall >= newCaretPosition && twoStrandedNode.senseNode) {
            modelChanges.merge(SequenceRenderer.getShiftArrowChanges(editor, twoStrandedNode));
          }
        });
      } else if (arrowKey === 'ArrowDown') {
        var _previousCaretPosition = SequenceRenderer.caretPosition;
        SequenceRenderer.moveCaretDown();
        var _newCaretPosition = SequenceRenderer.caretPosition;
        SequenceRenderer.forEachNode(function (_ref13) {
          var twoStrandedNode = _ref13.twoStrandedNode,
            nodeIndexOverall = _ref13.nodeIndexOverall;
          if (nodeIndexOverall >= _previousCaretPosition && nodeIndexOverall < _newCaretPosition && twoStrandedNode.senseNode) {
            modelChanges.merge(SequenceRenderer.getShiftArrowChanges(editor, twoStrandedNode));
          }
        });
      }
      editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "getShiftArrowChanges",
    value: function getShiftArrowChanges(editor, twoStrandedNode) {
      var _twoStrandedNode$sens7, _twoStrandedNode$anti7;
      var modelChanges = new Command.Command();
      var senseNodeMonomer = (_twoStrandedNode$sens7 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens7 === void 0 ? void 0 : _twoStrandedNode$sens7.monomer;
      var antiSenseNodeMonomer = (_twoStrandedNode$anti7 = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti7 === void 0 ? void 0 : _twoStrandedNode$anti7.monomer;
      var needTurnOffSelection = senseNodeMonomer === null || senseNodeMonomer === void 0 ? void 0 : senseNodeMonomer.selected;
      if (senseNodeMonomer) {
        var result = editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(senseNodeMonomer);
        if (needTurnOffSelection) {
          modelChanges.merge(editor.drawingEntitiesManager.addDrawingEntitiesToSelection(result.drawingEntities));
        } else {
          modelChanges.merge(result.command);
        }
      }
      if (antiSenseNodeMonomer) {
        var _result2 = editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(antiSenseNodeMonomer);
        if (needTurnOffSelection) {
          modelChanges.merge(editor.drawingEntitiesManager.addDrawingEntitiesToSelection(_result2.drawingEntities));
        } else {
          modelChanges.merge(_result2.command);
        }
      }
      return modelChanges;
    }
  }, {
    key: "unselectEmptyAndBackboneSequenceNodes",
    value: function unselectEmptyAndBackboneSequenceNodes() {
      var command = new Command.Command();
      var editor = editorSingleton.provideEditorInstance();
      SequenceRenderer.forEachNode(function (_ref14) {
        var twoStrandedNode = _ref14.twoStrandedNode;
        if (twoStrandedNode.senseNode instanceof EmptySequenceNode.EmptySequenceNode || twoStrandedNode.senseNode instanceof BackBoneSequenceNode.BackBoneSequenceNode) {
          var _twoStrandedNode$sens8;
          command.merge(editor.drawingEntitiesManager.unselectDrawingEntity(twoStrandedNode.senseNode.monomer));
          (_twoStrandedNode$sens8 = twoStrandedNode.senseNode.renderer) === null || _twoStrandedNode$sens8 === void 0 || _twoStrandedNode$sens8.removeSelection();
        }
        if (twoStrandedNode.antisenseNode instanceof EmptySequenceNode.EmptySequenceNode || twoStrandedNode.antisenseNode instanceof BackBoneSequenceNode.BackBoneSequenceNode) {
          var _twoStrandedNode$anti8;
          command.merge(editor.drawingEntitiesManager.unselectDrawingEntity(twoStrandedNode.antisenseNode.monomer));
          (_twoStrandedNode$anti8 = twoStrandedNode.antisenseNode.renderer) === null || _twoStrandedNode$anti8 === void 0 || _twoStrandedNode$anti8.removeSelection();
        }
      });
      return command;
    }
  }, {
    key: "selections",
    get: function get() {
      var editor = editorSingleton.provideEditorInstance();
      var selections = [];
      var lastSelectionRangeIndex = -1;
      var previousNode;
      SequenceRenderer.forEachNode(function (_ref15) {
        var _twoStrandedNode$sens9;
        var twoStrandedNode = _ref15.twoStrandedNode,
          nodeIndexOverall = _ref15.nodeIndexOverall;
        var nodeToCheck = (_twoStrandedNode$sens9 = twoStrandedNode.senseNode) !== null && _twoStrandedNode$sens9 !== void 0 && _twoStrandedNode$sens9.monomer.selected ? twoStrandedNode.senseNode : twoStrandedNode.antisenseNode;
        if (nodeToCheck !== null && nodeToCheck !== void 0 && nodeToCheck.monomer.selected) {
          var _previousNode;
          var selection = {};
          if (nodeToCheck instanceof Nucleoside.Nucleoside) {
            var nextMonomer = monomers.getNextMonomerInChain(nodeToCheck.sugar);
            selection.isNucleosideConnectedAndSelectedWithPhosphate = nextMonomer instanceof Phosphate.Phosphate && nextMonomer.selected && editor.drawingEntitiesManager.isNucleosideAndPhosphateConnectedAsNucleotide(nodeToCheck, nextMonomer);
          }
          if (nodeToCheck instanceof Nucleotide.Nucleotide || nodeToCheck instanceof Nucleoside.Nucleoside) {
            selection.hasR1Connection = !!nodeToCheck.sugar.attachmentPointsToBonds.R1;
          }
          if (!((_previousNode = previousNode) !== null && _previousNode !== void 0 && _previousNode.monomer.selected)) {
            lastSelectionRangeIndex = selections.push([]) - 1;
          }
          selections[lastSelectionRangeIndex].push(_objectSpread(_objectSpread({}, selection), {}, {
            node: twoStrandedNode,
            nodeIndexOverall: nodeIndexOverall
          }));
        }
        previousNode = nodeToCheck;
      });
      return selections;
    }
  }, {
    key: "getRenderedStructuresBbox",
    value: function getRenderedStructuresBbox() {
      var left;
      var right;
      var top;
      var bottom;
      SequenceRenderer.forEachNode(function (_ref16) {
        var _twoStrandedNode$sens0, _twoStrandedNode$sens1;
        var twoStrandedNode = _ref16.twoStrandedNode;
        assert.assert(((_twoStrandedNode$sens0 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens0 === void 0 ? void 0 : _twoStrandedNode$sens0.monomer.renderer) instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
        var nodePosition = (_twoStrandedNode$sens1 = twoStrandedNode.senseNode.monomer.renderer) === null || _twoStrandedNode$sens1 === void 0 ? void 0 : _twoStrandedNode$sens1.scaledMonomerPositionForSequence;
        left = left ? Math.min(left, nodePosition.x) : nodePosition.x;
        right = right ? Math.max(right, nodePosition.x) : nodePosition.x;
        top = top ? Math.min(top, nodePosition.y) : nodePosition.y;
        bottom = bottom ? Math.max(bottom, nodePosition.y) : nodePosition.y;
      });
      assert.assert(left !== undefined && right !== undefined && top !== undefined && bottom !== undefined, 'Unable to calculate bounding box: no nodes found');
      return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        width: right - left,
        height: bottom - top
      };
    }
  }, {
    key: "getRendererByMonomer",
    value: function getRendererByMonomer(monomer) {
      var rendererToReturn;
      SequenceRenderer.forEachNode(function (_ref17) {
        var _twoStrandedNode$sens10, _twoStrandedNode$anti9;
        var twoStrandedNode = _ref17.twoStrandedNode;
        if ((_twoStrandedNode$sens10 = twoStrandedNode.senseNode) !== null && _twoStrandedNode$sens10 !== void 0 && _twoStrandedNode$sens10.monomers.includes(monomer) || (_twoStrandedNode$anti9 = twoStrandedNode.antisenseNode) !== null && _twoStrandedNode$anti9 !== void 0 && _twoStrandedNode$anti9.monomers.includes(monomer)) {
          var _twoStrandedNode$sens11, _twoStrandedNode$sens12, _twoStrandedNode$anti0;
          var renderer = (_twoStrandedNode$sens11 = (_twoStrandedNode$sens12 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens12 === void 0 ? void 0 : _twoStrandedNode$sens12.renderer) !== null && _twoStrandedNode$sens11 !== void 0 ? _twoStrandedNode$sens11 : (_twoStrandedNode$anti0 = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti0 === void 0 ? void 0 : _twoStrandedNode$anti0.renderer;
          if (renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) {
            rendererToReturn = renderer;
          }
        }
      });
      return rendererToReturn;
    }
  }, {
    key: "showNewSequenceButton",
    value: function showNewSequenceButton(indexOfRowBefore) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var newSequenceButton = new NewSequenceButton.NewSequenceButton(indexOfRowBefore);
      newSequenceButton.show();
      newSequenceButton.setWidth(width);
      this.newSequenceButtons.push(newSequenceButton);
    }
  }, {
    key: "isEmptyCanvas",
    value: function isEmptyCanvas() {
      return SequenceRenderer.sequenceViewModel.hasOnlyOneNewChain;
    }
  }, {
    key: "isCaretAtChainEnd",
    get: function get() {
      var _SequenceRenderer$cur;
      return ((_SequenceRenderer$cur = SequenceRenderer.currentEdittingNode) === null || _SequenceRenderer$cur === void 0 ? void 0 : _SequenceRenderer$cur.senseNode) instanceof EmptySequenceNode.EmptySequenceNode;
    }
  }, {
    key: "clearBondRenderers",
    value: function clearBondRenderers() {
      this.sequenceBondRenderers.forEach(function (bondRenderer) {
        return bondRenderer.remove();
      });
      this.sequenceBondRenderers.clear();
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this$sequenceViewMod2;
      this.clearBondRenderers();
      (_this$sequenceViewMod2 = this.sequenceViewModel) === null || _this$sequenceViewMod2 === void 0 || _this$sequenceViewMod2.forEachNode(function (_ref18) {
        var _twoStrandedNode$sens13, _twoStrandedNode$anti1;
        var twoStrandedNode = _ref18.twoStrandedNode;
        (_twoStrandedNode$sens13 = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens13 === void 0 || (_twoStrandedNode$sens13 = _twoStrandedNode$sens13.renderer) === null || _twoStrandedNode$sens13 === void 0 || _twoStrandedNode$sens13.remove();
        (_twoStrandedNode$anti1 = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti1 === void 0 || (_twoStrandedNode$anti1 = _twoStrandedNode$anti1.renderer) === null || _twoStrandedNode$anti1 === void 0 || _twoStrandedNode$anti1.remove();
      });
      if (this.chainsCollection) {
        var handledBonds = new Set();
        this.chainsCollection.chains.forEach(function (chain) {
          chain.monomers.forEach(function (monomer) {
            monomer.forEachBond(function (bond) {
              if (!handledBonds.has(bond)) {
                var _bond$renderer;
                handledBonds.add(bond);
                (_bond$renderer = bond.renderer) === null || _bond$renderer === void 0 || _bond$renderer.remove();
              }
            });
          });
        });
      }
      this.removeNewSequenceButtons();
      this.removeDelegatedEvents();
    }
  }, {
    key: "attachDelegatedEvents",
    value: function attachDelegatedEvents() {
      var _ZoomTool$instance;
      var canvas = ((_ZoomTool$instance = Zoom.ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvas) || d3.select(constants.drawnStructuresSelector);
      SequenceEventDelegationManager.SequenceEventDelegationManager.instance.attachDelegatedEvents(canvas);
    }
  }, {
    key: "removeDelegatedEvents",
    value: function removeDelegatedEvents() {
      SequenceEventDelegationManager.SequenceEventDelegationManager.instance.removeDelegatedEvents();
    }
  }]);
  return SequenceRenderer;
}();
_defineProperty__default["default"](SequenceRenderer, "caretPositionValue", -1);
_defineProperty__default["default"](SequenceRenderer, "lastUserDefinedCaretPositionValue", 0);
_defineProperty__default["default"](SequenceRenderer, "chainsCollectionValue", void 0);
_defineProperty__default["default"](SequenceRenderer, "lastChainStartPositionValue", void 0);
_defineProperty__default["default"](SequenceRenderer, "newSequenceButtons", []);
_defineProperty__default["default"](SequenceRenderer, "sequenceBondRenderers", new Set());
_defineProperty__default["default"](SequenceRenderer, "isCaretAfterRowEndValue", false);

exports.SequenceRenderer = SequenceRenderer;
//# sourceMappingURL=SequenceRenderer.js.map
