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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
require('../../../domain/entities/Peptide.js');
var BaseMonomer = require('../../../domain/entities/BaseMonomer.js');
require('../../../domain/entities/Chem.js');
require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/RNABase.js');
require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
require('../../../domain/entities/UnresolvedMonomer.js');
require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
var Command = require('../../../domain/entities/Command.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var monomers$1 = require('../../../domain/types/monomers.js');
require('../../../domain/types/entities.js');
require('../../render/renderStruct.js');
require('../../render/raphaelRender.js');
require('../../render/restruct/reobject.js');
require('../../render/restruct/reatom.js');
require('../../render/restruct/rebond.js');
require('../../render/restruct/reenhancedFlag.js');
require('../../render/restruct/refrag.js');
require('../../render/restruct/rergroup.js');
require('../../render/restruct/rerxnarrow.js');
require('../../render/restruct/rerxnplus.js');
require('../../render/restruct/resgroup.js');
require('../../render/restruct/resimpleObject.js');
require('../../render/restruct/restruct.js');
require('../../render/restruct/retext.js');
require('../../render/restruct/visel.js');
require('../../render/restruct/generalEnumTypes.js');
require('../../render/restruct/showHydrogenLabels.js');
require('../../render/restruct/rergroupAttachmentPoint.js');
require('../../render/restruct/reImage.js');
require('../../render/restruct/remultitailArrow.js');
require('../../render/renderers/BaseRenderer.js');
var BaseMonomerRenderer = require('../../render/renderers/BaseMonomerRenderer.js');
require('../../render/renderers/AtomRenderer.js');
require('../../render/renderers/ChemRenderer.js');
require('../../render/renderers/PeptideRenderer.js');
require('../../render/renderers/PhosphateRenderer.js');
require('../../render/renderers/SugarRenderer.js');
require('../../render/renderers/RNABaseRenderer.js');
require('../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../render/renderers/UnsplitNucleotideRenderer.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../render/renderers/SGroupRenderer.js');
require('../../render/renderers/RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../render/renderers/StereoFlagRenderer.js');
require('../../render/renderers/sequence/SequenceRenderer.js');
require('../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
var attachmentPointCalculations = require('../../../domain/helpers/attachmentPointCalculations.js');
require('../../render/scrollbar/scrollbar-container.js');
require('../../render/notifyRenderComplete.js');
require('lodash');
require('../../render/renderers/constants.js');
require('../../render/render.types.js');
var AttachmentPoint = require('../../../domain/AttachmentPoint.js');
var coordinates = require('../shared/coordinates.js');
var EditorHistory = require('../EditorHistory.js');
var monomers = require('../../../domain/helpers/monomers.js');
var bondConnectionHelpers = require('../tools/bondConnectionHelpers.js');
var repositioning = require('./repositioning.js');
var replacementHelpers = require('./replacementHelpers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25;
var DRAG_CIRCLE_HOVER_THRESHOLD_PX = 20;
var DRAG_REPLACE_PROXIMITY_THRESHOLD_PX = 20;
var LibraryItemDragDropHandler = function () {
  function LibraryItemDragDropHandler(deps) {
    _classCallCheck__default["default"](this, LibraryItemDragDropHandler);
    _defineProperty__default["default"](this, "deps", void 0);
    _defineProperty__default["default"](this, "dragDropBondTarget", null);
    _defineProperty__default["default"](this, "dragCircleHoverTarget", null);
    _defineProperty__default["default"](this, "isDragDropBondModalOpen", false);
    _defineProperty__default["default"](this, "dragDropModalContext", null);
    _defineProperty__default["default"](this, "currentDragState", null);
    _defineProperty__default["default"](this, "dragReplaceTarget", null);
    this.deps = deps;
  }
  _createClass__default["default"](LibraryItemDragDropHandler, [{
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
      var command = new Command.Command();
      command.merge(drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, firstSelectedAttachmentPoint, secondSelectedAttachmentPoint));
      if (getModeName() === 'flex-layout-mode' && this.dragDropModalContext) {
        var _this$dragDropModalCo = this.dragDropModalContext,
          droppedMonomer = _this$dragDropModalCo.droppedMonomer,
          addedMonomers = _this$dragDropModalCo.addedMonomers;
        command.merge(repositioning.computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, secondMonomer, secondSelectedAttachmentPoint));
      }
      if (getModeName() === 'snake-layout-mode') {
        command.merge(drawingEntitiesManager.applySnakeLayout(true));
      }
      if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
        events.error.dispatch('You have connected monomers using attachment points with the same name (e.g., both R1 or both R2)');
      }
      var history = EditorHistory.EditorHistory.getInstance(getEditor());
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
          var _command = new Command.Command();
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
      var command = new Command.Command();
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
      var cursorCanvas = coordinates.Coordinates.viewToCanvas(new vec2.Vec2(cursorSVGX, cursorSVGY));
      var nearest = null;
      var minDist = DRAG_REPLACE_PROXIMITY_THRESHOLD_PX;
      var _iterator = _createForOfIteratorHelper(this.deps.drawingEntitiesManager.monomers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray__default["default"](_step.value, 2),
            monomer = _step$value[1];
          var renderer = monomer.renderer;
          if (!renderer || !(renderer instanceof BaseMonomerRenderer.BaseMonomerRenderer)) continue;
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
      if (draggedItem && monomers.isLibraryItemRnaPreset(draggedItem)) {
        var presetSugar = replacementHelpers.getPresetSugarForMonomer(nearestMonomer, draggedItem);
        if (presetSugar) {
          var presetComponents = replacementHelpers.getMatchingPresetComponents(presetSugar, draggedItem);
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
      var monomersAddResult = placeItemOnCanvas(item, new vec2.Vec2(position.x, position.y));
      if (!monomersAddResult) {
        return;
      }
      var modelChanges = new Command.Command();
      modelChanges.merge(monomersAddResult.modelChanges);
      if (this.dragCircleHoverTarget) {
        var _this$dragCircleHover = this.dragCircleHoverTarget,
          targetMonomer = _this$dragCircleHover.monomer,
          targetAP = _this$dragCircleHover.attachmentPointName;
        var addedMonomers = monomersAddResult.drawingEntities.filter(function (e) {
          return e instanceof BaseMonomer.BaseMonomer;
        });
        var droppedMonomer = monomers.isLibraryItemRnaPreset(item) ? this.findPresetMonomerForBonding(addedMonomers, targetAP) : monomersAddResult.firstMonomer;
        if (droppedMonomer && droppedMonomer.hasFreeAttachmentPoint) {
          targetMonomer.setPotentialSecondAttachmentPoint(targetAP);
          var sourceAP = droppedMonomer.getValidSourcePoint(targetMonomer);
          targetMonomer.setPotentialSecondAttachmentPoint(null);
          if (sourceAP) {
            modelChanges.merge(drawingEntitiesManager.createPolymerBond(droppedMonomer, targetMonomer, sourceAP, targetAP));
            if (monomers.isLibraryItemRnaPreset(item) && addedMonomers.length > 1) {
              modelChanges.merge(repositioning.applyPresetMirroringIfNeeded(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer));
            }
            if (getModeName() === 'flex-layout-mode') {
              modelChanges.merge(repositioning.computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer, targetAP));
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
      var history = EditorHistory.EditorHistory.getInstance(getEditor());
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
          var history = EditorHistory.EditorHistory.getInstance(getEditor());
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
      if (replaceTarget.kind === 'same-geometry-preset' && replaceTarget.presetComponents && monomers.isLibraryItemRnaPreset(item)) {
        var _this$computeNewPrese = this.computeNewPresetFreeAPs(item),
          freeAttachmentPointsByMonomer = _this$computeNewPrese.freeAttachmentPointsByMonomer,
          rolePresent = _this$computeNewPrese.rolePresent;
        return replacementHelpers.computeLostBondsForPresetReplacement(replaceTarget.presetComponents, freeAttachmentPointsByMonomer, rolePresent).length;
      }
      if (!monomers.isLibraryItemRnaPreset(item)) {
        var newFreeAPs = this.getTemplateAttachmentPointNames(item);
        if (!newFreeAPs) return 0;
        return replacementHelpers.computeLostBondsForMonomerReplacement(replaceTarget.monomer, newFreeAPs).length;
      }
      if (monomers.isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
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
        return replacementHelpers.computeLostBondsForMonomerReplacement(replaceTarget.monomer, allFreeAPs).length;
      }
      return 0;
    }
  }, {
    key: "getTemplateAttachmentPointNames",
    value: function getTemplateAttachmentPointNames(item) {
      if (!(item !== null && item !== void 0 && item.attachmentPoints) || item.attachmentPoints.length === 0) {
        return null;
      }
      var _BaseMonomer$getAttac = BaseMonomer.BaseMonomer.getAttachmentPointDictFromMonomerDefinition(item.attachmentPoints),
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
      var sugarAPs = getAttachmentPointNamesForMonomer(preset.sugar, [monomers$1.AttachmentPointName.R1, monomers$1.AttachmentPointName.R2, monomers$1.AttachmentPointName.R3]);
      var baseAPs = getAttachmentPointNamesForMonomer(preset.base, [monomers$1.AttachmentPointName.R1]);
      var phosphateAPs = getAttachmentPointNamesForMonomer(preset.phosphate, [monomers$1.AttachmentPointName.R1, monomers$1.AttachmentPointName.R2]);
      var sugarInternal = new Set();
      if (hasBase) sugarInternal.add(monomers$1.AttachmentPointName.R3);
      if (hasPhosphate) {
        sugarInternal.add(position === 'left' ? monomers$1.AttachmentPointName.R1 : monomers$1.AttachmentPointName.R2);
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
          base: subtractAttachmentPointsFromSet(baseAPs, new Set([monomers$1.AttachmentPointName.R1])),
          phosphate: subtractAttachmentPointsFromSet(phosphateAPs, new Set([position === 'left' ? monomers$1.AttachmentPointName.R2 : monomers$1.AttachmentPointName.R1]))
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
      if (replaceTarget.kind === 'same-geometry-preset' && replaceTarget.presetSugar && monomers.isLibraryItemRnaPreset(item)) {
        var _drawingEntitiesManag = drawingEntitiesManager.replacePreset(replaceTarget.presetSugar, item, new vec2.Vec2(replaceTarget.presetSugar.position.x, replaceTarget.presetSugar.position.y), replaceTarget.presetComponents),
          command = _drawingEntitiesManag.command;
        return command;
      }
      if (!monomers.isLibraryItemRnaPreset(item)) {
        var _drawingEntitiesManag2 = drawingEntitiesManager.replaceMonomer(replaceTarget.monomer, item),
          _command2 = _drawingEntitiesManag2.command;
        return _command2;
      }
      if (monomers.isLibraryItemRnaPreset(item) && replaceTarget.kind === 'monomer') {
        var sugarPosition = new vec2.Vec2(replaceTarget.monomer.position.x, replaceTarget.monomer.position.y);
        var _drawingEntitiesManag3 = drawingEntitiesManager.replacePreset(replaceTarget.monomer, item, sugarPosition),
          _command3 = _drawingEntitiesManag3.command,
          newSugar = _drawingEntitiesManag3.newSugar;
        var finalCommand = new Command.Command();
        finalCommand.merge(_command3);
        finalCommand.setUndoOperationsByPriority();
        if (getModeName() === 'snake-layout-mode') {
          finalCommand.merge(drawingEntitiesManager.applySnakeLayout(true));
        } else if (getModeName() === 'flex-layout-mode') {
          if (!newSugar) {
            KetcherLogger.KetcherLogger.error('Failed to create new sugar monomer');
            return finalCommand;
          }
          if (item.sugar && item.phosphate) {
            var _item$phosphatePositi;
            var phosphatePosition = (_item$phosphatePositi = item.phosphatePosition) !== null && _item$phosphatePositi !== void 0 ? _item$phosphatePositi : 'right';
            var newPhosphate = replacementHelpers.getPresetPhosphateFromSugar(newSugar, phosphatePosition);
            var anchor = newPhosphate !== null && newPhosphate !== void 0 ? newPhosphate : newSugar;
            finalCommand.merge(repositioning.shiftDownstreamChainMonomers(drawingEntitiesManager, anchor, 1));
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
      if (renderer instanceof BaseMonomerRenderer.BaseMonomerRenderer) {
        renderer.setDragTargetAttachmentPoint(apName);
      }
    }
  }, {
    key: "setMonomerDragCircleHoverAP",
    value: function setMonomerDragCircleHoverAP(monomer, apName) {
      var renderer = monomer.renderer;
      if (renderer instanceof BaseMonomerRenderer.BaseMonomerRenderer) {
        renderer.setDragCircleHoverAttachmentPoint(apName);
      }
    }
  }, {
    key: "getAttachmentPointApproxCanvasPosition",
    value: function getAttachmentPointApproxCanvasPosition(renderer, apName) {
      var center = renderer.center;
      var angleDeg = attachmentPointCalculations.attachmentPointNumberToAngle[apName];
      var outwardAngleDeg = angleDeg - 180;
      var outwardAngleRad = outwardAngleDeg * Math.PI / 180;
      var _renderer$monomerSize = renderer.monomerSize,
        width = _renderer$monomerSize.width,
        height = _renderer$monomerSize.height;
      var bodyRadius = (width + height) / 4;
      var apDistance = bodyRadius + AttachmentPoint.AttachmentPoint.attachmentPointLength + AttachmentPoint.AttachmentPoint.radius;
      return new vec2.Vec2(center.x + Math.cos(outwardAngleRad) * apDistance, center.y + Math.sin(outwardAngleRad) * apDistance);
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
      var cursorCanvas = coordinates.Coordinates.viewToCanvas(new vec2.Vec2(cursorSVGX, cursorSVGY));
      var nearest = null;
      var minDist = threshold;
      var _iterator2 = _createForOfIteratorHelper(this.deps.drawingEntitiesManager.monomers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray__default["default"](_step2.value, 2),
            monomer = _step2$value[1];
          var renderer = monomer.renderer;
          if (!renderer || !(renderer instanceof BaseMonomerRenderer.BaseMonomerRenderer)) continue;
          var _iterator3 = _createForOfIteratorHelper(monomer.unUsedAttachmentPointsNamesList),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var apName = _step3.value;
              if (!(apName in attachmentPointCalculations.attachmentPointNumberToAngle)) {
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
    value: function findPresetMonomerForBonding(addedMonomers, targetAP) {
      return bondConnectionHelpers.findPresetMonomerForBonding(addedMonomers, targetAP);
    }
  }]);
  return LibraryItemDragDropHandler;
}();

exports.LibraryItemDragDropHandler = LibraryItemDragDropHandler;
//# sourceMappingURL=LibraryItemDragDropHandler.js.map
