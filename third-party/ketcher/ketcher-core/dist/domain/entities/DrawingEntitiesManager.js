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
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../application/editor/editorSingleton.js');
var monomers$3 = require('../types/monomers.js');
require('../types/entities.js');
var vec2 = require('./vec2.js');
var Command = require('./Command.js');
var structureBbox = require('./structureBbox.js');
var PolymerBond = require('./PolymerBond.js');
require('./atom.js');
require('./atomList.js');
require('./bond.js');
require('./fixedPrecision.js');
require('./fragment.js');
require('./functionalGroup.js');
require('./halfBond.js');
require('./loop.js');
require('./rgroup.js');
require('./rgroupAttachmentPoint.js');
require('./rxnArrow.js');
require('./rxnPlus.js');
var sgroup = require('./sgroup.js');
var sgroupForest = require('./sgroupForest.js');
require('./simpleObject.js');
var struct = require('./struct.js');
require('./text.js');
require('./pile.js');
require('./box2Abs.js');
var pool = require('./pool.js');
require('./image.js');
require('./multitailArrow.js');
require('./highlight.js');
require('./sGroupAttachmentPoint.js');
require('./monomerMicromolecule.js');
require('./Peptide.js');
var BaseMonomer = require('./BaseMonomer.js');
var Chem = require('./Chem.js');
var Sugar = require('./Sugar.js');
require('./RNABase.js');
var Phosphate = require('./Phosphate.js');
require('./Axis.js');
var Nucleoside = require('./Nucleoside.js');
var Nucleotide = require('./Nucleotide.js');
require('./monomer-chains/types.js');
require('./monomer-chains/Chain.js');
var ChainsCollection = require('./monomer-chains/ChainsCollection.js');
var MonomerSequenceNode = require('./MonomerSequenceNode.js');
require('./EmptySequenceNode.js');
require('./LinkerSequenceNode.js');
require('./UnresolvedMonomer.js');
var UnsplitNucleotide = require('./UnsplitNucleotide.js');
var AmbiguousMonomer = require('./AmbiguousMonomer.js');
var MonomerToAtomBond = require('./MonomerToAtomBond.js');
var HydrogenBond = require('./HydrogenBond.js');
var SGroupDrawingEntity = require('./SGroupDrawingEntity.js');
require('./BackBoneSequenceNode.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
var SettingsManager = require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var monomers$1 = require('../../utilities/monomers.js');
var assert = require('../../utilities/assert.js');
var CoreAtom = require('./CoreAtom.js');
var CoreStereoFlag = require('./CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
require('../constants/chains.js');
var monomers = require('../constants/monomers.js');
var layout = require('../constants/layout.js');
var AttachmentPointHoverOperation = require('../../application/editor/operations/monomer/AttachmentPointHoverOperation.js');
require('../../application/editor/operations/monomer/FlipMonomerOperation.js');
var MonomerAddOperation = require('../../application/editor/operations/monomer/MonomerAddOperation.js');
var MonomerDeleteOperation = require('../../application/editor/operations/monomer/MonomerDeleteOperation.js');
var monomers$2 = require('../helpers/monomers.js');
require('../../application/render/renderers/AmbiguousMonomerRenderer.js');
var monomerEntityFactory = require('../helpers/monomerEntityFactory.js');
require('../../application/render/renderers/ChemRenderer.js');
require('../../application/render/renderers/PeptideRenderer.js');
require('../../application/render/renderers/PhosphateRenderer.js');
require('../../application/render/renderers/RNABaseRenderer.js');
require('../../application/render/renderers/SugarRenderer.js');
require('../../application/render/renderers/UnresolvedMonomerRenderer.js');
require('../../application/render/renderers/UnsplitNucleotideRenderer.js');
var MonomerHoverOperation = require('../../application/editor/operations/monomer/MonomerHoverOperation.js');
var MonomerItemModifyOperation = require('../../application/editor/operations/monomer/MonomerItemModifyOperation.js');
var MonomerMoveOperation = require('../../application/editor/operations/monomer/MonomerMoveOperation.js');
require('../../application/editor/operations/monomer/RotateMonomerOperation.js');
require('../../application/editor/operations/monomer/ShiftMonomerOperation.js');
var index = require('../../application/editor/operations/drawingEntity/index.js');
var index$1 = require('../../application/editor/operations/polymerBond/index.js');
var coordinates = require('../../application/editor/shared/coordinates.js');
var SequenceRenderer = require('../../application/render/renderers/sequence/SequenceRenderer.js');
var types = require('../../application/editor/tools/types.js');
var editorSettings = require('../../application/editor/editorSettings.js');
var CanvasMatrix = require('./canvas-matrix/CanvasMatrix.js');
var snake = require('../../application/editor/operations/modes/snake.js');
var Matrix = require('./canvas-matrix/Matrix.js');
var Cell = require('./canvas-matrix/Cell.js');
var CoreBond = require('./CoreBond.js');
var atom = require('../../application/editor/operations/coreAtom/atom.js');
var bond = require('../../application/editor/operations/coreBond/bond.js');
var monomerToAtomBond = require('../../application/editor/operations/monomerToAtomBond/monomerToAtomBond.js');
var index$2 = require('../../application/editor/operations/modes/index.js');
var SnakeLayoutModel = require('./snake-layout-model/SnakeLayoutModel.js');
var types$1 = require('./snake-layout-model/types.js');
var SugarWithBaseSnakeLayoutNode = require('./snake-layout-model/SugarWithBaseSnakeLayoutNode.js');
var SingleMonomerSnakeLayoutNode = require('./snake-layout-model/SingleMonomerSnakeLayoutNode.js');
var rna = require('../helpers/rna.js');
var EmptyMonomer = require('./EmptyMonomer.js');
var rxnArrow = require('../../application/editor/operations/coreRxn/rxnArrow.js');
var CoreRxnArrow = require('./CoreRxnArrow.js');
var CoreMultitailArrow = require('./CoreMultitailArrow.js');
var multitailArrow = require('../../application/editor/operations/coreRxn/multitailArrow.js');
var helpers = require('../serializers/ket/helpers.js');
var CoreRxnPlus = require('./CoreRxnPlus.js');
var rxnPlus = require('../../application/editor/operations/coreRxn/rxnPlus.js');
var MoleculeSnakeLayoutNode = require('./snake-layout-model/MoleculeSnakeLayoutNode.js');
var index$3 = require('../../application/editor/operations/stereoFlag/index.js');
var sgroup$1 = require('../../application/editor/operations/coreSGroup/sgroup.js');
var replacementHelpers = require('../../application/editor/libraryItemDragDrop/replacementHelpers.js');
var rnaPresetConnections = require('../../application/editor/tools/rnaPresetConnections.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var VERTICAL_DISTANCE_FROM_ROW_WITHOUT_RNA = layout.SnakeLayoutCellWidth;
var VERTICAL_OFFSET_FROM_ROW_WITH_RNA = 142;
var UNSPLIT_NUCLEOTIDE_MONOMERS_AMOUNT = 3;
var SENSE_NATURAL_ANALOGUES = [monomers.RnaDnaNaturalAnaloguesEnum.ADENINE, monomers.RnaDnaNaturalAnaloguesEnum.CYTOSINE, monomers.RnaDnaNaturalAnaloguesEnum.GUANINE, monomers.RnaDnaNaturalAnaloguesEnum.THYMINE, monomers.RnaDnaNaturalAnaloguesEnum.URACIL];
function isUnsplitNucleotideNode(node) {
  return node instanceof MonomerSequenceNode.MonomerSequenceNode && node.monomer instanceof UnsplitNucleotide.UnsplitNucleotide;
}
var getAntisenseSizeWeight = function getAntisenseSizeWeight(monomers) {
  return monomers.reduce(function (amount, monomer) {
    return amount + (monomer instanceof UnsplitNucleotide.UnsplitNucleotide ? UNSPLIT_NUCLEOTIDE_MONOMERS_AMOUNT : 1);
  }, 0);
};
var SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS = layout.SnakeLayoutCellWidth * 2 + 30;
var MONOMER_START_X_POSITION = 20 + layout.SnakeLayoutCellWidth / 2;
var MONOMER_START_Y_POSITION = 20 + layout.SnakeLayoutCellWidth / 2;
var DrawingEntitiesManager = function () {
  function DrawingEntitiesManager() {
    var _this = this;
    _classCallCheck__default["default"](this, DrawingEntitiesManager);
    _defineProperty__default["default"](this, "monomers", new Map());
    _defineProperty__default["default"](this, "polymerBonds", new Map());
    _defineProperty__default["default"](this, "bondsMonomersOverlaps", new Map());
    _defineProperty__default["default"](this, "atoms", new Map());
    _defineProperty__default["default"](this, "bonds", new Map());
    _defineProperty__default["default"](this, "monomerToAtomBonds", new Map());
    _defineProperty__default["default"](this, "rxnArrows", new Map());
    _defineProperty__default["default"](this, "multitailArrows", new Map());
    _defineProperty__default["default"](this, "rxnPluses", new Map());
    _defineProperty__default["default"](this, "stereoFlags", new Map());
    _defineProperty__default["default"](this, "sgroups", new Map());
    _defineProperty__default["default"](this, "micromoleculesHiddenEntities", new struct.Struct());
    _defineProperty__default["default"](this, "canvasMatrix", void 0);
    _defineProperty__default["default"](this, "snakeLayoutMatrix", void 0);
    _defineProperty__default["default"](this, "antisenseMonomerToSenseChain", new Map());
    _defineProperty__default["default"](this, "nextArrowId", 0);
    _defineProperty__default["default"](this, "addRnaPresetFromNode", function (node, connections) {
      var command = new Command.Command();
      var sugarMonomer = node.monomers.find(function (monomer) {
        return monomer instanceof Sugar.Sugar;
      });
      var phosphateMonomer = node.monomers.find(function (monomer) {
        return monomer instanceof Phosphate.Phosphate;
      });
      var rnaBaseMonomer = node.monomers.find(function (monomer) {
        return monomers$2.isRnaBaseOrAmbiguousRnaBase(monomer);
      });
      var monomers = [rnaBaseMonomer, sugarMonomer, phosphateMonomer].filter(function (monomer) {
        return monomer !== undefined;
      });
      monomers.forEach(function (monomer, monomerIndex) {
        var monomerAddOperation = monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? new MonomerAddOperation.MonomerAddOperation(_this.addAmbiguousMonomerChangeModel.bind(_this, monomer.variantMonomerItem, monomer.position, monomer), _this.deleteMonomerChangeModel.bind(_this)) : new MonomerAddOperation.MonomerAddOperation(_this.addMonomerChangeModel.bind(_this, monomer.monomerItem, monomer.position, monomer), _this.deleteMonomerChangeModel.bind(_this));
        command.addOperation(monomerAddOperation);
        if (monomerIndex > 0) {
          var previousMonomer = monomers[monomerIndex - 1];
          var connectionTemplate = _this.findGroupTemplateConnection(connections || [], previousMonomer.monomerItem, monomer.monomerItem);
          var attPointStart;
          var attPointEnd;
          if (connectionTemplate) {
            var isEndpoint1 = connectionTemplate.endpoint1.templateId === helpers.getMonomerTemplateRefFromMonomerItem(previousMonomer.monomerItem);
            attPointStart = isEndpoint1 ? connectionTemplate.endpoint1.attachmentPointId : connectionTemplate.endpoint2.attachmentPointId;
            attPointEnd = isEndpoint1 ? connectionTemplate.endpoint2.attachmentPointId : connectionTemplate.endpoint1.attachmentPointId;
          } else {
            attPointStart = previousMonomer.getValidSourcePoint(monomer);
            attPointEnd = monomer.getValidSourcePoint(previousMonomer);
          }
          assert.assert(attPointStart);
          assert.assert(attPointEnd);
          var operation = new index$1.PolymerBondFinishCreationOperation(function (polymerBond) {
            return _this.finishPolymerBondCreationModelChange(previousMonomer, monomer, attPointStart, attPointEnd, types.MACROMOLECULES_BOND_TYPES.SINGLE, polymerBond);
          }, _this.deletePolymerBondChangeModel.bind(_this));
          command.addOperation(operation);
        }
      });
      return command;
    });
  }
  _createClass__default["default"](DrawingEntitiesManager, [{
    key: "ensureArrowId",
    value: function ensureArrowId(arrow) {
      var _arrow$arrowId;
      var arrowId = (_arrow$arrowId = arrow.arrowId) !== null && _arrow$arrowId !== void 0 ? _arrow$arrowId : this.nextArrowId;
      arrow.arrowId = arrowId;
      this.nextArrowId = Math.max(this.nextArrowId, arrowId + 1);
      return arrow;
    }
  }, {
    key: "resetArrowIdCounter",
    value: function resetArrowIdCounter() {
      this.nextArrowId = 0;
    }
  }, {
    key: "bottomRightMonomerPosition",
    get: function get() {
      var _position;
      var position = null;
      this.monomers.forEach(function (monomer) {
        if (!position || monomer.position.x + monomer.position.y > position.x + position.y) {
          position = monomer.position;
        }
      });
      return (_position = position) !== null && _position !== void 0 ? _position : new vec2.Vec2(0, 0, 0);
    }
  }, {
    key: "bottomLeftMonomerPosition",
    get: function get() {
      var bbox = structureBbox.getStructureBbox(this.monomersArray);
      return new vec2.Vec2(bbox.left, bbox.bottom);
    }
  }, {
    key: "selectedEntitiesArr",
    get: function get() {
      var selectedEntities = [];
      this.allEntities.forEach(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          drawingEntity = _ref2[1];
        if (drawingEntity.selected) {
          selectedEntities.push(drawingEntity);
        }
      });
      return selectedEntities;
    }
  }, {
    key: "selectedEntities",
    get: function get() {
      return this.allEntities.filter(function (_ref3) {
        var _ref4 = _slicedToArray__default["default"](_ref3, 2),
          drawingEntity = _ref4[1];
        return drawingEntity.selected;
      });
    }
  }, {
    key: "selectedMonomers",
    get: function get() {
      return this.monomersArray.filter(function (monomer) {
        return monomer.selected;
      });
    }
  }, {
    key: "selectedMicromoleculeEntities",
    get: function get() {
      return this.selectedEntitiesArr.filter(function (entity) {
        return !(entity instanceof BaseMonomer.BaseMonomer || entity instanceof PolymerBond.PolymerBond || entity instanceof HydrogenBond.HydrogenBond);
      });
    }
  }, {
    key: "externalConnectionsToSelection",
    get: function get() {
      var connectedMonomers = [];
      this.selectedMonomers.forEach(function (monomer) {
        monomer.bonds.forEach(function (bond) {
          if (!(bond instanceof PolymerBond.PolymerBond || bond instanceof HydrogenBond.HydrogenBond) || !bond.secondMonomer) {
            return;
          }
          if (bond.firstMonomer === monomer && !bond.secondMonomer.selected) {
            connectedMonomers.push({
              monomerFromSelection: monomer,
              monomerConnectedToSelection: bond.secondMonomer,
              bond: bond
            });
          } else if (bond.secondMonomer === monomer && !bond.firstMonomer.selected) {
            connectedMonomers.push({
              monomerFromSelection: monomer,
              monomerConnectedToSelection: bond.firstMonomer,
              bond: bond
            });
          }
        });
      });
      return connectedMonomers;
    }
  }, {
    key: "allEntities",
    get: function get() {
      return [].concat(_toConsumableArray__default["default"](this.monomers), _toConsumableArray__default["default"](this.polymerBonds), _toConsumableArray__default["default"](this.monomerToAtomBonds), _toConsumableArray__default["default"](this.atoms), _toConsumableArray__default["default"](this.bonds), _toConsumableArray__default["default"](this.rxnArrows), _toConsumableArray__default["default"](this.multitailArrows), _toConsumableArray__default["default"](this.rxnPluses), _toConsumableArray__default["default"](this.stereoFlags));
    }
  }, {
    key: "allEntitiesArray",
    get: function get() {
      return this.allEntities.map(function (_ref5) {
        var _ref6 = _slicedToArray__default["default"](_ref5, 2),
          drawingEntity = _ref6[1];
        return drawingEntity;
      });
    }
  }, {
    key: "hasDrawingEntities",
    get: function get() {
      return this.allEntities.length !== 0;
    }
  }, {
    key: "hasMonomers",
    get: function get() {
      var monomers = _toConsumableArray__default["default"](this.monomers.values()).filter(function (monomer) {
        return !monomer.monomerItem.props.isMicromoleculeFragment || monomers$1.isMonomerSgroupWithAttachmentPoints(monomer);
      });
      return monomers.length !== 0;
    }
  }, {
    key: "allBondsToMonomers",
    get: function get() {
      return [].concat(_toConsumableArray__default["default"](this.polymerBonds), _toConsumableArray__default["default"](this.monomerToAtomBonds));
    }
  }, {
    key: "deleteSelectedEntities",
    value: function deleteSelectedEntities() {
      var _this2 = this;
      var mergedCommand = new Command.Command();
      this.selectedEntities.forEach(function (_ref7) {
        var _ref8 = _slicedToArray__default["default"](_ref7, 2),
          drawingEntity = _ref8[1];
        var command = _this2.deleteDrawingEntity(drawingEntity);
        mergedCommand.merge(command);
      });
      return mergedCommand;
    }
  }, {
    key: "deleteAllEntities",
    value: function deleteAllEntities() {
      var _this3 = this;
      var mergedCommand = new Command.Command();
      this.allEntities.forEach(function (_ref9) {
        var _ref0 = _slicedToArray__default["default"](_ref9, 2),
          drawingEntity = _ref0[1];
        var command = _this3.deleteDrawingEntity(drawingEntity, false);
        mergedCommand.merge(command);
      });
      this.sgroups.forEach(function (sgroup) {
        mergedCommand.merge(_this3.deleteSGroup(sgroup));
      });
      this.clearMicromoleculesHiddenEntities();
      this.resetArrowIdCounter();
      return mergedCommand;
    }
  }, {
    key: "addMonomerChangeModel",
    value: function addMonomerChangeModel(monomerItem, position, _monomer) {
      if (_monomer) {
        this.monomers.set(_monomer.id, _monomer);
        return _monomer;
      }
      var newMonomer = this.createMonomer(monomerItem, position);
      newMonomer.moveAbsolute(position);
      this.monomers.set(newMonomer.id, newMonomer);
      return newMonomer;
    }
  }, {
    key: "createMonomer",
    value: function createMonomer(monomerItem, position) {
      var generateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (monomers$2.isAmbiguousMonomerLibraryItem(monomerItem)) {
        return new AmbiguousMonomer.AmbiguousMonomer(monomerItem, position, generateId);
      } else {
        var _monomerEntityFactory = monomerEntityFactory.monomerEntityFactory(monomerItem),
          _monomerEntityFactory2 = _slicedToArray__default["default"](_monomerEntityFactory, 1),
          Monomer = _monomerEntityFactory2[0];
        return new Monomer(monomerItem, position, {
          generateId: generateId
        });
      }
    }
  }, {
    key: "updateMonomerItem",
    value: function updateMonomerItem(monomer, monomerItemNew) {
      var initialMonomer = this.monomers.get(monomer.id);
      if (!initialMonomer) return monomer;
      initialMonomer.monomerItem = Object.isFrozen(monomerItemNew) ? _objectSpread({}, monomerItemNew) : monomerItemNew;
      initialMonomer.recalculateAttachmentPoints();
      this.monomers.set(monomer.id, initialMonomer);
      return initialMonomer;
    }
  }, {
    key: "addMonomer",
    value: function addMonomer(monomerItem, position, _monomer) {
      var command = new Command.Command();
      var addMonomerChangeModelCallback = this.addMonomerChangeModel.bind(this, monomerItem, position);
      if (_monomer) {
        addMonomerChangeModelCallback = addMonomerChangeModelCallback.bind(this, _monomer);
      }
      var operation = new MonomerAddOperation.MonomerAddOperation(addMonomerChangeModelCallback, this.deleteMonomerChangeModel.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteDrawingEntity",
    value: function deleteDrawingEntity(drawingEntity) {
      var needToDeleteConnectedEntities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (drawingEntity instanceof BaseMonomer.BaseMonomer) {
        return this.deleteMonomer(drawingEntity, needToDeleteConnectedEntities, force);
      } else if (drawingEntity instanceof PolymerBond.PolymerBond || drawingEntity instanceof HydrogenBond.HydrogenBond) {
        return this.deletePolymerBond(drawingEntity);
      } else if (drawingEntity instanceof MonomerToAtomBond.MonomerToAtomBond) {
        return this.deleteMonomerToAtomBond(drawingEntity);
      } else if (drawingEntity instanceof CoreBond.Bond) {
        return this.deleteBond(drawingEntity);
      } else if (drawingEntity instanceof CoreAtom.Atom) {
        return this.deleteAtom(drawingEntity, needToDeleteConnectedEntities);
      } else if (drawingEntity instanceof CoreRxnArrow.RxnArrow) {
        return this.deleteRxnArrow(drawingEntity);
      } else if (drawingEntity instanceof CoreMultitailArrow.MultitailArrow) {
        return this.deleteMultitailArrow(drawingEntity);
      } else if (drawingEntity instanceof CoreRxnPlus.RxnPlus) {
        return this.deleteRxnPlus(drawingEntity);
      } else if (drawingEntity instanceof CoreStereoFlag.CoreStereoFlag) {
        return this.deleteStereoFlag(drawingEntity);
      } else {
        return new Command.Command();
      }
    }
  }, {
    key: "selectDrawingEntity",
    value: function selectDrawingEntity(drawingEntity) {
      var command = this.unselectAllDrawingEntities();
      drawingEntity.turnOnSelection();
      command.merge(this.createDrawingEntitySelectionCommand(drawingEntity));
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      return command;
    }
  }, {
    key: "selectDrawingEntitiesModelChange",
    value: function selectDrawingEntitiesModelChange(drawingEntity) {
      drawingEntity.turnOnSelection();
    }
  }, {
    key: "selectDrawingEntities",
    value: function selectDrawingEntities(drawingEntities) {
      var _this4 = this;
      var command = this.unselectAllDrawingEntities();
      drawingEntities.forEach(function (drawingEntity) {
        drawingEntity.turnOnSelection();
        var operation = new index.DrawingEntitySelectOperation(drawingEntity, _this4.selectDrawingEntitiesModelChange.bind(_this4, drawingEntity));
        command.addOperation(operation);
      });
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      return command;
    }
  }, {
    key: "createDrawingEntitySelectionCommand",
    value: function createDrawingEntitySelectionCommand(drawingEntity) {
      var command = new Command.Command();
      var selectionCommand = new index.DrawingEntitySelectOperation(drawingEntity);
      command.addOperation(selectionCommand);
      return command;
    }
  }, {
    key: "unselectAllDrawingEntities",
    value: function unselectAllDrawingEntities() {
      var _this5 = this;
      var command = new Command.Command();
      this.allEntities.forEach(function (_ref1) {
        var _ref10 = _slicedToArray__default["default"](_ref1, 2),
          drawingEntity = _ref10[1];
        if (drawingEntity.selected) {
          command.merge(_this5.unselectDrawingEntity(drawingEntity));
        }
      });
      var editor = editorSingleton.provideEditorInstance();
      editor.events.selectEntities.dispatch(this.selectedEntities.map(function (entity) {
        return entity[1];
      }));
      return command;
    }
  }, {
    key: "unselectDrawingEntity",
    value: function unselectDrawingEntity(drawingEntity) {
      var command = new Command.Command();
      drawingEntity.turnOffSelection();
      command.addOperation(new index.DrawingEntitySelectOperation(drawingEntity));
      return command;
    }
  }, {
    key: "selectAllDrawingEntities",
    value: function selectAllDrawingEntities() {
      var command = new Command.Command();
      this.allEntities.forEach(function (_ref11) {
        var _ref12 = _slicedToArray__default["default"](_ref11, 2),
          drawingEntity = _ref12[1];
        if (!drawingEntity.selected) {
          drawingEntity.turnOnSelection();
          var operation = new index.DrawingEntitySelectOperation(drawingEntity);
          command.addOperation(operation);
        }
      });
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      var editor = editorSingleton.provideEditorInstance();
      editor.events.selectEntities.dispatch(this.selectedEntities.map(function (entity) {
        return entity[1];
      }));
      return command;
    }
  }, {
    key: "addDrawingEntitiesToSelection",
    value: function addDrawingEntitiesToSelection(drawingEntities) {
      var command = new Command.Command();
      drawingEntities.forEach(function (drawingEntity) {
        if (drawingEntity.selected) {
          drawingEntity.turnOffSelection();
        } else {
          drawingEntity.turnOnSelection();
        }
        command.addOperation(new index.DrawingEntitySelectOperation(drawingEntity));
      });
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      return command;
    }
  }, {
    key: "moveDrawingEntityModelChange",
    value: function moveDrawingEntityModelChange(drawingEntity, offset) {
      if (drawingEntity instanceof PolymerBond.PolymerBond || drawingEntity instanceof HydrogenBond.HydrogenBond) {
        drawingEntity.moveToLinkedEntities();
        drawingEntity.isOverlappedByMonomer = this.checkBondForOverlapsByMonomers(drawingEntity);
      } else if (drawingEntity instanceof CoreBond.Bond) {
        drawingEntity.moveToLinkedAtoms();
      } else if (drawingEntity instanceof MonomerToAtomBond.MonomerToAtomBond) {
        drawingEntity.moveToLinkedEntities();
      } else {
        assert.assert(offset);
        drawingEntity.moveRelative(offset);
        if (drawingEntity instanceof BaseMonomer.BaseMonomer && monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          this.moveChemAtomsPoint(drawingEntity, offset);
        }
      }
      return drawingEntity;
    }
  }, {
    key: "moveChemAtomsPoint",
    value: function moveChemAtomsPoint(drawingEntity, offset) {
      if (drawingEntity.monomerItem.props.isMicromoleculeFragment && offset) {
        drawingEntity.monomerItem.struct.atoms.forEach(function (atom) {
          atom.pp.add_(offset);
        });
        drawingEntity.monomerItem.struct.sgroups.forEach(function (sgroup) {
          var _sgroup$pp;
          (_sgroup$pp = sgroup.pp) === null || _sgroup$pp === void 0 || _sgroup$pp.add_(offset);
        });
      }
    }
  }, {
    key: "moveSelectedDrawingEntities",
    value: function moveSelectedDrawingEntities(partOfMovementOffset, fullMovementOffset) {
      var _this6 = this;
      var command = new Command.Command();
      [].concat(_toConsumableArray__default["default"](this.atoms.values()), _toConsumableArray__default["default"](this.monomers.values()), _toConsumableArray__default["default"](this.rxnArrows.values()), _toConsumableArray__default["default"](this.multitailArrows.values()), _toConsumableArray__default["default"](this.rxnPluses.values()), _toConsumableArray__default["default"](this.stereoFlags.values())).forEach(function (drawingEntity) {
        if (drawingEntity instanceof BaseMonomer.BaseMonomer && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        if (drawingEntity.selected) {
          command.merge(_this6.createDrawingEntityMovingCommand(drawingEntity, partOfMovementOffset, fullMovementOffset));
        }
      });
      this.polymerBonds.forEach(function (drawingEntity) {
        var _drawingEntity$second;
        if (drawingEntity.selected || drawingEntity.firstMonomer.selected || (_drawingEntity$second = drawingEntity.secondMonomer) !== null && _drawingEntity$second !== void 0 && _drawingEntity$second.selected) {
          command.merge(_this6.createDrawingEntityMovingCommand(drawingEntity, partOfMovementOffset, fullMovementOffset));
        }
      });
      this.monomerToAtomBonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.monomer.selected || drawingEntity.atom.selected) {
          command.merge(_this6.createDrawingEntityMovingCommand(drawingEntity, partOfMovementOffset, fullMovementOffset));
        }
      });
      this.bonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.firstAtom.selected || drawingEntity.secondAtom.selected) {
          command.merge(_this6.createDrawingEntityMovingCommand(drawingEntity, partOfMovementOffset, fullMovementOffset));
        }
      });
      return command;
    }
  }, {
    key: "rotateSelectedDrawingEntities",
    value: function rotateSelectedDrawingEntities(center, angleInDegrees) {
      var _this7 = this;
      var isPartialRotation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var command = new Command.Command();
      [].concat(_toConsumableArray__default["default"](this.atoms.values()), _toConsumableArray__default["default"](this.monomers.values()), _toConsumableArray__default["default"](this.rxnArrows.values()), _toConsumableArray__default["default"](this.multitailArrows.values()), _toConsumableArray__default["default"](this.rxnPluses.values())).forEach(function (drawingEntity) {
        if (drawingEntity instanceof BaseMonomer.BaseMonomer && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        if (drawingEntity.selected) {
          var newPosition = drawingEntity.position.rotateAroundOrigin(angleInDegrees, center);
          var positionDelta = newPosition.sub(drawingEntity.position);
          if (isPartialRotation) {
            command.merge(_this7.createDrawingEntityMovingCommand(drawingEntity, positionDelta));
          } else {
            command.merge(_this7.createDrawingEntityMovingCommand(drawingEntity, positionDelta, positionDelta));
          }
        }
      });
      this.polymerBonds.forEach(function (drawingEntity) {
        var _drawingEntity$second2;
        if (drawingEntity.selected || drawingEntity.firstMonomer.selected || (_drawingEntity$second2 = drawingEntity.secondMonomer) !== null && _drawingEntity$second2 !== void 0 && _drawingEntity$second2.selected) {
          command.addOperation(_this7.movePolymerBond(drawingEntity));
        }
      });
      this.monomerToAtomBonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.monomer.selected || drawingEntity.atom.selected) {
          command.merge(_this7.createDrawingEntityMovingCommand(drawingEntity, new vec2.Vec2(0, 0), new vec2.Vec2(0, 0)));
        }
      });
      this.bonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.firstAtom.selected || drawingEntity.secondAtom.selected) {
          command.merge(_this7.createDrawingEntityMovingCommand(drawingEntity, new vec2.Vec2(0, 0), new vec2.Vec2(0, 0)));
        }
      });
      return command;
    }
  }, {
    key: "flipSelectedDrawingEntities",
    value: function flipSelectedDrawingEntities(flipDirection) {
      var _this8 = this;
      var command = new Command.Command();
      var center = this.getSelectedEntitiesCenter();
      var zeroOffset = new vec2.Vec2(0, 0);
      if (!center) {
        return command;
      }
      [].concat(_toConsumableArray__default["default"](this.atoms.values()), _toConsumableArray__default["default"](this.monomers.values()), _toConsumableArray__default["default"](this.rxnArrows.values()), _toConsumableArray__default["default"](this.multitailArrows.values()), _toConsumableArray__default["default"](this.rxnPluses.values())).forEach(function (drawingEntity) {
        if (drawingEntity instanceof BaseMonomer.BaseMonomer && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        if (drawingEntity.selected) {
          var newPosition;
          if (flipDirection === 'horizontal') {
            newPosition = new vec2.Vec2(center.x - (drawingEntity.position.x - center.x), drawingEntity.position.y);
          } else {
            newPosition = new vec2.Vec2(drawingEntity.position.x, center.y - (drawingEntity.position.y - center.y));
          }
          var positionDelta = newPosition.sub(drawingEntity.position);
          command.merge(_this8.createDrawingEntityMovingCommand(drawingEntity, positionDelta, positionDelta));
        }
      });
      this.polymerBonds.forEach(function (drawingEntity) {
        var _drawingEntity$second3;
        if (drawingEntity.selected || drawingEntity.firstMonomer.selected || (_drawingEntity$second3 = drawingEntity.secondMonomer) !== null && _drawingEntity$second3 !== void 0 && _drawingEntity$second3.selected) {
          command.merge(_this8.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      this.monomerToAtomBonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.monomer.selected || drawingEntity.atom.selected) {
          command.merge(_this8.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      this.bonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.firstAtom.selected || drawingEntity.secondAtom.selected) {
          command.merge(_this8.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      return command;
    }
  }, {
    key: "getSelectedEntitiesBoundingBox",
    value: function getSelectedEntitiesBoundingBox() {
      var selectedEntities = this.selectedEntitiesArr;
      if (selectedEntities.length === 0) {
        return null;
      }
      return structureBbox.getStructureBbox(selectedEntities);
    }
  }, {
    key: "getSelectedEntitiesCenter",
    value: function getSelectedEntitiesCenter() {
      var bbox = this.getSelectedEntitiesBoundingBox();
      if (!bbox) {
        return null;
      }
      return new vec2.Vec2(bbox.left + bbox.width / 2, bbox.top + bbox.height / 2);
    }
  }, {
    key: "createDrawingEntityMovingCommand",
    value: function createDrawingEntityMovingCommand(drawingEntity, partOfMovementOffset, fullMovementOffset) {
      var command = new Command.Command();
      var movingCommand = new index.DrawingEntityMoveOperation(this.moveDrawingEntityModelChange.bind(this, drawingEntity, partOfMovementOffset), this.moveDrawingEntityModelChange.bind(this, drawingEntity, fullMovementOffset ? fullMovementOffset.negated() : partOfMovementOffset.negated()), this.moveDrawingEntityModelChange.bind(this, drawingEntity, fullMovementOffset || partOfMovementOffset), drawingEntity);
      command.addOperation(movingCommand);
      return command;
    }
  }, {
    key: "createDrawingEntityRedrawCommand",
    value: function createDrawingEntityRedrawCommand(drawingEntityRedrawModelChange, invertDrawingEntityRedrawModelChange) {
      var command = new Command.Command();
      var redrawCommand = new index.DrawingEntityRedrawOperation(drawingEntityRedrawModelChange, invertDrawingEntityRedrawModelChange);
      command.addOperation(redrawCommand);
      return command;
    }
  }, {
    key: "deleteMonomerChangeModel",
    value: function deleteMonomerChangeModel(monomer) {
      this.monomers["delete"](monomer.id);
    }
  }, {
    key: "deleteMonomer",
    value: function deleteMonomer(monomer) {
      var _this9 = this;
      var needToDeleteConnectedBonds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var command = new Command.Command();
      if (monomer instanceof EmptyMonomer.EmptyMonomer) {
        return command;
      }
      var operation = new MonomerDeleteOperation.MonomerDeleteOperation(monomer, this.addMonomerChangeModel.bind(this, monomer.monomerItem, monomer.position), this.deleteMonomerChangeModel.bind(this));
      command.addOperation(operation);
      if (needToDeleteConnectedBonds && monomer.hasBonds) {
        monomer.forEachBond(function (bond) {
          if (bond.selected && !force) return;
          if (bond instanceof PolymerBond.PolymerBond || bond instanceof HydrogenBond.HydrogenBond) {
            bond.turnOnSelection();
            command.merge(_this9.deletePolymerBond(bond));
          } else {
            command.merge(_this9.deleteMonomerToAtomBond(bond));
          }
        });
      }
      return command;
    }
  }, {
    key: "modifyMonomerItem",
    value: function modifyMonomerItem(monomer, monomerItemNew) {
      var command = new Command.Command();
      var operation = new MonomerItemModifyOperation.MonomerItemModifyOperation(monomer, this.updateMonomerItem.bind(this, monomer, monomerItemNew), this.updateMonomerItem.bind(this, monomer, monomer.monomerItem));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "selectIfLocatedInRectangle",
    value: function selectIfLocatedInRectangle(rectangleTopLeftPoint, rectangleBottomRightPoint, previousSelectedEntities) {
      var _this0 = this;
      var shiftKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var command = new Command.Command();
      this.allEntities.forEach(function (_ref13) {
        var _ref14 = _slicedToArray__default["default"](_ref13, 2),
          drawingEntity = _ref14[1];
        if (drawingEntity instanceof Chem.Chem && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        var isPreviousSelected = previousSelectedEntities.find(function (_ref15) {
          var _ref16 = _slicedToArray__default["default"](_ref15, 2),
            entity = _ref16[1];
          return entity === drawingEntity;
        });
        var isValueChanged;
        var editor = editorSingleton.provideEditorInstance();
        if (editor.mode.modeName === 'sequence-layout-mode' && drawingEntity instanceof PolymerBond.PolymerBond) {
          isValueChanged = _this0.checkBondSelectionForSequenceMode(drawingEntity);
        } else {
          isValueChanged = drawingEntity.selectIfLocatedInRectangle(rectangleTopLeftPoint, rectangleBottomRightPoint, !!isPreviousSelected, shiftKey);
        }
        if (isValueChanged) {
          var selectionCommand = _this0.createDrawingEntitySelectionCommand(drawingEntity);
          command.merge(selectionCommand);
        }
      });
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      return command;
    }
  }, {
    key: "selectIfLocatedInPolygon",
    value: function selectIfLocatedInPolygon(polygonPoints, previousSelectedEntities) {
      var _this1 = this;
      var shiftKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var command = new Command.Command();
      this.allEntities.forEach(function (_ref17) {
        var _ref18 = _slicedToArray__default["default"](_ref17, 2),
          drawingEntity = _ref18[1];
        if (drawingEntity instanceof Chem.Chem && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        var isPreviousSelected = previousSelectedEntities.find(function (_ref19) {
          var _ref20 = _slicedToArray__default["default"](_ref19, 2),
            entity = _ref20[1];
          return entity === drawingEntity;
        });
        var isValueChanged;
        var editor = editorSingleton.provideEditorInstance();
        if (editor.mode.modeName === 'sequence-layout-mode' && drawingEntity instanceof PolymerBond.PolymerBond) {
          isValueChanged = _this1.checkBondSelectionForSequenceMode(drawingEntity);
        } else {
          isValueChanged = drawingEntity.selectIfLocatedInPolygon(polygonPoints, !!isPreviousSelected, shiftKey);
        }
        if (isValueChanged) {
          var selectionCommand = _this1.createDrawingEntitySelectionCommand(drawingEntity);
          command.merge(selectionCommand);
        }
      });
      command.merge(this.syncStereoFlagsSelectionWithMonomers());
      return command;
    }
  }, {
    key: "syncStereoFlagsSelectionWithMonomers",
    value: function syncStereoFlagsSelectionWithMonomers() {
      var _this10 = this;
      var command = new Command.Command();
      this.stereoFlags.forEach(function (stereoFlag) {
        var relatedMonomer = stereoFlag.relatedMonomer;
        var monomerAtoms = _toConsumableArray__default["default"](_this10.atoms.values()).filter(function (atom) {
          return atom.monomer === relatedMonomer;
        });
        var allMonomerAtomsSelected = monomerAtoms.length > 0 && monomerAtoms.every(function (atom) {
          return atom.selected;
        });
        var shouldBeSelected = relatedMonomer.selected || allMonomerAtomsSelected;
        if (stereoFlag.selected !== shouldBeSelected) {
          if (shouldBeSelected) {
            stereoFlag.turnOnSelection();
          } else {
            stereoFlag.turnOffSelection();
          }
          command.merge(_this10.createDrawingEntitySelectionCommand(stereoFlag));
        }
      });
      return command;
    }
  }, {
    key: "checkBondSelectionForSequenceMode",
    value: function checkBondSelectionForSequenceMode(bond) {
      var _bond$secondMonomer;
      var prevSelectedValue = bond.selected;
      if (bond.firstMonomer.selected && (_bond$secondMonomer = bond.secondMonomer) !== null && _bond$secondMonomer !== void 0 && _bond$secondMonomer.selected) {
        bond.turnOnSelection();
      } else {
        bond.turnOffSelection();
      }
      return prevSelectedValue !== bond.selected;
    }
  }, {
    key: "startPolymerBondCreationChangeModel",
    value: function startPolymerBondCreationChangeModel(firstMonomer, startPosition, endPosition) {
      var bondType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : types.MACROMOLECULES_BOND_TYPES.SINGLE;
      var _polymerBond = arguments.length > 4 ? arguments[4] : undefined;
      if (_polymerBond) {
        this.polymerBonds.set(_polymerBond.id, _polymerBond);
        return _polymerBond;
      }
      var polymerBond = bondType === types.MACROMOLECULES_BOND_TYPES.HYDROGEN ? new HydrogenBond.HydrogenBond(firstMonomer) : new PolymerBond.PolymerBond(firstMonomer);
      this.polymerBonds.set(polymerBond.id, polymerBond);
      if (firstMonomer.chosenFirstAttachmentPointForBond) {
        var startBondAttachmentPoint = firstMonomer.startBondAttachmentPoint;
        firstMonomer.setBond(startBondAttachmentPoint, polymerBond);
        firstMonomer.setPotentialBond(startBondAttachmentPoint, polymerBond);
      }
      polymerBond.moveBondStartAbsolute(startPosition.x, startPosition.y);
      polymerBond.moveBondEndAbsolute(endPosition.x, endPosition.y);
      return polymerBond;
    }
  }, {
    key: "startPolymerBondCreation",
    value: function startPolymerBondCreation(firstMonomer, startPosition, endPosition, bondType) {
      var command = new Command.Command();
      var operation = new index$1.PolymerBondAddOperation(this.startPolymerBondCreationChangeModel.bind(this, firstMonomer, startPosition, endPosition, bondType), this.deletePolymerBondChangeModel.bind(this));
      command.addOperation(operation);
      return {
        command: command,
        polymerBond: operation.polymerBond
      };
    }
  }, {
    key: "deletePolymerBondChangeModel",
    value: function deletePolymerBondChangeModel(polymerBond) {
      var _polymerBond$secondMo, _polymerBond$secondMo2, _polymerBond$secondMo3;
      if (this.polymerBonds.get(polymerBond.id) !== polymerBond) {
        return;
      }
      this.polymerBonds["delete"](polymerBond.id);
      var firstMonomerAttachmentPoint = polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
      var secondMonomerAttachmentPoint = (_polymerBond$secondMo = polymerBond.secondMonomer) === null || _polymerBond$secondMo === void 0 ? void 0 : _polymerBond$secondMo.getAttachmentPointByBond(polymerBond);
      polymerBond.firstMonomer.removePotentialBonds();
      (_polymerBond$secondMo2 = polymerBond.secondMonomer) === null || _polymerBond$secondMo2 === void 0 || _polymerBond$secondMo2.removePotentialBonds();
      polymerBond.firstMonomer.turnOffSelection();
      (_polymerBond$secondMo3 = polymerBond.secondMonomer) === null || _polymerBond$secondMo3 === void 0 || _polymerBond$secondMo3.turnOffSelection();
      if (firstMonomerAttachmentPoint || polymerBond instanceof HydrogenBond.HydrogenBond) {
        polymerBond.firstMonomer.unsetBond(firstMonomerAttachmentPoint, polymerBond);
      }
      if (secondMonomerAttachmentPoint || polymerBond instanceof HydrogenBond.HydrogenBond) {
        var _polymerBond$secondMo4;
        (_polymerBond$secondMo4 = polymerBond.secondMonomer) === null || _polymerBond$secondMo4 === void 0 || _polymerBond$secondMo4.unsetBond(secondMonomerAttachmentPoint, polymerBond);
      }
    }
  }, {
    key: "deletePolymerBond",
    value: function deletePolymerBond(polymerBond) {
      var _polymerBond$secondMo5,
        _this11 = this;
      var command = new Command.Command();
      var firstAttachmentPoint = polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
      var secondAttachmentPoint = (_polymerBond$secondMo5 = polymerBond.secondMonomer) === null || _polymerBond$secondMo5 === void 0 ? void 0 : _polymerBond$secondMo5.getAttachmentPointByBond(polymerBond);
      var operation = new index$1.PolymerBondDeleteOperation(polymerBond, this.deletePolymerBondChangeModel.bind(this, polymerBond), function (_polymerBond) {
        return _this11.finishPolymerBondCreationModelChange(polymerBond.firstMonomer, polymerBond.secondMonomer, firstAttachmentPoint, secondAttachmentPoint, types.MACROMOLECULES_BOND_TYPES.SINGLE, _polymerBond);
      });
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "cancelPolymerBondCreation",
    value: function cancelPolymerBondCreation(polymerBond, secondMonomer) {
      this.polymerBonds["delete"](polymerBond.id);
      var command = new Command.Command();
      polymerBond.firstMonomer.removeBond(polymerBond);
      polymerBond.firstMonomer.removePotentialBonds(true);
      polymerBond.firstMonomer.turnOffSelection();
      polymerBond.firstMonomer.turnOffHover();
      polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
      secondMonomer === null || secondMonomer === void 0 || secondMonomer.turnOffSelection();
      secondMonomer === null || secondMonomer === void 0 || secondMonomer.turnOffHover();
      secondMonomer === null || secondMonomer === void 0 || secondMonomer.turnOffAttachmentPointsVisibility();
      var operation = new index$1.PolymerBondCancelCreationOperation(polymerBond, secondMonomer);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "movePolymerBond",
    value: function movePolymerBond(polymerBond, position) {
      var command = new Command.Command();
      if (position) {
        polymerBond.moveBondEndAbsolute(position.x, position.y);
      } else {
        polymerBond.moveToLinkedEntities();
      }
      var operation = new index$1.PolymerBondMoveOperation(polymerBond);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "finishPolymerBondCreationModelChange",
    value: function finishPolymerBondCreationModelChange(firstMonomer, secondMonomer, firstMonomerAttachmentPoint, secondMonomerAttachmentPoint, bondType, _polymerBond) {
      var _polymerBond$secondMo6;
      if (_polymerBond) {
        this.polymerBonds.set(_polymerBond.id, _polymerBond);
        firstMonomer.setBond(firstMonomerAttachmentPoint, _polymerBond);
        secondMonomer.setBond(secondMonomerAttachmentPoint, _polymerBond);
        return _polymerBond;
      }
      var isHydrogenBond = bondType === types.MACROMOLECULES_BOND_TYPES.HYDROGEN;
      var polymerBond = isHydrogenBond ? new HydrogenBond.HydrogenBond(firstMonomer) : new PolymerBond.PolymerBond(firstMonomer);
      this.polymerBonds.set(polymerBond.id, polymerBond);
      polymerBond.setSecondMonomer(secondMonomer);
      polymerBond.firstMonomer.setBond(firstMonomerAttachmentPoint, polymerBond);
      assert.assert(polymerBond.secondMonomer);
      polymerBond.secondMonomer.setBond(secondMonomerAttachmentPoint, polymerBond);
      polymerBond.firstMonomer.removePotentialBonds(true);
      polymerBond.secondMonomer.removePotentialBonds(true);
      polymerBond.firstMonomer.setChosenFirstAttachmentPoint(null);
      (_polymerBond$secondMo6 = polymerBond.secondMonomer) === null || _polymerBond$secondMo6 === void 0 || _polymerBond$secondMo6.setChosenSecondAttachmentPoint(null);
      polymerBond.moveToLinkedEntities();
      polymerBond.firstMonomer.turnOffSelection();
      polymerBond.firstMonomer.turnOffHover();
      polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
      polymerBond.secondMonomer.turnOffSelection();
      polymerBond.secondMonomer.turnOffHover();
      polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();
      polymerBond.turnOffHover();
      return polymerBond;
    }
  }, {
    key: "finishPolymerBondCreation",
    value: function finishPolymerBondCreation(polymerBond, secondMonomer, firstMonomerAttachmentPoint, secondMonomerAttachmentPoint) {
      var _this12 = this;
      var bondType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : types.MACROMOLECULES_BOND_TYPES.SINGLE;
      var command = new Command.Command();
      var editor = editorSingleton.provideEditorInstance();
      var firstMonomer = polymerBond.firstMonomer;
      this.polymerBonds["delete"](polymerBond.id);
      var operation = new index$1.PolymerBondFinishCreationOperation(function (polymerBond) {
        return _this12.finishPolymerBondCreationModelChange(firstMonomer, secondMonomer, firstMonomerAttachmentPoint, secondMonomerAttachmentPoint, bondType, polymerBond);
      }, this.deletePolymerBondChangeModel.bind(this));
      command.addOperation(operation);
      if (editor.mode.modeName === 'snake-layout-mode') {
        command.merge(this.recalculateCanvasMatrix());
      }
      command.merge(this.recalculateAntisenseChains());
      return command;
    }
  }, {
    key: "createPolymerBond",
    value: function createPolymerBond(firstMonomer, secondMonomer, firstMonomerAttachmentPoint, secondMonomerAttachmentPoint) {
      var _this13 = this;
      var bondType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : types.MACROMOLECULES_BOND_TYPES.SINGLE;
      var command = new Command.Command();
      var operation = new index$1.PolymerBondFinishCreationOperation(function (polymerBond) {
        return _this13.finishPolymerBondCreationModelChange(firstMonomer, secondMonomer, firstMonomerAttachmentPoint, secondMonomerAttachmentPoint, bondType, polymerBond);
      }, this.deletePolymerBondChangeModel.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "intendToStartBondCreation",
    value: function intendToStartBondCreation(monomer) {
      var command = new Command.Command();
      monomer.turnOnHover();
      monomer.turnOnAttachmentPointsVisibility();
      var operation = new MonomerHoverOperation.MonomerHoverOperation(monomer, true);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "intendToStartAttachmenPointBondCreation",
    value: function intendToStartAttachmenPointBondCreation(monomer, attachmentPointName) {
      var command = new Command.Command();
      monomer.turnOnHover();
      monomer.turnOnAttachmentPointsVisibility();
      var operation = new AttachmentPointHoverOperation.AttachmentPointHoverOperation(monomer, attachmentPointName);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "intendToFinishBondCreation",
    value: function intendToFinishBondCreation(monomer, bond, shouldCalculateBonds) {
      var command = new Command.Command();
      monomer.turnOnHover();
      monomer.turnOnAttachmentPointsVisibility();
      if (shouldCalculateBonds) {
        bond.firstMonomer.removePotentialBonds();
        monomer.removePotentialBonds();
        var firstMonomerValidSourcePoint = bond.firstMonomer.getValidSourcePoint(monomer);
        var secondMonomerValidTargetPoint = monomer.getValidTargetPoint(bond.firstMonomer);
        bond.firstMonomer.setPotentialBond(firstMonomerValidSourcePoint, bond);
        monomer.setPotentialBond(secondMonomerValidTargetPoint, bond);
      }
      var connectFirstMonomerOperation = new MonomerHoverOperation.MonomerHoverOperation(bond.firstMonomer, true);
      var connectSecondMonomerOperation = new MonomerHoverOperation.MonomerHoverOperation(monomer, true);
      command.addOperation(connectFirstMonomerOperation);
      command.addOperation(connectSecondMonomerOperation);
      return command;
    }
  }, {
    key: "intendToFinishAttachmenPointBondCreation",
    value: function intendToFinishAttachmenPointBondCreation(monomer, bond, attachmentPointName, shouldCalculateBonds) {
      var command = new Command.Command();
      monomer.turnOnHover();
      monomer.turnOnAttachmentPointsVisibility();
      if (monomer.isAttachmentPointUsed(attachmentPointName)) {
        var operation = new MonomerHoverOperation.MonomerHoverOperation(monomer, true);
        command.addOperation(operation);
        return command;
      }
      if (attachmentPointName) {
        monomer.setPotentialSecondAttachmentPoint(attachmentPointName);
        monomer.setPotentialBond(attachmentPointName, bond);
      }
      if (shouldCalculateBonds) {
        bond.firstMonomer.removePotentialBonds();
        monomer.removePotentialBonds();
        var firstMonomerValidSourcePoint = bond.firstMonomer.getValidSourcePoint(monomer);
        var secondMonomerValidTargetPoint = monomer.getValidTargetPoint(bond.firstMonomer);
        bond.firstMonomer.setPotentialBond(firstMonomerValidSourcePoint, bond);
        monomer.setPotentialBond(secondMonomerValidTargetPoint, bond);
      }
      var connectFirstMonomerOperation = new MonomerHoverOperation.MonomerHoverOperation(bond.firstMonomer, true);
      var connectSecondMonomerOperation = new AttachmentPointHoverOperation.AttachmentPointHoverOperation(monomer, attachmentPointName);
      command.addOperation(connectFirstMonomerOperation);
      command.addOperation(connectSecondMonomerOperation);
      return command;
    }
  }, {
    key: "cancelIntentionToFinishBondCreation",
    value: function cancelIntentionToFinishBondCreation(monomer, polymerBond) {
      var command = new Command.Command();
      monomer.turnOffHover();
      monomer.turnOffAttachmentPointsVisibility();
      monomer.setPotentialSecondAttachmentPoint(null);
      monomer.removePotentialBonds();
      var operation = new MonomerHoverOperation.MonomerHoverOperation(monomer, true);
      command.addOperation(operation);
      if (polymerBond && !polymerBond.firstMonomer.chosenFirstAttachmentPointForBond) {
        polymerBond.firstMonomer.removePotentialBonds();
        var _operation = new MonomerHoverOperation.MonomerHoverOperation(polymerBond.firstMonomer, true);
        command.addOperation(_operation);
      }
      return command;
    }
  }, {
    key: "intendToSelectDrawingEntity",
    value: function intendToSelectDrawingEntity(drawingEntity) {
      var command = new Command.Command();
      drawingEntity.turnOnHover();
      var operation = new index.DrawingEntityHoverOperation(drawingEntity);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "intendToSelectAllConnectedDrawingEntities",
    value: function intendToSelectAllConnectedDrawingEntities(startEntity) {
      var command = new Command.Command();
      this.visitAllConnectedEntities(startEntity, function (drawingEntity) {
        drawingEntity.turnOnHover();
        var operation = new index.DrawingEntityHoverOperation(drawingEntity);
        command.addOperation(operation);
      });
      return command;
    }
  }, {
    key: "cancelIntentionToSelectDrawingEntity",
    value: function cancelIntentionToSelectDrawingEntity(drawingEntity) {
      var command = new Command.Command();
      drawingEntity.turnOffHover();
      var operation = new index.DrawingEntityHoverOperation(drawingEntity);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "cancelIntentionToSelectAllConnectedDrawingEntities",
    value: function cancelIntentionToSelectAllConnectedDrawingEntities(startEntity) {
      var command = new Command.Command();
      this.visitAllConnectedEntities(startEntity, function (drawingEntity) {
        drawingEntity.turnOffHover();
        var operation = new index.DrawingEntityHoverOperation(drawingEntity);
        command.addOperation(operation);
      });
      return command;
    }
  }, {
    key: "showPolymerBondInformation",
    value: function showPolymerBondInformation(polymerBond) {
      var command = new Command.Command();
      polymerBond.turnOnHover();
      polymerBond.firstMonomer.turnOnHover();
      assert.assert(polymerBond.secondMonomer);
      polymerBond.secondMonomer.turnOnHover();
      if (!(polymerBond instanceof HydrogenBond.HydrogenBond)) {
        polymerBond.firstMonomer.turnOnAttachmentPointsVisibility();
        polymerBond.secondMonomer.turnOnAttachmentPointsVisibility();
      }
      var operation = new index$1.PolymerBondShowInfoOperation(polymerBond);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "hidePolymerBondInformation",
    value: function hidePolymerBondInformation(polymerBond) {
      var command = new Command.Command();
      polymerBond.turnOffHover();
      polymerBond.firstMonomer.turnOffHover();
      polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
      assert.assert(polymerBond.secondMonomer);
      polymerBond.secondMonomer.turnOffHover();
      polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();
      var operation = new index$1.PolymerBondShowInfoOperation(polymerBond);
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "hideAllMonomersHoverAndAttachmentPoints",
    value: function hideAllMonomersHoverAndAttachmentPoints() {
      var command = new Command.Command();
      this.monomers.forEach(function (monomer) {
        monomer.turnOffHover();
        monomer.turnOffAttachmentPointsVisibility();
        var operation = new MonomerHoverOperation.MonomerHoverOperation(monomer, true);
        command.addOperation(operation);
      });
      return command;
    }
  }, {
    key: "findGroupTemplateConnection",
    value: function findGroupTemplateConnection(connections, monomer1, monomer2) {
      return monomer2 && (connections === null || connections === void 0 ? void 0 : connections.find(function (connection) {
        return connection.endpoint1.templateId === helpers.getMonomerTemplateRefFromMonomerItem(monomer1) && connection.endpoint2.templateId === helpers.getMonomerTemplateRefFromMonomerItem(monomer2) || connection.endpoint2.templateId === helpers.getMonomerTemplateRefFromMonomerItem(monomer1) && connection.endpoint1.templateId === helpers.getMonomerTemplateRefFromMonomerItem(monomer2);
      }));
    }
  }, {
    key: "addRnaPreset",
    value: function addRnaPreset(_ref21) {
      var _this14 = this;
      var sugar = _ref21.sugar,
        _sugarPosition = _ref21.sugarPosition,
        phosphate = _ref21.phosphate,
        _phosphatePosition = _ref21.phosphatePosition,
        rnaBase = _ref21.rnaBase,
        _rnaBasePosition = _ref21.rnaBasePosition,
        connections = _ref21.connections;
      var sugarPhosphateConnectionTemplate = this.findGroupTemplateConnection(connections || [], sugar, phosphate);
      var isFivePrimePhosphate = (sugarPhosphateConnectionTemplate === null || sugarPhosphateConnectionTemplate === void 0 ? void 0 : sugarPhosphateConnectionTemplate.endpoint1.templateId) === helpers.getMonomerTemplateRefFromMonomerItem(sugar) ? (sugarPhosphateConnectionTemplate === null || sugarPhosphateConnectionTemplate === void 0 ? void 0 : sugarPhosphateConnectionTemplate.endpoint1.attachmentPointId) === monomers$3.AttachmentPointName.R1 : (sugarPhosphateConnectionTemplate === null || sugarPhosphateConnectionTemplate === void 0 ? void 0 : sugarPhosphateConnectionTemplate.endpoint2.attachmentPointId) === monomers$3.AttachmentPointName.R1;
      var sugarPosition = isFivePrimePhosphate && _phosphatePosition ? _phosphatePosition : _sugarPosition;
      var phosphatePosition = isFivePrimePhosphate ? _sugarPosition : _phosphatePosition;
      var rnaBasePosition = isFivePrimePhosphate && sugarPosition && _rnaBasePosition ? new vec2.Vec2(sugarPosition.x, _rnaBasePosition.y) : _rnaBasePosition;
      var command = new Command.Command();
      var monomersToAdd = [];
      if (rnaBase && rnaBasePosition) {
        monomersToAdd.push([rnaBase, rnaBasePosition]);
      }
      monomersToAdd.push([sugar, sugarPosition]);
      if (phosphate && phosphatePosition) {
        monomersToAdd.push([phosphate, phosphatePosition]);
      }
      var monomers = [];
      monomersToAdd.forEach(function (_ref22, monomerIndex) {
        var _ref23 = _slicedToArray__default["default"](_ref22, 2),
          monomerItem = _ref23[0],
          monomerPosition = _ref23[1];
        var monomerAddOperation = new MonomerAddOperation.MonomerAddOperation(_this14.addMonomerChangeModel.bind(_this14, monomerItem, monomerPosition), _this14.deleteMonomerChangeModel.bind(_this14));
        var monomer = monomerAddOperation.monomer;
        monomers.push(monomer);
        command.addOperation(monomerAddOperation);
        if (monomerIndex > 0) {
          var previousMonomer = monomers[monomerIndex - 1];
          var connectionTemplate = _this14.findGroupTemplateConnection(connections || [], previousMonomer.monomerItem, monomer.monomerItem);
          var attPointStart;
          var attPointEnd;
          if (connectionTemplate) {
            var isEndpoint1 = connectionTemplate.endpoint1.templateId === helpers.getMonomerTemplateRefFromMonomerItem(previousMonomer.monomerItem);
            attPointStart = isEndpoint1 ? connectionTemplate.endpoint1.attachmentPointId : connectionTemplate.endpoint2.attachmentPointId;
            attPointEnd = isEndpoint1 ? connectionTemplate.endpoint2.attachmentPointId : connectionTemplate.endpoint1.attachmentPointId;
          } else {
            attPointStart = previousMonomer.getValidSourcePoint(monomer);
            attPointEnd = monomer.getValidSourcePoint(previousMonomer);
          }
          assert.assert(attPointStart);
          assert.assert(attPointEnd);
          var operation = new index$1.PolymerBondFinishCreationOperation(function (polymerBond) {
            return _this14.finishPolymerBondCreationModelChange(previousMonomer, monomer, attPointStart, attPointEnd, types.MACROMOLECULES_BOND_TYPES.SINGLE, polymerBond);
          }, _this14.deletePolymerBondChangeModel.bind(_this14));
          command.addOperation(operation);
        }
      });
      return {
        command: command,
        monomers: monomers
      };
    }
  }, {
    key: "rearrangeChainModelChange",
    value: function rearrangeChainModelChange(monomer, newPosition) {
      if (monomers$1.isMonomerSgroupWithAttachmentPoints(monomer)) {
        var offset = newPosition.sub(monomer.position);
        this.moveChemAtomsPoint(monomer, offset);
      }
      monomer.moveAbsolute(newPosition);
      return monomer;
    }
  }, {
    key: "addRnaOperations",
    value: function addRnaOperations(command, oldMonomerPosition, newPosition, monomer) {
      if (!monomer || !oldMonomerPosition || !newPosition) {
        return;
      }
      var operation = new MonomerMoveOperation.MonomerMoveOperation(this.rearrangeChainModelChange.bind(this, monomer, coordinates.Coordinates.canvasToModel(newPosition)), this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition));
      command.addOperation(operation);
    }
  }, {
    key: "recalculateCanvasMatrixModelChange",
    value: function recalculateCanvasMatrixModelChange(snakeLayoutMatrix, _chainsCollection) {
      if (!snakeLayoutMatrix || snakeLayoutMatrix.height === 0) {
        return;
      }
      var chainsCollection = _chainsCollection || ChainsCollection.ChainsCollection.fromMonomers(Array.from(this.monomers.values()));
      if (!_chainsCollection) {
        chainsCollection.rearrange();
      }
      this.canvasMatrix = new CanvasMatrix.CanvasMatrix(chainsCollection, {
        initialMatrix: snakeLayoutMatrix
      });
      return this.redrawBonds();
    }
  }, {
    key: "recalculateCanvasMatrix",
    value: function recalculateCanvasMatrix(chainsCollection, previousSnakeLayoutMatrix) {
      var command = new Command.Command();
      command.addOperation(new snake.RecalculateCanvasMatrixOperation(this.recalculateCanvasMatrixModelChange.bind(this, this.snakeLayoutMatrix, chainsCollection), this.recalculateCanvasMatrixModelChange.bind(this, previousSnakeLayoutMatrix, chainsCollection)));
      return command;
    }
  }, {
    key: "calculateSnakeLayoutMatrix",
    value: function calculateSnakeLayoutMatrix(chainsCollection) {
      var snakeLayoutMatrix = new Matrix.Matrix();
      var monomersGroupedByY = new Map();
      var monomerToNode = chainsCollection.monomerToNode;
      this.monomers.forEach(function (monomer) {
        var x = Number(monomer.position.x.toFixed());
        var y = Number(monomer.position.y.toFixed());
        if (!monomersGroupedByY.has(y)) {
          monomersGroupedByY.set(y, new Map());
        }
        var monomersGroupedByX = monomersGroupedByY.get(y);
        monomersGroupedByX === null || monomersGroupedByX === void 0 || monomersGroupedByX.set(x, monomer);
      });
      var sortedGroupedMonomers = _toConsumableArray__default["default"](monomersGroupedByY.entries()).map(function (_ref24) {
        var _ref25 = _slicedToArray__default["default"](_ref24, 2),
          y = _ref25[0],
          groupedByX = _ref25[1];
        var groupedByYArray = [y, _toConsumableArray__default["default"](groupedByX.entries())];
        return groupedByYArray;
      });
      sortedGroupedMonomers.sort(function (a, b) {
        return a[0] - b[0];
      });
      sortedGroupedMonomers.forEach(function (_ref26, index) {
        var _ref27 = _slicedToArray__default["default"](_ref26, 2),
          y = _ref27[0],
          groupedByY = _ref27[1];
        groupedByY.sort(function (a, b) {
          return Number(a[0]) - Number(b[0]);
        });
        sortedGroupedMonomers[index] = [y, groupedByY];
      });
      var monomerXToIndexInMatrix = {};
      var allXPositions = new Set();
      sortedGroupedMonomers.forEach(function (_ref28) {
        var _ref29 = _slicedToArray__default["default"](_ref28, 2),
          groupedByX = _ref29[1];
        groupedByX.forEach(function (_ref30) {
          var _ref31 = _slicedToArray__default["default"](_ref30, 1),
            x = _ref31[0];
          allXPositions.add(x);
        });
      });
      var sortedXPositions = _toConsumableArray__default["default"](allXPositions).sort(function (a, b) {
        return a - b;
      });
      sortedXPositions.forEach(function (x, index) {
        monomerXToIndexInMatrix[x] = index;
      });
      sortedGroupedMonomers.forEach(function (_ref32, indexY) {
        var _ref33 = _slicedToArray__default["default"](_ref32, 2),
          groupedByX = _ref33[1];
        groupedByX.forEach(function (_ref34) {
          var _ref35 = _slicedToArray__default["default"](_ref34, 2),
            x = _ref35[0],
            monomer = _ref35[1];
          snakeLayoutMatrix.set(Number(indexY), Number(monomerXToIndexInMatrix[x]), new Cell.Cell(monomerToNode.get(monomer), [], Number(indexY), Number(monomerXToIndexInMatrix[x]), monomer));
        });
      });
      return snakeLayoutMatrix;
    }
  }, {
    key: "rearrangeSingleMonomerSnakeLayoutNode",
    value: function rearrangeSingleMonomerSnakeLayoutNode(snakeLayoutNode, newPosition, rearrangedMonomersSet) {
      var _snakeLayoutNode$mono;
      var needRepositionMonomers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var command = new Command.Command();
      if (needRepositionMonomers) {
        this.addRnaOperations(command, snakeLayoutNode.monomer.position, newPosition, snakeLayoutNode.monomer);
      }
      rearrangedMonomersSet.add((_snakeLayoutNode$mono = snakeLayoutNode.monomer) === null || _snakeLayoutNode$mono === void 0 ? void 0 : _snakeLayoutNode$mono.id);
      return command;
    }
  }, {
    key: "rearrangeSugarWithBaseSnakeLayoutNode",
    value: function rearrangeSugarWithBaseSnakeLayoutNode(snakeLayoutNode, newSugarPosition, rearrangedMonomersSet) {
      var _snakeLayoutNode$base2;
      var needRepositionMonomers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var isAntisense = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var command = new Command.Command();
      if (needRepositionMonomers) {
        var _snakeLayoutNode$base;
        this.addRnaOperations(command, snakeLayoutNode.sugar.position, newSugarPosition, snakeLayoutNode.sugar);
        this.addRnaOperations(command, (_snakeLayoutNode$base = snakeLayoutNode.base) === null || _snakeLayoutNode$base === void 0 ? void 0 : _snakeLayoutNode$base.position, new vec2.Vec2(newSugarPosition.x, newSugarPosition.y + (isAntisense ? -1 : 1) * layout.SnakeLayoutCellWidth), snakeLayoutNode.base);
      }
      rearrangedMonomersSet.add(snakeLayoutNode.sugar.id);
      rearrangedMonomersSet.add((_snakeLayoutNode$base2 = snakeLayoutNode.base) === null || _snakeLayoutNode$base2 === void 0 ? void 0 : _snakeLayoutNode$base2.id);
      return command;
    }
  }, {
    key: "applySnakeLayout",
    value: function applySnakeLayout(isSnakeMode) {
      var _this15 = this;
      var needRedrawBonds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var needRepositionMonomers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var needRecalculateOldAntisense = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var needRepositionMolecules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      if (this.monomers.size === 0) {
        return new Command.Command();
      }
      var previousSnakeLayoutMatrix = this.snakeLayoutMatrix;
      var command = new Command.Command();
      var chainsCollection;
      command.merge(this.recalculateAntisenseChains(needRecalculateOldAntisense));
      if (isSnakeMode) {
        var editor = editorSingleton.provideEditorInstance();
        var editorSettings$1 = editorSettings.provideEditorSettings();
        var canvasWidth = editor.canvas.width.baseVal.value;
        var cellWidthInAngstroms = layout.SnakeLayoutCellWidth / editorSettings$1.macroModeScale;
        var lineLengthFromSettings = SettingsManager.SettingsManager.editorLineLength['snake-layout-mode'];
        var lineLengthFromCanvasWidth = Math.floor((canvasWidth - layout.SnakeLayoutCellWidth) / layout.SnakeLayoutCellWidth);
        if (lineLengthFromSettings === 0) {
          SettingsManager.SettingsManager.editorLineLength = {
            'snake-layout-mode': lineLengthFromCanvasWidth
          };
        }
        var rearrangedMonomersSet = new Set();
        var lastPosition = new vec2.Vec2({
          x: MONOMER_START_X_POSITION,
          y: MONOMER_START_Y_POSITION
        });
        chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(_toConsumableArray__default["default"](this.monomers.values()));
        chainsCollection.rearrange();
        var snakeLayoutModel = new SnakeLayoutModel.SnakeLayoutModel(chainsCollection, this, needRepositionMolecules);
        var hasAntisenseInRow = false;
        var hasRnaInRow = false;
        var previousSenseNode;
        var previousAntisenseNode;
        var newSenseNodePosition = lastPosition;
        snakeLayoutModel.forEachChain(function (chain) {
          chain.forEachRow(function (row) {
            var firstNodeInRow = row.snakeLayoutModelItems[0];
            if (hasAntisenseInRow && types$1.isTwoStrandedSnakeLayoutNode(firstNodeInRow)) {
              var _firstNodeInRow$sense, _previousSenseNode, _previousAntisenseNod;
              var r1BondToPreviousMonomer = (_firstNodeInRow$sense = firstNodeInRow.senseNode) === null || _firstNodeInRow$sense === void 0 ? void 0 : _firstNodeInRow$sense.monomers[0].attachmentPointsToBonds.R1;
              if (r1BondToPreviousMonomer instanceof PolymerBond.PolymerBond) {
                r1BondToPreviousMonomer.hasAntisenseInRow = true;
              }
              var r2BondFromPreviousSenseNode = (_previousSenseNode = previousSenseNode) === null || _previousSenseNode === void 0 ? void 0 : _previousSenseNode.monomers[0].attachmentPointsToBonds.R2;
              var r1BondFromPreviousAntisenseNode = (_previousAntisenseNod = previousAntisenseNode) === null || _previousAntisenseNod === void 0 ? void 0 : _previousAntisenseNod.monomers[0].attachmentPointsToBonds.R1;
              if (r2BondFromPreviousSenseNode instanceof PolymerBond.PolymerBond) {
                r2BondFromPreviousSenseNode.nextRowPositionX = newSenseNodePosition.x;
              }
              if (r1BondFromPreviousAntisenseNode instanceof PolymerBond.PolymerBond) {
                r1BondFromPreviousAntisenseNode.nextRowPositionX = newSenseNodePosition.x;
              }
            }
            hasAntisenseInRow = false;
            hasRnaInRow = false;
            row.snakeLayoutModelItems.forEach(function (twoStrandedSnakeLayoutNode) {
              if (twoStrandedSnakeLayoutNode instanceof MoleculeSnakeLayoutNode.MoleculeSnakeLayoutNode) {
                var moleculeBbox = structureBbox.getStructureBbox(twoStrandedSnakeLayoutNode.molecule);
                var offset = vec2.Vec2.diff(coordinates.Coordinates.canvasToModel(newSenseNodePosition), new vec2.Vec2(moleculeBbox.left + cellWidthInAngstroms / 4, moleculeBbox.top + cellWidthInAngstroms / 4));
                twoStrandedSnakeLayoutNode.molecule.forEach(function (atom) {
                  command.merge(_this15.createDrawingEntityMovingCommand(atom, offset));
                });
              } else if (types$1.isTwoStrandedSnakeLayoutNode(twoStrandedSnakeLayoutNode)) {
                var senseNode = twoStrandedSnakeLayoutNode.senseNode;
                var antisenseNode = twoStrandedSnakeLayoutNode.antisenseNode;
                if (senseNode) {
                  if (senseNode instanceof SugarWithBaseSnakeLayoutNode.SugarWithBaseSnakeLayoutNode) {
                    command.merge(_this15.rearrangeSugarWithBaseSnakeLayoutNode(senseNode, newSenseNodePosition, rearrangedMonomersSet, needRepositionMonomers));
                    hasRnaInRow = true;
                  } else if (senseNode instanceof SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode) {
                    command.merge(_this15.rearrangeSingleMonomerSnakeLayoutNode(senseNode, newSenseNodePosition, rearrangedMonomersSet, needRepositionMonomers));
                  }
                }
                if (antisenseNode) {
                  if (antisenseNode instanceof SugarWithBaseSnakeLayoutNode.SugarWithBaseSnakeLayoutNode) {
                    command.merge(_this15.rearrangeSugarWithBaseSnakeLayoutNode(antisenseNode, new vec2.Vec2(newSenseNodePosition.x, newSenseNodePosition.y + layout.SnakeLayoutCellWidth * 3), rearrangedMonomersSet, needRepositionMonomers, true));
                    hasRnaInRow = true;
                  } else if (antisenseNode instanceof SingleMonomerSnakeLayoutNode.SingleMonomerSnakeLayoutNode) {
                    command.merge(_this15.rearrangeSingleMonomerSnakeLayoutNode(antisenseNode, new vec2.Vec2(newSenseNodePosition.x, newSenseNodePosition.y + layout.SnakeLayoutCellWidth * 3), rearrangedMonomersSet, needRepositionMonomers));
                  }
                  hasAntisenseInRow = true;
                }
                previousSenseNode = senseNode || previousSenseNode;
                previousAntisenseNode = antisenseNode || previousAntisenseNode;
              }
              lastPosition = newSenseNodePosition;
              newSenseNodePosition = new vec2.Vec2(lastPosition.x + layout.SnakeLayoutCellWidth, lastPosition.y);
            });
            newSenseNodePosition = new vec2.Vec2(MONOMER_START_X_POSITION, lastPosition.y + (hasRnaInRow || hasAntisenseInRow
            ? VERTICAL_OFFSET_FROM_ROW_WITH_RNA : VERTICAL_DISTANCE_FROM_ROW_WITHOUT_RNA) + (hasAntisenseInRow ? SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS : 0));
          });
        });
        var snakeLayoutMatrix = this.calculateSnakeLayoutMatrix(chainsCollection);
        this.snakeLayoutMatrix = snakeLayoutMatrix;
        command.merge(this.recalculateCanvasMatrix(chainsCollection, previousSnakeLayoutMatrix));
      }
      if (needRedrawBonds) {
        command.merge(this.redrawBonds());
      }
      return command;
    }
  }, {
    key: "redrawBondsModelChange",
    value: function redrawBondsModelChange(bond, startPosition, endPosition) {
      if (bond instanceof MonomerToAtomBond.MonomerToAtomBond) {
        bond.moveToLinkedEntities();
        return bond;
      }
      if (startPosition && endPosition) {
        bond.moveBondStartAbsolute(startPosition.x, startPosition.y);
        bond.moveBondEndAbsolute(endPosition.x, endPosition.y);
      } else {
        bond.moveToLinkedEntities();
      }
      return bond;
    }
  }, {
    key: "redrawBonds",
    value: function redrawBonds() {
      var _this16 = this;
      var command = new Command.Command();
      [].concat(_toConsumableArray__default["default"](this.polymerBonds.values()), _toConsumableArray__default["default"](this.monomerToAtomBonds.values()), _toConsumableArray__default["default"](this.bonds.values())).forEach(function (polymerBond) {
        command.merge(_this16.createDrawingEntityRedrawCommand(_this16.redrawBondsModelChange.bind(_this16, polymerBond), _this16.redrawBondsModelChange.bind(_this16, polymerBond, polymerBond.startPosition, polymerBond.endPosition)));
      });
      return command;
    }
  }, {
    key: "isNucleosideAndPhosphateConnectedAsNucleotide",
    value: function isNucleosideAndPhosphateConnectedAsNucleotide(nucleoside, phosphate) {
      if (!(nucleoside instanceof Nucleoside.Nucleoside) || !(phosphate instanceof Phosphate.Phosphate)) return false;
      var r2Bond = nucleoside.sugar.attachmentPointsToBonds.R2;
      return !(r2Bond instanceof MonomerToAtomBond.MonomerToAtomBond) && (r2Bond === null || r2Bond === void 0 ? void 0 : r2Bond.secondMonomer) === phosphate;
    }
  }, {
    key: "setMicromoleculesHiddenEntities",
    value: function setMicromoleculesHiddenEntities(struct) {
      this.clearMicromoleculesHiddenEntities();
      struct.mergeInto(this.micromoleculesHiddenEntities);
      this.micromoleculesHiddenEntities.atoms = new pool.Pool();
      this.micromoleculesHiddenEntities.bonds = new pool.Pool();
      this.micromoleculesHiddenEntities.halfBonds = new pool.Pool();
      this.micromoleculesHiddenEntities.sgroups = new pool.Pool();
      this.micromoleculesHiddenEntities.functionalGroups = new pool.Pool();
      this.micromoleculesHiddenEntities.sGroupForest = new sgroupForest.SGroupForest();
      this.micromoleculesHiddenEntities.frags = new pool.Pool();
      this.micromoleculesHiddenEntities.rxnArrows = new pool.Pool();
      this.micromoleculesHiddenEntities.rxnPluses = new pool.Pool();
      this.micromoleculesHiddenEntities.multitailArrows = new pool.Pool();
    }
  }, {
    key: "clearMicromoleculesHiddenEntities",
    value: function clearMicromoleculesHiddenEntities() {
      this.micromoleculesHiddenEntities = new struct.Struct();
    }
  }, {
    key: "mergeInto",
    value: function mergeInto(targetDrawingEntitiesManager) {
      var command = new Command.Command();
      var monomerToNewMonomer = new Map();
      var atomToNewAtom = new Map();
      var mergedDrawingEntities = new DrawingEntitiesManager();
      var editor = editorSingleton.provideEditorInstance();
      var viewModel = editor.viewModel;
      this.monomers.forEach(function (monomer) {
        var monomerAddCommand = monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? targetDrawingEntitiesManager.addAmbiguousMonomer(_objectSpread({}, monomer.variantMonomerItem), monomer.position) : targetDrawingEntitiesManager.addMonomer(monomer.monomerItem, monomer.position);
        command.merge(monomerAddCommand);
        var addedMonomer = monomerAddCommand.operations[0].monomer;
        mergedDrawingEntities.monomers.set(addedMonomer.id, addedMonomer);
        monomerToNewMonomer.set(monomer, monomerAddCommand.operations[0].monomer);
      });
      this.polymerBonds.forEach(function (polymerBond) {
        assert.assert(polymerBond.secondMonomer);
        var polymerBondCreateCommand = targetDrawingEntitiesManager.createPolymerBond(monomerToNewMonomer.get(polymerBond.firstMonomer), monomerToNewMonomer.get(polymerBond.secondMonomer), polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond), polymerBond.secondMonomer.getAttachmentPointByBond(polymerBond), polymerBond instanceof HydrogenBond.HydrogenBond ? types.MACROMOLECULES_BOND_TYPES.HYDROGEN : types.MACROMOLECULES_BOND_TYPES.SINGLE);
        command.merge(polymerBondCreateCommand);
        var addedPolymerBond = polymerBondCreateCommand.operations[0].polymerBond;
        mergedDrawingEntities.polymerBonds.set(addedPolymerBond.id, addedPolymerBond);
      });
      this.atoms.forEach(function (atom) {
        var atomAddCommand = targetDrawingEntitiesManager.addAtom(atom.position, monomerToNewMonomer.get(atom.monomer), atom.atomIdInMicroMode, atom.label, atom.properties);
        var addedAtom = atomAddCommand.operations[0].atom;
        command.merge(atomAddCommand);
        mergedDrawingEntities.atoms.set(addedAtom.id, addedAtom);
        atomToNewAtom.set(atom, addedAtom);
      });
      this.bonds.forEach(function (bond) {
        var newFirstAtom = atomToNewAtom.get(bond.firstAtom);
        var newSecondAtom = atomToNewAtom.get(bond.secondAtom);
        if (!newFirstAtom || !newSecondAtom) {
          return;
        }
        var bondAddCommand = targetDrawingEntitiesManager.addBond(newFirstAtom, newSecondAtom, bond.type, bond.stereo, bond.bondIdInMicroMode, bond.cip);
        var addedBond = bondAddCommand.operations[0].bond;
        command.merge(bondAddCommand);
        mergedDrawingEntities.bonds.set(addedBond.id, addedBond);
      });
      viewModel.initialize(_toConsumableArray__default["default"](targetDrawingEntitiesManager.bonds.values()));
      this.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        var bondAddCommand = targetDrawingEntitiesManager.addMonomerToAtomBond(monomerToNewMonomer.get(monomerToAtomBond.monomer), atomToNewAtom.get(monomerToAtomBond.atom), monomerToAtomBond.monomer.getAttachmentPointByBond(monomerToAtomBond));
        var addedBond = bondAddCommand.operations[0].monomerToAtomBond;
        command.merge(bondAddCommand);
        mergedDrawingEntities.monomerToAtomBonds.set(addedBond.id, addedBond);
      });
      this.sgroups.forEach(function (sgroup) {
        var _sgroupAddCommand$ope;
        var monomer = monomerToNewMonomer.get(sgroup.monomer);
        if (!monomer) {
          return;
        }
        var sgroupAddCommand = targetDrawingEntitiesManager.addSGroup(sgroup.sgroup, monomer, sgroup.sgroupIdInMicroMode);
        var addedSGroup = (_sgroupAddCommand$ope = sgroupAddCommand.operations[0]) === null || _sgroupAddCommand$ope === void 0 ? void 0 : _sgroupAddCommand$ope.sgroupDrawingEntity;
        if (!addedSGroup) {
          return;
        }
        command.merge(sgroupAddCommand);
        mergedDrawingEntities.sgroups.set(addedSGroup.id, addedSGroup);
      });
      this.rxnArrows.forEach(function (rxnArrow) {
        var rxnArrowAddCommand = targetDrawingEntitiesManager.addRxnArrow(rxnArrow.type, rxnArrow.startEndPosition, rxnArrow.height, rxnArrow.initiallySelected, rxnArrow.arrowId);
        var addedRxnArrow = rxnArrowAddCommand.operations[0].rxnArrow;
        command.merge(rxnArrowAddCommand);
        mergedDrawingEntities.rxnArrows.set(addedRxnArrow.id, addedRxnArrow);
      });
      this.multitailArrows.forEach(function (multitailArrow) {
        var arrowAddCommand = targetDrawingEntitiesManager.addMultitailArrow(multitailArrow.toKetNode(), multitailArrow.arrowId);
        var addedArrow = arrowAddCommand.operations[0].multitailArrow;
        command.merge(arrowAddCommand);
        mergedDrawingEntities.multitailArrows.set(addedArrow.id, addedArrow);
      });
      this.rxnPluses.forEach(function (rxnPlus) {
        var plusAddCommand = targetDrawingEntitiesManager.addRxnPlus(rxnPlus.position);
        var addedPlus = plusAddCommand.operations[0].rxnPlus;
        command.merge(plusAddCommand);
        mergedDrawingEntities.rxnPluses.set(addedPlus.id, addedPlus);
      });
      this.micromoleculesHiddenEntities.mergeInto(targetDrawingEntitiesManager.micromoleculesHiddenEntities);
      return {
        command: command,
        mergedDrawingEntities: mergedDrawingEntities
      };
    }
  }, {
    key: "filterSelection",
    value: function filterSelection() {
      var filteredDrawingEntitiesManager = new DrawingEntitiesManager();
      this.selectedEntities.forEach(function (_ref36) {
        var _ref37 = _slicedToArray__default["default"](_ref36, 2),
          entity = _ref37[1];
        if (entity instanceof BaseMonomer.BaseMonomer) {
          filteredDrawingEntitiesManager.addMonomerChangeModel(entity.monomerItem, entity.position, entity);
        } else if (entity instanceof CoreAtom.Atom) {
          filteredDrawingEntitiesManager.addMonomerChangeModel(entity.monomer.monomerItem, entity.monomer.position, entity.monomer);
        } else if (entity instanceof PolymerBond.PolymerBond && entity.secondMonomer) {
          var _entity$secondMonomer, _entity$secondMonomer2;
          var firstAttachmentPoint = entity.firstMonomer.getAttachmentPointByBond(entity);
          var secondAttachmentPoint = (_entity$secondMonomer = entity.secondMonomer) === null || _entity$secondMonomer === void 0 ? void 0 : _entity$secondMonomer.getAttachmentPointByBond(entity);
          if (firstAttachmentPoint && secondAttachmentPoint && entity.firstMonomer.selected && (_entity$secondMonomer2 = entity.secondMonomer) !== null && _entity$secondMonomer2 !== void 0 && _entity$secondMonomer2.selected) {
            filteredDrawingEntitiesManager.finishPolymerBondCreationModelChange(entity.firstMonomer, entity.secondMonomer, firstAttachmentPoint, secondAttachmentPoint, undefined, entity);
          }
        } else if (entity instanceof HydrogenBond.HydrogenBond && entity.secondMonomer) {
          filteredDrawingEntitiesManager.finishPolymerBondCreationModelChange(entity.firstMonomer, entity.secondMonomer, monomers$3.AttachmentPointName.HYDROGEN, monomers$3.AttachmentPointName.HYDROGEN, types.MACROMOLECULES_BOND_TYPES.HYDROGEN, entity);
        } else if (entity instanceof MonomerToAtomBond.MonomerToAtomBond) {
          filteredDrawingEntitiesManager.addMonomerToAtomBondChangeModel(entity.monomer, entity.atom, entity.monomer.getAttachmentPointByBond(entity), entity);
        } else if (entity instanceof CoreBond.Bond) {
          filteredDrawingEntitiesManager.addBondChangeModel(entity.firstAtom, entity.secondAtom, entity.type, entity.stereo, entity.bondIdInMicroMode, entity, entity.cip);
        } else if (entity instanceof CoreRxnArrow.RxnArrow) {
          filteredDrawingEntitiesManager.addRxnArrowModelChange(entity.type, entity.startEndPosition, entity.height, entity.initiallySelected, undefined, entity);
        } else if (entity instanceof CoreMultitailArrow.MultitailArrow) {
          filteredDrawingEntitiesManager.addMultitailArrowArrowModelChange(entity.toKetNode(), undefined, entity);
        } else if (entity instanceof CoreRxnPlus.RxnPlus) {
          filteredDrawingEntitiesManager.addRxnPlusModelChange(entity.position, entity.initiallySelected, entity);
        }
      });
      return filteredDrawingEntitiesManager;
    }
  }, {
    key: "centerMacroStructure",
    value: function centerMacroStructure() {
      var _this17 = this;
      var centerPointOfModel = coordinates.Coordinates.canvasToModel(this.getCurrentCenterPointOfCanvas());
      var structCenter = this.getMacroStructureCenter();
      var offset = vec2.Vec2.diff(centerPointOfModel, structCenter);
      this.allEntities.forEach(function (_ref38) {
        var _ref39 = _slicedToArray__default["default"](_ref38, 2),
          entity = _ref39[1];
        _this17.moveDrawingEntityModelChange(entity, offset);
      });
    }
  }, {
    key: "getCurrentCenterPointOfCanvas",
    value: function getCurrentCenterPointOfCanvas() {
      var editor = editorSingleton.provideEditorInstance();
      var originalCenterPointOfCanvas = new vec2.Vec2(editor.canvasOffset.width / 2, editor.canvasOffset.height / 2);
      return coordinates.Coordinates.viewToCanvas(originalCenterPointOfCanvas);
    }
  }, {
    key: "getMacroStructureCenter",
    value: function getMacroStructureCenter() {
      var xmin = 1e50;
      var ymin = xmin;
      var xmax = -xmin;
      var ymax = -ymin;
      this.monomers.forEach(function (monomer) {
        xmin = Math.min(xmin, monomer.position.x);
        ymin = Math.min(ymin, monomer.position.y);
        xmax = Math.max(xmax, monomer.position.x);
        ymax = Math.max(ymax, monomer.position.y);
      });
      this.polymerBonds.forEach(function (bond) {
        xmin = Math.min(xmin, bond.position.x);
        ymin = Math.min(ymin, bond.position.y);
        xmax = Math.max(xmax, bond.position.x);
        ymax = Math.max(ymax, bond.position.y);
      });
      return new vec2.Vec2((xmin + xmax) / 2, (ymin + ymax) / 2);
    }
  }, {
    key: "rerenderMolecules",
    value: function rerenderMolecules() {
      var editor = editorSingleton.provideEditorInstance();
      this.atoms.forEach(function (atom) {
        editor.renderersContainer.deleteAtom(atom);
        editor.renderersContainer.addAtom(atom);
      });
      this.bonds.forEach(function (bond) {
        editor.renderersContainer.deleteBond(bond);
        editor.renderersContainer.addBond(bond);
      });
      this.rxnArrows.forEach(function (rxnArrow) {
        editor.renderersContainer.deleteRxnArrow(rxnArrow);
        editor.renderersContainer.addRxnArrow(rxnArrow);
      });
      this.multitailArrows.forEach(function (multitailArrow) {
        editor.renderersContainer.deleteMultitailArrow(multitailArrow);
        editor.renderersContainer.addMultitailArrow(multitailArrow);
      });
      this.rxnPluses.forEach(function (rxnPlus) {
        editor.renderersContainer.deleteRxnPlus(rxnPlus);
        editor.renderersContainer.addRxnPlus(rxnPlus);
      });
    }
  }, {
    key: "applyMonomersSequenceLayout",
    value: function applyMonomersSequenceLayout() {
      var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(_toConsumableArray__default["default"](this.monomers.values()));
      chainsCollection.rearrange();
      this.rerenderMolecules();
      SequenceRenderer.SequenceRenderer.show(chainsCollection);
      return chainsCollection;
    }
  }, {
    key: "clearCanvas",
    value: function clearCanvas() {
      var editor = editorSingleton.provideEditorInstance();
      this.monomers.forEach(function (monomer) {
        editor.renderersContainer.deleteMonomer(monomer);
      });
      this.polymerBonds.forEach(function (polymerBond) {
        editor.renderersContainer.deletePolymerBond(polymerBond);
      });
      this.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        editor.renderersContainer.deleteMonomerToAtomBond(monomerToAtomBond);
      });
      this.atoms.forEach(function (atom) {
        editor.renderersContainer.deleteAtom(atom);
      });
      this.bonds.forEach(function (bond) {
        editor.renderersContainer.deleteBond(bond);
      });
      this.rxnArrows.forEach(function (bond) {
        editor.renderersContainer.deleteRxnArrow(bond);
      });
      this.multitailArrows.forEach(function (bond) {
        editor.renderersContainer.deleteMultitailArrow(bond);
      });
      this.rxnPluses.forEach(function (rxnPlus) {
        editor.renderersContainer.deleteRxnPlus(rxnPlus);
      });
      this.stereoFlags.forEach(function (stereoFlag) {
        editor.renderersContainer.deleteStereoFlag(stereoFlag);
      });
      this.sgroups.forEach(function (sgroup) {
        editor.renderersContainer.deleteSGroup(sgroup);
      });
      SequenceRenderer.SequenceRenderer.clear();
    }
  }, {
    key: "applyFlexLayoutMode",
    value: function applyFlexLayoutMode() {
      var needRedrawBonds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var editor = editorSingleton.provideEditorInstance();
      var command = new Command.Command();
      if (needRedrawBonds) {
        command.merge(this.redrawBonds());
      }
      this.detectBondsOverlappedByMonomers();
      this.monomers.forEach(function (monomer) {
        editor.renderersContainer.deleteMonomer(monomer);
        editor.renderersContainer.addMonomer(monomer);
      });
      this.polymerBonds.forEach(function (polymerBond) {
        editor.renderersContainer.deletePolymerBond(polymerBond);
        editor.renderersContainer.addPolymerBond(polymerBond);
      });
      this.rerenderMolecules();
      this.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        editor.renderersContainer.deleteMonomerToAtomBond(monomerToAtomBond);
        editor.renderersContainer.addMonomerToAtomBond(monomerToAtomBond);
      });
      return command;
    }
  }, {
    key: "rerenderBondsOverlappedByMonomers",
    value: function rerenderBondsOverlappedByMonomers() {
      var _this18 = this;
      var editor = editorSingleton.provideEditorInstance();
      if (editor.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var monomersToCheck = this.selectedEntities.filter(function (_ref40) {
        var _ref41 = _slicedToArray__default["default"](_ref40, 2),
          entity = _ref41[1];
        return entity instanceof BaseMonomer.BaseMonomer;
      }).map(function (_ref42) {
        var _ref43 = _slicedToArray__default["default"](_ref42, 2),
          entity = _ref43[1];
        return entity;
      });
      var outstandingBonds = this.polymerBondsArray.filter(function (polymerBond) {
        return monomersToCheck.some(function (monomer) {
          return polymerBond.firstMonomer !== monomer && polymerBond.secondMonomer !== monomer;
        });
      });
      outstandingBonds.forEach(function (polymerBond) {
        var previousIsOverlappedByMonomer = polymerBond.isOverlappedByMonomer;
        polymerBond.isOverlappedByMonomer = _this18.checkBondForOverlapsByMonomers(polymerBond, monomersToCheck);
        if (polymerBond.isOverlappedByMonomer !== previousIsOverlappedByMonomer) {
          editor.renderersContainer.deletePolymerBond(polymerBond, false, false);
          editor.renderersContainer.addPolymerBond(polymerBond, false);
        }
      });
    }
  }, {
    key: "getAllSelectedEntitiesForEntities",
    value: function getAllSelectedEntitiesForEntities(drawingEntities) {
      var command = new Command.Command();
      var editor = editorSingleton.provideEditorInstance();
      editor.events.selectEntities.dispatch(drawingEntities);
      var newDrawingEntities = drawingEntities.reduce(function (selectedDrawingEntities, drawingEntity) {
        var res = editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(drawingEntity, true, selectedDrawingEntities);
        res.drawingEntities.forEach(function (entity) {
          return command.addOperation(new index.DrawingEntitySelectOperation(entity));
        });
        return selectedDrawingEntities.concat(res.drawingEntities);
      }, []);
      return {
        command: command,
        drawingEntities: newDrawingEntities
      };
    }
  }, {
    key: "getAllSelectedEntitiesForSGroup",
    value: function getAllSelectedEntitiesForSGroup(sgroupDrawingEntity, selectedDrawingEntities) {
      var command = new Command.Command();
      var drawingEntities = [];
      var struct = sgroupDrawingEntity.monomer.monomerItem.struct;
      var sgroupAtomIds = new Set(sgroup.SGroup.getAtoms(struct, sgroupDrawingEntity.sgroup));
      var sgroupBondIds = new Set(sgroup.SGroup.getBonds(struct, sgroupDrawingEntity.sgroup));
      var addDrawingEntity = function addDrawingEntity(drawingEntity) {
        if (drawingEntities.includes(drawingEntity) || selectedDrawingEntities !== null && selectedDrawingEntities !== void 0 && selectedDrawingEntities.includes(drawingEntity)) {
          return;
        }
        drawingEntity.turnOnSelection();
        drawingEntities.push(drawingEntity);
        command.addOperation(new index.DrawingEntitySelectOperation(drawingEntity));
      };
      this.atoms.forEach(function (atom) {
        if (atom.monomer === sgroupDrawingEntity.monomer && sgroupAtomIds.has(atom.atomIdInMicroMode)) {
          addDrawingEntity(atom);
        }
      });
      this.bonds.forEach(function (bond) {
        if (bond.firstAtom.monomer === sgroupDrawingEntity.monomer && bond.secondAtom.monomer === sgroupDrawingEntity.monomer && sgroupBondIds.has(bond.bondIdInMicroMode)) {
          addDrawingEntity(bond);
        }
      });
      return {
        command: command,
        drawingEntities: drawingEntities
      };
    }
  }, {
    key: "getAllSelectedEntitiesForSingleEntity",
    value: function getAllSelectedEntitiesForSingleEntity(drawingEntity) {
      var needToSelectConnectedBonds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var selectedDrawingEntities = arguments.length > 2 ? arguments[2] : undefined;
      if (drawingEntity instanceof SGroupDrawingEntity.SGroupDrawingEntity) {
        return this.getAllSelectedEntitiesForSGroup(drawingEntity, selectedDrawingEntities);
      }
      var command = new Command.Command();
      command.addOperation(new index.DrawingEntitySelectOperation(drawingEntity));
      drawingEntity.turnOnSelection();
      var drawingEntities = [drawingEntity];
      var editor = editorSingleton.provideEditorInstance();
      if (editor.mode.modeName !== 'sequence-layout-mode' || drawingEntity instanceof PolymerBond.PolymerBond) {
        return {
          command: command,
          drawingEntities: drawingEntities
        };
      }
      if (drawingEntity instanceof Sugar.Sugar && drawingEntity.isPartOfRNA) {
        var sugar = drawingEntity;
        if (monomers$2.isValidNucleoside(sugar)) {
          var nucleoside = Nucleoside.Nucleoside.fromSugar(sugar);
          drawingEntities = nucleoside.monomers;
        } else if (monomers$2.isValidNucleotide(sugar)) {
          var nucleotide = Nucleotide.Nucleotide.fromSugar(sugar);
          drawingEntities = nucleotide.monomers;
        }
        drawingEntities.forEach(function (entity) {
          if (!(entity instanceof Sugar.Sugar)) {
            entity.turnOnSelection();
            command.addOperation(new index.DrawingEntitySelectOperation(entity));
          }
        });
      }
      drawingEntities.forEach(function (entity) {
        var monomer = entity;
        if (needToSelectConnectedBonds && monomer.hasBonds) {
          monomer.forEachBond(function (polymerBond) {
            var _polymerBond$getAnoth;
            if (!(selectedDrawingEntities !== null && selectedDrawingEntities !== void 0 && selectedDrawingEntities.includes(polymerBond)) && !drawingEntities.includes(polymerBond) && polymerBond instanceof PolymerBond.PolymerBond && (_polymerBond$getAnoth = polymerBond.getAnotherMonomer(monomer)) !== null && _polymerBond$getAnoth !== void 0 && _polymerBond$getAnoth.selected) {
              drawingEntities.push(polymerBond);
              polymerBond.turnOnSelection();
              command.addOperation(new index.DrawingEntitySelectOperation(polymerBond));
            }
          });
        }
      });
      return {
        command: command,
        drawingEntities: drawingEntities
      };
    }
  }, {
    key: "validateIfApplicableForFasta",
    value: function validateIfApplicableForFasta() {
      if (this.monomers.size === 0 && this.micromoleculesHiddenEntities.atoms.size > 0) {
        return false;
      }
      var monomerTypes = new Set();
      var isValid = true;
      this.monomers.forEach(function (monomer) {
        var monomerType = monomer.monomerItem.props.MonomerType;
        if (monomer instanceof AmbiguousMonomer.AmbiguousMonomer) {
          monomerType = monomer.monomerClass === monomers.KetMonomerClass.CHEM ? monomers.MONOMER_CONST.CHEM : monomer.monomers[0].monomerItem.props.MonomerType;
        }
        monomerTypes.add(monomerType);
        if (monomerType === monomers.MONOMER_CONST.CHEM || monomerTypes.size > 1) {
          isValid = false;
        }
      });
      return isValid;
    }
  }, {
    key: "moveMonomer",
    value: function moveMonomer(monomer, position) {
      var oldMonomerPosition = monomer.position;
      var command = new Command.Command();
      var operation = new MonomerMoveOperation.MonomerMoveOperation(this.rearrangeChainModelChange.bind(this, monomer, position), this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "removeHoverForAllMonomers",
    value: function removeHoverForAllMonomers() {
      var command = new Command.Command();
      this.monomers.forEach(function (monomer) {
        if (!monomer.hovered) {
          return;
        }
        monomer.turnOffHover();
        monomer.turnOffAttachmentPointsVisibility();
        command.addOperation(new MonomerHoverOperation.MonomerHoverOperation(monomer, true));
      });
      return command;
    }
  }, {
    key: "reconnectPolymerBondModelChange",
    value: function reconnectPolymerBondModelChange(polymerBond, _ref44) {
      var _polymerBond$secondMo7, _polymerBond$secondMo8;
      var newFirstMonomerAttachmentPoint = _ref44.newFirstMonomerAttachmentPoint,
        newSecondMonomerAttachmentPoint = _ref44.newSecondMonomerAttachmentPoint,
        initialFirstMonomerAttachmentPoint = _ref44.initialFirstMonomerAttachmentPoint,
        initialSecondMonomerAttachmentPoint = _ref44.initialSecondMonomerAttachmentPoint;
      polymerBond.firstMonomer.unsetBond(initialFirstMonomerAttachmentPoint);
      (_polymerBond$secondMo7 = polymerBond.secondMonomer) === null || _polymerBond$secondMo7 === void 0 || _polymerBond$secondMo7.unsetBond(initialSecondMonomerAttachmentPoint);
      polymerBond.firstMonomer.setBond(newFirstMonomerAttachmentPoint, polymerBond);
      (_polymerBond$secondMo8 = polymerBond.secondMonomer) === null || _polymerBond$secondMo8 === void 0 || _polymerBond$secondMo8.setBond(newSecondMonomerAttachmentPoint, polymerBond);
      return polymerBond;
    }
  }, {
    key: "reconnectPolymerBond",
    value: function reconnectPolymerBond(polymerBond, newFirstMonomerAttachmentPoint, newSecondMonomerAttachmentPoint, initialFirstMonomerAttachmentPoint, initialSecondMonomerAttachmentPoint) {
      var command = new Command.Command();
      command.addOperation(new index$1.ReconnectPolymerBondOperation(this.reconnectPolymerBondModelChange.bind(this, polymerBond, {
        newFirstMonomerAttachmentPoint: newFirstMonomerAttachmentPoint,
        newSecondMonomerAttachmentPoint: newSecondMonomerAttachmentPoint,
        initialFirstMonomerAttachmentPoint: initialFirstMonomerAttachmentPoint,
        initialSecondMonomerAttachmentPoint: initialSecondMonomerAttachmentPoint
      }), this.reconnectPolymerBondModelChange.bind(this, polymerBond, {
        newFirstMonomerAttachmentPoint: initialFirstMonomerAttachmentPoint,
        newSecondMonomerAttachmentPoint: initialSecondMonomerAttachmentPoint,
        initialFirstMonomerAttachmentPoint: newFirstMonomerAttachmentPoint,
        initialSecondMonomerAttachmentPoint: newSecondMonomerAttachmentPoint
      })));
      return command;
    }
  }, {
    key: "addAmbiguousMonomerChangeModel",
    value: function addAmbiguousMonomerChangeModel(variantMonomerItem, position, _monomer) {
      if (_monomer) {
        this.monomers.set(_monomer.id, _monomer);
        return _monomer;
      }
      var monomer = new AmbiguousMonomer.AmbiguousMonomer(variantMonomerItem, position);
      this.monomers.set(monomer.id, monomer);
      return monomer;
    }
  }, {
    key: "addAmbiguousMonomer",
    value: function addAmbiguousMonomer(ambiguousMonomerItem, position) {
      var command = new Command.Command();
      var operation = new MonomerAddOperation.MonomerAddOperation(this.addAmbiguousMonomerChangeModel.bind(this, ambiguousMonomerItem, position), this.deleteMonomerChangeModel.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "addAtomChangeModel",
    value: function addAtomChangeModel(position, monomer, atomIdInMicroMode, label, properties, _atom) {
      if (_atom) {
        this.atoms.set(_atom.id, _atom);
        return _atom;
      }
      var atom = new CoreAtom.Atom(position, monomer, atomIdInMicroMode, label, properties);
      this.atoms.set(atom.id, atom);
      return atom;
    }
  }, {
    key: "addAtom",
    value: function addAtom(position, monomer, atomIdInMicroMode, label, properties) {
      var _this19 = this;
      var command = new Command.Command();
      var atomAddOperation = new atom.AtomAddOperation(function (atom) {
        return _this19.addAtomChangeModel(position, monomer, atomIdInMicroMode, label, properties, atom);
      }, this.deleteAtomChangeModel.bind(this));
      command.addOperation(atomAddOperation);
      return command;
    }
  }, {
    key: "deleteAtomChangeModel",
    value: function deleteAtomChangeModel(atom) {
      this.atoms["delete"](atom.id);
      return atom;
    }
  }, {
    key: "deleteAtom",
    value: function deleteAtom(atom$1) {
      var _this20 = this;
      var needToDeleteConnectedEntities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var command = new Command.Command();
      command.addOperation(new atom.AtomDeleteOperation(atom$1, this.deleteAtomChangeModel.bind(this, atom$1), function () {
        return _this20.addAtomChangeModel(atom$1.position, atom$1.monomer, atom$1.atomIdInMicroMode, atom$1.label, atom$1.properties, atom$1);
      }));
      if (needToDeleteConnectedEntities) {
        atom$1.bonds.forEach(function (bond) {
          if (bond.selected) {
            return;
          }
          if (bond instanceof CoreBond.Bond) {
            command.merge(_this20.deleteBond(bond));
          }
        });
        this.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
          if (monomerToAtomBond.atom === atom$1 && !monomerToAtomBond.selected) {
            command.merge(_this20.deleteMonomerToAtomBond(monomerToAtomBond));
          }
        });
      }
      return command;
    }
  }, {
    key: "addBondChangeModel",
    value: function addBondChangeModel(firstAtom, secondAtom, type, stereo, bondIdInMicroMode, _bond, cip) {
      if (_bond) {
        this.bonds.set(_bond.id, _bond);
        return _bond;
      }
      var bond = new CoreBond.Bond(firstAtom, secondAtom, bondIdInMicroMode, type, stereo, cip);
      this.bonds.set(bond.id, bond);
      firstAtom.addBond(bond);
      secondAtom.addBond(bond);
      return bond;
    }
  }, {
    key: "addBond",
    value: function addBond(firstAtom, secondAtom, type, stereo, bondIdInMicroMode, cip) {
      var _this21 = this;
      var command = new Command.Command();
      var bondAddOperation = new bond.BondAddOperation(function (bond) {
        return _this21.addBondChangeModel(firstAtom, secondAtom, type, stereo, bondIdInMicroMode, bond, cip);
      }, function (bond) {
        return _this21.deleteBondChangeModel(bond);
      });
      command.addOperation(bondAddOperation);
      return command;
    }
  }, {
    key: "deleteBondChangeModel",
    value: function deleteBondChangeModel(bond) {
      this.bonds["delete"](bond.id);
      var firstAtom = bond.firstAtom;
      var secondAtom = bond.secondAtom;
      [firstAtom, secondAtom].forEach(function (atom) {
        atom.deleteBond(bond.id);
      });
      return bond;
    }
  }, {
    key: "deleteBond",
    value: function deleteBond(bond$1) {
      var _this22 = this;
      var needToDeleteDisconnectedAtoms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var command = new Command.Command();
      command.addOperation(new bond.BondDeleteOperation(bond$1, this.deleteBondChangeModel.bind(this, bond$1), function (bond) {
        return _this22.addBondChangeModel(bond.firstAtom, bond.secondAtom, bond.type, bond.stereo, bond.bondIdInMicroMode, bond);
      }));
      var firstAtom = bond$1.firstAtom;
      var secondAtom = bond$1.secondAtom;
      [firstAtom, secondAtom].forEach(function (atom) {
        atom.deleteBond(bond$1.id);
        if (!needToDeleteDisconnectedAtoms || !atom.bonds.every(function (atomBond) {
          return atomBond instanceof MonomerToAtomBond.MonomerToAtomBond;
        })) {
          return;
        }
        _this22.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
          if (monomerToAtomBond.atom !== atom || monomerToAtomBond.selected) {
            return;
          }
          command.merge(_this22.deleteAtom(atom, true));
        });
      });
      return command;
    }
  }, {
    key: "addSGroupChangeModel",
    value: function addSGroupChangeModel(sgroup, monomer, sgroupIdInMicroMode, existingSGroupDrawingEntity) {
      if (existingSGroupDrawingEntity) {
        this.sgroups.set(existingSGroupDrawingEntity.id, existingSGroupDrawingEntity);
        return existingSGroupDrawingEntity;
      }
      var sgroupDrawingEntity = new SGroupDrawingEntity.SGroupDrawingEntity(sgroup, monomer, sgroupIdInMicroMode);
      this.sgroups.set(sgroupDrawingEntity.id, sgroupDrawingEntity);
      return sgroupDrawingEntity;
    }
  }, {
    key: "addSGroup",
    value: function addSGroup(sgroup, monomer, sgroupIdInMicroMode) {
      var _this23 = this;
      var command = new Command.Command();
      var sgroupAddOperation = new sgroup$1.SGroupAddOperation(function (sgroupDrawingEntity) {
        return _this23.addSGroupChangeModel(sgroup, monomer, sgroupIdInMicroMode, sgroupDrawingEntity);
      }, this.deleteSGroupChangeModel.bind(this));
      command.addOperation(sgroupAddOperation);
      return command;
    }
  }, {
    key: "deleteSGroupChangeModel",
    value: function deleteSGroupChangeModel(sgroupDrawingEntity) {
      this.sgroups["delete"](sgroupDrawingEntity.id);
      return sgroupDrawingEntity;
    }
  }, {
    key: "deleteSGroup",
    value: function deleteSGroup(sgroupDrawingEntity) {
      var _this24 = this;
      var command = new Command.Command();
      command.addOperation(new sgroup$1.SGroupDeleteOperation(sgroupDrawingEntity, this.deleteSGroupChangeModel.bind(this, sgroupDrawingEntity), function (sgroupToRestore) {
        return _this24.addSGroupChangeModel(sgroupToRestore.sgroup, sgroupToRestore.monomer, sgroupToRestore.sgroupIdInMicroMode, sgroupToRestore);
      }));
      return command;
    }
  }, {
    key: "addMonomerToAtomBondChangeModel",
    value: function addMonomerToAtomBondChangeModel(monomer, atom, attachmentPoint, _monomerToAtomBond) {
      if (_monomerToAtomBond) {
        this.monomerToAtomBonds.set(_monomerToAtomBond.id, _monomerToAtomBond);
        monomer.setBond(attachmentPoint, _monomerToAtomBond);
        atom.addBond(_monomerToAtomBond);
        return _monomerToAtomBond;
      }
      var monomerToAtomBond = new MonomerToAtomBond.MonomerToAtomBond(monomer, atom);
      atom.addBond(monomerToAtomBond);
      this.monomerToAtomBonds.set(monomerToAtomBond.id, monomerToAtomBond);
      monomerToAtomBond.moveToLinkedEntities();
      monomer.setBond(attachmentPoint, monomerToAtomBond);
      monomer.turnOffAttachmentPointsVisibility();
      monomer.turnOffHover();
      return monomerToAtomBond;
    }
  }, {
    key: "deleteMonomerToAtomBondChangeModel",
    value: function deleteMonomerToAtomBondChangeModel(monomerAtomBond) {
      var attachmentPointName = monomerAtomBond.monomer.getAttachmentPointByBond(monomerAtomBond);
      if (attachmentPointName) {
        monomerAtomBond.monomer.unsetBond(attachmentPointName);
      }
      this.monomerToAtomBonds["delete"](monomerAtomBond.id);
      monomerAtomBond.atom.deleteBond(monomerAtomBond.id);
      return monomerAtomBond;
    }
  }, {
    key: "deleteMonomerToAtomBond",
    value: function deleteMonomerToAtomBond(monomerAtomBond) {
      var command = new Command.Command();
      command.addOperation(new monomerToAtomBond.MonomerToAtomBondDeleteOperation(monomerAtomBond, this.deleteMonomerToAtomBondChangeModel.bind(this, monomerAtomBond), this.addMonomerToAtomBondChangeModel.bind(this, monomerAtomBond.monomer, monomerAtomBond.atom, monomerAtomBond.monomer.getAttachmentPointByBond(monomerAtomBond))));
      return command;
    }
  }, {
    key: "addMonomerToAtomBond",
    value: function addMonomerToAtomBond(monomer, atom, attachmentPoint) {
      var command = new Command.Command();
      var monomerAddToAtomBondOperation = new monomerToAtomBond.MonomerToAtomBondAddOperation(this.addMonomerToAtomBondChangeModel.bind(this, monomer, atom, attachmentPoint), this.deleteMonomerToAtomBondChangeModel.bind(this));
      command.addOperation(monomerAddToAtomBondOperation);
      return command;
    }
  }, {
    key: "markMonomerAsAntisense",
    value: function markMonomerAsAntisense(monomer) {
      var command = new Command.Command();
      command.merge(this.modifyMonomerItem(monomer, _objectSpread(_objectSpread({}, monomer.monomerItem), {}, {
        isSense: false,
        isAntisense: true
      })));
      return command;
    }
  }, {
    key: "markMonomerAsSense",
    value: function markMonomerAsSense(monomer) {
      var command = new Command.Command();
      command.merge(this.modifyMonomerItem(monomer, _objectSpread(_objectSpread({}, monomer.monomerItem), {}, {
        isSense: true,
        isAntisense: false
      })));
      return command;
    }
  }, {
    key: "recalculateAntisenseChains",
    value: function recalculateAntisenseChains() {
      var _this25 = this;
      var needRecalculateOldAntisense = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var command = new Command.Command();
      var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(_toConsumableArray__default["default"](this.monomers.values()));
      var handledChains = new Set();
      if (needRecalculateOldAntisense) {
        this.monomers.forEach(function (monomer) {
          command.merge(_this25.modifyMonomerItem(monomer, _objectSpread(_objectSpread({}, monomer.monomerItem), {}, {
            isAntisense: false,
            isSense: false
          })));
        });
        this.antisenseMonomerToSenseChain = new Map();
      }
      chainsCollection.chains.forEach(function (chain) {
        if (handledChains.has(chain)) {
          return;
        }
        if (!needRecalculateOldAntisense) {
          var isAntisenseChain = chain.monomers.some(function (monomer) {
            return monomer.monomerItem.isAntisense;
          });
          var isSenseChain = chain.monomers.some(function (monomer) {
            return monomer.monomerItem.isSense;
          });
          if (isSenseChain) {
            chain.monomers.forEach(function (monomer) {
              command.merge(_this25.markMonomerAsSense(monomer));
            });
            return;
          }
          if (isAntisenseChain) {
            chain.monomers.forEach(function (monomer) {
              command.merge(_this25.markMonomerAsAntisense(monomer));
            });
            return;
          }
        }
        var senseChain;
        var chainsToCheck = chainsCollection.getAllChainsWithConnectionInBlock(chain);
        var chainToMonomers = new Map();
        chainsToCheck.forEach(function (chainToCheck) {
          chainToMonomers.set(chainToCheck, chainToCheck.chain.monomers);
        });
        var largestChainsMonomersAmount = Math.max.apply(Math, _toConsumableArray__default["default"](_toConsumableArray__default["default"](chainToMonomers.values()).map(function (monomers) {
          return getAntisenseSizeWeight(monomers);
        })));
        var largestChains = _toConsumableArray__default["default"](chainToMonomers.entries()).filter(function (_ref45) {
          var _ref46 = _slicedToArray__default["default"](_ref45, 2),
            monomers = _ref46[1];
          return getAntisenseSizeWeight(monomers) === largestChainsMonomersAmount;
        });
        if (largestChains.length === 1) {
          senseChain = largestChains[0][0];
        } else {
          var chainsToCenters = new Map();
          var chainsToComplimentaryChainsAmount = new Map();
          largestChains.forEach(function (_ref47) {
            var _ref48 = _slicedToArray__default["default"](_ref47, 1),
              chainToCheck = _ref48[0];
            var complimentayChains = chainsCollection.getComplimentaryChainsWithData(chainToCheck.chain);
            chainsToComplimentaryChainsAmount.set(chainToCheck, complimentayChains.length);
          });
          largestChains.forEach(function (_ref49) {
            var _ref50 = _slicedToArray__default["default"](_ref49, 2),
              chainToCheck = _ref50[0],
              monomers = _ref50[1];
            var chainBbox = structureBbox.getStructureBbox(monomers);
            chainsToCenters.set(chainToCheck, new vec2.Vec2(chainBbox.left + chainBbox.width / 2, chainBbox.top + chainBbox.height / 2));
          });
          var chainsToCenterArray = _toConsumableArray__default["default"](chainsToCenters.entries());
          var chainWithLowestCenter = chainsToCenterArray.reduce(function (_ref51, _ref52) {
            var _ref53 = _slicedToArray__default["default"](_ref51, 2),
              previousChain = _ref53[0],
              previousChainCenter = _ref53[1];
            var _ref54 = _slicedToArray__default["default"](_ref52, 2),
              chainToCheck = _ref54[0],
              center = _ref54[1];
            return center.y < previousChainCenter.y ? [chainToCheck, center] : [previousChain, previousChainCenter];
          }, chainsToCenterArray[0]);
          var chainsToComplimentaryChainsAmountArray = _toConsumableArray__default["default"](chainsToComplimentaryChainsAmount.entries());
          var chainWithMoreComplimentaryChains = chainsToComplimentaryChainsAmountArray.reduce(function (_ref55, _ref56) {
            var _ref57 = _slicedToArray__default["default"](_ref55, 2),
              previousChain = _ref57[0],
              previousChainComplimentaryChainsAmount = _ref57[1];
            var _ref58 = _slicedToArray__default["default"](_ref56, 2),
              chainToCheck = _ref58[0],
              complimentaryChainsAmount = _ref58[1];
            return complimentaryChainsAmount > previousChainComplimentaryChainsAmount ? [chainToCheck, complimentaryChainsAmount] : [previousChain, previousChainComplimentaryChainsAmount];
          }, chainsToComplimentaryChainsAmountArray[0]);
          senseChain = chainsToComplimentaryChainsAmount.size === 1 ? chainWithMoreComplimentaryChains[0] : chainWithLowestCenter[0];
        }
        var _senseChain = senseChain,
          senseGroup = _senseChain.group;
        chainsToCheck.forEach(function (_ref59) {
          var chain = _ref59.chain,
            group = _ref59.group;
          handledChains.add(chain);
          if (group === senseGroup) {
            chain.monomers.forEach(function (monomer) {
              command.merge(_this25.markMonomerAsSense(monomer));
            });
          } else {
            chain.monomers.forEach(function (monomer) {
              command.merge(_this25.markMonomerAsAntisense(monomer));
              _this25.antisenseMonomerToSenseChain.set(monomer, senseChain.chain);
            });
          }
        });
      });
      return command;
    }
  }, {
    key: "hasAntisenseChains",
    get: function get() {
      return _toConsumableArray__default["default"](this.monomers.values()).some(function (monomer) {
        return monomer.monomerItem.isAntisense;
      });
    }
  }, {
    key: "createAntisenseChain",
    value: function createAntisenseChain(isDnaAntisense) {
      var _this26 = this;
      var editor = editorSingleton.provideEditorInstance();
      var command = new Command.Command();
      var selectedMonomers = this.selectedEntities.filter(function (_ref60) {
        var _ref61 = _slicedToArray__default["default"](_ref60, 2),
          drawingEntity = _ref61[1];
        return drawingEntity instanceof BaseMonomer.BaseMonomer;
      }).map(function (_ref62) {
        var _ref63 = _slicedToArray__default["default"](_ref62, 2),
          monomer = _ref63[1];
        return monomer;
      });
      var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(selectedMonomers);
      var chainsForAntisenseCreation = chainsCollection.chains.filter(function (chain) {
        return chain.subChains.some(function (subChain) {
          return subChain.nodes.some(function (node) {
            return Boolean(DrawingEntitiesManager.getAntisenseBaseLabelForNode(node, isDnaAntisense)) && node.monomer.selected;
          });
        });
      });
      var selectedPiecesInChains = [];
      chainsForAntisenseCreation.forEach(function (chain) {
        var selectedPiece = [];
        var hasRnaInPiece = false;
        chain.nodes.forEach(function (node) {
          var hasSelectedMonomerInNode = node.monomers.some(function (monomer) {
            return monomer.selected;
          });
          if (!hasSelectedMonomerInNode) {
            if (hasRnaInPiece) {
              selectedPiecesInChains.push(selectedPiece);
            }
            selectedPiece = [];
            hasRnaInPiece = false;
          } else {
            selectedPiece.push(node);
          }
          if (node instanceof Nucleoside.Nucleoside || node instanceof Nucleotide.Nucleotide || isUnsplitNucleotideNode(node)) {
            hasRnaInPiece = true;
          }
        });
        if (hasRnaInPiece) {
          selectedPiecesInChains.push(selectedPiece);
        }
        selectedPiece = [];
        hasRnaInPiece = false;
      });
      var lastAddedNode;
      var lastAddedMonomer;
      selectedPiecesInChains.forEach(function (selectedPiece) {
        _toConsumableArray__default["default"](selectedPiece).reverse().forEach(function (nodeToHandle) {
          var senseNode = nodeToHandle instanceof Nucleotide.Nucleotide && nodeToHandle.phosphate.selected && !nodeToHandle.monomer.selected ? new MonomerSequenceNode.MonomerSequenceNode(nodeToHandle.phosphate) : nodeToHandle;
          if (!senseNode.monomer.selected) {
            lastAddedMonomer = undefined;
            lastAddedNode = undefined;
            return;
          }
          if (senseNode instanceof Nucleotide.Nucleotide || senseNode instanceof Nucleoside.Nucleoside || isUnsplitNucleotideNode(senseNode)) {
            var antisenseNodeCreationResult = DrawingEntitiesManager.createAntisenseNode(senseNode, isDnaAntisense);
            if (!antisenseNodeCreationResult) {
              lastAddedNode = undefined;
              lastAddedMonomer = undefined;
              return;
            }
            var addNucleotideCommand = antisenseNodeCreationResult.modelChanges,
              addedNode = antisenseNodeCreationResult.node;
            command.merge(addNucleotideCommand);
            var addedPhosphate;
            if (senseNode instanceof Nucleotide.Nucleotide && senseNode.phosphate.selected || isUnsplitNucleotideNode(senseNode)) {
              var phosphateLibraryItem = rna.getRnaPartLibraryItem(editor, monomers.RNA_DNA_NON_MODIFIED_PART.PHOSPHATE);
              if (!phosphateLibraryItem) {
                KetcherLogger.KetcherLogger.warn('Phosphate is not found in monomers library. Skipping phosphate addition.');
                lastAddedNode = undefined;
                lastAddedMonomer = undefined;
                return;
              }
              var phosphateSeedPosition = senseNode instanceof Nucleotide.Nucleotide ? senseNode.phosphate.position : senseNode.monomer.position;
              var monomerAddCommand = _this26.addMonomer(phosphateLibraryItem, phosphateSeedPosition.add(new vec2.Vec2(0, 3)));
              addedPhosphate = monomerAddCommand.operations[0].monomer;
              command.merge(monomerAddCommand);
              command.merge(_this26.createPolymerBond(addedPhosphate, addedNode.firstMonomerInNode, monomers$3.AttachmentPointName.R2, monomers$3.AttachmentPointName.R1));
            }
            if (lastAddedNode) {
              command.merge(_this26.createPolymerBond(lastAddedMonomer || lastAddedNode.lastMonomerInNode, addedPhosphate || addedNode.firstMonomerInNode, monomers$3.AttachmentPointName.R2, monomers$3.AttachmentPointName.R1));
            }
            var senseMonomerForHydrogenBond = senseNode instanceof Nucleotide.Nucleotide || senseNode instanceof Nucleoside.Nucleoside ? senseNode.rnaBase : senseNode.monomer;
            command.merge(_this26.createPolymerBond(senseMonomerForHydrogenBond, addedNode.rnaBase, monomers$3.AttachmentPointName.HYDROGEN, monomers$3.AttachmentPointName.HYDROGEN, types.MACROMOLECULES_BOND_TYPES.HYDROGEN));
            lastAddedMonomer = undefined;
            lastAddedNode = addedNode;
          } else {
            var _lastAddedNode;
            lastAddedMonomer = lastAddedMonomer || ((_lastAddedNode = lastAddedNode) === null || _lastAddedNode === void 0 ? void 0 : _lastAddedNode.lastMonomerInNode);
            _toConsumableArray__default["default"](senseNode.monomers).reverse().forEach(function (monomer) {
              if (!monomer.selected) {
                lastAddedMonomer = undefined;
                lastAddedNode = undefined;
                return;
              }
              if (!monomer.hasAttachmentPoint(monomers$3.AttachmentPointName.R2)) {
                editor.events.error.dispatch("Monomer ".concat(monomer.label, " does not have attachment point R2. Antisense was not created for this monomer."));
                return;
              }
              if (lastAddedMonomer && !lastAddedMonomer.hasAttachmentPoint(monomers$3.AttachmentPointName.R1)) {
                editor.events.error.dispatch("Monomer ".concat(lastAddedMonomer.label, " does not have attachment point R1. Antisense was not created for this monomer."));
                return;
              }
              var isModifiedPhosphate = monomer instanceof Phosphate.Phosphate && monomer.isModification;
              var isAmbiguousMonomer = monomer instanceof AmbiguousMonomer.AmbiguousMonomer;
              var antisenseMonomerItem = monomer.monomerItem;
              if (isModifiedPhosphate || isAmbiguousMonomer) {
                var nonModifiedPhosphateItem = rna.getRnaPartLibraryItem(editor, monomers.RNA_DNA_NON_MODIFIED_PART.PHOSPHATE);
                if (nonModifiedPhosphateItem) {
                  antisenseMonomerItem = nonModifiedPhosphateItem;
                } else if (isAmbiguousMonomer) {
                  antisenseMonomerItem = monomer.variantMonomerItem;
                }
              }
              var monomerAddCommand = _this26.addMonomer(antisenseMonomerItem, monomer.position.add(new vec2.Vec2(0, 4.25)));
              var addedMonomer = monomerAddCommand.operations[0].monomer;
              command.merge(monomerAddCommand);
              if (lastAddedMonomer) {
                command.merge(_this26.createPolymerBond(lastAddedMonomer, addedMonomer, monomers$3.AttachmentPointName.R2, monomers$3.AttachmentPointName.R1));
              }
              lastAddedNode = senseNode;
              lastAddedMonomer = addedMonomer;
            });
          }
        });
        lastAddedNode = undefined;
        lastAddedMonomer = undefined;
      });
      command.merge(this.applySnakeLayout(true, true));
      if (editor.mode.modeName === 'sequence-layout-mode') {
        command.addOperation(new index$2.ReinitializeModeOperation());
      }
      command.setUndoOperationsByPriority();
      return command;
    }
  }, {
    key: "monomersArray",
    get: function get() {
      return _toConsumableArray__default["default"](this.monomers.values());
    }
  }, {
    key: "polymerBondsArray",
    get: function get() {
      return _toConsumableArray__default["default"](this.polymerBonds.values());
    }
  }, {
    key: "molecules",
    get: function get() {
      return this.monomersArray.filter(function (monomer) {
        return monomer.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(monomer);
      });
    }
  }, {
    key: "checkBondForOverlapsByMonomers",
    value: function checkBondForOverlapsByMonomers(polymerBond, monomers$1) {
      var editor = editorSingleton.provideEditorInstance();
      if (!editor || editor.mode.modeName === 'sequence-layout-mode') {
        return false;
      }
      var secondMonomer = polymerBond.secondMonomer;
      if (!secondMonomer) {
        return false;
      }
      if (!polymerBond.isHorizontal && !polymerBond.isVertical) {
        return false;
      }
      var monomersToUse = monomers$1 !== null && monomers$1 !== void 0 ? monomers$1 : this.monomersArray;
      if (monomersToUse.length > 500) {
        return false;
      }
      var previousOverlap = this.bondsMonomersOverlaps.get(polymerBond.id);
      var monomersToUseWithPreviousOverlap = previousOverlap ? [previousOverlap].concat(_toConsumableArray__default["default"](monomersToUse)) : monomersToUse;
      var overlappingMonomer = monomersToUseWithPreviousOverlap.find(function (monomer) {
        if (monomer.id === polymerBond.firstMonomer.id || monomer.id === secondMonomer.id) {
          return false;
        }
        var distanceFromMonomerToLine = monomer.center.calculateDistanceToLine([polymerBond.firstMonomer.center, secondMonomer.center]);
        return distanceFromMonomerToLine < monomers.HalfMonomerSize;
      });
      if (overlappingMonomer) {
        this.bondsMonomersOverlaps.set(polymerBond.id, overlappingMonomer);
      }
      return Boolean(overlappingMonomer);
    }
  }, {
    key: "detectBondsOverlappedByMonomers",
    value: function detectBondsOverlappedByMonomers(polymerBonds) {
      var _this27 = this;
      var bondsToCheck = polymerBonds !== null && polymerBonds !== void 0 ? polymerBonds : this.polymerBondsArray;
      bondsToCheck.forEach(function (polymerBond) {
        polymerBond.isOverlappedByMonomer = _this27.checkBondForOverlapsByMonomers(polymerBond);
      });
    }
  }, {
    key: "deleteRxnArrowModelChange",
    value: function deleteRxnArrowModelChange(rxnArrow) {
      this.rxnArrows["delete"](rxnArrow.id);
    }
  }, {
    key: "addRxnArrowModelChange",
    value: function addRxnArrowModelChange(type, position, height, initiallySelected, arrowId, _arrow) {
      if (_arrow) {
        this.ensureArrowId(_arrow);
        this.rxnArrows.set(_arrow.id, _arrow);
        return _arrow;
      }
      var rxnArrow = new CoreRxnArrow.RxnArrow(type, position, height, DrawingEntitiesManager.normalizeInitiallySelected(initiallySelected));
      rxnArrow.arrowId = arrowId;
      this.ensureArrowId(rxnArrow);
      this.rxnArrows.set(rxnArrow.id, rxnArrow);
      return rxnArrow;
    }
  }, {
    key: "addRxnArrow",
    value: function addRxnArrow(type, position, height, initiallySelected, arrowId) {
      var _this28 = this;
      var command = new Command.Command();
      var operation = new rxnArrow.RxnArrowAddOperation(function (arrow) {
        return _this28.addRxnArrowModelChange(type, position, height, initiallySelected, arrowId, arrow);
      }, this.deleteRxnArrowModelChange.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteRxnArrow",
    value: function deleteRxnArrow(rxnArrow$1) {
      var _this29 = this;
      var command = new Command.Command();
      var operation = new rxnArrow.RxnArrowDeleteOperation(rxnArrow$1, this.deleteRxnArrowModelChange.bind(this), function (arrow) {
        return _this29.addRxnArrowModelChange(rxnArrow$1.type, rxnArrow$1.startEndPosition, rxnArrow$1.height, rxnArrow$1.initiallySelected, rxnArrow$1.arrowId, arrow);
      });
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteMultitailArrowModelChange",
    value: function deleteMultitailArrowModelChange(multitailArrow) {
      this.multitailArrows["delete"](multitailArrow.id);
    }
  }, {
    key: "addMultitailArrowArrowModelChange",
    value: function addMultitailArrowArrowModelChange(multitailArrowKetNode, arrowId, _arrow) {
      if (_arrow) {
        this.ensureArrowId(_arrow);
        this.multitailArrows.set(_arrow.id, _arrow);
        return _arrow;
      }
      var multitailArrow = CoreMultitailArrow.MultitailArrow.fromKet(multitailArrowKetNode);
      multitailArrow.arrowId = arrowId;
      this.ensureArrowId(multitailArrow);
      this.multitailArrows.set(multitailArrow.id, multitailArrow);
      return multitailArrow;
    }
  }, {
    key: "addMultitailArrow",
    value: function addMultitailArrow(multitailArrowKetNode, arrowId) {
      var _this30 = this;
      var command = new Command.Command();
      var operation = new multitailArrow.MultitailArrowAddOperation(function (arrow) {
        return _this30.addMultitailArrowArrowModelChange(multitailArrowKetNode, arrowId, arrow);
      }, this.deleteMultitailArrowModelChange.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteMultitailArrow",
    value: function deleteMultitailArrow(multitailArrow$1) {
      var _this31 = this;
      var command = new Command.Command();
      var operation = new multitailArrow.MultitailArrowDeleteOperation(multitailArrow$1, this.deleteMultitailArrowModelChange.bind(this), function (arrow) {
        return _this31.addMultitailArrowArrowModelChange(multitailArrow$1.toKetNode(), multitailArrow$1.arrowId, arrow);
      });
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteRxnPlusModelChange",
    value: function deleteRxnPlusModelChange(rxnPlus) {
      this.rxnPluses["delete"](rxnPlus.id);
    }
  }, {
    key: "addRxnPlusModelChange",
    value: function addRxnPlusModelChange(position, initiallySelected, _rxnPlus) {
      if (_rxnPlus) {
        this.rxnPluses.set(_rxnPlus.id, _rxnPlus);
        return _rxnPlus;
      }
      var rxnPlus = new CoreRxnPlus.RxnPlus(position, DrawingEntitiesManager.normalizeInitiallySelected(initiallySelected));
      this.rxnPluses.set(rxnPlus.id, rxnPlus);
      return rxnPlus;
    }
  }, {
    key: "addRxnPlus",
    value: function addRxnPlus(position, initiallySelected) {
      var command = new Command.Command();
      var operation = new rxnPlus.RxnPlusAddOperation(this.addRxnPlusModelChange.bind(this, position, initiallySelected), this.deleteRxnPlusModelChange.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteRxnPlus",
    value: function deleteRxnPlus(rxnPlus$1) {
      var command = new Command.Command();
      var operation = new rxnPlus.RxnPlusDeleteOperation(rxnPlus$1, this.deleteRxnPlusModelChange.bind(this), this.addRxnPlusModelChange.bind(this, rxnPlus$1.position, rxnPlus$1.initiallySelected));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "selectAllConnectedEntities",
    value: function selectAllConnectedEntities(startEntity) {
      var _this32 = this;
      var command = new Command.Command();
      var process = function process(entity) {
        entity.selected = true;
        command.merge(_this32.createDrawingEntitySelectionCommand(entity));
      };
      this.visitAllConnectedEntities(startEntity, process);
      return command;
    }
  }, {
    key: "visitAllConnectedEntities",
    value: function visitAllConnectedEntities(startEntity, process) {
      var queue = [startEntity];
      var visited = new Set();
      while (queue.length > 0) {
        var current = queue.shift();
        if (!current || visited.has(current.id)) continue;
        process(current);
        visited.add(current.id);
        if (current instanceof BaseMonomer.BaseMonomer) {
          queue.push.apply(queue, _toConsumableArray__default["default"](current.hydrogenBonds).concat(_toConsumableArray__default["default"](current.bonds)));
        } else if (current instanceof HydrogenBond.HydrogenBond) {
          queue.push.apply(queue, [current.firstEndEntity].concat(_toConsumableArray__default["default"](current.secondEndEntity ? [current.secondEndEntity] : [])));
        } else if (current instanceof PolymerBond.PolymerBond) {
          queue.push(current.firstMonomer);
          if (current.secondMonomer) queue.push(current.secondMonomer);
        } else if (current instanceof MonomerToAtomBond.MonomerToAtomBond) {
          queue.push(current.monomer, current.atom);
        } else if (current instanceof CoreBond.Bond) {
          queue.push(current.firstAtom, current.secondAtom);
        } else if (current instanceof CoreAtom.Atom) {
          queue.push.apply(queue, _toConsumableArray__default["default"](current.bonds));
        }
      }
    }
  }, {
    key: "getConnectedMolecule",
    value: function getConnectedMolecule(startEntity) {
      var entitiesToReturn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [CoreAtom.Atom, CoreBond.Bond];
      var connectedMoleculeMonomers = [];
      var queue = [startEntity];
      var visited = new Set();
      while (queue.length > 0) {
        var current = queue.shift();
        if (!current || visited.has(current.id)) continue;
        visited.add(current.id);
        if (current instanceof CoreBond.Bond) {
          queue.push(current.firstAtom, current.secondAtom);
          if (entitiesToReturn.includes(CoreBond.Bond)) {
            connectedMoleculeMonomers.push(current);
          }
        } else if (current instanceof CoreAtom.Atom) {
          queue.push.apply(queue, _toConsumableArray__default["default"](current.bonds));
          if (entitiesToReturn.includes(CoreAtom.Atom)) {
            connectedMoleculeMonomers.push(current);
          }
        }
      }
      return connectedMoleculeMonomers;
    }
  }, {
    key: "createRotationHistoryCommand",
    value: function createRotationHistoryCommand(initialPositions) {
      var _this33 = this;
      var command = new Command.Command();
      var zeroOffset = new vec2.Vec2(0, 0);
      [].concat(_toConsumableArray__default["default"](this.atoms.values()), _toConsumableArray__default["default"](this.monomers.values()), _toConsumableArray__default["default"](this.rxnArrows.values()), _toConsumableArray__default["default"](this.multitailArrows.values()), _toConsumableArray__default["default"](this.rxnPluses.values())).forEach(function (drawingEntity) {
        if (drawingEntity instanceof BaseMonomer.BaseMonomer && drawingEntity.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(drawingEntity)) {
          return;
        }
        if (!drawingEntity.selected) {
          return;
        }
        var initialPosition = initialPositions.get(drawingEntity.id);
        if (!initialPosition) {
          return;
        }
        var delta = drawingEntity.position.sub(initialPosition);
        if (delta.length() === 0) {
          return;
        }
        command.merge(_this33.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, delta));
      });
      this.polymerBonds.forEach(function (drawingEntity) {
        var _drawingEntity$second4;
        if (drawingEntity.selected || drawingEntity.firstMonomer.selected || (_drawingEntity$second4 = drawingEntity.secondMonomer) !== null && _drawingEntity$second4 !== void 0 && _drawingEntity$second4.selected) {
          command.merge(_this33.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      this.monomerToAtomBonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.monomer.selected || drawingEntity.atom.selected) {
          command.merge(_this33.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      this.bonds.forEach(function (drawingEntity) {
        if (drawingEntity.selected || drawingEntity.firstAtom.selected || drawingEntity.secondAtom.selected) {
          command.merge(_this33.createDrawingEntityMovingCommand(drawingEntity, zeroOffset, zeroOffset));
        }
      });
      return command;
    }
  }, {
    key: "deleteStereoFlagModelChange",
    value: function deleteStereoFlagModelChange(stereoFlag) {
      this.stereoFlags["delete"](stereoFlag.id);
    }
  }, {
    key: "addStereoFlagModelChange",
    value: function addStereoFlagModelChange(position, flagType, relatedMonomer, _stereoFlag) {
      if (_stereoFlag) {
        this.stereoFlags.set(_stereoFlag.id, _stereoFlag);
        return _stereoFlag;
      }
      var stereoFlag = new CoreStereoFlag.CoreStereoFlag(position, flagType, relatedMonomer);
      this.stereoFlags.set(stereoFlag.id, stereoFlag);
      return stereoFlag;
    }
  }, {
    key: "addStereoFlag",
    value: function addStereoFlag(position, flagType, relatedMonomer) {
      var command = new Command.Command();
      var operation = new index$3.StereoFlagAddOperation(this.addStereoFlagModelChange.bind(this, position, flagType, relatedMonomer), this.deleteStereoFlagModelChange.bind(this));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "deleteStereoFlag",
    value: function deleteStereoFlag(stereoFlag) {
      var command = new Command.Command();
      var operation = new index$3.StereoFlagDeleteOperation(stereoFlag, this.deleteStereoFlagModelChange.bind(this), this.addStereoFlagModelChange.bind(this, stereoFlag.position, stereoFlag.flagType, stereoFlag.relatedMonomer));
      command.addOperation(operation);
      return command;
    }
  }, {
    key: "getStereoFlagForMonomer",
    value: function getStereoFlagForMonomer(monomer) {
      var _iterator = _createForOfIteratorHelper(this.stereoFlags.values()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var stereoFlag = _step.value;
          if (stereoFlag.relatedMonomer === monomer) {
            return stereoFlag;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return undefined;
    }
  }, {
    key: "replaceMonomer",
    value: function replaceMonomer(oldMonomer, newTemplate) {
      var command = new Command.Command();
      var position = new vec2.Vec2(oldMonomer.position.x, oldMonomer.position.y);
      var originalBonds = replacementHelpers.collectMonomerBonds(oldMonomer);
      var addCommand = this.addMonomer(newTemplate, position);
      command.merge(addCommand);
      var monomerAddOp = addCommand.operations[0];
      var newMonomer = monomerAddOp.monomer;
      var plan = replacementHelpers.computeReestablishableBonds(originalBonds, newMonomer);
      command.merge(this.deleteMonomer(oldMonomer, true ));
      var _iterator2 = _createForOfIteratorHelper(plan.lost),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var record = _step2.value;
          if (record.bond instanceof PolymerBond.PolymerBond || record.bond instanceof HydrogenBond.HydrogenBond) {
            command.merge(this.deletePolymerBond(record.bond));
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var _iterator3 = _createForOfIteratorHelper(plan.reestablishable),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _record = _step3.value;
          if (_record.attachmentPointName === 'hydrogen') {
            continue;
          }
          if (_record.otherAttachmentPointName === null) continue;
          command.merge(this.createPolymerBond(newMonomer, _record.otherEntity, _record.attachmentPointName, _record.otherAttachmentPointName));
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      command.setUndoOperationsByPriority();
      return {
        command: command,
        newMonomer: newMonomer
      };
    }
  }, {
    key: "replacePreset",
    value: function replacePreset(oldSugar, newPresetTemplate, initialSugarPosition, originalComponentsOverride) {
      var command = new Command.Command();
      if (!newPresetTemplate.sugar) {
        KetcherLogger.KetcherLogger.error('New preset template must have a sugar component');
        return {
          command: command
        };
      }
      var originalComponents = originalComponentsOverride && originalComponentsOverride.length > 0 ? originalComponentsOverride : [oldSugar];
      var allOriginalBonds = [];
      var bondToOriginalComponent = new Map();
      var _iterator4 = _createForOfIteratorHelper(originalComponents),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var component = _step4.value;
          var componentBonds = replacementHelpers.collectMonomerBonds(component);
          var _iterator8 = _createForOfIteratorHelper(componentBonds),
            _step8;
          try {
            for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
              var record = _step8.value;
              bondToOriginalComponent.set(record.bond, component);
            }
          } catch (err) {
            _iterator8.e(err);
          } finally {
            _iterator8.f();
          }
          allOriginalBonds.push.apply(allOriginalBonds, _toConsumableArray__default["default"](componentBonds));
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      var externalBonds = allOriginalBonds.filter(function (record) {
        return !originalComponents.includes(record.otherEntity);
      });
      var _iterator5 = _createForOfIteratorHelper(originalComponents),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _component = _step5.value;
          command.merge(this.deleteMonomer(_component, false));
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      var uniqueBonds = new Set(allOriginalBonds.map(function (r) {
        return r.bond;
      }));
      var _iterator6 = _createForOfIteratorHelper(uniqueBonds),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var bond = _step6.value;
          if (bond instanceof PolymerBond.PolymerBond || bond instanceof HydrogenBond.HydrogenBond) {
            command.merge(this.deletePolymerBond(bond));
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      var _this$computePresetPo = this.computePresetPositions(newPresetTemplate, initialSugarPosition),
        sugarPosition = _this$computePresetPo.sugarPosition,
        rnaBasePosition = _this$computePresetPo.rnaBasePosition,
        phosphatePosition = _this$computePresetPo.phosphatePosition;
      var _this$addRnaPreset = this.addRnaPreset({
          sugar: newPresetTemplate.sugar,
          sugarPosition: sugarPosition,
          rnaBase: newPresetTemplate.base,
          rnaBasePosition: rnaBasePosition,
          phosphate: newPresetTemplate.phosphate,
          phosphatePosition: phosphatePosition,
          connections: newPresetTemplate.connections
        }),
        addPresetCommand = _this$addRnaPreset.command,
        newComponents = _this$addRnaPreset.monomers;
      command.merge(addPresetCommand);
      var newSugar = newComponents.find(function (m) {
        return m instanceof Sugar.Sugar;
      });
      var _iterator7 = _createForOfIteratorHelper(externalBonds),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _record2 = _step7.value;
          if (_record2.attachmentPointName === 'hydrogen') {
            continue;
          }
          if (_record2.otherAttachmentPointName === null) continue;
          var newComponent = this.findNewPresetComponentForBond(_record2, originalComponents, newComponents, bondToOriginalComponent);
          if (!newComponent) continue;
          if (!newComponent.isAttachmentPointExistAndFree(_record2.attachmentPointName)) {
            continue;
          }
          command.merge(this.createPolymerBond(newComponent, _record2.otherEntity, _record2.attachmentPointName, _record2.otherAttachmentPointName));
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      command.setUndoOperationsByPriority();
      return {
        command: command,
        newSugar: newSugar !== null && newSugar !== void 0 ? newSugar : newComponents[0]
      };
    }
  }, {
    key: "computePresetPositions",
    value: function computePresetPositions(preset, initialSugarPosition) {
      var baseOffset = coordinates.Coordinates.canvasToModel(new vec2.Vec2(0, layout.SnakeLayoutCellWidth));
      var isLeftPhosphate = preset.phosphate && rnaPresetConnections.getRnaPresetPhosphatePosition(preset) === 'left';
      var phosphateOffset = coordinates.Coordinates.canvasToModel(new vec2.Vec2(layout.SnakeLayoutCellWidth, 0));
      var sugarPosition = isLeftPhosphate ? initialSugarPosition.sub(phosphateOffset) : initialSugarPosition;
      return {
        sugarPosition: sugarPosition,
        rnaBasePosition: preset.base ? sugarPosition.add(baseOffset) : undefined,
        phosphatePosition: preset.phosphate ? sugarPosition.add(phosphateOffset) : undefined
      };
    }
  }, {
    key: "findNewPresetComponentForBond",
    value: function findNewPresetComponentForBond(record, originalComponents, newComponents, bondToOriginalComponent) {
      var _bondToOriginalCompon;
      var originalComponent = (_bondToOriginalCompon = bondToOriginalComponent.get(record.bond)) !== null && _bondToOriginalCompon !== void 0 ? _bondToOriginalCompon : originalComponents.find(function (c) {
        var bonds = replacementHelpers.collectMonomerBonds(c);
        return bonds.some(function (b) {
          return b.bond === record.bond;
        });
      });
      if (!originalComponent) return undefined;
      if (monomers$2.isSugarOrAmbiguousSugar(originalComponent)) {
        return newComponents.find(monomers$2.isSugarOrAmbiguousSugar);
      }
      if (monomers$2.isRnaBaseOrAmbiguousRnaBase(originalComponent)) {
        return newComponents.find(monomers$2.isRnaBaseOrAmbiguousRnaBase);
      }
      if (monomers$2.isPhosphateOrAmbiguousPhosphate(originalComponent)) {
        return newComponents.find(monomers$2.isPhosphateOrAmbiguousPhosphate);
      }
      var newSugar = newComponents.find(monomers$2.isSugarOrAmbiguousSugar);
      if (newSugar !== null && newSugar !== void 0 && newSugar.isAttachmentPointExistAndFree(record.attachmentPointName)) {
        return newSugar;
      }
      var newPhosphate = newComponents.find(monomers$2.isPhosphateOrAmbiguousPhosphate);
      if (newPhosphate !== null && newPhosphate !== void 0 && newPhosphate.isAttachmentPointExistAndFree(record.attachmentPointName)) {
        return newPhosphate;
      }
      var newBase = newComponents.find(monomers$2.isRnaBaseOrAmbiguousRnaBase);
      if (newBase !== null && newBase !== void 0 && newBase.isAttachmentPointExistAndFree(record.attachmentPointName)) {
        return newBase;
      }
      return undefined;
    }
  }], [{
    key: "normalizeInitiallySelected",
    value: function normalizeInitiallySelected(initiallySelected) {
      return typeof initiallySelected === 'boolean' ? initiallySelected : undefined;
    }
  }, {
    key: "antisenseChainBasesMap",
    value: function antisenseChainBasesMap(isDnaAntisense) {
      var _antisenseMap;
      var antisenseMap = (_antisenseMap = {}, _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_antisenseMap, monomers.RnaDnaNaturalAnaloguesEnum.ADENINE, monomers.RnaDnaNaturalAnaloguesEnum.URACIL), monomers.RnaDnaNaturalAnaloguesEnum.CYTOSINE, monomers.RnaDnaNaturalAnaloguesEnum.GUANINE), monomers.RnaDnaNaturalAnaloguesEnum.GUANINE, monomers.RnaDnaNaturalAnaloguesEnum.CYTOSINE), monomers.RnaDnaNaturalAnaloguesEnum.THYMINE, monomers.RnaDnaNaturalAnaloguesEnum.ADENINE), monomers.RnaDnaNaturalAnaloguesEnum.URACIL, monomers.RnaDnaNaturalAnaloguesEnum.ADENINE), monomers.StandardAmbiguousRnaBase.N, monomers.StandardAmbiguousRnaBase.N), monomers.StandardAmbiguousRnaBase.B, monomers.StandardAmbiguousRnaBase.V), monomers.StandardAmbiguousRnaBase.D, monomers.StandardAmbiguousRnaBase.H), monomers.StandardAmbiguousRnaBase.H, monomers.StandardAmbiguousRnaBase.D), monomers.StandardAmbiguousRnaBase.K, monomers.StandardAmbiguousRnaBase.M), _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_antisenseMap, monomers.StandardAmbiguousRnaBase.W, monomers.StandardAmbiguousRnaBase.W), monomers.StandardAmbiguousRnaBase.Y, monomers.StandardAmbiguousRnaBase.R), monomers.StandardAmbiguousRnaBase.M, monomers.StandardAmbiguousRnaBase.K), monomers.StandardAmbiguousRnaBase.R, monomers.StandardAmbiguousRnaBase.Y), monomers.StandardAmbiguousRnaBase.S, monomers.StandardAmbiguousRnaBase.S), monomers.StandardAmbiguousRnaBase.V, monomers.StandardAmbiguousRnaBase.B));
      if (isDnaAntisense) {
        antisenseMap[monomers.RnaDnaNaturalAnaloguesEnum.ADENINE] = monomers.RnaDnaNaturalAnaloguesEnum.THYMINE;
      }
      return antisenseMap;
    }
  }, {
    key: "getAntisenseBaseLabel",
    value: function getAntisenseBaseLabel(rnaBaseMonomerOrLabel, isDnaAntisense) {
      var baseLabelKey;
      if (typeof rnaBaseMonomerOrLabel === 'string') {
        baseLabelKey = rnaBaseMonomerOrLabel;
      } else if (rnaBaseMonomerOrLabel instanceof AmbiguousMonomer.AmbiguousMonomer) {
        baseLabelKey = rnaBaseMonomerOrLabel.monomerItem.label;
      } else {
        baseLabelKey = rnaBaseMonomerOrLabel.monomerItem.props.MonomerNaturalAnalogCode;
      }
      return DrawingEntitiesManager.antisenseChainBasesMap(isDnaAntisense)[baseLabelKey];
    }
  }, {
    key: "getAntisenseBaseLabelForNode",
    value: function getAntisenseBaseLabelForNode(node, isDnaAntisense) {
      if (node instanceof Nucleotide.Nucleotide || node instanceof Nucleoside.Nucleoside) {
        return DrawingEntitiesManager.getAntisenseBaseLabel(node.rnaBase, isDnaAntisense);
      }
      if (isUnsplitNucleotideNode(node)) {
        var naturalAnalogCode = node.monomer.monomerItem.props.MonomerNaturalAnalogCode;
        return SENSE_NATURAL_ANALOGUES.includes(naturalAnalogCode) ? DrawingEntitiesManager.getAntisenseBaseLabel(naturalAnalogCode, isDnaAntisense) : undefined;
      }
      return undefined;
    }
  }, {
    key: "createAntisenseNode",
    value: function createAntisenseNode(node, isDnaAntisense) {
      var antisenseBaseLabel = DrawingEntitiesManager.getAntisenseBaseLabelForNode(node, isDnaAntisense);
      if (!antisenseBaseLabel) {
        return;
      }
      var sugarName = isDnaAntisense ? monomers.RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA : monomers.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
      return Nucleoside.Nucleoside.createOnCanvas(antisenseBaseLabel, node.monomer.position.add(new vec2.Vec2(0, 3)), sugarName);
    }
  }]);
  return DrawingEntitiesManager;
}();

exports.DrawingEntitiesManager = DrawingEntitiesManager;
exports.MONOMER_START_X_POSITION = MONOMER_START_X_POSITION;
exports.MONOMER_START_Y_POSITION = MONOMER_START_Y_POSITION;
exports.SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS = SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS;
//# sourceMappingURL=DrawingEntitiesManager.js.map
