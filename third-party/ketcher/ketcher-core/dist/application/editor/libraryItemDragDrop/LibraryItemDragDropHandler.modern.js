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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
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
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import { Command } from '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { AttachmentPointName } from '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import '../../render/renderStruct.modern.js';
import '../../render/raphaelRender.modern.js';
import '../../render/restruct/reobject.modern.js';
import '../../render/restruct/reatom.modern.js';
import '../../render/restruct/rebond.modern.js';
import '../../render/restruct/reenhancedFlag.modern.js';
import '../../render/restruct/refrag.modern.js';
import '../../render/restruct/rergroup.modern.js';
import '../../render/restruct/rerxnarrow.modern.js';
import '../../render/restruct/rerxnplus.modern.js';
import '../../render/restruct/resgroup.modern.js';
import '../../render/restruct/resimpleObject.modern.js';
import '../../render/restruct/restruct.modern.js';
import '../../render/restruct/retext.modern.js';
import '../../render/restruct/visel.modern.js';
import '../../render/restruct/generalEnumTypes.modern.js';
import '../../render/restruct/showHydrogenLabels.modern.js';
import '../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../render/restruct/reImage.modern.js';
import '../../render/restruct/remultitailArrow.modern.js';
import '../../render/renderers/BaseRenderer.modern.js';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../render/renderers/AtomRenderer.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../render/renderers/SGroupRenderer.modern.js';
import '../../render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../render/renderers/StereoFlagRenderer.modern.js';
import '../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import { attachmentPointNumberToAngle } from '../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../render/scrollbar/scrollbar-container.modern.js';
import '../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../render/renderers/constants.modern.js';
import '../../render/render.types.modern.js';
import { AttachmentPoint } from '../../../domain/AttachmentPoint.modern.js';
import { Coordinates } from '../shared/coordinates.modern.js';
import { EditorHistory } from '../EditorHistory.modern.js';
import { isLibraryItemRnaPreset } from '../../../domain/helpers/monomers.modern.js';
import { findPresetMonomerForBonding } from '../tools/bondConnectionHelpers.modern.js';
import { computeAndApplyFlexDropRepositioning, applyPresetMirroringIfNeeded, shiftDownstreamChainMonomers } from './repositioning.modern.js';
import { getPresetSugarForMonomer, getMatchingPresetComponents, computeLostBondsForPresetReplacement, computeLostBondsForMonomerReplacement, getPresetPhosphateFromSugar } from './replacementHelpers.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25;
var DRAG_CIRCLE_HOVER_THRESHOLD_PX = 20;
var DRAG_REPLACE_PROXIMITY_THRESHOLD_PX = 20;
var LibraryItemDragDropHandler = function () {
  function LibraryItemDragDropHandler(deps) {
    _classCallCheck(this, LibraryItemDragDropHandler);
    _defineProperty(this, "deps", void 0);
    _defineProperty(this, "dragDropBondTarget", null);
    _defineProperty(this, "dragCircleHoverTarget", null);
    _defineProperty(this, "isDragDropBondModalOpen", false);
    _defineProperty(this, "dragDropModalContext", null);
    _defineProperty(this, "currentDragState", null);
    _defineProperty(this, "dragReplaceTarget", null);
    this.deps = deps;
  }
  _createClass(LibraryItemDragDropHandler, [{
    key: "subscribe",
    value: function subscribe() {
      var _this = this;
      var events = this.deps.events;
      events.setLibraryItemDragState.add(this.onDragStateChanged.bind(this));
      events.placeLibraryItemOnCanvas.add(function (item, position) {
        return _this.onPlaceOnCanvas(item, position);
      });
    }
  }, {
    key: "handleMonomerConnection",
    value: function handleMonomerConnection(payload) {
      var firstMonomer = payload.firstMonomer,
        secondMonomer = payload.secondMonomer,
        firstSelectedAttachmentPoint = payload.firstSelectedAttachmentPoint,
        secondSelectedAttachmentPoint = payload.secondSelectedAttachmentPoint;
      var _this$deps = this.deps,
        drawingEntitiesManager = _this$deps.drawingEntitiesManager,
        renderersContainer = _this$deps.renderersContainer,
        getEditor = _this$deps.getEditor,
        getModeName = _this$deps.getModeName,
        events = _this$deps.events;
      var command = new Command();
      command.merge(drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, firstSelectedAttachmentPoint, secondSelectedAttachmentPoint));
      if (getModeName() === 'flex-layout-mode' && this.dragDropModalContext) {
        var _this$dragDropModalCo = this.dragDropModalContext,
          droppedMonomer = _this$dragDropModalCo.droppedMonomer,
          addedMonomers = _this$dragDropModalCo.addedMonomers;
        command.merge(computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, secondMonomer, secondSelectedAttachmentPoint));
      }
      if (getModeName() === 'snake-layout-mode') {
        command.merge(drawingEntitiesManager.applySnakeLayout(true));
      }
      if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
        events.error.dispatch('You have connected monomers using attachment points with the same name (e.g., both R1 or both R2)');
      }
      var history = EditorHistory.getInstance(getEditor());
      history.update(command);
      renderersContainer.update(command);
      this.isDragDropBondModalOpen = false;
      this.dragDropModalContext = null;
    }
  }, {
    key: "handleMonomerConnectionCancel",
    value: function handleMonomerConnectionCancel() {
      this.isDragDropBondModalOpen = false;
      this.dragDropModalContext = null;
    }
  }, {
    key: "isModalOpen",
    get: function get() {
      return this.isDragDropBondModalOpen;
    }
  }, {
    key: "isDragging",
    get: function get() {
      return this.currentDragState !== null;
    }
  }, {
    key: "onDragStateChanged",
    value: function onDragStateChanged(state) {
      this.currentDragState = state;
      if (state) {
        this.onLibraryItemDragOver(state);
      } else {
        this.clearDragDropBondTarget();
        this.clearReplacementTarget();
      }
    }
  }, {
    key: "onLibraryItemDragOver",
    value: function onLibraryItemDragOver(state) {
      if (this.deps.getModeName() === 'sequence-layout-mode') return;
      var replacementTarget = this.findReplacementTarget(state.position);
      if (replacementTarget) {
        var classified = this.classifyReplaceTarget(replacementTarget, state.item);
        var prevTarget = this.dragReplaceTarget;
        var hasTargetChanged = classified.monomer !== (prevTarget === null || prevTarget === void 0 ? void 0 : prevTarget.monomer) || classified.kind !== (prevTarget === null || prevTarget === void 0 ? void 0 : prevTarget.kind);
        if (hasTargetChanged) {
          if (prevTarget) this.clearReplacementVisualState();
          this.applyReplacementVisualState(classified);
          this.dragReplaceTarget = classified;
          var _this$updateAttachmen = this.updateAttachmentPointTarget(this.dragDropBondTarget, null, this.setMonomerDragTargetAP.bind(this)),
            clearedBondTarget = _this$updateAttachmen.updatedTarget;
          this.dragDropBondTarget = clearedBondTarget;
          var _this$updateAttachmen2 = this.updateAttachmentPointTarget(this.dragCircleHoverTarget, null, this.setMonomerDragCircleHoverAP.bind(this)),
            clearedCircleHover = _this$updateAttachmen2.updatedTarget;
          this.dragCircleHoverTarget = clearedCircleHover;
          var _command = new Command();
          _command.merge(this.deps.drawingEntitiesManager.removeHoverForAllMonomers());
          this.deps.renderersContainer.update(_command);
        }
        return;
      }
      if (this.dragReplaceTarget) {
        this.clearReplacementTarget();
      }
      var nearestAP = this.findNearestFreeAttachmentPointForDrag(state.position);
      var circleHoverAP = this.findNearestFreeAttachmentPointForDrag(state.position, DRAG_CIRCLE_HOVER_THRESHOLD_PX);
      var _this$updateAttachmen3 = this.updateAttachmentPointTarget(this.dragCircleHoverTarget, circleHoverAP, this.setMonomerDragCircleHoverAP.bind(this)),
        updatedCircleHoverTarget = _this$updateAttachmen3.updatedTarget,
        hasCircleHoverTargetChanged = _this$updateAttachmen3.hasTargetChanged;
      this.dragCircleHoverTarget = updatedCircleHoverTarget;
      var _this$updateAttachmen4 = this.updateAttachmentPointTarget(this.dragDropBondTarget, nearestAP, this.setMonomerDragTargetAP.bind(this)),
        updatedBondTarget = _this$updateAttachmen4.updatedTarget,
        hasBondTargetChanged = _this$updateAttachmen4.hasTargetChanged;
      if (!hasBondTargetChanged && !hasCircleHoverTargetChanged) {
        return;
      }
      this.dragDropBondTarget = updatedBondTarget;
      var _this$deps2 = this.deps,
        drawingEntitiesManager = _this$deps2.drawingEntitiesManager,
        renderersContainer = _this$deps2.renderersContainer;
      var command = new Command();
      command.merge(drawingEntitiesManager.removeHoverForAllMonomers());
      if (nearestAP) {
        command.merge(drawingEntitiesManager.intendToStartBondCreation(nearestAP.monomer));
      }
      renderersContainer.update(command);
    }
  }, {
    key: "clearDragDropBondTarget",
    value: function clearDragDropBondTarget() {
      var _this$updateAttachmen5 = this.updateAttachmentPointTarget(this.dragCircleHoverTarget, null, this.setMonomerDragCircleHoverAP.bind(this)),
        clearedCircleHoverTarget = _this$updateAttachmen5.updatedTarget;
      this.dragCircleHoverTarget = clearedCircleHoverTarget;
      var _this$updateAttachmen6 = this.updateAttachmentPointTarget(this.dragDropBondTarget, null, this.setMonomerDragTargetAP.bind(this)),
        clearedBondTarget = _this$updateAttachmen6.updatedTarget,
        hasBondTargetChanged = _this$updateAttachmen6.hasTargetChanged;
      this.dragDropBondTarget = clearedBondTarget;
      if (!hasBondTargetChanged) return;
      var clearCommand = this.deps.drawingEntitiesManager.removeHoverForAllMonomers();
      this.deps.renderersContainer.update(clearCommand);
    }
  }, {
    key: "findReplacementTarget",
    value: function findReplacementTarget(position) {
      var rootOffset = this.deps.getKetcherRootRect();
      if (!rootOffset) return null;
      var canvasOffset = this.deps.getCanvasOffset();
      var cursorSVGX = position.x - (canvasOffset.left - rootOffset.left);
      var cursorSVGY = position.y - (canvasOffset.top - rootOffset.top);
      var cursorCanvas = Coordinates.viewToCanvas(new Vec2(cursorSVGX, cursorSVGY));
      var nearest = null;
      var minDist = DRAG_REPLACE_PROXIMITY_THRESHOLD_PX;
      var _iterator = _createForOfIteratorHelper(this.deps.drawingEntitiesManager.monomers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            monomer = _step$value[1];
          var renderer = monomer.renderer;
          if (!renderer || !(renderer instanceof BaseMonomerRenderer)) continue;
          var center = renderer.center;
          var dist = Math.sqrt(Math.pow(cursorCanvas.x - center.x, 2) + Math.pow(cursorCanvas.y - center.y, 2));
          if (dist < minDist) {
            minDist = dist;
            nearest = monomer;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return nearest;
    }
  }, {
    key: "classifyReplaceTarget",
    value: function classifyReplaceTarget(nearestMonomer, draggedItem) {
      if (draggedItem && isLibraryItemRnaPreset(draggedItem)) {
        var presetSugar = getPresetSugarForMonomer(nearestMonomer, draggedItem);
        if (presetSugar) {
          var presetComponents = getMatchingPresetComponents(presetSugar, draggedItem);
          if (presetComponents && presetComponents.includes(nearestMonomer)) {
            return {
              monomer: nearestMonomer,
              kind: 'same-geometry-preset',
              presetSugar: presetSugar,
              presetComponents: presetComponents
            };
          }
        }
      }
      return {
        monomer: nearestMonomer,
        kind: 'monomer'
      };
    }
  }, {
    key: "applyReplacementVisualState",
    value: function applyReplacementVisualState(target) {
      var monomersToHighlight = this.getHighlightMonomers(target);
      var transientDrawingView = this.deps.getTransientDrawingView();
      transientDrawingView.showReplacementHighlight({
        monomers: monomersToHighlight
      });
      transientDrawingView.update();
    }
  }, {
    key: "clearReplacementVisualState",
    value: function clearReplacementVisualState() {
      var transientDrawingView = this.deps.getTransientDrawingView();
      transientDrawingView.hideReplacementHighlight();
      transientDrawingView.update();
    }
  }, {
    key: "getHighlightMonomers",
    value: function getHighlightMonomers(target) {
      return target.kind === 'same-geometry-preset' && target.presetComponents ? target.presetComponents : [target.monomer];
    }
  }, {
    key: "clearReplacementTarget",
    value: function clearReplacementTarget() {
      if (this.dragReplaceTarget) {
        this.clearReplacementVisualState();
        this.dragReplaceTarget = null;
      }
    }
  }, {
    key: "onPlaceOnCanvas",
    value: function onPlaceOnCanvas(item, position) {
      var _this$deps3 = this.deps,
        drawingEntitiesManager = _this$deps3.drawingEntitiesManager,
        renderersContainer = _this$deps3.renderersContainer,
        events = _this$deps3.events,
        getModeName = _this$deps3.getModeName,
        getEditor = _this$deps3.getEditor,
        placeItemOnCanvas = _this$deps3.placeItemOnCanvas,
        calculateAndStoreNextAutochainPosition = _this$deps3.calculateAndStoreNextAutochainPosition;
      if (this.dragReplaceTarget) {
        var replaceTarget = this.dragReplaceTarget;
        this.executeReplacement(item, replaceTarget, getModeName, events, drawingEntitiesManager, renderersContainer, getEditor);
        return;
      }
      var monomersAddResult = placeItemOnCanvas(item, new Vec2(position.x, position.y));
      if (!monomersAddResult) {
        return;
      }
      var modelChanges = new Command();
      modelChanges.merge(monomersAddResult.modelChanges);
      if (this.dragCircleHoverTarget) {
        var _this$dragCircleHover = this.dragCircleHoverTarget,
          targetMonomer = _this$dragCircleHover.monomer,
          targetAP = _this$dragCircleHover.attachmentPointName;
        var addedMonomers = monomersAddResult.drawingEntities.filter(function (e) {
          return e instanceof BaseMonomer;
        });
        var droppedMonomer = isLibraryItemRnaPreset(item) ? this.findPresetMonomerForBonding(addedMonomers, targetAP) : monomersAddResult.firstMonomer;
        if (droppedMonomer && droppedMonomer.hasFreeAttachmentPoint) {
          targetMonomer.setPotentialSecondAttachmentPoint(targetAP);
          var sourceAP = droppedMonomer.getValidSourcePoint(targetMonomer);
          targetMonomer.setPotentialSecondAttachmentPoint(null);
          if (sourceAP) {
            modelChanges.merge(drawingEntitiesManager.createPolymerBond(droppedMonomer, targetMonomer, sourceAP, targetAP));
            if (isLibraryItemRnaPreset(item) && addedMonomers.length > 1) {
              modelChanges.merge(applyPresetMirroringIfNeeded(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer));
            }
            if (getModeName() === 'flex-layout-mode') {
              modelChanges.merge(computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer, targetAP));
            }
            if (sourceAP === targetAP) {
              events.error.dispatch('You have connected monomers with attachment points of the same group');
            }
            if (getModeName() === 'snake-layout-mode') {
              modelChanges.merge(drawingEntitiesManager.applySnakeLayout(true));
            }
          } else if (droppedMonomer.unUsedAttachmentPointsNamesList.length > 0) {
            this.isDragDropBondModalOpen = true;
            this.dragDropModalContext = {
              droppedMonomer: droppedMonomer,
              addedMonomers: addedMonomers,
              targetMonomer: targetMonomer,
              targetAP: targetAP
            };
            events.openMonomerConnectionModal.dispatch({
              firstMonomer: droppedMonomer,
              secondMonomer: targetMonomer
            });
          }
        }
        this.setMonomerDragCircleHoverAP(this.dragCircleHoverTarget.monomer, null);
        this.dragCircleHoverTarget = null;
      }
      modelChanges.merge(drawingEntitiesManager.selectDrawingEntities(monomersAddResult.drawingEntities));
      var history = EditorHistory.getInstance(getEditor());
      history.update(modelChanges);
      renderersContainer.update(modelChanges);
      calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);
    }
  }, {
    key: "executeReplacement",
    value: function executeReplacement(item, replaceTarget, getModeName, events, drawingEntitiesManager, renderersContainer, getEditor) {
      var _this2 = this;
      this.clearReplacementTarget();
      var lostBonds = this.computeLostBondsForReplacement(item, replaceTarget);
      var doReplace = function doReplace() {
        var command = _this2.buildReplacementCommand(item, replaceTarget, getModeName, drawingEntitiesManager);
        if (command) {
          var history = EditorHistory.getInstance(getEditor());
          history.update(command);
          renderersContainer.update(command);
        }
      };
      if (lostBonds > 0) {
        events.openConfirmationDialog.dispatch({
          title: 'Deletion of bonds',
          confirmationText: 'Some bonds will get deleted during replacement. Do you wish to proceed.',
          onConfirm: doReplace
        });
      } else {
        doReplace();
      }
    }
  }, {
    key: "computeLostBondsForReplacement",
    value: function computeLostBondsForReplacement(item, replaceTarget) {
      if (replaceTarget.kind === 'same-geometry-preset' && replaceTarget.presetComponents && isLibraryItemRnaPreset(item)) {
        var _this$computeNewPrese = this.computeNewPresetFreeAPs(item),
          freeAttachmentPointsByMonomer = _this$computeNewPrese.freeAttachmentPointsByMonomer,
          rolePresent = _this$computeNewPrese.rolePresent;
        return computeLostBondsForPresetReplacement(replaceTarget.presetComponents, freeAttachmentPointsByMonomer, rolePresent).length;
      }
      if (!isLibraryItemRnaPreset(item)) {
        var newFreeAPs = this.getTemplateAttachmentPointNames(item);
        if (!newFreeAPs) return 0;
        return computeLostBondsForMonomerReplacement(replaceTarget.monomer, newFreeAPs).length;
      }
      if (isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
        var _this$computeNewPrese2 = this.computeNewPresetFreeAPs(item),
          _freeAttachmentPointsByMonomer = _this$computeNewPrese2.freeAttachmentPointsByMonomer,
          _rolePresent = _this$computeNewPrese2.rolePresent;
        var allFreeAPs = new Set();
        ['sugar', 'phosphate', 'base'].forEach(function (role) {
          if (_rolePresent[role]) {
            _freeAttachmentPointsByMonomer[role].forEach(function (ap) {
              return allFreeAPs.add(ap);
            });
          }
        });
        return computeLostBondsForMonomerReplacement(replaceTarget.monomer, allFreeAPs).length;
      }
      return 0;
    }
  }, {
    key: "getTemplateAttachmentPointNames",
    value: function getTemplateAttachmentPointNames(item) {
      if (!(item !== null && item !== void 0 && item.attachmentPoints) || item.attachmentPoints.length === 0) {
        return null;
      }
      var _BaseMonomer$getAttac = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(item.attachmentPoints),
        attachmentPointsList = _BaseMonomer$getAttac.attachmentPointsList;
      return new Set(attachmentPointsList);
    }
  }, {
    key: "computeNewPresetFreeAPs",
    value: function computeNewPresetFreeAPs(preset) {
      var _preset$phosphatePosi,
        _this3 = this;
      var position = (_preset$phosphatePosi = preset.phosphatePosition) !== null && _preset$phosphatePosi !== void 0 ? _preset$phosphatePosi : 'right';
      var hasBase = Boolean(preset.base);
      var hasPhosphate = Boolean(preset.phosphate);
      var getAttachmentPointNamesForMonomer = function getAttachmentPointNamesForMonomer(item, fallback) {
        var _this3$getTemplateAtt;
        return (_this3$getTemplateAtt = _this3.getTemplateAttachmentPointNames(item)) !== null && _this3$getTemplateAtt !== void 0 ? _this3$getTemplateAtt : new Set(fallback);
      };
      var sugarAPs = getAttachmentPointNamesForMonomer(preset.sugar, [AttachmentPointName.R1, AttachmentPointName.R2, AttachmentPointName.R3]);
      var baseAPs = getAttachmentPointNamesForMonomer(preset.base, [AttachmentPointName.R1]);
      var phosphateAPs = getAttachmentPointNamesForMonomer(preset.phosphate, [AttachmentPointName.R1, AttachmentPointName.R2]);
      var sugarInternal = new Set();
      if (hasBase) sugarInternal.add(AttachmentPointName.R3);
      if (hasPhosphate) {
        sugarInternal.add(position === 'left' ? AttachmentPointName.R1 : AttachmentPointName.R2);
      }
      var subtractAttachmentPointsFromSet = function subtractAttachmentPointsFromSet(all, used) {
        var result = new Set();
        all.forEach(function (ap) {
          if (!used.has(ap)) result.add(ap);
        });
        return result;
      };
      return {
        freeAttachmentPointsByMonomer: {
          sugar: subtractAttachmentPointsFromSet(sugarAPs, sugarInternal),
          base: subtractAttachmentPointsFromSet(baseAPs, new Set([AttachmentPointName.R1])),
          phosphate: subtractAttachmentPointsFromSet(phosphateAPs, new Set([position === 'left' ? AttachmentPointName.R2 : AttachmentPointName.R1]))
        },
        rolePresent: {
          sugar: Boolean(preset.sugar),
          base: hasBase,
          phosphate: hasPhosphate
        }
      };
    }
  }, {
    key: "buildReplacementCommand",
    value: function buildReplacementCommand(item, replaceTarget, getModeName, drawingEntitiesManager) {
      if (replaceTarget.kind === 'same-geometry-preset' && replaceTarget.presetSugar && isLibraryItemRnaPreset(item)) {
        var _drawingEntitiesManag = drawingEntitiesManager.replacePreset(replaceTarget.presetSugar, item, new Vec2(replaceTarget.presetSugar.position.x, replaceTarget.presetSugar.position.y), replaceTarget.presetComponents),
          command = _drawingEntitiesManag.command;
        return command;
      }
      if (!isLibraryItemRnaPreset(item)) {
        var _drawingEntitiesManag2 = drawingEntitiesManager.replaceMonomer(replaceTarget.monomer, item),
          _command2 = _drawingEntitiesManag2.command;
        return _command2;
      }
      if (isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
        var sugarPosition = new Vec2(replaceTarget.monomer.position.x, replaceTarget.monomer.position.y);
        var _drawingEntitiesManag3 = drawingEntitiesManager.replacePreset(replaceTarget.monomer, item, sugarPosition),
          _command3 = _drawingEntitiesManag3.command,
          newSugar = _drawingEntitiesManag3.newSugar;
        var finalCommand = new Command();
        finalCommand.merge(_command3);
        finalCommand.setUndoOperationsByPriority();
        if (getModeName() === 'snake-layout-mode') {
          finalCommand.merge(drawingEntitiesManager.applySnakeLayout(true));
        } else if (getModeName() === 'flex-layout-mode') {
          if (!newSugar) {
            KetcherLogger.error('Failed to create new sugar monomer');
            return finalCommand;
          }
          if (item.sugar && item.phosphate) {
            var _item$phosphatePositi;
            var phosphatePosition = (_item$phosphatePositi = item.phosphatePosition) !== null && _item$phosphatePositi !== void 0 ? _item$phosphatePositi : 'right';
            var newPhosphate = getPresetPhosphateFromSugar(newSugar, phosphatePosition);
            var anchor = newPhosphate !== null && newPhosphate !== void 0 ? newPhosphate : newSugar;
            finalCommand.merge(shiftDownstreamChainMonomers(drawingEntitiesManager, anchor, 1));
            finalCommand.setUndoOperationsByPriority();
          }
        }
        return finalCommand;
      }
      return null;
    }
  }, {
    key: "setMonomerDragTargetAP",
    value: function setMonomerDragTargetAP(monomer, apName) {
      var renderer = monomer.renderer;
      if (renderer instanceof BaseMonomerRenderer) {
        renderer.setDragTargetAttachmentPoint(apName);
      }
    }
  }, {
    key: "setMonomerDragCircleHoverAP",
    value: function setMonomerDragCircleHoverAP(monomer, apName) {
      var renderer = monomer.renderer;
      if (renderer instanceof BaseMonomerRenderer) {
        renderer.setDragCircleHoverAttachmentPoint(apName);
      }
    }
  }, {
    key: "getAttachmentPointApproxCanvasPosition",
    value: function getAttachmentPointApproxCanvasPosition(renderer, apName) {
      var center = renderer.center;
      var angleDeg = attachmentPointNumberToAngle[apName];
      var outwardAngleDeg = angleDeg - 180;
      var outwardAngleRad = outwardAngleDeg * Math.PI / 180;
      var _renderer$monomerSize = renderer.monomerSize,
        width = _renderer$monomerSize.width,
        height = _renderer$monomerSize.height;
      var bodyRadius = (width + height) / 4;
      var apDistance = bodyRadius + AttachmentPoint.attachmentPointLength + AttachmentPoint.radius;
      return new Vec2(center.x + Math.cos(outwardAngleRad) * apDistance, center.y + Math.sin(outwardAngleRad) * apDistance);
    }
  }, {
    key: "findNearestFreeAttachmentPointForDrag",
    value: function findNearestFreeAttachmentPointForDrag(position) {
      var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DRAG_BOND_PROXIMITY_THRESHOLD_PX;
      var rootOffset = this.deps.getKetcherRootRect();
      if (!rootOffset) return null;
      var canvasOffset = this.deps.getCanvasOffset();
      var cursorSVGX = position.x - (canvasOffset.left - rootOffset.left);
      var cursorSVGY = position.y - (canvasOffset.top - rootOffset.top);
      var cursorCanvas = Coordinates.viewToCanvas(new Vec2(cursorSVGX, cursorSVGY));
      var nearest = null;
      var minDist = threshold;
      var _iterator2 = _createForOfIteratorHelper(this.deps.drawingEntitiesManager.monomers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            monomer = _step2$value[1];
          var renderer = monomer.renderer;
          if (!renderer || !(renderer instanceof BaseMonomerRenderer)) continue;
          var _iterator3 = _createForOfIteratorHelper(monomer.unUsedAttachmentPointsNamesList),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var apName = _step3.value;
              if (!(apName in attachmentPointNumberToAngle)) {
                continue;
              }
              var apCanvasPos = this.getAttachmentPointApproxCanvasPosition(renderer, apName);
              var dist = Math.sqrt(Math.pow(cursorCanvas.x - apCanvasPos.x, 2) + Math.pow(cursorCanvas.y - apCanvasPos.y, 2));
              if (dist < minDist) {
                minDist = dist;
                nearest = {
                  monomer: monomer,
                  attachmentPointName: apName
                };
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
      return nearest;
    }
  }, {
    key: "updateAttachmentPointTarget",
    value: function updateAttachmentPointTarget(previousTarget, nextTarget, applyRendererFlag) {
      var hasTargetChanged = (nextTarget === null || nextTarget === void 0 ? void 0 : nextTarget.monomer) !== (previousTarget === null || previousTarget === void 0 ? void 0 : previousTarget.monomer) || (nextTarget === null || nextTarget === void 0 ? void 0 : nextTarget.attachmentPointName) !== (previousTarget === null || previousTarget === void 0 ? void 0 : previousTarget.attachmentPointName);
      if (!hasTargetChanged) {
        return {
          updatedTarget: previousTarget,
          hasTargetChanged: false
        };
      }
      if (previousTarget) {
        applyRendererFlag(previousTarget.monomer, null);
      }
      if (nextTarget) {
        applyRendererFlag(nextTarget.monomer, nextTarget.attachmentPointName);
      }
      return {
        updatedTarget: nextTarget,
        hasTargetChanged: true
      };
    }
  }, {
    key: "findPresetMonomerForBonding",
    value: function findPresetMonomerForBonding$1(addedMonomers, targetAP) {
      return findPresetMonomerForBonding(addedMonomers, targetAP);
    }
  }]);
  return LibraryItemDragDropHandler;
}();

export { LibraryItemDragDropHandler };
//# sourceMappingURL=LibraryItemDragDropHandler.modern.js.map
