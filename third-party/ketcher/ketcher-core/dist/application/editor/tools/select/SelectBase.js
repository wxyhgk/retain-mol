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
var editorSingleton = require('../../editorSingleton.js');
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
var BaseMonomer = require('../../../../domain/entities/BaseMonomer.js');
require('../../../../domain/entities/Chem.js');
require('../../../../domain/entities/Sugar.js');
require('../../../../domain/entities/RNABase.js');
require('../../../../domain/entities/Phosphate.js');
require('../../../../domain/entities/Axis.js');
var Nucleoside = require('../../../../domain/entities/Nucleoside.js');
var Nucleotide = require('../../../../domain/entities/Nucleotide.js');
require('../../../../domain/entities/monomer-chains/types.js');
require('../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../../domain/entities/MonomerSequenceNode.js');
require('../../../../domain/entities/EmptySequenceNode.js');
require('../../../../domain/entities/LinkerSequenceNode.js');
require('../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../domain/entities/UnsplitNucleotide.js');
var PolymerBond = require('../../../../domain/entities/PolymerBond.js');
require('../../../../domain/entities/AmbiguousMonomer.js');
require('../../../../domain/entities/MonomerToAtomBond.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');
require('../../../../domain/entities/SGroupDrawingEntity.js');
require('../../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
var Command = require('../../../../domain/entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
var reactDeviceDetect = require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var CoreAtom = require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
var monomers$1 = require('../../../../domain/constants/monomers.js');
var monomers = require('../../../../domain/helpers/monomers.js');
var EditorHistory = require('../../EditorHistory.js');
var BaseRenderer = require('../../../render/renderers/BaseRenderer.js');
var coordinates = require('../../shared/coordinates.js');
var BaseSequenceItemRenderer = require('../../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../../render/renderStruct.js');
require('../../../render/raphaelRender.js');
require('../../../render/restruct/reobject.js');
require('../../../render/restruct/reatom.js');
require('../../../render/restruct/rebond.js');
require('../../../render/restruct/reenhancedFlag.js');
require('../../../render/restruct/refrag.js');
require('../../../render/restruct/rergroup.js');
require('../../../render/restruct/rerxnarrow.js');
require('../../../render/restruct/rerxnplus.js');
require('../../../render/restruct/resgroup.js');
require('../../../render/restruct/resimpleObject.js');
require('../../../render/restruct/restruct.js');
require('../../../render/restruct/retext.js');
require('../../../render/restruct/visel.js');
require('../../../render/restruct/generalEnumTypes.js');
require('../../../render/restruct/showHydrogenLabels.js');
require('../../../render/restruct/rergroupAttachmentPoint.js');
require('../../../render/restruct/reImage.js');
require('../../../render/restruct/remultitailArrow.js');
require('../../../render/renderers/BaseMonomerRenderer.js');
require('../../../render/renderers/AtomRenderer.js');
require('../../../render/renderers/ChemRenderer.js');
require('../../../render/renderers/PeptideRenderer.js');
require('../../../render/renderers/PhosphateRenderer.js');
require('../../../render/renderers/SugarRenderer.js');
require('../../../render/renderers/RNABaseRenderer.js');
require('../../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../../render/renderers/UnsplitNucleotideRenderer.js');
require('../../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../../render/renderers/SGroupRenderer.js');
require('../../../render/renderers/RenderersManager.js');
require('../../../render/renderers/StereoFlagRenderer.js');
var SequenceRenderer = require('../../../render/renderers/sequence/SequenceRenderer.js');
require('../../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
require('../../../render/scrollbar/scrollbar-container.js');
require('../../../render/notifyRenderComplete.js');
require('lodash');
require('../../../render/renderers/constants.js');
require('../../../render/render.types.js');
var vectorUtils = require('../../shared/vectorUtils.js');
var structureBbox = require('../../../../domain/entities/structureBbox.js');
var RotationView = require('../../../render/renderers/TransientView/RotationView.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function isGroupCenterSnapResult(result) {
  return result.showGroupCenterSnapping;
}
var SelectBase = function () {
  function SelectBase(editor) {
    var _this = this;
    _classCallCheck__default["default"](this, SelectBase);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "name", 'select-tool');
    _defineProperty__default["default"](this, "mousePositionAfterMove", new vec2.Vec2(0, 0, 0));
    _defineProperty__default["default"](this, "mousePositionBeforeMove", new vec2.Vec2(0, 0, 0));
    _defineProperty__default["default"](this, "selectionStartCanvasPosition", new vec2.Vec2(0, 0, 0));
    _defineProperty__default["default"](this, "previousSelectedEntities", []);
    _defineProperty__default["default"](this, "canvasResizeObserver", void 0);
    _defineProperty__default["default"](this, "firstMonomerPositionBeforeMove", void 0);
    _defineProperty__default["default"](this, "mode", 'standby');
    _defineProperty__default["default"](this, "rotationStartAngle", 0);
    _defineProperty__default["default"](this, "rotationCenter", null);
    _defineProperty__default["default"](this, "currentRotationAngle", 0);
    _defineProperty__default["default"](this, "rotationStartPositions", new Map());
    _defineProperty__default["default"](this, "userRotationCenter", null);
    _defineProperty__default["default"](this, "rotationHandleUnsubscribe", void 0);
    _defineProperty__default["default"](this, "rotationCenterUnsubscribe", void 0);
    _defineProperty__default["default"](this, "selectEntitiesHandler", function () {
      _this.updateRotationView();
    });
    this.editor = editor;
    this.destroy();
    this.rotationHandleUnsubscribe = RotationView.RotationView.subscribeRotationHandle(function (payload) {
      if (editorSingleton.provideEditorInstance().isSequenceAnyEditMode) return;
      if (_this.mode === 'rotating') return;
      _this.startRotation(payload.event);
    });
    this.rotationCenterUnsubscribe = RotationView.RotationView.subscribeRotationCenter(function (payload) {
      if (editorSingleton.provideEditorInstance().isSequenceAnyEditMode) return;
      _this.startRotationCenterDrag(payload.event);
    });
    this.editor.events.selectEntities.add(this.selectEntitiesHandler);
  }
  _createClass__default["default"](SelectBase, [{
    key: "startMoveIfNeeded",
    value: function startMoveIfNeeded(renderer) {
      var shouldStartMove;
      if (this.editor.mode.modeName === 'sequence-layout-mode') {
        shouldStartMove = !(renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      } else {
        shouldStartMove = true;
      }
      if (shouldStartMove) this.mode = 'moving';
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (editorSingleton.provideEditorInstance().isSequenceAnyEditMode) return;
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
      this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;
      this.selectionStartCanvasPosition = coordinates.Coordinates.viewToCanvas(this.editor.lastCursorPosition);
      if (event.target === this.editor.canvas) {
        if (!event.shiftKey) {
          var modelChanges = new Command.Command();
          modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
          SequenceRenderer.SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
          this.editor.renderersContainer.update(modelChanges);
        }
        this.onSelectionStart();
      } else {
        var _event$target;
        var renderer = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.__data__;
        if (!renderer || !(renderer instanceof BaseRenderer.BaseRenderer)) {
          var _modelChanges = new Command.Command();
          _modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
          SequenceRenderer.SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
          this.editor.renderersContainer.update(_modelChanges);
          return;
        }
        var modKey = reactDeviceDetect.isMacOs ? event.metaKey : event.ctrlKey;
        this.mousedownEntity(renderer, event.shiftKey, modKey, event.altKey);
      }
    }
  }, {
    key: "getCanvasBbox",
    value: function getCanvasBbox(bbox) {
      var topLeft = coordinates.Coordinates.modelToCanvas(new vec2.Vec2(bbox.left, bbox.top));
      var bottomRight = coordinates.Coordinates.modelToCanvas(new vec2.Vec2(bbox.left + bbox.width, bbox.top + bbox.height));
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
        center: coordinates.Coordinates.modelToCanvas(center),
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
        return [entity.id, new vec2.Vec2(entity.position)];
      }));
      var canvasCenter = coordinates.Coordinates.modelToCanvas(this.rotationCenter);
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
      var cursorCanvas = coordinates.Coordinates.viewToCanvas(this.editor.lastCursorPosition);
      this.userRotationCenter = coordinates.Coordinates.canvasToModel(cursorCanvas);
      this.updateRotationView();
    }
  }, {
    key: "mousedownEntity",
    value: function mousedownEntity(renderer) {
      var shiftKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var modKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var altKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var modelChanges = new Command.Command();
      var drawingEntitiesToSelect = [];
      if (renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) {
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
        var isSequenceItem = renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer;
        if (renderer.drawingEntity.selected && !isSequenceItem) {
          return;
        }
        modelChanges.merge(this.editor.drawingEntitiesManager.unselectAllDrawingEntities());
        SequenceRenderer.SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
        var _this$editor$drawingE = this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(drawingEntitiesToSelect),
          selectModelChanges = _this$editor$drawingE.command;
        modelChanges.merge(selectModelChanges);
      } else if (shiftKey) {
        if (renderer.drawingEntity.selected) {
          return;
        }
        var drawingEntities = [].concat(_toConsumableArray__default["default"](this.editor.drawingEntitiesManager.selectedEntitiesArr), drawingEntitiesToSelect);
        var _this$editor$drawingE2 = this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(drawingEntities),
          _selectModelChanges = _this$editor$drawingE2.command;
        modelChanges.merge(_selectModelChanges);
      } else if (renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer && modKey) {
        var _drawingEntities = renderer.currentChain.nodes.map(function (node) {
          if (node instanceof Nucleoside.Nucleoside || node instanceof Nucleotide.Nucleotide) {
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
      } else if (altKey && this.editor.mode.modeName !== 'sequence-layout-mode' && renderer.drawingEntity instanceof BaseMonomer.BaseMonomer) {
        this.startMoveIfNeeded(renderer);
        var connectedMonomers = monomers.getAllConnectedMonomersRecursively(renderer.drawingEntity);
        connectedMonomers.forEach(function (connectedMonomer) {
          return connectedMonomer.turnOnSelection();
        });
        var bondsInsideChain = connectedMonomers.flatMap(function (connectedMonomer) {
          return connectedMonomer.bonds.filter(function (bond) {
            var _bond$secondMonomer2;
            return (bond instanceof PolymerBond.PolymerBond || bond instanceof HydrogenBond.HydrogenBond) && bond.firstMonomer === connectedMonomer && Boolean((_bond$secondMonomer2 = bond.secondMonomer) === null || _bond$secondMonomer2 === void 0 ? void 0 : _bond$secondMonomer2.selected);
          });
        });
        modelChanges.merge(this.editor.drawingEntitiesManager.selectDrawingEntities([].concat(_toConsumableArray__default["default"](connectedMonomers), _toConsumableArray__default["default"](bondsInsideChain))));
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
      var modKeyPressed = reactDeviceDetect.isMacOs ? event.metaKey : event.ctrlKey;
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
        var connectionLength = vec2.Vec2.diff(monomerFromSelection.position, monomerConnectedToSelection.position).length();
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
        var thresholdValue = Boolean(distanceSnapPosition) && Boolean(angleSnapPosition) ? monomers$1.HalfMonomerSize + 0.1 : monomers$1.HalfMonomerSize;
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
        var cursorCanvas = coordinates.Coordinates.viewToCanvas(this.editor.lastCursorPosition);
        this.userRotationCenter = coordinates.Coordinates.canvasToModel(cursorCanvas);
        this.updateRotationView();
        return;
      }
      if (!this.firstMonomerPositionBeforeMove) {
        var _this$editor$drawingE3, _this$editor$drawingE4;
        this.firstMonomerPositionBeforeMove = (_this$editor$drawingE3 = this.editor.drawingEntitiesManager.selectedMonomers[0]) !== null && _this$editor$drawingE3 !== void 0 && _this$editor$drawingE3.position ? new vec2.Vec2((_this$editor$drawingE4 = this.editor.drawingEntitiesManager.selectedMonomers[0]) === null || _this$editor$drawingE4 === void 0 ? void 0 : _this$editor$drawingE4.position) : undefined;
      }
      var firstMonomerPosition = (_this$editor$drawingE5 = this.editor.drawingEntitiesManager.selectedMonomers[0]) === null || _this$editor$drawingE5 === void 0 ? void 0 : _this$editor$drawingE5.position;
      var distanceBetweenFirstMonomerAndCursorBeforeMove = this.firstMonomerPositionBeforeMove && vec2.Vec2.diff(coordinates.Coordinates.modelToCanvas(this.firstMonomerPositionBeforeMove), this.mousePositionBeforeMove);
      var distanceBetweenFirstMonomerAndCursor = firstMonomerPosition && vec2.Vec2.diff(coordinates.Coordinates.modelToCanvas(firstMonomerPosition), this.editor.lastCursorPositionOfCanvas);
      var firstMonomerPositionDelta = distanceBetweenFirstMonomerAndCursorBeforeMove && distanceBetweenFirstMonomerAndCursor && vec2.Vec2.diff(distanceBetweenFirstMonomerAndCursorBeforeMove, distanceBetweenFirstMonomerAndCursor);
      var movementDelta = coordinates.Coordinates.canvasToModel(firstMonomerPositionDelta || new vec2.Vec2(this.editor.lastCursorPositionOfCanvas.x - this.mousePositionAfterMove.x, this.editor.lastCursorPositionOfCanvas.y - this.mousePositionAfterMove.y));
      var modelChanges = new Command.Command();
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
      var history = EditorHistory.EditorHistory.getInstance(this.editor);
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
            var actualMovementDelta = this.firstMonomerPositionBeforeMove && firstMonomerCurrentPosition ? vec2.Vec2.diff(firstMonomerCurrentPosition, this.firstMonomerPositionBeforeMove) : undefined;
            var epsilon = 0.001;
            if (!actualMovementDelta || actualMovementDelta.length() < epsilon) {
              return;
            }
            var modelChanges = this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(new vec2.Vec2(0, 0), actualMovementDelta);
            history.update(modelChanges);
          } else {
            var canvasDelta = vec2.Vec2.diff(this.mousePositionAfterMove, this.mousePositionBeforeMove);
            if (canvasDelta.length() === 0) {
              return;
            }
            var fullMovementOffset = coordinates.Coordinates.canvasToModel(canvasDelta);
            var _modelChanges2 = this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(new vec2.Vec2(0, 0), fullMovementOffset);
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
        return entity instanceof BaseMonomer.BaseMonomer || entity instanceof CoreAtom.Atom;
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
      var canvasCenter = coordinates.Coordinates.modelToCanvas(this.rotationCenter);
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
      var history = EditorHistory.EditorHistory.getInstance(this.editor);
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
        SequenceRenderer.SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
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
      var angle = vectorUtils.vectorUtils.calcAngle(monomerPositionPlusCursorDelta, connectedPosition);
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
      var distance = snappedDistance !== null && snappedDistance !== void 0 ? snappedDistance : vec2.Vec2.diff(monomerPositionPlusCursorDelta, connectedPosition).length();
      var angleSnapPosition = new vec2.Vec2(connectedPosition.x - distance * Math.cos(snappedAngleRad), connectedPosition.y - distance * Math.sin(snappedAngleRad));
      var isAngleSnapped = vec2.Vec2.diff(monomerPositionPlusCursorDelta, angleSnapPosition).length() < monomers$1.HalfMonomerSize;
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
      var currentDistance = vec2.Vec2.diff(cursorPosition, connectedPosition).length();
      var isBondLengthSnapped = Math.abs(currentDistance - monomers$1.StandardBondLength) < monomers$1.HalfMonomerSize;
      if (!isBondLengthSnapped) {
        return {
          bondLengthSnapPosition: null
        };
      }
      var editor = editorSingleton.provideEditorInstance();
      var angle;
      if (editor.mode.modeName === 'snake-layout-mode') {
        var rawAngle = vectorUtils.vectorUtils.calcAngle(cursorPosition, connectedPosition);
        rawAngle = (rawAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        var step = Math.PI / 2;
        angle = Math.round(rawAngle / step) * step;
      } else {
        angle = snappedAngle !== null && snappedAngle !== void 0 ? snappedAngle : vectorUtils.vectorUtils.calcAngle(cursorPosition, connectedPosition);
      }
      var bondLengthSnapPosition = new vec2.Vec2(connectedPosition.x + monomers$1.StandardBondLength * -Math.cos(angle), connectedPosition.y + monomers$1.StandardBondLength * -Math.sin(angle));
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
      var selectedEntitiesBbox = structureBbox.getStructureBbox(selectedEntities);
      var selectedEntitiesCenter = new vec2.Vec2(selectedEntitiesBbox.left + selectedEntitiesBbox.width / 2, selectedEntitiesBbox.top + selectedEntitiesBbox.height / 2);
      var selectedEntitiesCenterWithMovementDelta = selectedEntitiesCenter.add(movementDelta);
      for (var i = 0; i < connectedMonomers.length; i++) {
        for (var j = i + 1; j < connectedMonomers.length; j++) {
          var monomerA = connectedMonomers[i];
          var monomerB = connectedMonomers[j];
          var pairBbox = structureBbox.getStructureBbox([monomerA, monomerB]);
          var pairCenter = new vec2.Vec2(pairBbox.left + pairBbox.width / 2, pairBbox.top + pairBbox.height / 2);
          if (SelectBase.needApplyGroupCenterSnapForOneAxis(selectedEntitiesCenterWithMovementDelta.x, pairCenter.x, monomers$1.HalfMonomerSize, selectedEntitiesCenterWithMovementDelta.y, pairCenter.y, monomers$1.HalfMonomerSize * 2)) {
            results.push({
              snapPosition: vec2.Vec2.diff(pairCenter, selectedEntitiesCenter),
              isVertical: false,
              absoluteSnapPosition: pairCenter,
              monomerPair: [monomerA, monomerB],
              connectionLength: 0,
              showGroupCenterSnapping: true
            });
          } else if (SelectBase.needApplyGroupCenterSnapForOneAxis(selectedEntitiesCenterWithMovementDelta.y, pairCenter.y, monomers$1.HalfMonomerSize, selectedEntitiesCenterWithMovementDelta.x, pairCenter.x, monomers$1.HalfMonomerSize * 2)) {
            results.push({
              snapPosition: vec2.Vec2.diff(pairCenter, selectedEntitiesCenter),
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
      if (verticalDiff < monomers$1.MonomerSize && horizontalDiff >= monomers$1.MonomerSize) {
        return 'horizontal';
      } else if (horizontalDiff < monomers$1.MonomerSize && verticalDiff >= monomers$1.MonomerSize) {
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
      if (Math.abs(cursorPosition[secondaryAxis] - connectedMonomer.center[secondaryAxis]) >= monomers$1.MonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var snapDistance = Math.abs(connectedMonomer.center[primaryAxis] - monomerForAlignment.center[primaryAxis]);
      var distanceToMonomerForSnapping = Math.abs(cursorPosition[primaryAxis] - connectedMonomer.center[primaryAxis]);
      if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= monomers$1.HalfMonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var sign = Math.sign(connectedMonomer.center[primaryAxis] - cursorPosition[primaryAxis]);
      var newPrimaryCoord = connectedMonomer.center[primaryAxis] - sign * snapDistance;
      var distanceSnapPosition = isHorizontal ? new vec2.Vec2(newPrimaryCoord, cursorPosition.y) : new vec2.Vec2(cursorPosition.x, newPrimaryCoord);
      var alignedMonomers = [initialMonomer, connectedMonomer, monomerForAlignment];
      var additionalAlignedMonomers = SelectBase.findRemainingAlignedMonomers(monomerForAlignment, alignedMonomers, alignment, snapDistance);
      return {
        snapDistance: snapDistance,
        distanceSnapPosition: distanceSnapPosition,
        alignment: alignment,
        alignedMonomers: [].concat(alignedMonomers, _toConsumableArray__default["default"](additionalAlignedMonomers))
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
      if (firstDelta >= monomers$1.MonomerSize || secondDelta >= monomers$1.MonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var distanceToMonomerForSnapping = Math.abs(cursorPosition[primaryAxis] - firstConnectedMonomer.center[primaryAxis]);
      var snapDistance = Math.abs(firstConnectedMonomer.center[primaryAxis] - secondConnectedMonomer.center[primaryAxis]) / 2;
      if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= monomers$1.HalfMonomerSize) {
        return {
          distanceSnapPosition: null
        };
      }
      var midPoint = (firstConnectedMonomer.center[primaryAxis] + secondConnectedMonomer.center[primaryAxis]) / 2;
      var distanceSnapPosition = isHorizontal ? new vec2.Vec2(midPoint, cursorPosition.y) : new vec2.Vec2(cursorPosition.x, midPoint);
      var alignedMonomers = [initialMonomer, firstConnectedMonomer, secondConnectedMonomer];
      var additionalAlignedMonomersFromOneSide = SelectBase.findRemainingAlignedMonomers(firstConnectedMonomer, alignedMonomers, alignment, snapDistance);
      var additionalAlignedMonomersFromOtherSide = SelectBase.findRemainingAlignedMonomers(secondConnectedMonomer, alignedMonomers, alignment, snapDistance);
      return {
        snapDistance: snapDistance,
        distanceSnapPosition: distanceSnapPosition,
        alignment: alignment,
        alignedMonomers: [].concat(alignedMonomers, _toConsumableArray__default["default"](additionalAlignedMonomersFromOneSide), _toConsumableArray__default["default"](additionalAlignedMonomersFromOtherSide))
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
_defineProperty__default["default"](SelectBase, "ROTATION_SNAP_ANGLE", 15);
_defineProperty__default["default"](SelectBase, "ROTATION_ANGLE_EPSILON", 0.001);

exports.SelectBase = SelectBase;
//# sourceMappingURL=SelectBase.js.map
