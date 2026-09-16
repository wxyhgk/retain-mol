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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import { EditorHistory } from '../EditorHistory.modern.js';
import { provideEditorInstance } from '../editorSingleton.modern.js';
import { BaseMode } from './BaseMode.modern.js';
import { isTwoStrandedNodeRestrictedForHydrogenBondCreation } from './helpers.modern.js';
import { ZoomTool } from '../tools/Zoom.modern.js';
import { BaseSequenceItemRenderer } from '../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import { SequenceRenderer } from '../../render/renderers/sequence/SequenceRenderer.modern.js';
import { AttachmentPointName } from '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import { Command } from '../../../domain/entities/Command.modern.js';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import { BaseMonomer } from '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import { Sugar } from '../../../domain/entities/Sugar.modern.js';
import { RNABase } from '../../../domain/entities/RNABase.modern.js';
import { Phosphate } from '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import { Nucleoside } from '../../../domain/entities/Nucleoside.modern.js';
import { Nucleotide } from '../../../domain/entities/Nucleotide.modern.js';
import { SequenceType } from '../../../domain/entities/monomer-chains/types.modern.js';
import { Chain } from '../../../domain/entities/monomer-chains/Chain.modern.js';
import { ChainsCollection } from '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import { MonomerSequenceNode } from '../../../domain/entities/MonomerSequenceNode.modern.js';
import { EmptySequenceNode } from '../../../domain/entities/EmptySequenceNode.modern.js';
import { LinkerSequenceNode } from '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import { PolymerBond } from '../../../domain/entities/PolymerBond.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import { MonomerToAtomBond } from '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import { BackBoneSequenceNode } from '../../../domain/entities/BackBoneSequenceNode.modern.js';
import { replaceMonomer } from '../../../domain/entities/DrawingEntitiesManager.replaceMonomer.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import { STRAND_TYPE } from '../../../domain/constants/chains.modern.js';
import { rnaDnaNaturalAnalogues, rnaDnaAmbiguousSymbols, peptideNaturalAnalogues, peptideAmbiguousSymbols, KetMonomerClass, RNA_DNA_NON_MODIFIED_PART } from '../../../domain/constants/monomers.modern.js';
import { BaseRenderer } from '../../render/renderers/BaseRenderer.modern.js';
import { ReinitializeModeOperation, RestoreSequenceCaretPositionOperation } from '../operations/modes/index.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import { getRnaPartLibraryItem, getPeptideLibraryItem, getSugarBySequenceType } from '../../../domain/helpers/rna.modern.js';
import { uniq, isNumber } from 'lodash';
import { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager.modern.js';
import { AmbiguousMonomerSequenceNode } from '../../../domain/entities/AmbiguousMonomerSequenceNode.modern.js';
import { NewSequenceButton } from '../../render/renderers/sequence/ui-controls/NewSequenceButton.modern.js';
import { getNodeFromTwoStrandedNode } from '../../../domain/helpers/chains.modern.js';
import { MACROMOLECULES_BOND_TYPES } from '../tools/types.modern.js';
import '../../formatters/supportedFormatProperties.modern.js';
import '../../formatters/formatProperties.modern.js';
import '../../formatters/structFormatter.types.modern.js';
import '../../formatters/formatterFactory.modern.js';
import '../../formatters/mol2Formatter.modern.js';
import '../../formatters/xyzFormatter.modern.js';
import '../../formatters/qcSchemaFormatter.modern.js';
import '../../formatters/types/ket.modern.js';
import { registerMode } from './modesRegistry.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var naturalAnalogues = uniq([].concat(_toConsumableArray(rnaDnaNaturalAnalogues), _toConsumableArray(rnaDnaAmbiguousSymbols), _toConsumableArray(peptideNaturalAnalogues), _toConsumableArray(peptideAmbiguousSymbols)));
var Direction;
(function (Direction) {
  Direction["Left"] = "left";
  Direction["Right"] = "right";
})(Direction || (Direction = {}));
var SequenceMode = function (_BaseMode) {
  _inherits(SequenceMode, _BaseMode);
  function SequenceMode(previousMode) {
    var _this;
    _classCallCheck(this, SequenceMode);
    _this = _callSuper(this, SequenceMode, ['sequence-layout-mode', previousMode]);
    _defineProperty(_assertThisInitialized(_this), "_isEditMode", false);
    _defineProperty(_assertThisInitialized(_this), "_isEditInRNABuilderMode", false);
    _defineProperty(_assertThisInitialized(_this), "_isAntisenseEditMode", false);
    _defineProperty(_assertThisInitialized(_this), "_isSyncEditMode", true);
    _defineProperty(_assertThisInitialized(_this), "isFirstInit", true);
    _defineProperty(_assertThisInitialized(_this), "selectionStarted", false);
    _defineProperty(_assertThisInitialized(_this), "selectionStartCaretPosition", -1);
    _defineProperty(_assertThisInitialized(_this), "mousemoveCounter", 0);
    return _this;
  }
  _createClass(SequenceMode, [{
    key: "isEditMode",
    get: function get() {
      return this._isEditMode;
    },
    set: function set(isEditMode) {
      this._isEditMode = isEditMode;
    }
  }, {
    key: "isEditInRNABuilderMode",
    get: function get() {
      return this._isEditInRNABuilderMode;
    },
    set: function set(isEditInRNABuilderMode) {
      this._isEditInRNABuilderMode = isEditInRNABuilderMode;
    }
  }, {
    key: "isAntisenseEditMode",
    get: function get() {
      return this._isAntisenseEditMode;
    }
  }, {
    key: "isSyncEditMode",
    get: function get() {
      return this._isSyncEditMode;
    }
  }, {
    key: "needToEditSense",
    get: function get() {
      return this.isSyncEditMode || !this.isAntisenseEditMode;
    }
  }, {
    key: "needToEditAntisense",
    get: function get() {
      return this.isSyncEditMode || this.isAntisenseEditMode;
    }
  }, {
    key: "turnOnAntisenseEditMode",
    value: function turnOnAntisenseEditMode() {
      this._isAntisenseEditMode = true;
      this.initialize(false, false, false);
    }
  }, {
    key: "turnOffAntisenseEditMode",
    value: function turnOffAntisenseEditMode() {
      this._isAntisenseEditMode = false;
      this.initialize(false, false, false);
    }
  }, {
    key: "setAntisenseEditMode",
    value: function setAntisenseEditMode(isAntisenseEditMode) {
      this._isAntisenseEditMode = isAntisenseEditMode;
      this.initialize(false, false, false);
    }
  }, {
    key: "turnOnSyncEditMode",
    value: function turnOnSyncEditMode() {
      this._isSyncEditMode = true;
      this.initialize(false, false, false);
    }
  }, {
    key: "turnOffSyncEditMode",
    value: function turnOffSyncEditMode() {
      this._isSyncEditMode = false;
      this.initialize(false, false, false);
    }
  }, {
    key: "resetEditMode",
    value: function resetEditMode() {
      if (this.isEditMode) this.turnOffEditMode();
      this.turnOffAntisenseEditMode();
      this.turnOffSyncEditMode();
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _chainsCollection$fir;
      var needScroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var needRemoveSelection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var needReArrangeChains = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var forceRecalculateAntisense = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var command = _get(_getPrototypeOf(SequenceMode.prototype), "initialize", this).call(this, needRemoveSelection);
      var editor = provideEditorInstance();
      editor.drawingEntitiesManager.clearCanvas();
      var needRecalculateOldAntisense = !this.isEditMode || forceRecalculateAntisense;
      var modelChanges = needReArrangeChains ? editor.drawingEntitiesManager.applySnakeLayout(true, false, true, needRecalculateOldAntisense, false) : editor.drawingEntitiesManager.recalculateAntisenseChains(needRecalculateOldAntisense);
      var zoom = ZoomTool.instance;
      editor.renderersContainer.update(modelChanges);
      var chainsCollection = editor.drawingEntitiesManager.applyMonomersSequenceLayout();
      var firstMonomerPosition = (_chainsCollection$fir = chainsCollection.firstNode) === null || _chainsCollection$fir === void 0 || (_chainsCollection$fir = _chainsCollection$fir.monomer.renderer) === null || _chainsCollection$fir === void 0 ? void 0 : _chainsCollection$fir.scaledMonomerPositionForSequence;
      if (firstMonomerPosition && needScroll && !this.isFirstInit) {
        zoom.scrollTo(firstMonomerPosition);
      }
      this.isFirstInit = false;
      if (this.isEditMode) {
        var drawnStructuresElement = document.querySelector('.drawn-structures');
        var isScrollToTheBottomNeeded = drawnStructuresElement && drawnStructuresElement.getBoundingClientRect().bottom > window.innerHeight;
        if (isScrollToTheBottomNeeded) {
          zoom.scrollToVerticalBottom();
        }
      }
      modelChanges.merge(command);
      return modelChanges;
    }
  }, {
    key: "turnOnEditMode",
    value: function turnOnEditMode(sequenceItemRenderer) {
      var needToRemoveSelection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var editor = provideEditorInstance();
      if (sequenceItemRenderer) {
        SequenceRenderer.setCaretPositionNextToMonomer(sequenceItemRenderer.node.monomer);
      }
      this.isEditMode = true;
      this.initialize(false, needToRemoveSelection, false);
      editor.events.toggleSequenceEditMode.dispatch(true);
    }
  }, {
    key: "turnOffEditMode",
    value: function turnOffEditMode() {
      if (!this.isEditMode) return;
      var editor = provideEditorInstance();
      this.isEditMode = false;
      this.initialize(false, true, true);
      editor.events.toggleSequenceEditMode.dispatch(false);
    }
  }, {
    key: "turnOnSequenceEditInRNABuilderMode",
    value: function turnOnSequenceEditInRNABuilderMode() {
      var editor = provideEditorInstance();
      this.isEditInRNABuilderMode = true;
      this.initialize(false, false, false);
      editor.events.toggleSequenceEditInRNABuilderMode.dispatch(true);
    }
  }, {
    key: "turnOffSequenceEditInRNABuilderMode",
    value: function turnOffSequenceEditInRNABuilderMode() {
      var editor = provideEditorInstance();
      this.isEditInRNABuilderMode = false;
      this.initialize(false, true, false);
      editor.events.toggleSequenceEditInRNABuilderMode.dispatch(false);
    }
  }, {
    key: "startNewSequence",
    value: function startNewSequence(eventData) {
      var _provideEditorInstanc;
      if ((_provideEditorInstanc = provideEditorInstance()) !== null && _provideEditorInstanc !== void 0 && _provideEditorInstanc.isSequenceEditInRNABuilderMode) {
        return;
      }
      var currentChainIndex = this.isEditMode ? SequenceRenderer.currentChainIndex : SequenceRenderer.sequenceViewModel.chains.length - 1;
      var indexOfRowBefore = isNumber(eventData === null || eventData === void 0 ? void 0 : eventData.indexOfRowBefore) ? eventData === null || eventData === void 0 ? void 0 : eventData.indexOfRowBefore : currentChainIndex;
      if (!this.isEditMode) {
        this.turnOnEditMode();
      }
      SequenceRenderer.startNewSequence(indexOfRowBefore);
      if (SequenceRenderer.caretPosition === -1) {
        SequenceRenderer.setCaretPositionByNode(SequenceRenderer.sequenceViewModel.lastTwoStrandedNode);
      }
    }
  }, {
    key: "modifySequenceInRnaBuilder",
    value: function modifySequenceInRnaBuilder(updatedSelection) {
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var modelChanges = new Command();
      var _iterator = _createForOfIteratorHelper(updatedSelection),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var labeledNucleoelement = _step.value;
          var nodeIndexOverall = labeledNucleoelement.nodeIndexOverall;
          if (nodeIndexOverall === undefined) return;
          var sugarMonomerItem = void 0;
          var baseMonomerItem = void 0;
          var phosphateMonomerItem = void 0;
          if (labeledNucleoelement.sugarLabel) {
            sugarMonomerItem = getRnaPartLibraryItem(editor, labeledNucleoelement.sugarLabel, KetMonomerClass.Sugar);
          }
          if (labeledNucleoelement.baseLabel) {
            var _labeledNucleoelement;
            baseMonomerItem = (_labeledNucleoelement = labeledNucleoelement.rnaBaseMonomerItem) !== null && _labeledNucleoelement !== void 0 ? _labeledNucleoelement : getRnaPartLibraryItem(editor, labeledNucleoelement.baseLabel, KetMonomerClass.Base);
          }
          if (labeledNucleoelement.phosphateLabel) {
            phosphateMonomerItem = getRnaPartLibraryItem(editor, labeledNucleoelement.phosphateLabel, KetMonomerClass.Phosphate);
          }
          var nodeToModify = SequenceRenderer.getNodeByPointer(nodeIndexOverall);
          if ((nodeToModify === null || nodeToModify === void 0 ? void 0 : nodeToModify.senseNode) instanceof Nucleotide || (nodeToModify === null || nodeToModify === void 0 ? void 0 : nodeToModify.senseNode) instanceof Nucleoside) {
            if (nodeToModify.senseNode && sugarMonomerItem) {
              modelChanges.merge(editor.drawingEntitiesManager.modifyMonomerItem(nodeToModify.senseNode.sugar, sugarMonomerItem));
            }
            if (nodeToModify !== null && nodeToModify !== void 0 && nodeToModify.senseNode.rnaBase && baseMonomerItem) {
              if (nodeToModify !== null && nodeToModify !== void 0 && nodeToModify.senseNode.rnaBase.monomerItem.isAmbiguous || baseMonomerItem.isAmbiguous) {
                modelChanges.merge(replaceMonomer(editor.drawingEntitiesManager, nodeToModify === null || nodeToModify === void 0 ? void 0 : nodeToModify.senseNode.rnaBase, baseMonomerItem));
              } else {
                modelChanges.merge(editor.drawingEntitiesManager.modifyMonomerItem(nodeToModify === null || nodeToModify === void 0 ? void 0 : nodeToModify.senseNode.rnaBase, baseMonomerItem));
              }
            }
          }
          if (nodeToModify !== null && nodeToModify !== void 0 && nodeToModify.senseNode && phosphateMonomerItem) {
            if (nodeToModify.senseNode instanceof Nucleotide) {
              modelChanges.merge(editor.drawingEntitiesManager.modifyMonomerItem(nodeToModify.senseNode.phosphate, phosphateMonomerItem));
            } else if (nodeToModify.senseNode instanceof Nucleoside) {
              var sugarR2 = nodeToModify.senseNode.sugar.attachmentPointsToBonds.R2;
              if (sugarR2 instanceof MonomerToAtomBond) {
                return;
              }
              var nextMonomerInSameChain = sugarR2 === null || sugarR2 === void 0 ? void 0 : sugarR2.secondMonomer;
              if (sugarR2) {
                modelChanges.merge(editor.drawingEntitiesManager.deletePolymerBond(sugarR2));
              }
              modelChanges.merge(this.bondNodesThroughNewPhosphate(new Vec2(0, 0), nodeToModify.senseNode.sugar, nextMonomerInSameChain, labeledNucleoelement.phosphateLabel));
            } else if (nodeToModify.senseNode.monomer instanceof Phosphate) {
              modelChanges.merge(editor.drawingEntitiesManager.modifyMonomerItem(nodeToModify.senseNode.monomer, phosphateMonomerItem));
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      history.update(modelChanges);
    }
  }, {
    key: "click",
    value: function click(event) {
      var _event$target;
      if (this.isEditInRNABuilderMode) return;
      var eventData = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.__data__;
      var isClickedOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;
      if (this.isEditMode && isClickedOnSequenceItem) {
        this.unselectAllEntities();
      }
    }
  }, {
    key: "doubleClickOnSequenceItem",
    value: function doubleClickOnSequenceItem(event) {
      var _event$target2;
      if (this.isEditInRNABuilderMode) {
        return;
      }
      var eventData = (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.__data__;
      this.turnOnEditMode(eventData, false);
    }
  }, {
    key: "mousedownBetweenSequenceItems",
    value: function mousedownBetweenSequenceItems(event) {
      var _event$target3;
      if (this.isEditInRNABuilderMode) {
        return;
      }
      var eventData = (_event$target3 = event.target) === null || _event$target3 === void 0 ? void 0 : _event$target3.__data__;
      this.turnOnEditMode(eventData);
      this.setAntisenseEditMode(Boolean(eventData.isAntisenseNode));
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      var _event$target4;
      if (this.isEditInRNABuilderMode) return;
      var eventData = (_event$target4 = event.target) === null || _event$target4 === void 0 ? void 0 : _event$target4.__data__;
      var isClickedOnEmptyPlace = !(eventData instanceof NewSequenceButton || eventData instanceof BaseRenderer);
      var isEventOnSequenceItem = eventData instanceof BaseSequenceItemRenderer;
      if (isClickedOnEmptyPlace) {
        this.turnOffEditMode();
        return;
      }
      if (this.isEditMode && isEventOnSequenceItem && !event.shiftKey) {
        var sequenceItemBoundingBox = eventData.rootBoundingClientRect;
        if (!sequenceItemBoundingBox) {
          var _SequenceRenderer$get;
          sequenceItemBoundingBox = (_SequenceRenderer$get = SequenceRenderer.getRendererByMonomer(eventData.node.monomer)) === null || _SequenceRenderer$get === void 0 ? void 0 : _SequenceRenderer$get.rootBoundingClientRect;
        }
        if (!sequenceItemBoundingBox) {
          return;
        }
        var isRightSideOfSequenceItemClicked = sequenceItemBoundingBox ? event.clientX > sequenceItemBoundingBox.x + sequenceItemBoundingBox.width / 2 : false;
        SequenceRenderer.setCaretPositionByMonomer(eventData.node.monomer);
        if (isRightSideOfSequenceItemClicked) {
          SequenceRenderer.moveCaretForwardOrToRowEnd();
        }
        SequenceRenderer.resetLastUserDefinedCaretPosition();
        this.unselectAllEntities();
        this.selectionStarted = true;
        this.selectionStartCaretPosition = SequenceRenderer.caretPosition;
        this.setAntisenseEditMode(Boolean(eventData.isAntisenseNode));
      }
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      var _event$target5;
      if (this.isEditInRNABuilderMode) return;
      var eventData = (_event$target5 = event.target) === null || _event$target5 === void 0 ? void 0 : _event$target5.__data__;
      if (this.isEditMode && eventData instanceof BaseSequenceItemRenderer && this.selectionStarted && this.mousemoveCounter > 1) {
        var editor = provideEditorInstance();
        SequenceRenderer.setCaretPositionBySequenceItemRenderer(eventData);
        var startCaretPosition = this.selectionStartCaretPosition;
        var endCaretPosition = SequenceRenderer.caretPosition;
        if (this.selectionStartCaretPosition > SequenceRenderer.caretPosition) {
          startCaretPosition = SequenceRenderer.caretPosition;
          endCaretPosition = this.selectionStartCaretPosition;
        } else {
          SequenceRenderer.setCaretPosition(SequenceRenderer.caretPosition + 1);
          endCaretPosition++;
        }
        var monomers = SequenceRenderer.getMonomersByCaretPositionRange(startCaretPosition, endCaretPosition);
        this.unselectAllEntities();
        var _editor$drawingEntiti = editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(monomers),
          modelChanges = _editor$drawingEntiti.command;
        var moveCaretOperation = new RestoreSequenceCaretPositionOperation(this.selectionStartCaretPosition, SequenceRenderer.caretPosition, function (position) {
          return SequenceRenderer.setCaretPosition(position);
        });
        modelChanges.addOperation(moveCaretOperation);
        editor.renderersContainer.update(modelChanges);
      }
      if (this.selectionStarted) {
        this.mousemoveCounter++;
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup() {
      if (this.isEditInRNABuilderMode) return;
      if (this.selectionStarted) {
        this.selectionStarted = false;
      }
      if (this.isEditMode) {
        SequenceRenderer.resetLastUserDefinedCaretPosition();
      }
      this.mousemoveCounter = 0;
    }
  }, {
    key: "bondNodesThroughNewPhosphate",
    value: function bondNodesThroughNewPhosphate(position, previousMonomer, nextMonomer, phosphate) {
      var editor = provideEditorInstance();
      var phosphateLibraryItem = getRnaPartLibraryItem(editor, phosphate !== null && phosphate !== void 0 ? phosphate : RNA_DNA_NON_MODIFIED_PART.PHOSPHATE);
      assert(phosphateLibraryItem);
      var modelChanges = editor.drawingEntitiesManager.addMonomer(phosphateLibraryItem, position);
      var additionalPhosphate = modelChanges.operations[0].monomer;
      modelChanges.merge(this.tryToCreatePolymerBond(previousMonomer, additionalPhosphate));
      if (nextMonomer) {
        modelChanges.merge(this.tryToCreatePolymerBond(additionalPhosphate, nextMonomer));
      }
      return modelChanges;
    }
  }, {
    key: "handlePeptideNodeAddition",
    value: function handlePeptideNodeAddition(enteredSymbol, newNodePosition, nextNodeToConnect, previousNodeToConnect) {
      var modelChanges = new Command();
      var editor = provideEditorInstance();
      var newPeptideLibraryItem = getPeptideLibraryItem(editor, enteredSymbol);
      if (!newPeptideLibraryItem) {
        return undefined;
      }
      var peptideAddCommand = editor.drawingEntitiesManager.addMonomer(newPeptideLibraryItem, newNodePosition);
      var newPeptide = peptideAddCommand.operations[0].monomer;
      var newPeptideNode = newPeptide instanceof AmbiguousMonomer ? new AmbiguousMonomerSequenceNode(newPeptide) : new MonomerSequenceNode(newPeptide);
      modelChanges.merge(peptideAddCommand);
      modelChanges.merge(this.insertNewSequenceFragment(newPeptideNode, nextNodeToConnect instanceof BackBoneSequenceNode ? nextNodeToConnect.secondConnectedNode : nextNodeToConnect, previousNodeToConnect instanceof BackBoneSequenceNode ? previousNodeToConnect.firstConnectedNode : previousNodeToConnect));
      return {
        modelChanges: modelChanges,
        node: newPeptideNode
      };
    }
  }, {
    key: "handleRnaDnaNodeAddition",
    value: function handleRnaDnaNodeAddition(enteredSymbol, newNodePosition, nextNodeToConnect, previousNodeToConnect) {
      var editor = provideEditorInstance();
      var modelChanges = new Command();
      var _ref = nextNodeToConnect instanceof Nucleotide || nextNodeToConnect instanceof Nucleoside || nextNodeToConnect instanceof BackBoneSequenceNode && (nextNodeToConnect.secondConnectedNode instanceof Nucleotide || nextNodeToConnect.secondConnectedNode instanceof Nucleoside) ? Nucleotide.createOnCanvas(enteredSymbol, newNodePosition, getSugarBySequenceType(editor.sequenceTypeEnterMode)) : Nucleoside.createOnCanvas(enteredSymbol, newNodePosition, getSugarBySequenceType(editor.sequenceTypeEnterMode)),
        addedNodeModelChanges = _ref.modelChanges,
        nodeToAdd = _ref.node;
      if (!addedNodeModelChanges || !nodeToAdd) {
        return undefined;
      }
      modelChanges.merge(addedNodeModelChanges);
      modelChanges.merge(this.insertNewSequenceFragment(nodeToAdd, nextNodeToConnect instanceof BackBoneSequenceNode ? nextNodeToConnect.secondConnectedNode : nextNodeToConnect, previousNodeToConnect instanceof BackBoneSequenceNode ? previousNodeToConnect.firstConnectedNode : previousNodeToConnect));
      return {
        modelChanges: modelChanges,
        node: nodeToAdd
      };
    }
  }, {
    key: "connectNodes",
    value: function connectNodes(firstNodeToConnect, secondNodeToConnect, modelChanges, newNodePosition) {
      var _firstNodeToConnect$l, _secondNodeToConnect$;
      var addPhosphateIfNeeded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      if (!firstNodeToConnect || firstNodeToConnect instanceof EmptySequenceNode || !secondNodeToConnect || secondNodeToConnect instanceof EmptySequenceNode) {
        return;
      }
      var editor = provideEditorInstance();
      var nodeR2Bond = (_firstNodeToConnect$l = firstNodeToConnect.lastMonomerInNode.attachmentPointsToBonds) === null || _firstNodeToConnect$l === void 0 ? void 0 : _firstNodeToConnect$l.R2;
      var nextNodeR1Bond = secondNodeToConnect === null || secondNodeToConnect === void 0 || (_secondNodeToConnect$ = secondNodeToConnect.firstMonomerInNode) === null || _secondNodeToConnect$ === void 0 ? void 0 : _secondNodeToConnect$.attachmentPointsToBonds.R1;
      if (nodeR2Bond || nextNodeR1Bond) {
        editor.events.error.dispatch('No available attachment points to establish bonds for merge.');
        return;
      }
      if (addPhosphateIfNeeded && firstNodeToConnect instanceof Nucleoside && (secondNodeToConnect instanceof Nucleotide && !secondNodeToConnect.isFiveEndPhosphate || secondNodeToConnect instanceof Nucleoside || secondNodeToConnect instanceof MonomerSequenceNode && secondNodeToConnect.monomer instanceof Phosphate && secondNodeToConnect.monomer.hydrogenBonds.length)) {
        modelChanges.merge(this.bondNodesThroughNewPhosphate(newNodePosition, firstNodeToConnect.lastMonomerInNode, secondNodeToConnect.firstMonomerInNode));
      } else {
        modelChanges.merge(this.tryToCreatePolymerBond(firstNodeToConnect.lastMonomerInNode, secondNodeToConnect.firstMonomerInNode));
      }
    }
  }, {
    key: "deleteBondToNextNodeInChain",
    value: function deleteBondToNextNodeInChain(node, modelChanges) {
      var editor = provideEditorInstance();
      var nodeR2Bond = node === null || node === void 0 ? void 0 : node.lastMonomerInNode.attachmentPointsToBonds.R2;
      if (!nodeR2Bond || nodeR2Bond instanceof MonomerToAtomBond) {
        return;
      }
      modelChanges.merge(editor.drawingEntitiesManager.deletePolymerBond(nodeR2Bond));
    }
  }, {
    key: "finishNodesDeletion",
    value: function finishNodesDeletion(modelChanges, previousCaretPosition, newCaretPosition) {
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var moveCaretOperation = new RestoreSequenceCaretPositionOperation(previousCaretPosition, isNumber(newCaretPosition) ? newCaretPosition : SequenceRenderer.caretPosition, function (position) {
        return SequenceRenderer.setCaretPosition(position);
      });
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      modelChanges.addOperation(moveCaretOperation);
      history.update(modelChanges);
      this.selectionStartCaretPosition = -1;
      SequenceRenderer.resetLastUserDefinedCaretPosition();
    }
  }, {
    key: "tryToCreatePolymerBond",
    value: function tryToCreatePolymerBond(firstMonomer, secondMonomer) {
      var editor = provideEditorInstance();
      var isConnectionPossible = this.areR1R2Free(secondMonomer, firstMonomer);
      if (!isConnectionPossible) {
        this.showMergeWarningModal();
        return new Command();
      }
      return editor.drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, AttachmentPointName.R2, AttachmentPointName.R1);
    }
  }, {
    key: "splitCurrentChain",
    value: function splitCurrentChain() {
      var modelChanges = new Command();
      var editor = provideEditorInstance();
      var editorHistory = EditorHistory.getInstance(editor);
      var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
      var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      if (this.needToEditSense && previousTwoStrandedNodeInSameChain !== null && previousTwoStrandedNodeInSameChain !== void 0 && previousTwoStrandedNodeInSameChain.senseNode) {
        this.deleteBondToNextNodeInChain(previousTwoStrandedNodeInSameChain.senseNode instanceof BackBoneSequenceNode ? previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode.firstConnectedNode : previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode, modelChanges);
        if ((previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode) instanceof Nucleotide) {
          modelChanges.addOperation(SequenceRenderer.moveCaretForward());
          modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(previousTwoStrandedNodeInSameChain.senseNode.lastMonomerInNode));
        }
      }
      if (this.needToEditAntisense && currentTwoStrandedNode !== null && currentTwoStrandedNode !== void 0 && currentTwoStrandedNode.antisenseNode) {
        this.deleteBondToNextNodeInChain(currentTwoStrandedNode.antisenseNode instanceof BackBoneSequenceNode ? currentTwoStrandedNode.antisenseNode.secondConnectedNode : currentTwoStrandedNode.antisenseNode, modelChanges);
        if ((currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode) instanceof Nucleotide) {
          modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(currentTwoStrandedNode.antisenseNode.lastMonomerInNode));
        }
      }
      modelChanges.addOperation(new ReinitializeModeOperation(true));
      editor.renderersContainer.update(modelChanges);
      editorHistory.update(modelChanges);
    }
  }, {
    key: "handleNodesDeletion",
    value: function handleNodesDeletion(selections, strandType) {
      var _this2 = this;
      var monomersBeingDeleted = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
      var editor = provideEditorInstance();
      var modelChanges = new Command();
      selections.forEach(function (selectionRange) {
        var _ref2, _ref3, _ref4, _ref5;
        var selectionStartTwoStrandedNode = selectionRange[0].node;
        var selectionEndTwoStrandedNode = selectionRange[selectionRange.length - 1].node;
        var selectionStartNode = getNodeFromTwoStrandedNode(selectionStartTwoStrandedNode, strandType);
        var selectionEndNode = getNodeFromTwoStrandedNode(selectionEndTwoStrandedNode, strandType);
        var twoStrandedNodeBeforeSelection = SequenceRenderer.getPreviousNode(selectionStartTwoStrandedNode);
        var twoStrandedNodeAfterSelection = SequenceRenderer.getNextNode(selectionEndTwoStrandedNode);
        var twoStrandedNodeInSameChainBeforeSelection = SequenceRenderer.getPreviousNodeInSameChain(selectionStartTwoStrandedNode);
        var twoStrandedNodeInSameChainAfterSelection = SequenceRenderer.getNextNodeInSameChain(selectionEndTwoStrandedNode);
        var potentialNodeBeforeSelection = (_ref2 = twoStrandedNodeBeforeSelection && getNodeFromTwoStrandedNode(twoStrandedNodeBeforeSelection, strandType)) !== null && _ref2 !== void 0 ? _ref2 : undefined;
        var rawNodeBeforeSelection = potentialNodeBeforeSelection;
        if (potentialNodeBeforeSelection instanceof BackBoneSequenceNode) {
          rawNodeBeforeSelection = strandType === STRAND_TYPE.SENSE ? potentialNodeBeforeSelection.firstConnectedNode : potentialNodeBeforeSelection.secondConnectedNode;
        }
        var nodeBeforeSelection = rawNodeBeforeSelection && monomersBeingDeleted.has(rawNodeBeforeSelection.lastMonomerInNode) ? undefined : rawNodeBeforeSelection;
        var potentialNodeAfterSelection = (_ref3 = twoStrandedNodeAfterSelection && getNodeFromTwoStrandedNode(twoStrandedNodeAfterSelection, strandType)) !== null && _ref3 !== void 0 ? _ref3 : undefined;
        var nodeAfterSelection = potentialNodeAfterSelection;
        if (potentialNodeAfterSelection instanceof BackBoneSequenceNode) {
          nodeAfterSelection = strandType === STRAND_TYPE.SENSE ? potentialNodeAfterSelection.secondConnectedNode : potentialNodeAfterSelection.firstConnectedNode;
        }
        if (nodeAfterSelection && !(nodeAfterSelection instanceof EmptySequenceNode) && !(nodeAfterSelection instanceof BackBoneSequenceNode) && monomersBeingDeleted.has(nodeAfterSelection.firstMonomerInNode)) {
          nodeAfterSelection = undefined;
        }
        var potentialNodeInSameChainBeforeSelection = (_ref4 = twoStrandedNodeInSameChainBeforeSelection && getNodeFromTwoStrandedNode(twoStrandedNodeInSameChainBeforeSelection, strandType)) !== null && _ref4 !== void 0 ? _ref4 : undefined;
        var nodeInSameChainBeforeSelection = potentialNodeInSameChainBeforeSelection;
        if (potentialNodeInSameChainBeforeSelection instanceof BackBoneSequenceNode) {
          nodeInSameChainBeforeSelection = strandType === STRAND_TYPE.SENSE ? potentialNodeInSameChainBeforeSelection.firstConnectedNode : potentialNodeInSameChainBeforeSelection.secondConnectedNode;
        }
        var potentialNodeInSameChainAfterSelection = (_ref5 = twoStrandedNodeInSameChainAfterSelection && getNodeFromTwoStrandedNode(twoStrandedNodeInSameChainAfterSelection, strandType)) !== null && _ref5 !== void 0 ? _ref5 : twoStrandedNodeInSameChainAfterSelection;
        var nodeInSameChainAfterSelection = potentialNodeInSameChainAfterSelection;
        if (potentialNodeInSameChainAfterSelection instanceof BackBoneSequenceNode) {
          nodeInSameChainAfterSelection = potentialNodeInSameChainAfterSelection.secondConnectedNode;
        }
        var previouseNodeInBackbone = strandType === STRAND_TYPE.SENSE ? nodeBeforeSelection : nodeAfterSelection;
        if (strandType === STRAND_TYPE.ANTISENSE && (selectionStartNode instanceof EmptySequenceNode && !(selectionStartTwoStrandedNode.senseNode instanceof BackBoneSequenceNode || selectionStartTwoStrandedNode.senseNode instanceof EmptySequenceNode) || selectionEndNode instanceof EmptySequenceNode && !(selectionEndTwoStrandedNode.senseNode instanceof BackBoneSequenceNode || selectionEndTwoStrandedNode.senseNode instanceof EmptySequenceNode))) {
          return;
        }
        if (selectionStartNode instanceof BackBoneSequenceNode || selectionEndNode instanceof BackBoneSequenceNode) {
          var backBoneSequenceNode = selectionStartNode instanceof BackBoneSequenceNode ? selectionStartNode : selectionEndNode;
          var polymerBondToDelete = backBoneSequenceNode.firstConnectedNode.lastMonomerInNode.attachmentPointsToBonds.R2;
          if (!(polymerBondToDelete instanceof PolymerBond)) {
            return;
          }
          modelChanges.merge(editor.drawingEntitiesManager.deletePolymerBond(polymerBondToDelete));
          if (previouseNodeInBackbone instanceof Nucleotide) {
            modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(previouseNodeInBackbone.lastMonomerInNode));
          }
          return;
        }
        if (!nodeInSameChainBeforeSelection && nodeAfterSelection && selectionStartNode && !(nodeAfterSelection instanceof EmptySequenceNode) && nodeAfterSelection === nodeInSameChainAfterSelection) {
          modelChanges.merge(editor.drawingEntitiesManager.moveMonomer(nodeAfterSelection.monomer, selectionStartNode.monomer.position));
        }
        if (strandType === STRAND_TYPE.SENSE) {
          if (!nodeBeforeSelection || nodeBeforeSelection instanceof EmptySequenceNode) {
            return;
          }
          var sensePhosphateAdditionallyDeleted = nodeBeforeSelection === nodeInSameChainBeforeSelection && nodeBeforeSelection instanceof Nucleotide && selectionStartNode instanceof Nucleoside && (!nodeAfterSelection || nodeAfterSelection instanceof EmptySequenceNode);
          if (sensePhosphateAdditionallyDeleted) {
            modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(nodeBeforeSelection.lastMonomerInNode));
          }
          if (!nodeAfterSelection || nodeAfterSelection instanceof EmptySequenceNode || !_this2.isEditMode && (nodeAfterSelection !== nodeInSameChainAfterSelection || nodeBeforeSelection !== nodeInSameChainBeforeSelection)) {
            return;
          }
          if (nodeBeforeSelection instanceof Nucleoside && (nodeAfterSelection instanceof Nucleotide || nodeAfterSelection instanceof Nucleoside)) {
            modelChanges.merge(_this2.bondNodesThroughNewPhosphate(_this2.getNewSequenceItemPosition(nodeBeforeSelection), nodeBeforeSelection.lastMonomerInNode, nodeAfterSelection.firstMonomerInNode));
          } else if (nodeBeforeSelection && nodeAfterSelection) {
            modelChanges.merge(_this2.tryToCreatePolymerBond(sensePhosphateAdditionallyDeleted ? nodeBeforeSelection.firstMonomerInNode : nodeBeforeSelection.lastMonomerInNode, nodeAfterSelection.firstMonomerInNode));
          }
        } else {
          if (!nodeAfterSelection || nodeAfterSelection instanceof EmptySequenceNode) {
            return;
          }
          var antisensePhosphateAdditionallyDeleted = nodeAfterSelection === nodeInSameChainAfterSelection && nodeAfterSelection instanceof Nucleotide && selectionEndNode instanceof Nucleoside && (!nodeBeforeSelection || nodeBeforeSelection instanceof EmptySequenceNode);
          if (antisensePhosphateAdditionallyDeleted) {
            modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(nodeAfterSelection.lastMonomerInNode));
          }
          if (!nodeBeforeSelection || nodeBeforeSelection instanceof EmptySequenceNode || !_this2.isEditMode && (nodeBeforeSelection !== nodeInSameChainBeforeSelection || nodeAfterSelection !== nodeInSameChainAfterSelection)) {
            return;
          }
          if (nodeAfterSelection instanceof Nucleoside && (nodeBeforeSelection instanceof Nucleotide || nodeBeforeSelection instanceof Nucleoside)) {
            modelChanges.merge(_this2.bondNodesThroughNewPhosphate(_this2.getNewSequenceItemPosition(nodeBeforeSelection), nodeAfterSelection.lastMonomerInNode, nodeBeforeSelection.firstMonomerInNode));
          } else if (nodeBeforeSelection && nodeAfterSelection) {
            modelChanges.merge(_this2.tryToCreatePolymerBond(antisensePhosphateAdditionallyDeleted ? nodeAfterSelection.firstMonomerInNode : nodeAfterSelection.lastMonomerInNode, nodeBeforeSelection.firstMonomerInNode));
          }
        }
      });
      return modelChanges;
    }
  }, {
    key: "isNodeExistAndNonEmpty",
    value: function isNodeExistAndNonEmpty(twoStrandedNode) {
      return twoStrandedNode && !((!twoStrandedNode.senseNode || twoStrandedNode.senseNode instanceof EmptySequenceNode) && (!twoStrandedNode.antisenseNode || twoStrandedNode.antisenseNode instanceof EmptySequenceNode));
    }
  }, {
    key: "keyboardEventHandlers",
    get: function get() {
      var _this3 = this;
      var deleteNode = function deleteNode(direction) {
        if (_this3.isEditInRNABuilderMode) return;
        var editor = provideEditorInstance();
        var nodeToDelete = direction === Direction.Left ? SequenceRenderer.previousNode : SequenceRenderer.getNodeByPointer(SequenceRenderer.caretPosition);
        var caretPosition = direction === Direction.Left ? SequenceRenderer.previousCaretPosition : SequenceRenderer.caretPosition;
        var selections = SequenceRenderer.selections;
        var modelChanges = new Command();
        var nodesToDelete;
        if (selections.length) {
          nodesToDelete = selections;
          var senseNodesToDelete = nodesToDelete.filter(function (selectionRange) {
            return selectionRange.every(function (nodeSelection) {
              var _nodeSelection$node$s;
              return (_nodeSelection$node$s = nodeSelection.node.senseNode) === null || _nodeSelection$node$s === void 0 ? void 0 : _nodeSelection$node$s.monomer.selected;
            });
          });
          var antisenseNodesToDelete = nodesToDelete.filter(function (selectionRange) {
            return selectionRange.every(function (nodeSelection) {
              var _nodeSelection$node$a;
              return (_nodeSelection$node$a = nodeSelection.node.antisenseNode) === null || _nodeSelection$node$a === void 0 ? void 0 : _nodeSelection$node$a.monomer.selected;
            });
          });
          var monomersBeingDeleted = new Set(editor.drawingEntitiesManager.selectedMonomers);
          modelChanges.merge(_this3.deleteSelectedDrawingEntities());
          if (_this3.needToEditSense) {
            modelChanges.merge(_this3.handleNodesDeletion(senseNodesToDelete, STRAND_TYPE.SENSE, monomersBeingDeleted));
          }
          if (_this3.needToEditAntisense) {
            modelChanges.merge(_this3.handleNodesDeletion(antisenseNodesToDelete, STRAND_TYPE.ANTISENSE, monomersBeingDeleted));
          }
        } else if (nodeToDelete) {
          var previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
          nodesToDelete = [[{
            node: nodeToDelete,
            nodeIndexOverall: caretPosition
          }]];
          if (_this3.needToEditSense && nodeToDelete.senseNode) {
            if (!(nodeToDelete.senseNode instanceof BackBoneSequenceNode)) {
              nodeToDelete.senseNode.monomers.forEach(function (monomer) {
                modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
              });
            }
            modelChanges.merge(_this3.handleNodesDeletion(nodesToDelete, STRAND_TYPE.SENSE));
          }
          if (_this3.needToEditAntisense && nodeToDelete.antisenseNode && (
          !(nodeToDelete.antisenseNode instanceof EmptySequenceNode) || !previousNodeInSameChain)) {
            var _nodeToDelete$antisen;
            (_nodeToDelete$antisen = nodeToDelete.antisenseNode) === null || _nodeToDelete$antisen === void 0 || _nodeToDelete$antisen.monomers.forEach(function (monomer) {
              modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
            });
            modelChanges.merge(_this3.handleNodesDeletion(nodesToDelete, STRAND_TYPE.ANTISENSE));
          }
        } else {
          return;
        }
        _this3.finishNodesDeletion(modelChanges, nodesToDelete[0][0].nodeIndexOverall, nodesToDelete[0][0].nodeIndexOverall);
        if (SequenceRenderer.caretPosition === 0 && SequenceRenderer.chainsCollection.chains.length === 0) {
          _this3.startNewSequence();
        }
      };
      return {
        "delete": {
          shortcut: ['Delete'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode && SequenceRenderer.selections.length > 0) {
              _this3.deleteSelection();
            } else {
              deleteNode(Direction.Right);
            }
          }
        },
        backspace: {
          shortcut: ['Backspace'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode && SequenceRenderer.selections.length > 0) {
              _this3.deleteSelection();
            } else {
              deleteNode(Direction.Left);
            }
          }
        },
        'turn-off-edit-mode': {
          shortcut: ['Escape'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (_this3.isEditMode) {
              _this3.turnOffEditMode();
            } else {
              var editor = provideEditorInstance();
              editor.events.selectSelectionTool.dispatch();
            }
          }
        },
        'start-new-sequence': {
          shortcut: ['Enter'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            _this3.unselectAllEntities();
            if (_this3.isNodeExistAndNonEmpty(SequenceRenderer.currentEdittingNode) && _this3.isNodeExistAndNonEmpty(SequenceRenderer.previousNodeInSameChain)) {
              _this3.splitCurrentChain();
            } else {
              if (_this3.isSyncEditMode) {
                _this3.turnOffAntisenseEditMode();
              }
              _this3.startNewSequence();
            }
          }
        },
        'break-editting-chain': {
          shortcut: ['Space'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (_this3.isSyncEditMode) return;
            var modelChanges = new Command();
            var editor = provideEditorInstance();
            var history = EditorHistory.getInstance(editor);
            var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
            var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
            if (_this3.isAntisenseEditMode) {
              _this3.deleteBondToNextNodeInChain(currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode, modelChanges);
            } else {
              _this3.deleteBondToNextNodeInChain(previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode, modelChanges);
            }
            modelChanges.addOperation(new ReinitializeModeOperation(true));
            editor.renderersContainer.update(modelChanges);
            history.update(modelChanges);
          }
        },
        'break-complimentary-chain': {
          shortcut: ['Minus', 'NumpadSubtract'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            var modelChanges = new Command();
            var editor = provideEditorInstance();
            var history = EditorHistory.getInstance(editor);
            var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
            var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
            var hasValidAntisense = function hasValidAntisense(node) {
              return (node === null || node === void 0 ? void 0 : node.antisenseNode) && !(node.antisenseNode instanceof EmptySequenceNode);
            };
            var getNextNodeWithNucleotideSense = function getNextNodeWithNucleotideSense(startNode) {
              var node = startNode;
              while (node) {
                if (node.senseNode instanceof Nucleotide || node.senseNode instanceof Nucleoside) {
                  return node;
                }
                node = SequenceRenderer.getNextNodeInSameChain(node);
              }
              return undefined;
            };
            var nextNucleotideFromCurrent = getNextNodeWithNucleotideSense(currentTwoStrandedNode);
            if (hasValidAntisense(previousTwoStrandedNodeInSameChain) && !hasValidAntisense(currentTwoStrandedNode) && nextNucleotideFromCurrent !== undefined && !hasValidAntisense(nextNucleotideFromCurrent)) {
              var nextNodeWithAntisense = currentTwoStrandedNode ? SequenceRenderer.getNextNodeInSameChain(currentTwoStrandedNode) : undefined;
              while (nextNodeWithAntisense && !hasValidAntisense(nextNodeWithAntisense)) {
                nextNodeWithAntisense = SequenceRenderer.getNextNodeInSameChain(nextNodeWithAntisense);
              }
              if (!nextNodeWithAntisense) return;
              var newNodePosition = _this3.getNewNodePosition();
              _this3.connectNodes(nextNodeWithAntisense.antisenseNode, previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode, modelChanges, newNodePosition);
              modelChanges.addOperation(new ReinitializeModeOperation(true));
              editor.renderersContainer.update(modelChanges);
              history.update(modelChanges);
              return;
            }
            if (_this3.isAntisenseEditMode && previousTwoStrandedNodeInSameChain !== null && previousTwoStrandedNodeInSameChain !== void 0 && previousTwoStrandedNodeInSameChain.senseNode && !(previousTwoStrandedNodeInSameChain.senseNode instanceof EmptySequenceNode) && hasValidAntisense(previousTwoStrandedNodeInSameChain) && !((currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode) instanceof BackBoneSequenceNode)) {
              _this3.deleteBondToNextNodeInChain(previousTwoStrandedNodeInSameChain.senseNode, modelChanges);
              modelChanges.addOperation(new ReinitializeModeOperation(true));
              editor.renderersContainer.update(modelChanges);
              history.update(modelChanges);
              return;
            }
            if (!(currentTwoStrandedNode !== null && currentTwoStrandedNode !== void 0 && currentTwoStrandedNode.senseNode) || !(currentTwoStrandedNode !== null && currentTwoStrandedNode !== void 0 && currentTwoStrandedNode.antisenseNode) || !(previousTwoStrandedNodeInSameChain !== null && previousTwoStrandedNodeInSameChain !== void 0 && previousTwoStrandedNodeInSameChain.senseNode) || !(previousTwoStrandedNodeInSameChain !== null && previousTwoStrandedNodeInSameChain !== void 0 && previousTwoStrandedNodeInSameChain.antisenseNode) || (currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode) instanceof EmptySequenceNode || (currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode) instanceof EmptySequenceNode || (previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode) instanceof EmptySequenceNode || (previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode) instanceof EmptySequenceNode) {
              return;
            }
            if (currentTwoStrandedNode !== null && currentTwoStrandedNode !== void 0 && currentTwoStrandedNode.antisenseNode) {
              _this3.deleteBondToNextNodeInChain(currentTwoStrandedNode.antisenseNode, modelChanges);
            }
            modelChanges.addOperation(new ReinitializeModeOperation(true));
            editor.renderersContainer.update(modelChanges);
            history.update(modelChanges);
          }
        },
        'move-caret-up': {
          shortcut: ['ArrowUp'],
          handler: function handler() {
            var _SequenceRenderer$cur;
            if (_this3.isEditInRNABuilderMode) return;
            var currentEdittingNode = SequenceRenderer.currentEdittingNode;
            if (_this3.isAntisenseEditMode && Boolean(currentEdittingNode === null || currentEdittingNode === void 0 ? void 0 : currentEdittingNode.antisenseNode)) {
              _this3.turnOffAntisenseEditMode();
              return;
            }
            SequenceRenderer.moveCaretUp();
            if ((_SequenceRenderer$cur = SequenceRenderer.currentEdittingNode) !== null && _SequenceRenderer$cur !== void 0 && _SequenceRenderer$cur.antisenseNode) {
              _this3.turnOnAntisenseEditMode();
            }
            _this3.unselectAllEntities();
          }
        },
        'move-caret-down': {
          shortcut: ['ArrowDown'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            var currentEdittingNode = SequenceRenderer.currentEdittingNode;
            if (!_this3.isAntisenseEditMode && Boolean(currentEdittingNode === null || currentEdittingNode === void 0 ? void 0 : currentEdittingNode.antisenseNode)) {
              _this3.turnOnAntisenseEditMode();
              return;
            }
            SequenceRenderer.moveCaretDown();
            _this3.turnOffAntisenseEditMode();
            _this3.unselectAllEntities();
          }
        },
        'move-caret-forward': {
          shortcut: ['ArrowRight'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode) return;
            SequenceRenderer.moveCaretForwardOrToRowEnd();
            SequenceRenderer.resetLastUserDefinedCaretPosition();
            _this3.unselectAllEntities();
          }
        },
        'move-caret-back': {
          shortcut: ['ArrowLeft'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode) return;
            SequenceRenderer.moveCaretBackOrFromRowEnd();
            SequenceRenderer.resetLastUserDefinedCaretPosition();
            _this3.unselectAllEntities();
          }
        },
        'move-caret-to-row-start': {
          shortcut: ['Home'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode) return;
            SequenceRenderer.moveCaretToRowStart();
            _this3.unselectAllEntities();
          }
        },
        'move-caret-to-row-end': {
          shortcut: ['End'],
          handler: function handler() {
            if (_this3.isEditInRNABuilderMode) return;
            if (!_this3.isEditMode) return;
            SequenceRenderer.moveCaretToRowEnd();
            _this3.unselectAllEntities();
          }
        },
        'add-sequence-item': {
          shortcut: [].concat(_toConsumableArray(naturalAnalogues), _toConsumableArray(naturalAnalogues.map(function (naturalAnalogue) {
            return naturalAnalogue.toLowerCase();
          }))),
          handler: function handler(event) {
            var _ref6, _previousTwoStrandedN2, _currentTwoStrandedNo, _previousTwoStrandedN3, _currentTwoStrandedNo2;
            if (_this3.isEditInRNABuilderMode) return;
            if (SequenceRenderer.isEmptyCanvas() && !_this3.isEditMode) {
              _this3.turnOnEditMode();
              SequenceRenderer.setCaretPosition(0);
            }
            if (!_this3.isEditMode) {
              return;
            }
            var selectionsBeforeDeletion = SequenceRenderer.selections;
            var isWholeChainSelected = selectionsBeforeDeletion.length > 0 && selectionsBeforeDeletion.every(function (selectionRange) {
              var _selectionRange$, _selectionRange;
              var firstNode = (_selectionRange$ = selectionRange[0]) === null || _selectionRange$ === void 0 ? void 0 : _selectionRange$.node;
              var lastNode = (_selectionRange = selectionRange[selectionRange.length - 1]) === null || _selectionRange === void 0 ? void 0 : _selectionRange.node;
              var prevInSameChain = firstNode ? SequenceRenderer.getPreviousNodeInSameChain(firstNode) : null;
              var nextInSameChain = lastNode ? SequenceRenderer.getNextNodeInSameChain(lastNode) : null;
              return !prevInSameChain && (!nextInSameChain || nextInSameChain.senseNode instanceof EmptySequenceNode);
            });
            if (!_this3.deleteSelection()) {
              return;
            }
            var enteredSymbol = event.code.replace('Key', '');
            var editor = provideEditorInstance();
            var history = EditorHistory.getInstance(editor);
            var modelChanges = new Command();
            var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
            var previousTwoStrandedNodeInSameChain = (_ref6 = currentTwoStrandedNode && SequenceRenderer.getPreviousNodeInSameChain(currentTwoStrandedNode)) !== null && _ref6 !== void 0 ? _ref6 : undefined;
            var insertAsStandaloneChain = isWholeChainSelected && !previousTwoStrandedNodeInSameChain;
            var senseNodeToConnect = insertAsStandaloneChain ? null : currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode;
            var isDnaEnteringMode = editor.sequenceTypeEnterMode === SequenceType.DNA;
            var isRnaEnteringMode = editor.sequenceTypeEnterMode === SequenceType.RNA;
            var isEnteringSymbolP = enteredSymbol.toUpperCase() === 'P';
            if (_this3.needToEditSense) {
              var insertNewSequenceItemResult = _this3.insertNewSequenceItem(editor, _this3.isAntisenseEditMode && !isEnteringSymbolP ? DrawingEntitiesManager.getAntisenseBaseLabel(enteredSymbol, isDnaEnteringMode) : enteredSymbol, senseNodeToConnect, previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode);
              if (!insertNewSequenceItemResult) {
                return;
              }
              modelChanges.merge(insertNewSequenceItemResult.modelChanges);
              senseNodeToConnect = insertNewSequenceItemResult.node;
            }
            var prevSense = previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode;
            var prevAntisense = previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode;
            var currSense = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode;
            var currAntisense = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode;
            var prevHasRealSenseAndAntisense = !!prevSense && !(prevSense instanceof EmptySequenceNode) && !!prevAntisense;
            var currHasAntisenseWithNonEmptyContent = !!currAntisense && (!(currSense instanceof EmptySequenceNode) || !(currAntisense instanceof EmptySequenceNode));
            var shouldEditAntisenseInSyncMode = prevHasRealSenseAndAntisense || currHasAntisenseWithNonEmptyContent;
            var shouldEditAntisenseInAsyncMode = !(prevAntisense instanceof EmptySequenceNode) || !(currAntisense instanceof EmptySequenceNode);
            if (_this3.needToEditAntisense && (_this3.isSyncEditMode ? shouldEditAntisenseInSyncMode : shouldEditAntisenseInAsyncMode)) {
              var _previousTwoStrandedN;
              var antisenseNodeCreationResult = _this3.insertNewSequenceItem(editor, _this3.isAntisenseEditMode || editor.sequenceTypeEnterMode !== SequenceType.DNA && editor.sequenceTypeEnterMode !== SequenceType.RNA || isEnteringSymbolP ? enteredSymbol : DrawingEntitiesManager.getAntisenseBaseLabel(enteredSymbol, isDnaEnteringMode), (_previousTwoStrandedN = previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode) !== null && _previousTwoStrandedN !== void 0 ? _previousTwoStrandedN : null, insertAsStandaloneChain ? undefined : currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode);
              if (antisenseNodeCreationResult) {
                modelChanges.merge(antisenseNodeCreationResult.modelChanges);
              }
              if (_this3.isSyncEditMode && antisenseNodeCreationResult && senseNodeToConnect && (senseNodeToConnect instanceof Nucleotide || senseNodeToConnect instanceof Nucleoside)) {
                var _senseNodeToConnect, _antisenseNodeCreatio;
                modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond((_senseNodeToConnect = senseNodeToConnect) === null || _senseNodeToConnect === void 0 ? void 0 : _senseNodeToConnect.rnaBase, antisenseNodeCreationResult.node instanceof Nucleotide || antisenseNodeCreationResult.node instanceof Nucleoside ? (_antisenseNodeCreatio = antisenseNodeCreationResult.node) === null || _antisenseNodeCreatio === void 0 ? void 0 : _antisenseNodeCreatio.rnaBase : antisenseNodeCreationResult.node.monomer, AttachmentPointName.HYDROGEN, AttachmentPointName.HYDROGEN, MACROMOLECULES_BOND_TYPES.HYDROGEN));
              }
            }
            modelChanges.addOperation(new ReinitializeModeOperation());
            editor.renderersContainer.update(modelChanges);
            if (
            !(isDnaEnteringMode || isRnaEnteringMode) || !(isEnteringSymbolP && (_this3.needToEditSense ? LinkerSequenceNode.isPartOfLinker(previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 || (_previousTwoStrandedN2 = previousTwoStrandedNodeInSameChain.senseNode) === null || _previousTwoStrandedN2 === void 0 ? void 0 : _previousTwoStrandedN2.monomer) || LinkerSequenceNode.isPartOfLinker(currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 || (_currentTwoStrandedNo = currentTwoStrandedNode.senseNode) === null || _currentTwoStrandedNo === void 0 ? void 0 : _currentTwoStrandedNo.monomer) : LinkerSequenceNode.isPartOfLinker(previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 || (_previousTwoStrandedN3 = previousTwoStrandedNodeInSameChain.antisenseNode) === null || _previousTwoStrandedN3 === void 0 ? void 0 : _previousTwoStrandedN3.monomer) || LinkerSequenceNode.isPartOfLinker(currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 || (_currentTwoStrandedNo2 = currentTwoStrandedNode.antisenseNode) === null || _currentTwoStrandedNo2 === void 0 ? void 0 : _currentTwoStrandedNo2.monomer)))) {
              modelChanges.addOperation(SequenceRenderer.moveCaretForward());
            }
            history.update(modelChanges, selectionsBeforeDeletion.length > 0);
          }
        },
        'sequence-edit-select': {
          shortcut: ['Shift+ArrowLeft', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowDown'],
          handler: function handler(event) {
            if (_this3.isEditInRNABuilderMode) return;
            var arrowKey = event.key;
            if (SequenceRenderer.caretPosition === 0 && arrowKey === 'ArrowLeft') {
              return;
            }
            _this3.selectionStartCaretPosition = _this3.selectionStartCaretPosition !== -1 ? _this3.selectionStartCaretPosition : SequenceRenderer.caretPosition;
            SequenceRenderer.shiftArrowSelectionInEditMode(event);
            if (arrowKey === 'ArrowLeft' || arrowKey === 'ArrowRight') {
              SequenceRenderer.resetLastUserDefinedCaretPosition();
            }
          }
        }
      };
    }
  }, {
    key: "deleteSelection",
    value: function deleteSelection() {
      var editor = provideEditorInstance();
      var selections = SequenceRenderer.selections;
      if (selections.length > 0) {
        var monomersBeingDeleted = new Set(editor.drawingEntitiesManager.selectedMonomers);
        var deletionModelChanges = this.deleteSelectedDrawingEntities();
        deletionModelChanges.merge(this.handleNodesDeletion(selections, STRAND_TYPE.SENSE, monomersBeingDeleted));
        deletionModelChanges.merge(this.handleNodesDeletion(selections, STRAND_TYPE.ANTISENSE, monomersBeingDeleted));
        this.finishNodesDeletion(deletionModelChanges, SequenceRenderer.caretPosition, selections[0][0].nodeIndexOverall);
      }
      return true;
    }
  }, {
    key: "isPasteAllowedByMode",
    value: function isPasteAllowedByMode(drawingEntitiesManager) {
      var editor = provideEditorInstance();
      var chainsCollection = ChainsCollection.fromMonomers(_toConsumableArray(drawingEntitiesManager.monomers.values()));
      if (!this.isEditMode) {
        return true;
      }
      if (chainsCollection.chains.length > 1) {
        editor.events.error.dispatch('Paste of several fragments is prohibited in text-editing mode.');
        return false;
      }
      if (chainsCollection.chains.length === 0) {
        editor.events.error.dispatch('No copied fragments.');
        return false;
      }
      return this.deleteSelection();
    }
  }, {
    key: "isR1Free",
    value: function isR1Free(entity) {
      var _entity$firstMonomerI;
      if (entity instanceof BaseMonomer) {
        return entity.attachmentPointsToBonds.R1 === null;
      }
      return (entity === null || entity === void 0 || (_entity$firstMonomerI = entity.firstMonomerInNode) === null || _entity$firstMonomerI === void 0 || (_entity$firstMonomerI = _entity$firstMonomerI.attachmentPointsToBonds) === null || _entity$firstMonomerI === void 0 ? void 0 : _entity$firstMonomerI.R1) === null;
    }
  }, {
    key: "isR2Free",
    value: function isR2Free(entity) {
      var _entity$lastMonomerIn;
      if (entity instanceof BaseMonomer) {
        return entity.attachmentPointsToBonds.R2 === null;
      }
      return (entity === null || entity === void 0 || (_entity$lastMonomerIn = entity.lastMonomerInNode) === null || _entity$lastMonomerIn === void 0 || (_entity$lastMonomerIn = _entity$lastMonomerIn.attachmentPointsToBonds) === null || _entity$lastMonomerIn === void 0 ? void 0 : _entity$lastMonomerIn.R2) === null;
    }
  }, {
    key: "areR1R2Free",
    value: function areR1R2Free(firstEntity, lastEntity) {
      return this.isR1Free(firstEntity) && this.isR2Free(lastEntity);
    }
  }, {
    key: "isConnectionPossible",
    value: function isConnectionPossible(firstMonomer, firstMonomerAttachmentPoint, secondMonomer, secondMonomerAttachmentPoint) {
      return firstMonomer.attachmentPointsToBonds[firstMonomerAttachmentPoint] === null && secondMonomer.attachmentPointsToBonds[secondMonomerAttachmentPoint] === null;
    }
  }, {
    key: "isPasteAvailable",
    value: function isPasteAvailable(drawingEntitiesManager) {
      if (!this.isEditMode) {
        return true;
      }
      var chainsCollection = ChainsCollection.fromMonomers(_toConsumableArray(drawingEntitiesManager.monomers.values()));
      var currentNode = SequenceRenderer.currentEdittingNode;
      var previousNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
      var lastNodeOfNewFragment = chainsCollection.lastNode;
      var firstNodeOfNewFragment = chainsCollection.firstNode;
      var isPasteInEnd = (currentNode === null || currentNode === void 0 ? void 0 : currentNode.senseNode) instanceof EmptySequenceNode || !currentNode;
      var isPasteInStart = !previousNodeInSameChain;
      if (isPasteInEnd && !previousNodeInSameChain) return true;
      if (isPasteInEnd) {
        return this.isR1Free(firstNodeOfNewFragment) && this.isR2Free(previousNodeInSameChain === null || previousNodeInSameChain === void 0 ? void 0 : previousNodeInSameChain.senseNode);
      }
      if (isPasteInStart) {
        return this.isR2Free(lastNodeOfNewFragment) && this.isR1Free(currentNode === null || currentNode === void 0 ? void 0 : currentNode.senseNode);
      }
      return this.areR1R2Free(firstNodeOfNewFragment, lastNodeOfNewFragment);
    }
  }, {
    key: "applyAdditionalPasteOperations",
    value: function applyAdditionalPasteOperations(drawingEntitiesManager) {
      var _currentSequence$last, _chainsCollection$las;
      if (!this.isEditMode) {
        var command = new Command();
        command.addOperation(new ReinitializeModeOperation());
        return command;
      }
      var chainsCollection = ChainsCollection.fromMonomers(_toConsumableArray(drawingEntitiesManager.monomers.values()));
      var currentSequence = SequenceRenderer.currentChain;
      var currentSequenceHasPhosphate = currentSequence === null || currentSequence === void 0 || (_currentSequence$last = currentSequence.lastNonEmptyNode) === null || _currentSequence$last === void 0 || (_currentSequence$last = _currentSequence$last.monomer) === null || _currentSequence$last === void 0 ? void 0 : _currentSequence$last.isPhosphate;
      var nextCaretPosition = SequenceRenderer.caretPosition + chainsCollection.length;
      if (currentSequenceHasPhosphate) {
        nextCaretPosition -= 1;
      }
      var hasPhosphateAtChainEnd = chainsCollection === null || chainsCollection === void 0 || (_chainsCollection$las = chainsCollection.lastNode) === null || _chainsCollection$las === void 0 || (_chainsCollection$las = _chainsCollection$las.monomer) === null || _chainsCollection$las === void 0 ? void 0 : _chainsCollection$las.isPhosphate;
      if (!SequenceRenderer.isCaretAtChainEnd && hasPhosphateAtChainEnd) {
        nextCaretPosition -= 1;
      }
      var modelChanges = this.insertNewSequenceFragment(chainsCollection);
      modelChanges.addOperation(new ReinitializeModeOperation());
      modelChanges.addOperation(new RestoreSequenceCaretPositionOperation(SequenceRenderer.caretPosition, nextCaretPosition, function (position) {
        return SequenceRenderer.setCaretPosition(position);
      }));
      return modelChanges;
    }
  }, {
    key: "preserveSideChainConnections",
    value: function preserveSideChainConnections(selectedNode) {
      var allMonomers = selectedNode.monomers;
      var hasAnySideConnection = allMonomers.some(function (monomer) {
        return monomer.sideConnections.length > 0;
      });
      if (!hasAnySideConnection) {
        return null;
      }
      var sideConnectionsData = [];
      allMonomers.forEach(function (monomer) {
        Object.entries(monomer.attachmentPointsToBonds).forEach(function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2),
            key = _ref8[0],
            bond = _ref8[1];
          if (!bond || bond instanceof MonomerToAtomBond || !bond.isSideChainConnection) {
            return;
          }
          var secondMonomer = bond.getAnotherMonomer(monomer);
          if (!(secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.attachmentPointsToBonds)) {
            return;
          }
          var secondMonomerBondData = Object.entries(secondMonomer.attachmentPointsToBonds).find(function (_ref9) {
            var _ref0 = _slicedToArray(_ref9, 2),
              value = _ref0[1];
            return value === bond;
          });
          if (!secondMonomerBondData) {
            return;
          }
          var _secondMonomerBondDat = _slicedToArray(secondMonomerBondData, 1),
            secondMonomerAttachmentPointName = _secondMonomerBondDat[0];
          sideConnectionsData.push({
            sourceMonomer: monomer,
            firstMonomerAttachmentPointName: key,
            secondMonomer: secondMonomer,
            secondMonomerAttachmentPointName: secondMonomerAttachmentPointName
          });
        });
      });
      return sideConnectionsData;
    }
  }, {
    key: "replaceSelectionWithMonomer",
    value: function replaceSelectionWithMonomer(monomerItem, selectedNode, selectedTwoStrandedNode, modelChanges, previousSelectionNode) {
      var _nextNode$senseNode,
        _this4 = this;
      var editor = provideEditorInstance();
      var nextNode = SequenceRenderer.getNextNodeInSameChain(selectedTwoStrandedNode);
      var position = selectedNode.monomer.position;
      var sideChainConnections = this.preserveSideChainConnections(selectedNode);
      var preservedHydrodenBonds = selectedNode.monomers.reduce(function (acc, monomer) {
        return acc.concat(monomer.hydrogenBonds.map(function (hydrodenBond) {
          return {
            toMonomer: hydrodenBond.getAnotherMonomer(monomer),
            fromMonomer: monomer
          };
        }));
      }, []);
      var hasPreviousNodeInChain = selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1;
      var hasNextNodeInChain = selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2;
      selectedNode.monomers.forEach(function (monomer) {
        modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
        monomer.forEachBond(function (polymerBond) {
          modelChanges.merge(editor.drawingEntitiesManager.deleteDrawingEntity(polymerBond));
        });
      });
      var monomerAddCommand = editor.drawingEntitiesManager.addMonomer(monomerItem, position);
      var newMonomer = monomerAddCommand.operations[0].monomer;
      var newMonomerSequenceNode = new MonomerSequenceNode(newMonomer);
      modelChanges.merge(monomerAddCommand);
      modelChanges.merge(this.insertNewSequenceFragment(newMonomerSequenceNode, (_nextNode$senseNode = nextNode === null || nextNode === void 0 ? void 0 : nextNode.senseNode) !== null && _nextNode$senseNode !== void 0 ? _nextNode$senseNode : null, previousSelectionNode, Boolean(hasPreviousNodeInChain), Boolean(hasNextNodeInChain)));
      sideChainConnections === null || sideChainConnections === void 0 || sideChainConnections.forEach(function (sideConnectionData) {
        var firstMonomerAttachmentPointName = sideConnectionData.firstMonomerAttachmentPointName,
          secondMonomer = sideConnectionData.secondMonomer,
          secondMonomerAttachmentPointName = sideConnectionData.secondMonomerAttachmentPointName;
        if (!_this4.isConnectionPossible(newMonomer, firstMonomerAttachmentPointName, secondMonomer, secondMonomerAttachmentPointName)) {
          return;
        }
        modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(newMonomer, secondMonomer, firstMonomerAttachmentPointName, secondMonomerAttachmentPointName));
      });
      preservedHydrodenBonds.forEach(function (_ref1) {
        var toMonomer = _ref1.toMonomer;
        modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(newMonomer, toMonomer, AttachmentPointName.HYDROGEN, AttachmentPointName.HYDROGEN, MACROMOLECULES_BOND_TYPES.HYDROGEN));
      });
      return newMonomerSequenceNode;
    }
  }, {
    key: "getPresetMonomerForPreservedSideChainConnection",
    value: function getPresetMonomerForPreservedSideChainConnection(newPresetNode, sourceMonomer) {
      var sourceMonomerClass = sourceMonomer.monomerItem.props.MonomerClass || (sourceMonomer instanceof AmbiguousMonomer ? sourceMonomer.monomerClass : undefined);
      if (newPresetNode instanceof Nucleotide) {
        if (sourceMonomer instanceof RNABase || sourceMonomerClass === KetMonomerClass.Base) {
          return newPresetNode.rnaBase;
        }
        if (sourceMonomer instanceof Sugar || sourceMonomerClass === KetMonomerClass.Sugar) {
          return newPresetNode.sugar;
        }
        if (sourceMonomer instanceof Phosphate || sourceMonomerClass === KetMonomerClass.Phosphate) {
          return newPresetNode.phosphate;
        }
      }
      if (newPresetNode instanceof Nucleoside) {
        if (sourceMonomer instanceof RNABase || sourceMonomerClass === KetMonomerClass.Base) {
          return newPresetNode.rnaBase;
        }
        if (sourceMonomer instanceof Sugar || sourceMonomerClass === KetMonomerClass.Sugar) {
          return newPresetNode.sugar;
        }
      }
      return sourceMonomer instanceof Sugar || sourceMonomerClass === KetMonomerClass.Sugar ? newPresetNode.monomer : undefined;
    }
  }, {
    key: "replaceSelectionsWithMonomer",
    value: function replaceSelectionsWithMonomer(selections, monomerItem) {
      var _this5 = this;
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var modelChanges = new Command();
      selections.forEach(function (selectionRange) {
        var _SequenceRenderer$get2;
        var previousReplacedNode = (_SequenceRenderer$get2 = SequenceRenderer.getPreviousNodeInSameChain(selectionRange[0].node)) === null || _SequenceRenderer$get2 === void 0 ? void 0 : _SequenceRenderer$get2.senseNode;
        selectionRange.forEach(function (nodeSelection) {
          var senseNode = nodeSelection.node.senseNode;
          if (!senseNode || senseNode instanceof EmptySequenceNode) {
            return;
          }
          previousReplacedNode = _this5.replaceSelectionWithMonomer(monomerItem, senseNode, nodeSelection.node, modelChanges, previousReplacedNode);
        });
      });
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      modelChanges.setUndoOperationReverse();
      modelChanges.setUndoOperationsByPriority();
      history.update(modelChanges);
    }
  }, {
    key: "checkIfNewMonomerCouldEstablishConnections",
    value: function checkIfNewMonomerCouldEstablishConnections(selectedNode, monomerItem, sideChainConnections) {
      if (!(monomerItem !== null && monomerItem !== void 0 && monomerItem.attachmentPoints)) {
        return false;
      }
      var newMonomerAttachmentPoints = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(monomerItem.attachmentPoints);
      var oldMonomerBonds = sideChainConnections ? Object.entries(selectedNode.monomer.attachmentPointsToBonds) : [[AttachmentPointName.R1, selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1], [AttachmentPointName.R2, selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2]];
      return oldMonomerBonds.every(function (_ref10) {
        var _ref11 = _slicedToArray(_ref10, 2),
          key = _ref11[0],
          bond = _ref11[1];
        if (!bond || !(bond instanceof MonomerToAtomBond) && (sideChainConnections ? !bond.isSideChainConnection : !bond.isBackBoneChainConnection)) {
          return true;
        }
        return newMonomerAttachmentPoints.attachmentPointsList.includes(key);
      });
    }
  }, {
    key: "selectionsContainLinkerNode",
    value: function selectionsContainLinkerNode(selections) {
      return selections.some(function (selectionRange) {
        return selectionRange.some(function (nodeSelection) {
          return nodeSelection.node.senseNode instanceof LinkerSequenceNode;
        });
      });
    }
  }, {
    key: "getFirstMissingAttachmentPoint",
    value: function getFirstMissingAttachmentPoint(selections, monomerItem, sideChainConnections) {
      var newMonomerAttachmentPoints = monomerItem.attachmentPoints ? BaseMonomer.getAttachmentPointDictFromMonomerDefinition(monomerItem.attachmentPoints) : null;
      var _iterator2 = _createForOfIteratorHelper(selections),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var selectionRange = _step2.value;
          var _iterator3 = _createForOfIteratorHelper(selectionRange),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var nodeSelection = _step3.value;
              var senseNode = nodeSelection.node.senseNode;
              if (!senseNode) {
                continue;
              }
              if (!this.checkIfNewMonomerCouldEstablishConnections(senseNode, monomerItem, sideChainConnections)) {
                if (sideChainConnections || !newMonomerAttachmentPoints) {
                  return AttachmentPointName.R1;
                }
                var backboneBonds = [[AttachmentPointName.R1, senseNode.firstMonomerInNode.attachmentPointsToBonds.R1], [AttachmentPointName.R2, senseNode.lastMonomerInNode.attachmentPointsToBonds.R2]];
                for (var _i = 0, _backboneBonds = backboneBonds; _i < _backboneBonds.length; _i++) {
                  var _backboneBonds$_i = _slicedToArray(_backboneBonds[_i], 2),
                    attachmentPointName = _backboneBonds$_i[0],
                    bond = _backboneBonds$_i[1];
                  var isBackboneBond = bond && (bond instanceof MonomerToAtomBond || bond.isBackBoneChainConnection);
                  if (isBackboneBond && !newMonomerAttachmentPoints.attachmentPointsList.includes(attachmentPointName)) {
                    return attachmentPointName;
                  }
                }
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return null;
    }
  }, {
    key: "presetHasNeededAttachmentPoints",
    value: function presetHasNeededAttachmentPoints(preset) {
      if (!preset.sugar) {
        return false;
      }
      var sugarHasR1 = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(preset.sugar.attachmentPoints).attachmentPointsList.includes(AttachmentPointName.R1);
      if (preset.phosphate) {
        var phosphateHasR2 = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(preset.phosphate.attachmentPoints).attachmentPointsList.includes(AttachmentPointName.R2);
        return sugarHasR1 && phosphateHasR2;
      }
      return sugarHasR1;
    }
  }, {
    key: "selectionsCantPreserveConnectionsWithPreset",
    value: function selectionsCantPreserveConnectionsWithPreset(selections, preset, sideChainConnections) {
      var _this6 = this;
      return selections.some(function (selectionRange) {
        return selectionRange.some(function (nodeSelection) {
          return [preset.sugar, preset.base, preset.phosphate].some(function (monomer) {
            return monomer && nodeSelection.node.senseNode && !_this6.checkIfNewMonomerCouldEstablishConnections(nodeSelection.node.senseNode, monomer, sideChainConnections);
          });
        });
      });
    }
  }, {
    key: "checkNodeInsertionPossibility",
    value: function checkNodeInsertionPossibility(newNode) {
      var _previousTwoStrandedN4, _currentTwoStrandedNo3;
      var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
      var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      var currentNodeIsNotEmpty = !((currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode) instanceof EmptySequenceNode);
      var missingAttachmentPoint = null;
      var previousMonomerHasR2 = Boolean(previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 || (_previousTwoStrandedN4 = previousTwoStrandedNodeInSameChain.senseNode) === null || _previousTwoStrandedN4 === void 0 ? void 0 : _previousTwoStrandedN4.lastMonomerInNode.hasAttachmentPoint(AttachmentPointName.R2));
      var newMonomerHasR1 = newNode.firstMonomerInNode.hasAttachmentPoint(AttachmentPointName.R1);
      var rightSideInsertImpossible = Boolean(previousTwoStrandedNodeInSameChain) && (!previousMonomerHasR2 || !newMonomerHasR1);
      if (rightSideInsertImpossible && !newMonomerHasR1) {
        missingAttachmentPoint = AttachmentPointName.R1;
      }
      var nextMonomerHasR1 = Boolean(currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 || (_currentTwoStrandedNo3 = currentTwoStrandedNode.senseNode) === null || _currentTwoStrandedNo3 === void 0 ? void 0 : _currentTwoStrandedNo3.firstMonomerInNode.hasAttachmentPoint(AttachmentPointName.R1));
      var newMonomerHasR2 = newNode.lastMonomerInNode.hasAttachmentPoint(AttachmentPointName.R2);
      var leftSideInsertImpossible = Boolean(currentTwoStrandedNode) && currentNodeIsNotEmpty && (!nextMonomerHasR1 || !newMonomerHasR2);
      if (leftSideInsertImpossible && !newMonomerHasR2) {
        missingAttachmentPoint = AttachmentPointName.R2;
      }
      var nodeCanBeInserted = !rightSideInsertImpossible && !leftSideInsertImpossible;
      return {
        nodeCanBeInserted: nodeCanBeInserted,
        missingAttachmentPoint: missingAttachmentPoint
      };
    }
  }, {
    key: "isSelectionsContainAntisenseChains",
    value: function isSelectionsContainAntisenseChains(selections) {
      return selections.some(function (selectionRange) {
        return selectionRange.some(function (twoStrandedNodeSelection) {
          return twoStrandedNodeSelection.node.antisenseNode;
        });
      });
    }
  }, {
    key: "insertMonomerFromLibrary",
    value: function insertMonomerFromLibrary(monomerItem) {
      var _this7 = this;
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var modelChanges = new Command();
      var selections = SequenceRenderer.selections;
      if (selections.length > 0) {
        if (this.isSelectionsContainAntisenseChains(selections)) {
          return;
        }
        var missingAttachmentPoint = this.getFirstMissingAttachmentPoint(selections, monomerItem);
        if (missingAttachmentPoint) {
          var message = "The monomer lacks ".concat(missingAttachmentPoint, " attachment point and cannot be inserted at current position");
          this.showMergeWarningModal(message);
          return;
        }
        if (this.selectionsContainLinkerNode(selections)) {
          editor.events.openConfirmationDialog.dispatch({
            confirmationText: 'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
            onConfirm: function onConfirm() {
              _this7.replaceSelectionsWithMonomer(selections, monomerItem);
            }
          });
        } else if (this.getFirstMissingAttachmentPoint(selections, monomerItem, true)) {
          editor.events.openConfirmationDialog.dispatch({
            confirmationText: 'Side chain connections will be deleted during replacement. Do you want to proceed?',
            onConfirm: function onConfirm() {
              _this7.replaceSelectionsWithMonomer(selections, monomerItem);
            }
          });
        } else {
          this.replaceSelectionsWithMonomer(selections, monomerItem);
        }
      } else if (editor.isSequenceEditMode) {
        var _currentTwoStrandedNo4, _currentTwoStrandedNo5;
        var newNodePosition = this.getNewNodePosition();
        var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
        var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
        var nextNodeToConnect = this.isAntisenseEditMode ? (_currentTwoStrandedNo4 = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode) !== null && _currentTwoStrandedNo4 !== void 0 ? _currentTwoStrandedNo4 : null : (_currentTwoStrandedNo5 = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode) !== null && _currentTwoStrandedNo5 !== void 0 ? _currentTwoStrandedNo5 : null;
        var previousNodeToConnect = this.isAntisenseEditMode ? previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode : previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode;
        var newMonomer = editor.drawingEntitiesManager.createMonomer(monomerItem, newNodePosition);
        var newMonomerSequenceNode = new MonomerSequenceNode(newMonomer);
        var _this$checkNodeInsert = this.checkNodeInsertionPossibility(newMonomerSequenceNode),
          nodeCanBeInserted = _this$checkNodeInsert.nodeCanBeInserted,
          _missingAttachmentPoint = _this$checkNodeInsert.missingAttachmentPoint;
        if (!nodeCanBeInserted) {
          var _message = _missingAttachmentPoint && "The monomer lacks ".concat(_missingAttachmentPoint, " attachment point and cannot be inserted at current position");
          this.showMergeWarningModal(_message);
          return;
        }
        var monomerAddCommand = editor.drawingEntitiesManager.addMonomer(monomerItem, newNodePosition, newMonomer);
        modelChanges.merge(monomerAddCommand);
        modelChanges.merge(this.insertNewSequenceFragment(newMonomerSequenceNode, nextNodeToConnect, previousNodeToConnect));
        modelChanges.addOperation(new ReinitializeModeOperation());
        editor.renderersContainer.update(modelChanges);
        SequenceRenderer.setCaretPositionNextToMonomer(newMonomerSequenceNode.lastMonomerInNode);
        history.update(modelChanges);
      }
    }
  }, {
    key: "createRnaPresetNode",
    value: function createRnaPresetNode(preset, position) {
      var editor = provideEditorInstance();
      var rnaBase = preset.base,
        sugar = preset.sugar,
        phosphate = preset.phosphate;
      assert(sugar);
      var sugarMonomer = editor.drawingEntitiesManager.createMonomer(sugar, position);
      var rnaBaseMonomer = null;
      if (rnaBase) {
        rnaBaseMonomer = editor.drawingEntitiesManager.createMonomer(rnaBase, position);
      }
      var phosphateMonomer = null;
      if (phosphate) {
        phosphateMonomer = editor.drawingEntitiesManager.createMonomer(phosphate, position);
      }
      var newPresetNode = null;
      if (rnaBaseMonomer && sugarMonomer && phosphateMonomer) {
        newPresetNode = new Nucleotide(sugarMonomer, rnaBaseMonomer, phosphateMonomer);
      } else if (rnaBaseMonomer && sugarMonomer) {
        newPresetNode = new Nucleoside(sugarMonomer, rnaBaseMonomer);
      } else {
        newPresetNode = new LinkerSequenceNode(sugarMonomer);
      }
      return newPresetNode;
    }
  }, {
    key: "replaceSelectionWithPreset",
    value: function replaceSelectionWithPreset(preset, selectedNode, selectedTwoStrandedNode, modelChanges, previousSelectionNode) {
      var _nextNode$senseNode2,
        _this8 = this;
      var editor = provideEditorInstance();
      var nextNode = SequenceRenderer.getNextNodeInSameChain(selectedTwoStrandedNode);
      var position = selectedNode.monomer.position;
      var hasPreviousNodeInChain = selectedNode.firstMonomerInNode.attachmentPointsToBonds.R1;
      var hasNextNodeInChain = selectedNode.lastMonomerInNode.attachmentPointsToBonds.R2;
      var sideChainConnections = this.preserveSideChainConnections(selectedNode);
      var preservedHydrodenBonds = selectedNode.monomers.reduce(function (acc, monomer) {
        return acc.concat(monomer.hydrogenBonds.map(function (hydrodenBond) {
          return {
            toMonomer: hydrodenBond.getAnotherMonomer(monomer),
            fromMonomer: monomer
          };
        }));
      }, []);
      selectedNode.monomers.forEach(function (monomer) {
        modelChanges.merge(editor.drawingEntitiesManager.deleteMonomer(monomer));
        monomer.forEachBond(function (polymerBond) {
          modelChanges.merge(editor.drawingEntitiesManager.deleteDrawingEntity(polymerBond));
        });
      });
      var nextSenseNode = nextNode === null || nextNode === void 0 ? void 0 : nextNode.senseNode;
      var presetToInsert = selectedNode instanceof Nucleoside && nextSenseNode instanceof MonomerSequenceNode && nextSenseNode.monomer instanceof Phosphate && preset.phosphate ? _objectSpread(_objectSpread({}, preset), {}, {
        phosphate: undefined
      }) : preset;
      var newPresetNode = this.createRnaPresetNode(presetToInsert, position);
      assert(newPresetNode);
      var rnaPresetAddModelChanges = editor.drawingEntitiesManager.addRnaPresetFromNode(newPresetNode);
      modelChanges.merge(rnaPresetAddModelChanges);
      modelChanges.merge(this.insertNewSequenceFragment(newPresetNode, (_nextNode$senseNode2 = nextNode === null || nextNode === void 0 ? void 0 : nextNode.senseNode) !== null && _nextNode$senseNode2 !== void 0 ? _nextNode$senseNode2 : null, previousSelectionNode, Boolean(hasPreviousNodeInChain), Boolean(hasNextNodeInChain), false));
      sideChainConnections === null || sideChainConnections === void 0 || sideChainConnections.forEach(function (sideConnectionData) {
        var sourceMonomer = sideConnectionData.sourceMonomer,
          firstMonomerAttachmentPointName = sideConnectionData.firstMonomerAttachmentPointName,
          secondMonomer = sideConnectionData.secondMonomer,
          secondMonomerAttachmentPointName = sideConnectionData.secondMonomerAttachmentPointName;
        var monomerForSideConnections = _this8.getPresetMonomerForPreservedSideChainConnection(newPresetNode, sourceMonomer);
        if (!monomerForSideConnections || !_this8.isConnectionPossible(monomerForSideConnections, firstMonomerAttachmentPointName, secondMonomer, secondMonomerAttachmentPointName)) {
          return;
        }
        modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(monomerForSideConnections, secondMonomer, firstMonomerAttachmentPointName, secondMonomerAttachmentPointName));
      });
      preservedHydrodenBonds.forEach(function (_ref12) {
        var toMonomer = _ref12.toMonomer,
          fromMonomer = _ref12.fromMonomer;
        var monomerForHydrogenBond;
        if (newPresetNode instanceof Nucleotide || newPresetNode instanceof Nucleoside) {
          if (fromMonomer instanceof RNABase) {
            monomerForHydrogenBond = newPresetNode.rnaBase;
          } else if (fromMonomer instanceof Sugar) {
            monomerForHydrogenBond = newPresetNode.sugar;
          } else if (newPresetNode instanceof Nucleotide && fromMonomer instanceof Phosphate) {
            monomerForHydrogenBond = newPresetNode.phosphate;
          }
        }
        if (!monomerForHydrogenBond) {
          return;
        }
        modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(monomerForHydrogenBond, toMonomer, AttachmentPointName.HYDROGEN, AttachmentPointName.HYDROGEN, MACROMOLECULES_BOND_TYPES.HYDROGEN));
      });
      return newPresetNode;
    }
  }, {
    key: "replaceSelectionsWithPreset",
    value: function replaceSelectionsWithPreset(selections, preset) {
      var _this9 = this;
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var modelChanges = new Command();
      selections.forEach(function (selectionRange) {
        var _SequenceRenderer$get3;
        var previousReplacedNode = (_SequenceRenderer$get3 = SequenceRenderer.getPreviousNodeInSameChain(selectionRange[0].node)) === null || _SequenceRenderer$get3 === void 0 ? void 0 : _SequenceRenderer$get3.senseNode;
        selectionRange.forEach(function (nodeSelection) {
          var senseNode = nodeSelection.node.senseNode;
          if (!senseNode || senseNode instanceof EmptySequenceNode) {
            return;
          }
          previousReplacedNode = _this9.replaceSelectionWithPreset(preset, senseNode, nodeSelection.node, modelChanges, previousReplacedNode);
        });
      });
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      modelChanges.setUndoOperationReverse();
      modelChanges.setUndoOperationsByPriority();
      history.update(modelChanges);
    }
  }, {
    key: "insertPresetFromLibrary",
    value: function insertPresetFromLibrary(preset) {
      var _this0 = this;
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var modelChanges = new Command();
      var selections = SequenceRenderer.selections;
      if (selections.length > 0) {
        if (this.isSelectionsContainAntisenseChains(selections)) {
          return;
        }
        if (!this.presetHasNeededAttachmentPoints(preset)) {
          this.showMergeWarningModal();
          return;
        }
        if (this.selectionsContainLinkerNode(selections)) {
          editor.events.openConfirmationDialog.dispatch({
            confirmationText: 'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
            onConfirm: function onConfirm() {
              _this0.replaceSelectionsWithPreset(selections, preset);
            }
          });
        } else if (this.selectionsCantPreserveConnectionsWithPreset(selections, preset, true)) {
          editor.events.openConfirmationDialog.dispatch({
            confirmationText: 'Side chain connections will be deleted during replacement. Do you want to proceed?',
            onConfirm: function onConfirm() {
              _this0.replaceSelectionsWithPreset(selections, preset);
            }
          });
        } else {
          this.replaceSelectionsWithPreset(selections, preset);
        }
      } else if (editor.isSequenceEditMode) {
        var _currentTwoStrandedNo6, _currentTwoStrandedNo7;
        var newNodePosition = this.getNewNodePosition();
        var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
        var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
        var nextNodeToConnect = this.isAntisenseEditMode ? (_currentTwoStrandedNo6 = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.antisenseNode) !== null && _currentTwoStrandedNo6 !== void 0 ? _currentTwoStrandedNo6 : null : (_currentTwoStrandedNo7 = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode) !== null && _currentTwoStrandedNo7 !== void 0 ? _currentTwoStrandedNo7 : null;
        var previousNodeToConnect = this.isAntisenseEditMode ? previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.antisenseNode : previousTwoStrandedNodeInSameChain === null || previousTwoStrandedNodeInSameChain === void 0 ? void 0 : previousTwoStrandedNodeInSameChain.senseNode;
        var newPresetNode = this.createRnaPresetNode(preset, newNodePosition);
        assert(newPresetNode);
        var _this$checkNodeInsert2 = this.checkNodeInsertionPossibility(newPresetNode),
          nodeCanBeInserted = _this$checkNodeInsert2.nodeCanBeInserted,
          missingAttachmentPoint = _this$checkNodeInsert2.missingAttachmentPoint;
        if (!nodeCanBeInserted) {
          var message = missingAttachmentPoint && "The monomer lacks ".concat(missingAttachmentPoint, " attachment point and cannot be inserted at current position");
          this.showMergeWarningModal(message);
          return;
        }
        var rnaPresetAddModelChanges = editor.drawingEntitiesManager.addRnaPresetFromNode(newPresetNode, preset.connections);
        modelChanges.merge(rnaPresetAddModelChanges);
        modelChanges.merge(this.insertNewSequenceFragment(newPresetNode, nextNodeToConnect, previousNodeToConnect));
        modelChanges.addOperation(new ReinitializeModeOperation());
        editor.renderersContainer.update(modelChanges);
        SequenceRenderer.setCaretPositionNextToMonomer(newPresetNode.lastMonomerInNode);
        history.update(modelChanges);
      }
    }
  }, {
    key: "insertNewSequenceItem",
    value: function insertNewSequenceItem(editor, enteredSymbol, nextNodeToConnect, previousNodeToConnect) {
      var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
      var newNodePosition = this.getNewNodePosition();
      var previousTwoStrandedNodeInSameChain = SequenceRenderer.previousNodeInSameChain;
      if (nextNodeToConnect instanceof EmptySequenceNode && previousNodeToConnect) {
        if (!(previousTwoStrandedNodeInSameChain !== null && previousTwoStrandedNodeInSameChain !== void 0 && previousTwoStrandedNodeInSameChain.antisenseNode) && !this.isR2Free(previousNodeToConnect)) {
          this.showMergeWarningModal();
          return;
        }
      }
      if (!previousNodeToConnect && nextNodeToConnect && !(nextNodeToConnect instanceof EmptySequenceNode)) {
        var isAttachmentPointFree = this.isAntisenseEditMode ? this.isR2Free(nextNodeToConnect) : this.isR1Free(nextNodeToConnect);
        if (!isAttachmentPointFree) {
          this.showMergeWarningModal();
          return;
        }
      }
      if (editor.sequenceTypeEnterMode !== SequenceType.PEPTIDE && enteredSymbol.toUpperCase() === 'P') {
        var phosphateLibraryItem = getRnaPartLibraryItem(editor, RNA_DNA_NON_MODIFIED_PART.PHOSPHATE, KetMonomerClass.Phosphate);
        var phosphateAddCommand = phosphateLibraryItem && editor.drawingEntitiesManager.addMonomer(phosphateLibraryItem, newNodePosition);
        var newPhosphate = phosphateAddCommand === null || phosphateAddCommand === void 0 ? void 0 : phosphateAddCommand.operations[0].monomer;
        if (!phosphateLibraryItem || !newPhosphate) {
          this.showMergeWarningModal('Phosphate library item not found.');
          return;
        }
        var newPhosphateNode = new MonomerSequenceNode(newPhosphate);
        var modelChanges = new Command();
        modelChanges.merge(phosphateAddCommand);
        modelChanges.merge(this.insertNewSequenceFragment(newPhosphateNode, currentTwoStrandedNode instanceof BackBoneSequenceNode ? currentTwoStrandedNode.secondConnectedNode : nextNodeToConnect, currentTwoStrandedNode instanceof BackBoneSequenceNode ? currentTwoStrandedNode.firstConnectedNode : previousNodeToConnect, true, true, false));
        return {
          modelChanges: modelChanges,
          node: newPhosphateNode
        };
      }
      if (editor.sequenceTypeEnterMode === SequenceType.PEPTIDE) {
        return this.handlePeptideNodeAddition(enteredSymbol, newNodePosition, nextNodeToConnect, previousNodeToConnect);
      } else {
        return this.handleRnaDnaNodeAddition(enteredSymbol, newNodePosition, nextNodeToConnect, previousNodeToConnect);
      }
    }
  }, {
    key: "showMergeWarningModal",
    value: function showMergeWarningModal(message) {
      var editor = provideEditorInstance();
      editor.events.openErrorModal.dispatch({
        errorTitle: 'Error Message',
        errorMessage: message !== null && message !== void 0 ? message : 'It is impossible to merge fragments. Attachment point to establish bonds are not available.'
      });
    }
  }, {
    key: "insertNewSequenceFragment",
    value: function insertNewSequenceFragment(chainsCollectionOrNode, nextNodeToConnect, previousNodeToConnect) {
      var _SequenceRenderer$cur2, _SequenceRenderer$pre;
      var needConnectWithPreviousNodeInChain = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var needConnectWithNextNodeInChain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var addPhosphateIfNeeded = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
      var chainsCollection = chainsCollectionOrNode instanceof ChainsCollection ? chainsCollectionOrNode : new ChainsCollection().add(new Chain().addNode(chainsCollectionOrNode));
      var currentNode = nextNodeToConnect === null ? undefined : nextNodeToConnect !== null && nextNodeToConnect !== void 0 ? nextNodeToConnect : (_SequenceRenderer$cur2 = SequenceRenderer.currentEdittingNode) === null || _SequenceRenderer$cur2 === void 0 ? void 0 : _SequenceRenderer$cur2.senseNode;
      var previousNodeInSameChain = previousNodeToConnect !== null && previousNodeToConnect !== void 0 ? previousNodeToConnect : (_SequenceRenderer$pre = SequenceRenderer.previousNodeInSameChain) === null || _SequenceRenderer$pre === void 0 ? void 0 : _SequenceRenderer$pre.senseNode;
      var modelChanges = new Command();
      var lastNodeOfNewFragment = chainsCollection.lastNode;
      var firstNodeOfNewFragment = chainsCollection.firstNode;
      var newNodePosition = this.getNewNodePosition();
      if (needConnectWithPreviousNodeInChain) {
        this.deleteBondToNextNodeInChain(previousNodeInSameChain, modelChanges);
        this.connectNodes(previousNodeInSameChain, firstNodeOfNewFragment, modelChanges, newNodePosition, addPhosphateIfNeeded);
      }
      if (needConnectWithNextNodeInChain) {
        var isAntisenseEndCase = this.isAntisenseEditMode && !previousNodeInSameChain && currentNode;
        if (isAntisenseEndCase) {
          this.connectNodes(currentNode, firstNodeOfNewFragment, modelChanges, newNodePosition, addPhosphateIfNeeded);
        } else {
          this.connectNodes(lastNodeOfNewFragment, currentNode, modelChanges, newNodePosition, addPhosphateIfNeeded);
        }
      }
      return modelChanges;
    }
  }, {
    key: "getNewNodePosition",
    value: function getNewNodePosition() {
      if (this.isEditMode) {
        var currentTwoStrandedNode = SequenceRenderer.currentEdittingNode;
        var currentNode = currentTwoStrandedNode === null || currentTwoStrandedNode === void 0 ? void 0 : currentTwoStrandedNode.senseNode;
        var previousTwoStrandedNode = SequenceRenderer.previousNode;
        var previousNode = previousTwoStrandedNode === null || previousTwoStrandedNode === void 0 ? void 0 : previousTwoStrandedNode.senseNode;
        var twoStrandedNodeBeforePreviousNode = previousNode ? SequenceRenderer.getPreviousNodeInSameChain(previousTwoStrandedNode) : undefined;
        var nodeBeforePreviousNode = twoStrandedNodeBeforePreviousNode === null || twoStrandedNodeBeforePreviousNode === void 0 ? void 0 : twoStrandedNodeBeforePreviousNode.senseNode;
        var newNodePosition = this.getNewSequenceItemPosition(previousNode, nodeBeforePreviousNode, currentNode);
        return newNodePosition;
      } else {
        return SequenceRenderer.chainsCollection.chains.length > 0 ? SequenceRenderer.getNextChainPosition() : new Vec2(0, 0);
      }
    }
  }, {
    key: "deleteSelectedDrawingEntities",
    value: function deleteSelectedDrawingEntities() {
      var editor = provideEditorInstance();
      var modelChanges = new Command();
      editor.drawingEntitiesManager.selectedEntities.forEach(function (_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2),
          entity = _ref14[1];
        modelChanges.merge(editor.drawingEntitiesManager.deleteDrawingEntity(entity));
      });
      return modelChanges;
    }
  }, {
    key: "getNewSequenceItemPosition",
    value: function getNewSequenceItemPosition(previousNode, nodeBeforePreviousNode, currentNode) {
      var offsetFromPrevious = new Vec2(1, 1);
      if (previousNode && !(previousNode instanceof EmptySequenceNode)) {
        return previousNode.lastMonomerInNode.position.add(offsetFromPrevious);
      } else if (nodeBeforePreviousNode) {
        return nodeBeforePreviousNode.lastMonomerInNode.position.add(offsetFromPrevious);
      } else if (currentNode && !(currentNode instanceof EmptySequenceNode)) {
        return currentNode.firstMonomerInNode.position.sub(offsetFromPrevious);
      } else {
        return new Vec2(0, 0);
      }
    }
  }, {
    key: "scrollForView",
    value: function scrollForView() {
      if (this.isEditMode) {
        return;
      }
      var zoom = ZoomTool.instance;
      var drawnEntitiesBoundingBox = SequenceRenderer.getRenderedStructuresBbox();
      if (zoom.isFitToCanvasHeight(drawnEntitiesBoundingBox.height)) {
        zoom.scrollTo(new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top));
      } else {
        zoom.scrollTo(new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.bottom), true);
      }
    }
  }, {
    key: "unselectAllEntities",
    value: function unselectAllEntities() {
      var editor = provideEditorInstance();
      var modelChanges = editor.drawingEntitiesManager.unselectAllDrawingEntities();
      modelChanges.merge(SequenceRenderer.unselectEmptyAndBackboneSequenceNodes());
      editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "createHydrogenBondForTwoStrandedNode",
    value: function createHydrogenBondForTwoStrandedNode(twoStrandedNode) {
      var command = new Command();
      var editor = provideEditorInstance();
      var senseNode = twoStrandedNode.senseNode;
      var antisenseNode = twoStrandedNode.antisenseNode;
      if (!senseNode || !antisenseNode || isTwoStrandedNodeRestrictedForHydrogenBondCreation(twoStrandedNode)) {
        return command;
      }
      command.merge(editor.drawingEntitiesManager.createPolymerBond(senseNode instanceof Nucleoside || senseNode instanceof Nucleotide ? senseNode.rnaBase : senseNode.monomer, antisenseNode instanceof Nucleoside || antisenseNode instanceof Nucleotide ? antisenseNode.rnaBase : antisenseNode.monomer, AttachmentPointName.HYDROGEN, AttachmentPointName.HYDROGEN, MACROMOLECULES_BOND_TYPES.HYDROGEN));
      return command;
    }
  }, {
    key: "deleteHydrogenBondsForNode",
    value: function deleteHydrogenBondsForNode(node) {
      var command = new Command();
      var editor = provideEditorInstance();
      node === null || node === void 0 || node.monomers.forEach(function (monomer) {
        monomer.hydrogenBonds.forEach(function (hydrogenBond) {
          command.merge(editor.drawingEntitiesManager.deletePolymerBond(hydrogenBond));
        });
      });
      return command;
    }
  }, {
    key: "establishHydrogenBond",
    value: function establishHydrogenBond(sequenceItemRenderer) {
      var _this1 = this;
      var modelChanges = new Command();
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var selections = SequenceRenderer.selections;
      if (selections.length) {
        selections.forEach(function (selectionRange) {
          selectionRange.forEach(function (nodeSelection) {
            modelChanges.merge(_this1.createHydrogenBondForTwoStrandedNode(nodeSelection.node));
          });
        });
      } else {
        var twoStrandedNode = sequenceItemRenderer.twoStrandedNode;
        if (!twoStrandedNode) {
          return;
        }
        modelChanges.merge(this.createHydrogenBondForTwoStrandedNode(twoStrandedNode));
      }
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      history.update(modelChanges);
    }
  }, {
    key: "deleteHydrogenBond",
    value: function deleteHydrogenBond(sequenceItemRenderer) {
      var _this10 = this;
      var modelChanges = new Command();
      var editor = provideEditorInstance();
      var history = EditorHistory.getInstance(editor);
      var selections = SequenceRenderer.selections;
      if (selections.length) {
        selections.forEach(function (selectionRange) {
          selectionRange.forEach(function (nodeSelection) {
            modelChanges.merge(_this10.deleteHydrogenBondsForNode(nodeSelection.node.senseNode));
            modelChanges.merge(_this10.deleteHydrogenBondsForNode(nodeSelection.node.antisenseNode));
          });
        });
      } else {
        var node = sequenceItemRenderer.node;
        modelChanges.merge(this.deleteHydrogenBondsForNode(node));
      }
      modelChanges.addOperation(new ReinitializeModeOperation());
      editor.renderersContainer.update(modelChanges);
      history.update(modelChanges);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.turnOffEditMode();
      SequenceRenderer.clear();
    }
  }]);
  return SequenceMode;
}(BaseMode);
registerMode('sequence-layout-mode', SequenceMode);

export { SequenceMode };
//# sourceMappingURL=SequenceMode.modern.js.map
