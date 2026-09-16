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
import { provideEditorInstance } from '../../editorSingleton.modern.js';
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
import { BaseMonomer } from '../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../../domain/entities/Sugar.modern.js';
import '../../../../domain/entities/RNABase.modern.js';
import '../../../../domain/entities/Phosphate.modern.js';
import '../../../../domain/entities/Axis.modern.js';
import { Nucleoside } from '../../../../domain/entities/Nucleoside.modern.js';
import { Nucleotide } from '../../../../domain/entities/Nucleotide.modern.js';
import '../../../../domain/entities/monomer-chains/types.modern.js';
import '../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../domain/entities/UnsplitNucleotide.modern.js';
import { PolymerBond } from '../../../../domain/entities/PolymerBond.modern.js';
import '../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../domain/entities/MonomerToAtomBond.modern.js';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import { Command } from '../../../../domain/entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import { isMacOs } from 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { Atom } from '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import { HalfMonomerSize, StandardBondLength, MonomerSize } from '../../../../domain/constants/monomers.modern.js';
import { getAllConnectedMonomersRecursively } from '../../../../domain/helpers/monomers.modern.js';
import { EditorHistory } from '../../EditorHistory.modern.js';
import { BaseRenderer } from '../../../render/renderers/BaseRenderer.modern.js';
import { Coordinates } from '../../shared/coordinates.modern.js';
import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../../render/renderStruct.modern.js';
import '../../../render/raphaelRender.modern.js';
import '../../../render/restruct/reobject.modern.js';
import '../../../render/restruct/reatom.modern.js';
import '../../../render/restruct/rebond.modern.js';
import '../../../render/restruct/reenhancedFlag.modern.js';
import '../../../render/restruct/refrag.modern.js';
import '../../../render/restruct/rergroup.modern.js';
import '../../../render/restruct/rerxnarrow.modern.js';
import '../../../render/restruct/rerxnplus.modern.js';
import '../../../render/restruct/resgroup.modern.js';
import '../../../render/restruct/resimpleObject.modern.js';
import '../../../render/restruct/restruct.modern.js';
import '../../../render/restruct/retext.modern.js';
import '../../../render/restruct/visel.modern.js';
import '../../../render/restruct/generalEnumTypes.modern.js';
import '../../../render/restruct/showHydrogenLabels.modern.js';
import '../../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../../render/restruct/reImage.modern.js';
import '../../../render/restruct/remultitailArrow.modern.js';
import '../../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../../render/renderers/AtomRenderer.modern.js';
import '../../../render/renderers/ChemRenderer.modern.js';
import '../../../render/renderers/PeptideRenderer.modern.js';
import '../../../render/renderers/PhosphateRenderer.modern.js';
import '../../../render/renderers/SugarRenderer.modern.js';
import '../../../render/renderers/RNABaseRenderer.modern.js';
import '../../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../../render/renderers/SGroupRenderer.modern.js';
import '../../../render/renderers/RenderersManager.modern.js';
import '../../../render/renderers/StereoFlagRenderer.modern.js';
import { SequenceRenderer } from '../../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../../render/scrollbar/scrollbar-container.modern.js';
import '../../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../../render/renderers/constants.modern.js';
import '../../../render/render.types.modern.js';
import { vectorUtils } from '../../shared/vectorUtils.modern.js';
import { getStructureBbox } from '../../../../domain/entities/structureBbox.modern.js';
import { RotationView } from '../../../render/renderers/TransientView/RotationView.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function isGroupCenterSnapResult(result) {
  return result.showGroupCenterSnapping;
}
var SelectBase = function () {
  function SelectBase(editor) {
    var _this = this;
    _classCallCheck(this, SelectBase);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "name", 'select-tool');
    _defineProperty(this, "mousePositionAfterMove", new Vec2(0, 0, 0));
    _defineProperty(this, "mousePositionBeforeMove", new Vec2(0, 0, 0));
    _defineProperty(this, "selectionStartCanvasPosition", new Vec2(0, 0, 0));
    _defineProperty(this, "previousSelectedEntities", []);
    _defineProperty(this, "canvasResizeObserver", void 0);
    _defineProperty(this, "firstMonomerPositionBeforeMove", void 0);
    _defineProperty(this, "mode", 'standby');
    _defineProperty(this, "rotationStartAngle", 0);
    _defineProperty(this, "rotationCenter", null);
    _defineProperty(this, "currentRotationAngle", 0);
    _defineProperty(this, "rotationStartPositions", new Map());
    _defineProperty(this, "userRotationCenter", null);
    _defineProperty(this, "rotationHandleUnsubscribe", void 0);
    _defineProperty(this, "rotationCenterUnsubscribe", void 0);
    _defineProperty(this, "selectEntitiesHandler", function () {
      _this.updateRotationView();
    });
    this.editor = editor;
    this.destroy();
    this.rotationHandleUnsubscribe = RotationView.subscribeRotationHandle(function (payload) {
      if (provideEditorInstance().isSequenceAnyEditMode) return;
      if (_this.mode === 'rotating') return;
      _this.startRotation(payload.event);
    });
    this.rotationCenterUnsubscribe = RotationView.subscribeRotationCenter(function (payload) {
      if (provideEditorInstance().isSequenceAnyEditMode) return;
      _this.startRotationCenterDrag(payload.event);
    });
    this.editor.events.selectEntities.add(this.selectEntitiesHandler);
  }
  _createClass(SelectBase, [{
    key: "startMoveIfNeeded",
    value: function startMoveIfNeeded(renderer) {
      var shouldStartMove;
      if (this.editor.mode.modeName === 'sequence-layout-mode') {
        shouldStartMove = !(renderer instanceof BaseSequenceItemRenderer);
      } else {
        shouldStartMove = true;
      }
      if (shouldStartMove) this.mode = 'moving';
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (provideEditorInstance().isSequenceAnyEditMode) return;
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
      this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;
      this.selectionStartCanvasPosition = Coordinates.viewToCanvas(this.editor.lastCursorPosition);
      if (event.target === this.editor.canvas) {
        if (!event.shiftKey) {
          var modelChanges = new Command();
          modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
          SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
          this.editor.renderersContainer.update(modelChanges);
        }
        this.onSelectionStart();
      } else {
        var _event$target;
        var renderer = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.__data__;
        if (!renderer || !(renderer instanceof BaseRenderer)) {
          var _modelChanges = new Command();
          _modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
          SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
          this.editor.renderersContainer.update(_modelChanges);
          return;
        }
        var modKey = isMacOs ? event.metaKey : event.ctrlKey;
        this.mousedownEntity(renderer, event.shiftKey, modKey, event.altKey);
      }
    }
  }, {
    key: "getCanvasBbox",
    value: function getCanvasBbox(bbox) {
      var topLeft = Coordinates.modelToCanvas(new Vec2(bbox.left, bbox.top));
      var bottomRight = Coordinates.modelToCanvas(new Vec2(bbox.left + bbox.width, bbox.top + bbox.height));
      return {
        left: topLeft.x,
        top: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y
      };
    }
  }, {
    key: "buildRotationViewParams",
    value: function buildRotationViewParams(center, bbox, startAngle) {
      return {
        center: Coordinates.modelToCanvas(center),
        boundingBox: this.getCanvasBbox(bbox),
        cursor: this.editor.lastCursorPosition,
        startAngle: startAngle
      };
    }
  }, {
    key: "startRotation",
    value: function startRotation(event) {
      var _this$userRotationCen;
      event.stopPropagation();
      event.preventDefault();
      this.mode = 'rotating';
      this.rotationCenter = (_this$userRotationCen = this.userRotationCenter) !== null && _this$userRotationCen !== void 0 ? _this$userRotationCen : this.editor.drawingEntitiesManager.getSelectedEntitiesCenter();
      if (!this.rotationCenter) {
        this.mode = 'standby';
        this.rotationStartPositions.clear();
        return;
      }
      this.rotationStartPositions = new Map(this.editor.drawingEntitiesManager.selectedEntitiesArr.map(function (entity) {
        return [entity.id, new Vec2(entity.position)];
      }));
      var canvasCenter = Coordinates.modelToCanvas(this.rotationCenter);
      var cursorPos = this.editor.lastCursorPositionOfCanvas;
      this.rotationStartAngle = Math.atan2(cursorPos.y - canvasCenter.y, cursorPos.x - canvasCenter.x);
      this.currentRotationAngle = 0;
      var bbox = this.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
      if (bbox) {
        var viewParams = this.buildRotationViewParams(this.rotationCenter, bbox, this.rotationStartAngle);
        this.editor.transientDrawingView.showRotation(_objectSpread(_objectSpread({}, viewParams), {}, {
          rotationAngle: 0,
          isRotating: true
        }));
        this.editor.transientDrawingView.update();
      }
    }
  }, {
    key: "startRotationCenterDrag",
    value: function startRotationCenterDrag(event) {
      event.stopPropagation();
      event.preventDefault();
      if (this.editor.drawingEntitiesManager.externalConnectionsToSelection.length) {
        return;
      }
      this.mode = 'rotating-center';
      var cursorCanvas = Coordinates.viewToCanvas(this.editor.lastCursorPosition);
      this.userRotationCenter = Coordinates.canvasToModel(cursorCanvas);
      this.updateRotationView();
    }
  }, {
    key: "mousedownEntity",
    value: function mousedownEntity(renderer) {
      var shiftKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var modKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var altKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var modelChanges = new Command();
      var drawingEntitiesToSelect = [];
      if (renderer instanceof BaseSequenceItemRenderer) {
        var twoStrandedNode = renderer.twoStrandedNode;
        if (twoStrandedNode.senseNode) {
          drawingEntitiesToSelect.push(twoStrandedNode.senseNode.monomer);
        }
        if (twoStrandedNode.antisenseNode) {
          drawingEntitiesToSelect.push(twoStrandedNode.antisenseNode.monomer);
        }
      } else {
        drawingEntitiesToSelect.push(renderer.drawingEntity);
      }
      if (!shiftKey && !modKey && !altKey) {
        this.startMoveIfNeeded(renderer);
        var isSequenceItem = renderer instanceof BaseSequenceItemRenderer;
        if (renderer.drawingEntity.selected && !isSequenceItem) {
          return;
        }
        modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
        SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
        var _this$editor$drawingE = this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(drawingEntitiesToSelect),
          selectModelChanges = _this$editor$drawingE.command;
        modelChanges.merge(selectModelChanges);
      } else if (shiftKey) {
        if (renderer.drawingEntity.selected) {
          return;
        }
        var drawingEntities = [].concat(_toConsumableArray(this.editor.drawingEntitiesManager.selectedEntitiesArr), drawingEntitiesToSelect);
        var _this$editor$drawingE2 = this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(drawingEntities),
          _selectModelChanges = _this$editor$drawingE2.command;
        modelChanges.merge(_selectModelChanges);
      } else if (renderer instanceof BaseSequenceItemRenderer && modKey) {
        var _drawingEntities = renderer.currentChain.nodes.map(function (node) {
          if (node instanceof Nucleoside || node instanceof Nucleotide) {
            return node.monomers;
          } else {
            return node.monomer;
          }
        }).flat();
        _drawingEntities.forEach(function (entity) {
          return entity.turnOnSelection();
        });
        var bondsInsideCurrentChain = renderer.currentChain.bonds.filter(function (bond) {
          var _bond$secondMonomer;
          return bond.firstMonomer.selected && ((_bond$secondMonomer = bond.secondMonomer) === null || _bond$secondMonomer === void 0 ? void 0 : _bond$secondMonomer.selected);
        });
        _drawingEntities = _drawingEntities.concat(bondsInsideCurrentChain);
        modelChanges.merge(this.editor.drawingEntitiesManager.selectDrawingEntities(_drawingEntities));
      } else if (altKey && this.editor.mode.modeName !== 'sequence-layout-mode' && renderer.drawingEntity instanceof BaseMonomer) {
        this.startMoveIfNeeded(renderer);
        var connectedMonomers = getAllConnectedMonomersRecursively(renderer.drawingEntity);
        connectedMonomers.forEach(function (connectedMonomer) {
          return connectedMonomer.turnOnSelection();
        });
        var bondsInsideChain = connectedMonomers.flatMap(function (connectedMonomer) {
          return connectedMonomer.bonds.filter(function (bond) {
            var _bond$secondMonomer2;
            return (bond instanceof PolymerBond || bond instanceof HydrogenBond) && bond.firstMonomer === connectedMonomer && Boolean((_bond$secondMonomer2 = bond.secondMonomer) === null || _bond$secondMonomer2 === void 0 ? void 0 : _bond$secondMonomer2.selected);
          });
        });
        modelChanges.merge(this.editor.drawingEntitiesManager.selectDrawingEntities([].concat(_toConsumableArray(connectedMonomers), _toConsumableArray(bondsInsideChain))));
      }
      modelChanges.merge(this.editor.drawingEntitiesManager.hideAllMonomersHoverAndAttachmentPoints());
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "onSelectionStart",
    value: function onSelectionStart() {
      this.mode = 'selecting';
      this.createSelectionView();
    }
  }, {
    key: "isSelectionRunning",
    value: function isSelectionRunning() {
      return this.mode === 'selecting';
    }
  }, {
    key: "tryToSnap",
    value: function tryToSnap(event, movementDelta) {
      var _this2 = this;
      var snapPosition;
      var emptyResult = {
        snapPosition: null,
        connectionLength: Infinity
      };
      if (this.editor.mode.modeName === 'sequence-layout-mode') {
        return emptyResult;
      }
      var modKeyPressed = isMacOs ? event.metaKey : event.ctrlKey;
      var externalConnectionsToSelection = this.editor.drawingEntitiesManager.externalConnectionsToSelection;
      if (modKeyPressed || externalConnectionsToSelection.length === 0) {
        return emptyResult;
      }
      var snappingOptions = externalConnectionsToSelection.map(function (_ref) {
        var monomerFromSelection = _ref.monomerFromSelection,
          monomerConnectedToSelection = _ref.monomerConnectedToSelection,
          bond = _ref.bond;
        var selectedMonomer = monomerFromSelection;
        var connectedMonomer = monomerConnectedToSelection;
        var connectionLength = Vec2.diff(monomerFromSelection.position, monomerConnectedToSelection.position).length();
        if (!connectedMonomer) {
          return emptyResult;
        }
        var _SelectBase$calculate = SelectBase.calculateDistanceSnap(selectedMonomer.position, selectedMonomer, connectedMonomer),
          distanceSnapPosition = _SelectBase$calculate.distanceSnapPosition,
          snapDistance = _SelectBase$calculate.snapDistance,
          alignment = _SelectBase$calculate.alignment,
          alignedMonomers = _SelectBase$calculate.alignedMonomers;
        var _SelectBase$calculate2 = SelectBase.calculateAngleSnap(selectedMonomer.position.add(movementDelta), connectedMonomer.position, _this2.editor.mode.modeName === 'snake-layout-mode' ? 90 : 30, snapDistance),
          angleSnapPosition = _SelectBase$calculate2.angleSnapPosition,
          snappedAngleRad = _SelectBase$calculate2.snappedAngleRad;
        var _SelectBase$calculate3 = SelectBase.calculateBondLengthSnap(selectedMonomer.position, connectedMonomer.position, snappedAngleRad),
          bondLengthSnapPosition = _SelectBase$calculate3.bondLengthSnapPosition;
        if (bondLengthSnapPosition) {
          snapPosition = bondLengthSnapPosition;
        } else if (angleSnapPosition) {
          snapPosition = angleSnapPosition;
        } else if (distanceSnapPosition) {
          snapPosition = distanceSnapPosition;
        }
        if (!snapPosition) {
          return emptyResult;
        }
        var movementDeltaLength = movementDelta.length();
        var thresholdValue = Boolean(distanceSnapPosition) && Boolean(angleSnapPosition) ? HalfMonomerSize + 0.1 : HalfMonomerSize;
        if (movementDeltaLength >= thresholdValue) {
          return emptyResult;
        }
        var showAngleSnapping = Boolean(angleSnapPosition);
        var showBondLengthSnapping = Boolean(bondLengthSnapPosition);
        var showDistanceSnapping = !showBondLengthSnapping && Boolean(distanceSnapPosition);
        if (!showAngleSnapping && !showBondLengthSnapping && !showDistanceSnapping) {
          return emptyResult;
        }
        return {
          snapPosition: snapPosition.sub(selectedMonomer.position),
          showAngleSnapping: showAngleSnapping,
          bond: bond,
          connectedMonomer: connectedMonomer,
          showBondLengthSnapping: showBondLengthSnapping,
          showDistanceSnapping: showDistanceSnapping,
          showGroupCenterSnapping: false,
          alignment: alignment,
          alignedMonomers: alignedMonomers,
          connectionLength: connectionLength
        };
      });
      var selectedMonomers = this.editor.drawingEntitiesManager.selectedMonomers;
      if (externalConnectionsToSelection.length >= 2 && selectedMonomers.length >= 2) {
        var connectedMonomers = externalConnectionsToSelection.map(function (_ref2) {
          var monomerConnectedToSelection = _ref2.monomerConnectedToSelection;
          return monomerConnectedToSelection;
        });
        var groupCenterSnapResult = SelectBase.calculateGroupCenterSnapPosition(selectedMonomers, connectedMonomers, movementDelta);
        var firstGroupCenterSnapResult = groupCenterSnapResult[0];
        if (firstGroupCenterSnapResult) {
          snappingOptions.push(firstGroupCenterSnapResult);
        }
      }
      snappingOptions.sort(function (a, b) {
        return a.connectionLength - b.connectionLength;
      });
      return snappingOptions[0] || emptyResult;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      var _this$editor$drawingE5,
        _this3 = this;
      if (this.mode === 'standby') {
        return;
      }
      if (this.mode === 'selecting') {
        this.updateSelectionViewParams();
        this.onSelectionMove(event.shiftKey);
        return;
      }
      if (this.mode === 'rotating') {
        this.handleRotationMove(event);
        return;
      }
      if (this.mode === 'rotating-center') {
        var cursorCanvas = Coordinates.viewToCanvas(this.editor.lastCursorPosition);
        this.userRotationCenter = Coordinates.canvasToModel(cursorCanvas);
        this.updateRotationView();
        return;
      }
      if (!this.firstMonomerPositionBeforeMove) {
        var _this$editor$drawingE3, _this$editor$drawingE4;
        this.firstMonomerPositionBeforeMove = (_this$editor$drawingE3 = this.editor.drawingEntitiesManager.selectedMonomers[0]) !== null && _this$editor$drawingE3 !== void 0 && _this$editor$drawingE3.position ? new Vec2((_this$editor$drawingE4 = this.editor.drawingEntitiesManager.selectedMonomers[0]) === null || _this$editor$drawingE4 === void 0 ? void 0 : _this$editor$drawingE4.position) : undefined;
      }
      var firstMonomerPosition = (_this$editor$drawingE5 = this.editor.drawingEntitiesManager.selectedMonomers[0]) === null || _this$editor$drawingE5 === void 0 ? void 0 : _this$editor$drawingE5.position;
      var distanceBetweenFirstMonomerAndCursorBeforeMove = this.firstMonomerPositionBeforeMove && Vec2.diff(Coordinates.modelToCanvas(this.firstMonomerPositionBeforeMove), this.mousePositionBeforeMove);
      var distanceBetweenFirstMonomerAndCursor = firstMonomerPosition && Vec2.diff(Coordinates.modelToCanvas(firstMonomerPosition), this.editor.lastCursorPositionOfCanvas);
      var firstMonomerPositionDelta = distanceBetweenFirstMonomerAndCursorBeforeMove && distanceBetweenFirstMonomerAndCursor && Vec2.diff(distanceBetweenFirstMonomerAndCursorBeforeMove, distanceBetweenFirstMonomerAndCursor);
      var movementDelta = Coordinates.canvasToModel(firstMonomerPositionDelta || new Vec2(this.editor.lastCursorPositionOfCanvas.x - this.mousePositionAfterMove.x, this.editor.lastCursorPositionOfCanvas.y - this.mousePositionAfterMove.y));
      var modelChanges = new Command();
      var snapResult = this.tryToSnap(event, movementDelta);
      var snapPosition = snapResult.snapPosition;
      this.editor.transientDrawingView.clear();
      if (snapPosition) {
        modelChanges.merge(this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(snapPosition));
        if (isGroupCenterSnapResult(snapResult)) {
          this.editor.transientDrawingView.showGroupCenterSnap({
            isVertical: snapResult.isVertical,
            absoluteSnapPosition: snapResult.absoluteSnapPosition,
            monomerPair: snapResult.monomerPair
          });
        } else {
          var showAngleSnapping = snapResult.showAngleSnapping,
            connectedMonomer = snapResult.connectedMonomer,
            bond = snapResult.bond,
            showBondLengthSnapping = snapResult.showBondLengthSnapping,
            showDistanceSnapping = snapResult.showDistanceSnapping,
            alignment = snapResult.alignment,
            alignedMonomers = snapResult.alignedMonomers;
          if (showAngleSnapping) {
            this.editor.transientDrawingView.showAngleSnap({
              connectedMonomer: connectedMonomer,
              polymerBond: bond,
              isBondLengthSnapped: showBondLengthSnapping
            });
          }
          if (showBondLengthSnapping) {
            this.editor.transientDrawingView.showBondSnap(bond);
          }
          if (showDistanceSnapping) {
            this.editor.transientDrawingView.showDistanceSnap({
              alignment: alignment,
              alignedMonomers: alignedMonomers
            });
          }
        }
      } else {
        modelChanges.merge(this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(movementDelta));
      }
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
      requestAnimationFrame(function () {
        _this3.editor.renderersContainer.update(modelChanges);
        _this3.editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
        _this3.editor.transientDrawingView.update();
      });
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      var _event$target2;
      var renderer = (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.__data__;
      var history = EditorHistory.getInstance(this.editor);
      try {
        var _renderer$drawingEnti;
        if (this.mode === 'rotating') {
          this.finishRotation();
          return;
        }
        if (this.mode === 'rotating-center') {
          this.mode = 'standby';
          this.updateRotationView();
          return;
        }
        if (this.mode === 'moving' && (renderer !== null && renderer !== void 0 && (_renderer$drawingEnti = renderer.drawingEntity) !== null && _renderer$drawingEnti !== void 0 && _renderer$drawingEnti.selected || this.editor.drawingEntitiesManager.selectedEntitiesArr.length > 0)) {
          var selectedMonomers = this.editor.drawingEntitiesManager.selectedMonomers;
          var hasMonomerSelection = selectedMonomers.length > 0;
          if (hasMonomerSelection) {
            var _selectedMonomers$;
            var firstMonomerCurrentPosition = (_selectedMonomers$ = selectedMonomers[0]) === null || _selectedMonomers$ === void 0 ? void 0 : _selectedMonomers$.position;
            var actualMovementDelta = this.firstMonomerPositionBeforeMove && firstMonomerCurrentPosition ? Vec2.diff(firstMonomerCurrentPosition, this.firstMonomerPositionBeforeMove) : undefined;
            var epsilon = 0.001;
            if (!actualMovementDelta || actualMovementDelta.length() < epsilon) {
              return;
            }
            var modelChanges = this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(new Vec2(0, 0), actualMovementDelta);
            history.update(modelChanges);
          } else {
            var canvasDelta = Vec2.diff(this.mousePositionAfterMove, this.mousePositionBeforeMove);
            if (canvasDelta.length() === 0) {
              return;
            }
            var fullMovementOffset = Coordinates.canvasToModel(canvasDelta);
            var _modelChanges2 = this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(new Vec2(0, 0), fullMovementOffset);
            history.update(_modelChanges2);
          }
        }
      } finally {
        this.firstMonomerPositionBeforeMove = undefined;
        this.stopMovement();
        this.setSelectedEntities();
      }
    }
  }, {
    key: "mouseOverDrawingEntity",
    value: function mouseOverDrawingEntity(event) {
      var renderer = SelectBase.getRendererFromEvent(event);
      if (!renderer) {
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.intendToSelectDrawingEntity(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseLeaveDrawingEntity",
    value: function mouseLeaveDrawingEntity(event) {
      var renderer = SelectBase.getRendererFromEvent(event);
      if (!renderer) {
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.cancelIntentionToSelectDrawingEntity(renderer.drawingEntity);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseOverPolymerBond",
    value: function mouseOverPolymerBond(event) {
      if (event.buttons === 1) {
        return;
      }
      var renderer = SelectBase.getRendererFromEvent(event);
      if (!renderer) {
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.showPolymerBondInformation(renderer.polymerBond);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseLeavePolymerBond",
    value: function mouseLeavePolymerBond(event) {
      var renderer = SelectBase.getRendererFromEvent(event);
      if (!(renderer !== null && renderer !== void 0 && renderer.polymerBond)) {
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.hidePolymerBondInformation(renderer.polymerBond);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "setSelectedEntities",
    value: function setSelectedEntities() {
      this.previousSelectedEntities = this.editor.drawingEntitiesManager.selectedEntities;
      this.editor.events.selectEntities.dispatch(this.previousSelectedEntities.map(function (entity) {
        return entity[1];
      }));
      this.updateRotationView();
    }
  }, {
    key: "updateRotationView",
    value: function updateRotationView() {
      var _this$userRotationCen2;
      var selectedEntities = this.editor.drawingEntitiesManager.selectedEntitiesArr;
      var selectedMonomersAndAtoms = selectedEntities.filter(function (entity) {
        return entity instanceof BaseMonomer || entity instanceof Atom;
      });
      if (selectedMonomersAndAtoms.length < 2 || this.editor.mode.modeName === 'sequence-layout-mode' || this.mode !== 'standby' && this.mode !== 'rotating-center') {
        this.editor.transientDrawingView.hideRotation();
        this.editor.transientDrawingView.update();
        return;
      }
      var bbox = this.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
      var center = (_this$userRotationCen2 = this.userRotationCenter) !== null && _this$userRotationCen2 !== void 0 ? _this$userRotationCen2 : this.editor.drawingEntitiesManager.getSelectedEntitiesCenter();
      if (!bbox || !center) {
        this.editor.transientDrawingView.hideRotation();
        this.editor.transientDrawingView.update();
        return;
      }
      var viewParams = this.buildRotationViewParams(center, bbox);
      this.editor.transientDrawingView.showRotation(viewParams);
      this.editor.transientDrawingView.update();
    }
  }, {
    key: "handleRotationMove",
    value: function handleRotationMove(event) {
      var _this4 = this;
      if (!this.rotationCenter) return;
      var canvasCenter = Coordinates.modelToCanvas(this.rotationCenter);
      var cursorPos = this.editor.lastCursorPositionOfCanvas;
      var currentAngle = Math.atan2(cursorPos.y - canvasCenter.y, cursorPos.x - canvasCenter.x);
      var angleDelta = currentAngle - this.rotationStartAngle;
      var angleDeltaDegrees = angleDelta * 180 / Math.PI;
      if (!event.ctrlKey) {
        var snapAngle = SelectBase.ROTATION_SNAP_ANGLE;
        angleDeltaDegrees = Math.round(angleDeltaDegrees / snapAngle) * snapAngle;
        angleDelta = angleDeltaDegrees * Math.PI / 180;
      }
      var incrementalDegrees = angleDeltaDegrees - this.currentRotationAngle;
      this.currentRotationAngle = angleDeltaDegrees;
      var modelChanges = this.editor.drawingEntitiesManager.rotateSelectedDrawingEntities(this.rotationCenter, incrementalDegrees, true);
      requestAnimationFrame(function () {
        _this4.editor.renderersContainer.update(modelChanges);
        _this4.editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
        var bbox = _this4.editor.drawingEntitiesManager.getSelectedEntitiesBoundingBox();
        if (bbox && _this4.rotationCenter) {
          var viewParams = _this4.buildRotationViewParams(_this4.rotationCenter, bbox, _this4.rotationStartAngle);
          _this4.editor.transientDrawingView.showRotation(_objectSpread(_objectSpread({}, viewParams), {}, {
            rotationAngle: angleDelta,
            isRotating: true
          }));
          _this4.editor.transientDrawingView.update();
        }
      });
    }
  }, {
    key: "finishRotation",
    value: function finishRotation() {
      var history = EditorHistory.getInstance(this.editor);
      if (!this.rotationCenter || Math.abs(this.currentRotationAngle) < SelectBase.ROTATION_ANGLE_EPSILON) {
        this.mode = 'standby';
        this.rotationCenter = null;
        this.userRotationCenter = null;
        this.currentRotationAngle = 0;
        this.rotationStartPositions.clear();
        this.updateRotationView();
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.createRotationHistoryCommand(this.rotationStartPositions);
      history.update(modelChanges);
      this.mode = 'standby';
      this.rotationCenter = null;
      this.userRotationCenter = null;
      this.currentRotationAngle = 0;
      this.rotationStartPositions.clear();
      this.updateRotationView();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this$canvasResizeObs, _this$rotationHandleU, _this$rotationCenterU, _this$editor$selected;
      (_this$canvasResizeObs = this.canvasResizeObserver) === null || _this$canvasResizeObs === void 0 || _this$canvasResizeObs.disconnect();
      (_this$rotationHandleU = this.rotationHandleUnsubscribe) === null || _this$rotationHandleU === void 0 || _this$rotationHandleU.call(this);
      (_this$rotationCenterU = this.rotationCenterUnsubscribe) === null || _this$rotationCenterU === void 0 || _this$rotationCenterU.call(this);
      this.editor.events.selectEntities.remove(this.selectEntitiesHandler);
      if (((_this$editor$selected = this.editor.selectedTool) === null || _this$editor$selected === void 0 ? void 0 : _this$editor$selected.name) !== 'eraser-tool') {
        var modelChanges = this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
        SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
        this.editor.renderersContainer.update(modelChanges);
      }
    }
  }, {
    key: "stopMovement",
    value: function stopMovement() {
      this.mode = 'standby';
      this.editor.transientDrawingView.clear();
    }
  }], [{
    key: "getRendererFromEvent",
    value:
    function getRendererFromEvent(event) {
      var _event$target3;
      return (_event$target3 = event.target) === null || _event$target3 === void 0 ? void 0 : _event$target3.__data__;
    }
  }, {
    key: "calculateAngleSnap",
    value: function calculateAngleSnap(monomerPositionPlusCursorDelta, connectedPosition, snapAngle, snappedDistance) {
      var angle = vectorUtils.calcAngle(monomerPositionPlusCursorDelta, connectedPosition);
      var angleInDegrees = (angle * 180 / Math.PI + 360) % 360;
      var snapRest = Math.abs(angleInDegrees % snapAngle);
      var leftBorder = snapAngle / 3;
      var rightBorder = 2 * snapAngle / 3;
      var snappedAngle = null;
      if (snapRest < leftBorder) {
        snappedAngle = angleInDegrees - snapRest;
      } else if (snapRest > rightBorder) {
        snappedAngle = angleInDegrees + snapAngle - snapRest;
      }
      if (snappedAngle === null) {
        return {
          angleSnapPosition: null
        };
      }
      var snappedAngleRad = snappedAngle * Math.PI / 180;
      var distance = snappedDistance !== null && snappedDistance !== void 0 ? snappedDistance : Vec2.diff(monomerPositionPlusCursorDelta, connectedPosition).length();
      var angleSnapPosition = new Vec2(connectedPosition.x - distance * Math.cos(snappedAngleRad), connectedPosition.y - distance * Math.sin(snappedAngleRad));
      var isAngleSnapped = Vec2.diff(monomerPositionPlusCursorDelta, angleSnapPosition).length() < HalfMonomerSize;
      if (!isAngleSnapped) {
        return {
          angleSnapPosition: null
        };
      }
      return {
        angleSnapPosition: angleSnapPosition,
        snappedAngleRad: snappedAngleRad
      };
    }
  }, {
    key: "calculateBondLengthSnap",
    value: function calculateBondLengthSnap(cursorPosition, connectedPosition, snappedAngle) {
      var currentDistance = Vec2.diff(cursorPosition, connectedPosition).length();
      var isBondLengthSnapped = Math.abs(currentDistance - StandardBondLength) < HalfMonomerSize;
      if (!isBondLengthSnapped) {
        return {
          bondLengthSnapPosition: null
        };
      }
      var editor = provideEditorInstance();
      var angle;
      if (editor.mode.modeName === 'snake-layout-mode') {
        var rawAngle = vectorUtils.calcAngle(cursorPosition, connectedPosition);
        rawAngle = (rawAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        var step = Math.PI / 2;
        angle = Math.round(rawAngle / step) * step;
      } else {
        angle = snappedAngle !== null && snappedAngle !== void 0 ? snappedAngle : vectorUtils.calcAngle(cursorPosition, connectedPosition);
      }
      var bondLengthSnapPosition = new Vec2(connectedPosition.x + StandardBondLength * -Math.cos(angle), connectedPosition.y + StandardBondLength * -Math.sin(angle));
      return {
        bondLengthSnapPosition: bondLengthSnapPosition
      };
    }
  }, {
    key: "needApplyGroupCenterSnapForOneAxis",
    value: function needApplyGroupCenterSnapForOneAxis(pointToCheck, snappingPoint, threshold, pointToCheckOnAnotherAxis, snappingPointOnAnotherAxis, thresholdOnAnotherAxis) {
      return pointToCheck < snappingPoint + threshold && pointToCheck > snappingPoint - threshold && pointToCheckOnAnotherAxis < snappingPointOnAnotherAxis + thresholdOnAnotherAxis && pointToCheckOnAnotherAxis > snappingPointOnAnotherAxis - thresholdOnAnotherAxis;
    }
  }, {
    key: "calculateGroupCenterSnapPosition",
    value: function calculateGroupCenterSnapPosition(selectedEntities, connectedMonomers, movementDelta) {
      var results = [];
      var selectedEntitiesBbox = getStructureBbox(selectedEntities);
      var selectedEntitiesCenter = new Vec2(selectedEntitiesBbox.left + selectedEntitiesBbox.width / 2, selectedEntitiesBbox.top + selectedEntitiesBbox.height / 2);
      var selectedEntitiesCenterWithMovementDelta = selectedEntitiesCenter.add(movementDelta);
      for (var i = 0; i < connectedMonomers.length; i++) {
        for (var j = i + 1; j < connectedMonomers.length; j++) {
          var monomerA = connectedMonomers[i];
          var monomerB = connectedMonomers[j];
          var pairBbox = getStructureBbox([monomerA, monomerB]);
          var pairCenter = new Vec2(pairBbox.left + pairBbox.width / 2, pairBbox.top + pairBbox.height / 2);
          if (SelectBase.needApplyGroupCenterSnapForOneAxis(selectedEntitiesCenterWithMovementDelta.x, pairCenter.x, HalfMonomerSize, selectedEntitiesCenterWithMovementDelta.y, pairCenter.y, HalfMonomerSize * 2)) {
            results.push({
              snapPosition: Vec2.diff(pairCenter, selectedEntitiesCenter),
              isVertical: false,
              absoluteSnapPosition: pairCenter,
              monomerPair: [monomerA, monomerB],
              connectionLength: 0,
              showGroupCenterSnapping: true
            });
          } else if (SelectBase.needApplyGroupCenterSnapForOneAxis(selectedEntitiesCenterWithMovementDelta.y, pairCenter.y, HalfMonomerSize, selectedEntitiesCenterWithMovementDelta.x, pairCenter.x, HalfMonomerSize * 2)) {
            results.push({
              snapPosition: Vec2.diff(pairCenter, selectedEntitiesCenter),
              isVertical: true,
              absoluteSnapPosition: pairCenter,
              monomerPair: [monomerA, monomerB],
              connectionLength: 0,
              showGroupCenterSnapping: true
            });
          }
        }
      }
      return results;
    }
  }, {
    key: "determineAlignment",
    value: function determineAlignment(firstPosition, secondPosition) {
      var verticalDiff = Math.abs(firstPosition.y - secondPosition.y);
      var horizontalDiff = Math.abs(firstPosition.x - secondPosition.x);
      if (verticalDiff < MonomerSize && horizontalDiff >= MonomerSize) {
        return 'horizontal';
      } else if (horizontalDiff < MonomerSize && verticalDiff >= MonomerSize) {
        return 'vertical';
      }
      return null;
    }
  }, {
    key: "checkMonomersAlignment",
    value: function checkMonomersAlignment(firstMonomer, secondMonomer, snapAlignment, distance) {
      var alignment = SelectBase.determineAlignment(firstMonomer.center, secondMonomer.center);
      if (alignment !== snapAlignment) {
        return false;
      }
      var distanceBetweenMonomers = alignment === 'horizontal' ? Math.abs(firstMonomer.center.x - secondMonomer.center.x) : Math.abs(firstMonomer.center.y - secondMonomer.center.y);
      return Math.abs(distanceBetweenMonomers - distance) < 0.0001;
    }
  }, {
    key: "getNextMonomers",
    value: function getNextMonomers(currentMonomer, visitedMonomers) {
      return currentMonomer.polymerBondsSortedByLength.map(function (bond) {
        return bond.getAnotherMonomer(currentMonomer);
      }).filter(function (monomer) {
        return monomer && !visitedMonomers.has(monomer.id);
      });
    }
  }, {
    key: "findRemainingAlignedMonomers",
    value: function findRemainingAlignedMonomers(startingMonomer, initialState, alignment, distance) {
      var visitedMonomers = new Set(initialState.map(function (monomer) {
        return monomer.id;
      }));
      var remainingAlignedMonomers = [];
      var traverse = function traverse(currentMonomer) {
        var nextMonomers = SelectBase.getNextMonomers(currentMonomer, visitedMonomers);
        var _iterator = _createForOfIteratorHelper(nextMonomers),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var nextMonomer = _step.value;
            if (!nextMonomer) {
              continue;
            }
            if (SelectBase.checkMonomersAlignment(currentMonomer, nextMonomer, alignment, distance)) {
              visitedMonomers.add(nextMonomer.id);
              remainingAlignedMonomers.push(nextMonomer);
              traverse(nextMonomer);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };
      traverse(startingMonomer);
      return remainingAlignedMonomers;
    }
  }, {
    key: "calculateSideDistanceSnap",
    value: function calculateSideDistanceSnap(cursorPosition, initialMonomer, connectedMonomer) {
      var bondToMonomerForAlignment = connectedMonomer.polymerBondsSortedByLength.find(function (bond) {
        return bond.getAnotherMonomer(connectedMonomer) !== initialMonomer;
      });
      if (!bondToMonomerForAlignment) {
        return {
          distanceSnapPosition: null
        };
      }
      var monomerForAlignment = bondToMonomerForAlignment.getAnotherMonomer(connectedMonomer);
      if (!monomerForAlignment) {
        return {
          distanceSnapPosition: null
        };
      }
      var alignment = SelectBase.determineAlignment(connectedMonomer.center, monomerForAlignment.center);
      if (!alignment) {
        return {
          distanceSnapPosition: null
        };
      }
      var isHorizontal = alignment === 'horizontal';
      var primaryAxis = isHorizontal ? 'x' : 'y';
      var secondaryAxis = isHorizontal ? 'y' : 'x';
      if (Math.abs(cursorPosition[secondaryAxis] - connectedMonomer.center[secondaryAxis]) >= MonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var snapDistance = Math.abs(connectedMonomer.center[primaryAxis] - monomerForAlignment.center[primaryAxis]);
      var distanceToMonomerForSnapping = Math.abs(cursorPosition[primaryAxis] - connectedMonomer.center[primaryAxis]);
      if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= HalfMonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var sign = Math.sign(connectedMonomer.center[primaryAxis] - cursorPosition[primaryAxis]);
      var newPrimaryCoord = connectedMonomer.center[primaryAxis] - sign * snapDistance;
      var distanceSnapPosition = isHorizontal ? new Vec2(newPrimaryCoord, cursorPosition.y) : new Vec2(cursorPosition.x, newPrimaryCoord);
      var alignedMonomers = [initialMonomer, connectedMonomer, monomerForAlignment];
      var additionalAlignedMonomers = SelectBase.findRemainingAlignedMonomers(monomerForAlignment, alignedMonomers, alignment, snapDistance);
      return {
        snapDistance: snapDistance,
        distanceSnapPosition: distanceSnapPosition,
        alignment: alignment,
        alignedMonomers: [].concat(alignedMonomers, _toConsumableArray(additionalAlignedMonomers))
      };
    }
  }, {
    key: "calculateInBetweenDistanceSnap",
    value: function calculateInBetweenDistanceSnap(cursorPosition, initialMonomer, firstConnectedMonomer, secondConnectedMonomer, alignment) {
      var isHorizontal = alignment === 'horizontal';
      var primaryAxis = isHorizontal ? 'x' : 'y';
      var secondaryAxis = isHorizontal ? 'y' : 'x';
      var firstDelta = Math.abs(cursorPosition[secondaryAxis] - firstConnectedMonomer.center[secondaryAxis]);
      var secondDelta = Math.abs(cursorPosition[secondaryAxis] - secondConnectedMonomer.center[secondaryAxis]);
      if (firstDelta >= MonomerSize || secondDelta >= MonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var distanceToMonomerForSnapping = Math.abs(cursorPosition[primaryAxis] - firstConnectedMonomer.center[primaryAxis]);
      var snapDistance = Math.abs(firstConnectedMonomer.center[primaryAxis] - secondConnectedMonomer.center[primaryAxis]) / 2;
      if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= HalfMonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var midPoint = (firstConnectedMonomer.center[primaryAxis] + secondConnectedMonomer.center[primaryAxis]) / 2;
      var distanceSnapPosition = isHorizontal ? new Vec2(midPoint, cursorPosition.y) : new Vec2(cursorPosition.x, midPoint);
      var alignedMonomers = [initialMonomer, firstConnectedMonomer, secondConnectedMonomer];
      var additionalAlignedMonomersFromOneSide = SelectBase.findRemainingAlignedMonomers(firstConnectedMonomer, alignedMonomers, alignment, snapDistance);
      var additionalAlignedMonomersFromOtherSide = SelectBase.findRemainingAlignedMonomers(secondConnectedMonomer, alignedMonomers, alignment, snapDistance);
      return {
        snapDistance: snapDistance,
        distanceSnapPosition: distanceSnapPosition,
        alignment: alignment,
        alignedMonomers: [].concat(alignedMonomers, _toConsumableArray(additionalAlignedMonomersFromOneSide), _toConsumableArray(additionalAlignedMonomersFromOtherSide))
      };
    }
  }, {
    key: "calculateDistanceSnap",
    value: function calculateDistanceSnap(cursorPosition, initialMonomer, connectedMonomer) {
      var secondShortestBond = initialMonomer.polymerBondsSortedByLength[1];
      if (!secondShortestBond) {
        return SelectBase.calculateSideDistanceSnap(cursorPosition, initialMonomer, connectedMonomer);
      }
      var secondConnectedMonomer = secondShortestBond.getAnotherMonomer(initialMonomer);
      if (!secondConnectedMonomer) {
        return SelectBase.calculateSideDistanceSnap(cursorPosition, initialMonomer, connectedMonomer);
      }
      var alignment = SelectBase.determineAlignment(connectedMonomer.center, secondConnectedMonomer.center);
      if (!alignment) {
        return SelectBase.calculateSideDistanceSnap(cursorPosition, initialMonomer, connectedMonomer);
      }
      return SelectBase.calculateInBetweenDistanceSnap(cursorPosition, initialMonomer, connectedMonomer, secondConnectedMonomer, alignment);
    }
  }]);
  return SelectBase;
}();
_defineProperty(SelectBase, "ROTATION_SNAP_ANGLE", 15);
_defineProperty(SelectBase, "ROTATION_ANGLE_EPSILON", 0.001);

export { SelectBase };
//# sourceMappingURL=SelectBase.modern.js.map
