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

var _typeof = require('@babel/runtime/helpers/typeof');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var constants$1 = require('./constants.js');
var constants = require('./shared/constants.js');
var editor_types = require('./editor.types.js');
var editorEvents = require('./editorEvents.js');
var MacromoleculesConverter = require('./MacromoleculesConverter.js');
var index$3 = require('./modes/types/index.js');
var modesRegistry = require('./modes/modesRegistry.js');
var index$1 = require('./tools/index.js');
var Bond = require('./tools/Bond.js');
var Tool = require('./tools/Tool.js');
var ket = require('../formatters/types/ket.js');
var FlexModePolymerBondRenderer = require('../render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer.js');
var SnakeModePolymerBondRenderer = require('../render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer.js');
var utils = require('../render/renderers/utils.js');
var BaseSequenceItemRenderer = require('../render/renderers/sequence/BaseSequenceItemRenderer.js');
var SequenceRenderer = require('../render/renderers/sequence/SequenceRenderer.js');
var ketcherProvider = require('../ketcherProvider.js');
require('../../domain/entities/atom.js');
require('../../domain/entities/atomList.js');
require('../../domain/entities/bond.js');
require('../../domain/entities/fixedPrecision.js');
require('../../domain/entities/fragment.js');
require('../../domain/entities/functionalGroup.js');
require('../../domain/entities/halfBond.js');
require('../../domain/entities/loop.js');
require('../../domain/entities/rgroup.js');
require('../../domain/entities/rgroupAttachmentPoint.js');
require('../../domain/entities/rxnArrow.js');
require('../../domain/entities/rxnPlus.js');
require('../../domain/entities/sgroup.js');
require('../../domain/entities/sgroupForest.js');
require('../../domain/entities/simpleObject.js');
var struct = require('../../domain/entities/struct.js');
require('../../domain/entities/text.js');
require('../../domain/entities/pile.js');
var vec2 = require('../../domain/entities/vec2.js');
require('../../domain/entities/box2Abs.js');
require('../../domain/entities/pool.js');
require('../../domain/entities/image.js');
require('../../domain/entities/multitailArrow.js');
require('../../domain/entities/highlight.js');
require('../../domain/entities/sGroupAttachmentPoint.js');
require('../../domain/entities/monomerMicromolecule.js');
require('../../domain/entities/Peptide.js');
var BaseMonomer = require('../../domain/entities/BaseMonomer.js');
require('../../domain/entities/Chem.js');
var Sugar = require('../../domain/entities/Sugar.js');
require('../../domain/entities/RNABase.js');
var Phosphate = require('../../domain/entities/Phosphate.js');
require('../../domain/entities/Axis.js');
require('../../domain/entities/Nucleoside.js');
require('../../domain/entities/Nucleotide.js');
var types = require('../../domain/entities/monomer-chains/types.js');
require('../../domain/entities/monomer-chains/Chain.js');
var ChainsCollection = require('../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../domain/entities/MonomerSequenceNode.js');
require('../../domain/entities/EmptySequenceNode.js');
require('../../domain/entities/LinkerSequenceNode.js');
require('../../domain/entities/UnresolvedMonomer.js');
require('../../domain/entities/UnsplitNucleotide.js');
require('../../domain/entities/PolymerBond.js');
require('../../domain/entities/AmbiguousMonomer.js');
require('../../domain/entities/MonomerToAtomBond.js');
var HydrogenBond = require('../../domain/entities/HydrogenBond.js');
require('../../domain/entities/SGroupDrawingEntity.js');
require('../../domain/entities/BackBoneSequenceNode.js');
var Command = require('../../domain/entities/Command.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
var SettingsManager = require('../../utilities/SettingsManager.js');
var keynorm = require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var monomers = require('../../utilities/monomers.js');
var dom = require('../../utilities/dom.js');
require('../../domain/entities/CoreAtom.js');
require('../../domain/entities/CoreStereoFlag.js');
require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
var monomers$3 = require('../../domain/constants/monomers.js');
var layout = require('../../domain/constants/layout.js');
var DrawingEntitiesManager = require('../../domain/entities/DrawingEntitiesManager.js');
var structureBbox = require('../../domain/entities/structureBbox.js');
var monomers$2 = require('../../domain/types/monomers.js');
require('../../domain/types/entities.js');
var index$2 = require('../../node_modules/subscription/index.js');
var monomers$4 = require('./data/monomers.js');
var EditorHistory = require('./EditorHistory.js');
var coordinates = require('./shared/coordinates.js');
var Zoom = require('./tools/Zoom.js');
var ViewModel = require('../render/view-model/ViewModel.js');
var Hand = require('./tools/Hand.js');
require('../render/renderStruct.js');
require('../render/raphaelRender.js');
require('../render/restruct/reobject.js');
require('../render/restruct/reatom.js');
require('../render/restruct/rebond.js');
require('../render/restruct/reenhancedFlag.js');
require('../render/restruct/refrag.js');
require('../render/restruct/rergroup.js');
require('../render/restruct/rerxnarrow.js');
require('../render/restruct/rerxnplus.js');
require('../render/restruct/resgroup.js');
require('../render/restruct/resimpleObject.js');
require('../render/restruct/restruct.js');
require('../render/restruct/retext.js');
require('../render/restruct/visel.js');
require('../render/restruct/generalEnumTypes.js');
require('../render/restruct/showHydrogenLabels.js');
require('../render/restruct/rergroupAttachmentPoint.js');
require('../render/restruct/reImage.js');
require('../render/restruct/remultitailArrow.js');
require('../render/renderers/BaseRenderer.js');
var BaseMonomerRenderer = require('../render/renderers/BaseMonomerRenderer.js');
require('../render/renderers/AtomRenderer.js');
require('../render/renderers/ChemRenderer.js');
require('../render/renderers/PeptideRenderer.js');
require('../render/renderers/PhosphateRenderer.js');
require('../render/renderers/SugarRenderer.js');
require('../render/renderers/RNABaseRenderer.js');
require('../render/renderers/UnresolvedMonomerRenderer.js');
require('../render/renderers/UnsplitNucleotideRenderer.js');
require('../render/renderers/AmbiguousMonomerRenderer.js');
require('../render/renderers/SGroupRenderer.js');
require('../render/renderers/RenderersManager.js');
require('../render/renderers/StereoFlagRenderer.js');
require('../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../render/renderers/sequence/BaseSequenceRenderer.js');
require('../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
require('../../domain/helpers/attachmentPointCalculations.js');
require('../render/scrollbar/scrollbar-container.js');
require('../render/notifyRenderComplete.js');
var _ = require('lodash');
require('../render/renderers/constants.js');
require('../render/render.types.js');
var helpers = require('./helpers.js');
var TransientDrawingView = require('../render/renderers/TransientView/TransientDrawingView.js');
var index = require('./operations/polymerBond/index.js');
require('./operations/atom/index.js');
require('./operations/bond/index.js');
require('./operations/CanvasLoad.js');
require('./operations/descriptors.js');
require('./operations/EnhancedFlagMove.js');
require('./operations/EnhancedFlagClear.js');
require('./operations/ifThen.js');
require('./operations/fragment.js');
require('./operations/fragmentStereoAtom.js');
require('./operations/FragmentStereoFlag.js');
require('./operations/calcimplicitH.js');
require('./operations/LoopMove.js');
require('./operations/OperationType.js');
require('./operations/image/imageMove.js');
require('./operations/image/imageResize.js');
require('./operations/image/imageUpsertDelete.js');
require('./operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('./operations/multitailArrow/multitailArrowMove.js');
require('./operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('./operations/multitailArrow/multitailArrowResizeTailHead.js');
require('./operations/multitailArrow/multitailArrowUpsertDelete.js');
require('./operations/rgroup/RGroupAttr.js');
require('./operations/rgroup/RGroupFragment.js');
require('./operations/rgroupAttachmentPoint/index.js');
require('./operations/rxn/index.js');
require('./operations/simpleObject.js');
require('./operations/sgroup/index.js');
require('./operations/Text/TextCreateDelete.js');
require('./operations/Text/TextUpdate.js');
require('./operations/Text/TextMove.js');
require('./operations/monomer/AttachmentPointHoverOperation.js');
require('./operations/monomer/FlipMonomerOperation.js');
require('./operations/monomer/MonomerAddOperation.js');
require('./operations/monomer/MonomerDeleteOperation.js');
var monomerFactory = require('../render/renderers/monomerFactory.js');
require('./operations/monomer/MonomerHoverOperation.js');
require('./operations/monomer/MonomerItemModifyOperation.js');
require('./operations/monomer/MonomerMoveOperation.js');
require('./operations/monomer/RotateMonomerOperation.js');
require('./operations/monomer/ShiftMonomerOperation.js');
var index$4 = require('./operations/modes/index.js');
require('./operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('./operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('./operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('./operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('./operations/monomerCreation/ReassignLeavingAtomOperation.js');
var monomers$1 = require('../../domain/helpers/monomers.js');
var LineLengthChangeOperation = require('./operations/editor/LineLengthChangeOperation.js');
var editorSingleton = require('./editorSingleton.js');
var editorSettings = require('./editorSettings.js');
var SelectBase = require('./tools/select/SelectBase.js');
var ketSerializer = require('../../domain/serializers/ket/ketSerializer.js');
var helpers$1 = require('../../domain/serializers/ket/helpers.js');
require('../../domain/serializers/mol/molSerializer.js');
require('../../domain/serializers/sdf/sdfSerializer.js');
var LibraryItemDragDropHandler = require('./libraryItemDragDrop/LibraryItemDragDropHandler.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultLegacy(_wrapNativeSuper);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SCROLL_SMOOTHNESS_IM_MS = 300;
var turnOnScrollAnimation = function turnOnScrollAnimation(canvas) {
  canvas.style('transition', "transform ".concat(SCROLL_SMOOTHNESS_IM_MS, "ms ease"));
};
var MonomerLibraryUpdateError = function (_Error) {
  _inherits__default["default"](MonomerLibraryUpdateError, _Error);
  function MonomerLibraryUpdateError(skippedItems, partialSuccess) {
    var _this;
    _classCallCheck__default["default"](this, MonomerLibraryUpdateError);
    _this = _callSuper(this, MonomerLibraryUpdateError, [skippedItems.map(function (_ref) {
      var name = _ref.name,
        reason = _ref.reason;
      return "".concat(name, ": ").concat(reason);
    }).join('\n')]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "partialSuccess", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "skippedItems", void 0);
    _this.name = 'MonomerLibraryUpdateError';
    _this.skippedItems = _toConsumableArray__default["default"](skippedItems);
    _this.partialSuccess = partialSuccess;
    return _this;
  }
  return _createClass__default["default"](MonomerLibraryUpdateError);
}(_wrapNativeSuper__default["default"](Error));
var MonomerLibraryConvertError = function (_Error2) {
  _inherits__default["default"](MonomerLibraryConvertError, _Error2);
  function MonomerLibraryConvertError(message, cause) {
    var _this2;
    _classCallCheck__default["default"](this, MonomerLibraryConvertError);
    _this2 = _callSuper(this, MonomerLibraryConvertError, [message, {
      cause: cause
    }]);
    _this2.name = 'MonomerLibraryConvertError';
    return _this2;
  }
  return _createClass__default["default"](MonomerLibraryConvertError);
}(_wrapNativeSuper__default["default"](Error));
var debouncedTurnOffScrollAnimation = _.debounce(function (canvas) {
  canvas.style('transition', 'none');
}, SCROLL_SMOOTHNESS_IM_MS);
var NATURAL_AMINO_ACID_MODIFICATION_TYPE = 'Natural amino acid';
var hasBilnAliasUniquenessScope = function hasBilnAliasUniquenessScope(monomerClass) {
  return monomerClass === monomers$3.KetMonomerClass.AminoAcid || monomerClass === monomers$3.KetMonomerClass.CHEM;
};
var persistentMonomersLibrary = [];
var persistentMonomersLibraryParsedJson = null;
var CoreEditor = function () {
  function CoreEditor(_ref2) {
    var _this3 = this,
      _this$canvas;
    var ketcherId = _ref2.ketcherId,
      theme = _ref2.theme,
      canvas = _ref2.canvas,
      renderersContainer = _ref2.renderersContainer,
      mode = _ref2.mode;
    _classCallCheck__default["default"](this, CoreEditor);
    _defineProperty__default["default"](this, "events", void 0);
    _defineProperty__default["default"](this, "ketcherId", void 0);
    _defineProperty__default["default"](this, "_type", void 0);
    _defineProperty__default["default"](this, "renderersContainer", void 0);
    _defineProperty__default["default"](this, "transientDrawingView", void 0);
    _defineProperty__default["default"](this, "drawingEntitiesManager", void 0);
    _defineProperty__default["default"](this, "viewModel", void 0);
    _defineProperty__default["default"](this, "lastCursorPosition", new vec2.Vec2(0, 0));
    _defineProperty__default["default"](this, "lastCursorPositionOfCanvas", new vec2.Vec2(0, 0));
    _defineProperty__default["default"](this, "_monomersLibraryParsedJson", null);
    _defineProperty__default["default"](this, "_monomersLibrary", []);
    _defineProperty__default["default"](this, "canvas", void 0);
    _defineProperty__default["default"](this, "ketcherRootElement", void 0);
    _defineProperty__default["default"](this, "drawnStructuresWrapperElement", void 0);
    _defineProperty__default["default"](this, "canvasOffset", {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    });
    _defineProperty__default["default"](this, "ketcherRootElementBoundingClientRect", void 0);
    _defineProperty__default["default"](this, "nextAutochainPosition", undefined);
    _defineProperty__default["default"](this, "libraryItemDragCancelled", false);
    _defineProperty__default["default"](this, "theme", void 0);
    _defineProperty__default["default"](this, "dragDropHandler", void 0);
    _defineProperty__default["default"](this, "zoomTool", void 0);
    _defineProperty__default["default"](this, "tool", void 0);
    _defineProperty__default["default"](this, "mode", void 0);
    _defineProperty__default["default"](this, "previousModes", []);
    _defineProperty__default["default"](this, "sequenceTypeEnterMode", types.SequenceType.RNA);
    _defineProperty__default["default"](this, "micromoleculesEditor", void 0);
    _defineProperty__default["default"](this, "hotKeyEventHandler", function () {});
    _defineProperty__default["default"](this, "copyEventHandler", function () {});
    _defineProperty__default["default"](this, "pasteEventHandler", function () {});
    _defineProperty__default["default"](this, "cutEventHandler", function () {});
    _defineProperty__default["default"](this, "keydownEventHandler", function () {});
    _defineProperty__default["default"](this, "contextMenuEventHandler", function () {});
    _defineProperty__default["default"](this, "cleanupsForDomEvents", []);
    _defineProperty__default["default"](this, "handleVisibilityChange", function () {
      if (document.hidden) {
        _this3.cancelActiveDrag();
      }
    });
    _defineProperty__default["default"](this, "handleWindowBlur", function () {
      _this3.cancelActiveDrag();
    });
    _defineProperty__default["default"](this, "handleWindowResize", function () {
      _this3.resetCanvasOffset();
      _this3.resetKetcherRootElementOffset();
    });
    var ketcher = ketcherProvider.ketcherProvider.getKetcher(ketcherId);
    this._type = editor_types.EditorType.Micromolecules;
    this.ketcherId = ketcherId;
    this.theme = theme;
    this.canvas = canvas;
    this.ketcherRootElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.closest(constants.KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR);
    this.drawnStructuresWrapperElement = canvas.querySelector(constants$1.drawnStructuresSelector);
    this.mode = mode !== null && mode !== void 0 ? mode : new (modesRegistry.getModeConstructor(index$3.DEFAULT_LAYOUT_MODE))();
    this.events = editorEvents.createEditorEvents();
    ketSerializer.KetSerializer.setMonomerFactory(monomerFactory.monomerFactory);
    this.setMonomersLibrary(monomers$4["default"]);
    this.events.updateMonomersLibrary.dispatch();
    this.subscribeEvents();
    this.renderersContainer = renderersContainer;
    this.drawingEntitiesManager = new DrawingEntitiesManager.DrawingEntitiesManager();
    this.viewModel = new ViewModel.ViewModel();
    this.dragDropHandler = new LibraryItemDragDropHandler.LibraryItemDragDropHandler({
      drawingEntitiesManager: this.drawingEntitiesManager,
      renderersContainer: this.renderersContainer,
      events: this.events,
      getCanvasOffset: function getCanvasOffset() {
        return _this3.canvasOffset;
      },
      getKetcherRootRect: function getKetcherRootRect() {
        return _this3.ketcherRootElementBoundingClientRect;
      },
      getModeName: function getModeName() {
        return _this3.mode.modeName;
      },
      getEditor: function getEditor() {
        return _this3;
      },
      getTransientDrawingView: function getTransientDrawingView() {
        return _this3.transientDrawingView;
      },
      placeItemOnCanvas: function placeItemOnCanvas(item, position) {
        return _this3.placeItemOnCanvasForHandler(item, position);
      },
      calculateAndStoreNextAutochainPosition: function calculateAndStoreNextAutochainPosition(lastMonomer) {
        return _this3.calculateAndStoreNextAutochainPosition(lastMonomer);
      }
    });
    this.dragDropHandler.subscribe();
    this.domEventSetup();
    this.setupContextMenuEvents();
    this.setupKeyboardEvents();
    this.setupHotKeysEvents();
    this.setupCopyPasteEvent();
    this.resetCanvasOffset();
    this.resetKetcherRootElementOffset();
    this.zoomTool = Zoom.ZoomTool.initInstance(this.drawingEntitiesManager, this.canvas);
    this.renderersContainer.zoomTool = this.zoomTool;
    this.renderersContainer.editor = this;
    this.transientDrawingView = new TransientDrawingView.TransientDrawingView();
    editorSingleton.setEditorInstance(this);
    this.micromoleculesEditor = ketcher === null || ketcher === void 0 ? void 0 : ketcher.editor;
    this.initializeGlobalEventListeners();
  }
  _createClass__default["default"](CoreEditor, [{
    key: "selectedTool",
    get: function get() {
      return this.tool;
    }
  }, {
    key: "resetCanvasOffset",
    value: function resetCanvasOffset() {
      this.canvasOffset = this.canvas.getBoundingClientRect();
    }
  }, {
    key: "resetKetcherRootElementOffset",
    value: function resetKetcherRootElementOffset() {
      var _this$ketcherRootElem;
      this.ketcherRootElementBoundingClientRect = (_this$ketcherRootElem = this.ketcherRootElement) === null || _this$ketcherRootElem === void 0 ? void 0 : _this$ketcherRootElem.getBoundingClientRect();
    }
  }, {
    key: "initializeGlobalEventListeners",
    value: function initializeGlobalEventListeners() {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('blur', this.handleWindowBlur);
      window.addEventListener('resize', this.handleWindowResize);
    }
  }, {
    key: "cancelActiveDrag",
    value: function cancelActiveDrag() {
      if (this.tool instanceof SelectBase.SelectBase && this.tool.mode !== 'standby') {
        this.tool.stopMovement();
      }
    }
  }, {
    key: "clearSelectionAfterCopy",
    value: function clearSelectionAfterCopy() {
      var hasSelectedEntities = this.drawingEntitiesManager.selectedEntitiesArr.length > 0;
      if (!hasSelectedEntities) {
        return;
      }
      var modelChanges = this.drawingEntitiesManager.unselectAllDrawingEntities();
      this.renderersContainer.update(modelChanges);
    }
  }, {
    key: "clearMonomersLibrary",
    value: function clearMonomersLibrary() {
      this._monomersLibrary = [];
      this._monomersLibraryParsedJson = helpers.getEmptyMonomersLibraryJson();
    }
  }, {
    key: "initializeMonomersLibraryFromKetcher",
    value: function () {
      var _initializeMonomersLibraryFromKetcher = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(monomersLibraryUpdate, monomersLibraryReplace, onError) {
        var monomersLibraryUpdateData, ketcher, monomersLibraryUpdateInKetFormat, errorMessage, errorTitle;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              monomersLibraryUpdateData = monomersLibraryUpdate || monomersLibraryReplace;
              if (monomersLibraryUpdateData) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return");
            case 3:
              _context.prev = 3;
              ketcher = ketcherProvider.ketcherProvider.getKetcher(this.ketcherId);
              if (monomersLibraryReplace) {
                this.clearMonomersLibrary();
              }
              _context.next = 8;
              return ketcher.ensureMonomersLibraryDataInKetFormat(monomersLibraryUpdateData);
            case 8:
              monomersLibraryUpdateInKetFormat = _context.sent;
              this.updateMonomersLibrary(monomersLibraryUpdateInKetFormat);
              _context.next = 19;
              break;
            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](3);
              KetcherLogger.KetcherLogger.error('Editor::initializeMonomersLibraryFromKetcher failed:', _context.t0);
              if (_context.t0 instanceof Error) {
                errorMessage = _context.t0.message;
              } else if (typeof _context.t0 === 'string') {
                errorMessage = _context.t0;
              } else {
                errorMessage = 'Failed to load monomers library';
              }
              errorTitle = _context.t0 instanceof MonomerLibraryConvertError ? 'Monomer library conversion failed' : 'Monomer library update failed';
              this.events.openErrorModal.dispatch({
                errorMessage: errorMessage,
                errorTitle: errorTitle
              });
              onError === null || onError === void 0 || onError(_context.t0);
            case 19:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[3, 12]]);
      }));
      function initializeMonomersLibraryFromKetcher(_x, _x2, _x3) {
        return _initializeMonomersLibraryFromKetcher.apply(this, arguments);
      }
      return initializeMonomersLibraryFromKetcher;
    }()
  }, {
    key: "setMonomersLibrary",
    value: function setMonomersLibrary(monomersDataRaw) {
      var _this4 = this;
      if (persistentMonomersLibrary.length !== 0 && persistentMonomersLibraryParsedJson !== undefined) {
        this._monomersLibrary = persistentMonomersLibrary;
        this._monomersLibraryParsedJson = persistentMonomersLibraryParsedJson;
        return;
      }
      var _parseMonomersLibrary = helpers.parseMonomersLibrary(monomersDataRaw),
        monomersLibraryParsedJson = _parseMonomersLibrary.monomersLibraryParsedJson,
        monomersLibrary = _parseMonomersLibrary.monomersLibrary;
      this._monomersLibrary = monomersLibrary;
      this._monomersLibraryParsedJson = monomersLibraryParsedJson;
      var storedMonomerLibraryUpdates = SettingsManager.SettingsManager.monomerLibraryUpdates;
      storedMonomerLibraryUpdates.forEach(function (update) {
        var parsedUpdate = JSON.parse(update);
        if (parsedUpdate.replacement) {
          _this4.clearMonomersLibrary();
          _this4.updateMonomersLibrary(parsedUpdate.data);
        } else {
          _this4.updateMonomersLibrary(parsedUpdate.data || update);
        }
      });
      persistentMonomersLibrary = this._monomersLibrary;
      persistentMonomersLibraryParsedJson = this._monomersLibraryParsedJson;
    }
  }, {
    key: "updateMonomersLibrary",
    value: function updateMonomersLibrary(monomersDataRaw) {
      var _this5 = this;
      var monomersLibraryParsedJson = this._monomersLibraryParsedJson;
      if (!monomersLibraryParsedJson) {
        throw new Error('Editor::updateMonomersLibrary: monomers library parsed JSON is not initialized');
      }
      var _parseMonomersLibrary2 = helpers.parseMonomersLibrary(monomersDataRaw),
        newMonomersLibraryChunkParsedJson = _parseMonomersLibrary2.monomersLibraryParsedJson,
        newMonomersLibraryChunk = _parseMonomersLibrary2.monomersLibrary;
      var skippedItems = [];
      var reportValidationError = function reportValidationError(name, reason) {
        KetcherLogger.KetcherLogger.error('Editor::updateMonomersLibrary', reason);
        skippedItems.push({
          name: name,
          reason: reason
        });
      };
      var didCommitAnyItem = false;
      var areSameMonomers = function areSameMonomers(firstMonomer, secondMonomer) {
        if (!(firstMonomer !== null && firstMonomer !== void 0 && firstMonomer.props) || !(secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.props)) {
          return false;
        }
        return firstMonomer.props.MonomerName === secondMonomer.props.MonomerName && firstMonomer.props.MonomerClass === secondMonomer.props.MonomerClass && firstMonomer.props.hidden === secondMonomer.props.hidden;
      };
      var getIdtAliasesList = function getIdtAliasesList(idtAliases) {
        var base = idtAliases === null || idtAliases === void 0 ? void 0 : idtAliases.base;
        var mods = idtAliases === null || idtAliases === void 0 ? void 0 : idtAliases.modifications;
        return [base, mods === null || mods === void 0 ? void 0 : mods.internal, mods === null || mods === void 0 ? void 0 : mods.endpoint3, mods === null || mods === void 0 ? void 0 : mods.endpoint5].filter(function (v) {
          return typeof v === 'string' && v.length > 0;
        });
      };
      var getIdtModificationAliases = function getIdtModificationAliases(monomer) {
        var _monomer$props;
        return getIdtAliasesList(monomer === null || monomer === void 0 || (_monomer$props = monomer.props) === null || _monomer$props === void 0 ? void 0 : _monomer$props.idtAliases);
      };
      var formatIdtAliasDetails = function formatIdtAliasDetails(idtAliases) {
        var _idtAliases$modificat, _idtAliases$modificat2, _idtAliases$modificat3;
        return [idtAliases !== null && idtAliases !== void 0 && idtAliases.base ? "IDT base alias \"".concat(idtAliases.base, "\"") : null, idtAliases !== null && idtAliases !== void 0 && (_idtAliases$modificat = idtAliases.modifications) !== null && _idtAliases$modificat !== void 0 && _idtAliases$modificat.endpoint3 ? "IDT 3' alias \"".concat(idtAliases.modifications.endpoint3, "\"") : null, idtAliases !== null && idtAliases !== void 0 && (_idtAliases$modificat2 = idtAliases.modifications) !== null && _idtAliases$modificat2 !== void 0 && _idtAliases$modificat2.endpoint5 ? "IDT 5' alias \"".concat(idtAliases.modifications.endpoint5, "\"") : null, idtAliases !== null && idtAliases !== void 0 && (_idtAliases$modificat3 = idtAliases.modifications) !== null && _idtAliases$modificat3 !== void 0 && _idtAliases$modificat3.internal ? "IDT internal alias \"".concat(idtAliases.modifications.internal, "\"") : null].filter(function (value) {
          return Boolean(value);
        });
      };
      var formatAliasDetails = function formatAliasDetails(monomer) {
        var _monomer$props2, _monomer$props3, _monomer$props4;
        return [(_monomer$props2 = monomer.props) !== null && _monomer$props2 !== void 0 && _monomer$props2.aliasHELM ? "HELM alias \"".concat(monomer.props.aliasHELM, "\"") : null, (_monomer$props3 = monomer.props) !== null && _monomer$props3 !== void 0 && _monomer$props3.aliasBILN ? "BILN alias \"".concat(monomer.props.aliasBILN, "\"") : null].concat(_toConsumableArray__default["default"](formatIdtAliasDetails((_monomer$props4 = monomer.props) === null || _monomer$props4 === void 0 ? void 0 : _monomer$props4.idtAliases))).filter(function (value) {
          return Boolean(value);
        }).join(', ');
      };
      var getCollisionErrorMessage = function getCollisionErrorMessage(incoming, conflicting, aliasDetails) {
        var _incoming$props, _conflicting$props, _incoming$props2, _incoming$props3, _conflicting$props2, _incoming$props4;
        var detail = aliasDetails ? " (".concat(aliasDetails, ")") : '';
        var isHelmCollision = Boolean((_incoming$props = incoming.props) === null || _incoming$props === void 0 ? void 0 : _incoming$props.aliasHELM) && ((_conflicting$props = conflicting.props) === null || _conflicting$props === void 0 ? void 0 : _conflicting$props.aliasHELM) === ((_incoming$props2 = incoming.props) === null || _incoming$props2 === void 0 ? void 0 : _incoming$props2.aliasHELM);
        var isBilnCollision = Boolean((_incoming$props3 = incoming.props) === null || _incoming$props3 === void 0 ? void 0 : _incoming$props3.aliasBILN) && ((_conflicting$props2 = conflicting.props) === null || _conflicting$props2 === void 0 ? void 0 : _conflicting$props2.aliasBILN) === ((_incoming$props4 = incoming.props) === null || _incoming$props4 === void 0 ? void 0 : _incoming$props4.aliasBILN);
        if (isHelmCollision || isBilnCollision) {
          return "Alias collision detected".concat(detail, ".");
        }
        return "Duplicate IDT aliases detected".concat(detail, ". IDT aliases for 5', 3', internal and base positions must be unique.");
      };
      newMonomersLibraryChunk.forEach(function (newMonomer) {
        var _newMonomer$props, _newMonomer$props2, _newMonomer$props3, _newMonomer$props4, _newMonomer$props5, _newMonomer$props0, _newMonomer$props1;
        var disallowedModificationTypes = monomers.getDisallowedModificationTypes((_newMonomer$props = newMonomer.props) === null || _newMonomer$props === void 0 ? void 0 : _newMonomer$props.modificationTypes);
        if (disallowedModificationTypes.length > 0) {
          var errorMessage = "Editor::updateMonomersLibrary: Load of \"".concat(newMonomer.props.MonomerName, "\" monomer has failed. ").concat(monomers.DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE, " Offending modification type(s): ").concat(disallowedModificationTypes.join(', '), ". The monomer was not added to the library.");
          KetcherLogger.KetcherLogger.error(errorMessage);
          return;
        }
        var newMonomerHasBilnAliasUniquenessScope = hasBilnAliasUniquenessScope((_newMonomer$props2 = newMonomer.props) === null || _newMonomer$props2 === void 0 ? void 0 : _newMonomer$props2.MonomerClass);
        if ((_newMonomer$props3 = newMonomer.props) !== null && _newMonomer$props3 !== void 0 && _newMonomer$props3.aliasHELM && !monomers.isValidHelmAlias(newMonomer.props.aliasHELM)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(monomers.HELM_ALIAS_FORMAT_ERROR_MESSAGE));
          return;
        }
        if ((_newMonomer$props4 = newMonomer.props) !== null && _newMonomer$props4 !== void 0 && _newMonomer$props4.aliasBILN && !monomers.isValidBilnAlias(newMonomer.props.aliasBILN)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(monomers.BILN_ALIAS_FORMAT_ERROR_MESSAGE));
          return;
        }
        if ((_newMonomer$props5 = newMonomer.props) !== null && _newMonomer$props5 !== void 0 && _newMonomer$props5.aliasHELM && !monomers.isValidHelmAliasLength(newMonomer.props.aliasHELM)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(monomers.HELM_ALIAS_LENGTH_ERROR_MESSAGE));
          return;
        }
        var newMonomerModificationAliases = getIdtModificationAliases(newMonomer);
        var conflictingMonomer = _this5._monomersLibrary.find(function (monomer) {
          var _newMonomer$props6, _monomer$props5, _newMonomer$props7, _newMonomer$props8, _monomer$props6, _monomer$props7, _newMonomer$props9;
          if (areSameMonomers(monomer, newMonomer)) {
            return false;
          }
          var existingMonomerModificationAliases = getIdtModificationAliases(monomer);
          return Boolean((_newMonomer$props6 = newMonomer.props) === null || _newMonomer$props6 === void 0 ? void 0 : _newMonomer$props6.aliasHELM) && ((_monomer$props5 = monomer.props) === null || _monomer$props5 === void 0 ? void 0 : _monomer$props5.aliasHELM) === ((_newMonomer$props7 = newMonomer.props) === null || _newMonomer$props7 === void 0 ? void 0 : _newMonomer$props7.aliasHELM) || newMonomerHasBilnAliasUniquenessScope && Boolean((_newMonomer$props8 = newMonomer.props) === null || _newMonomer$props8 === void 0 ? void 0 : _newMonomer$props8.aliasBILN) && hasBilnAliasUniquenessScope((_monomer$props6 = monomer.props) === null || _monomer$props6 === void 0 ? void 0 : _monomer$props6.MonomerClass) && ((_monomer$props7 = monomer.props) === null || _monomer$props7 === void 0 ? void 0 : _monomer$props7.aliasBILN) === ((_newMonomer$props9 = newMonomer.props) === null || _newMonomer$props9 === void 0 ? void 0 : _newMonomer$props9.aliasBILN) || newMonomerModificationAliases.some(function (alias) {
            return existingMonomerModificationAliases.includes(alias);
          });
        });
        if (conflictingMonomer) {
          reportValidationError(newMonomer.props.MonomerName, getCollisionErrorMessage(newMonomer, conflictingMonomer, formatAliasDetails(newMonomer)));
          return;
        }
        if ((_newMonomer$props0 = newMonomer.props) !== null && _newMonomer$props0 !== void 0 && _newMonomer$props0.idtAliases && !newMonomer.props.idtAliases.base) {
          reportValidationError(newMonomer.props.MonomerName, "Base IDT alias is required when idtAliases is defined.");
          return;
        }
        if ((_newMonomer$props1 = newMonomer.props) !== null && _newMonomer$props1 !== void 0 && _newMonomer$props1.idtAliases) {
          var _newMonomer$props$idt = newMonomer.props.idtAliases,
            base = _newMonomer$props$idt.base,
            modifications = _newMonomer$props$idt.modifications;
          var aliasesToValidate = [base, modifications === null || modifications === void 0 ? void 0 : modifications.endpoint3, modifications === null || modifications === void 0 ? void 0 : modifications.endpoint5, modifications === null || modifications === void 0 ? void 0 : modifications.internal].filter(Boolean);
          var hasInvalidSlash = aliasesToValidate.some(function (alias) {
            return !monomers.isValidIdtAlias(alias);
          });
          if (hasInvalidSlash) {
            reportValidationError(newMonomer.props.MonomerName, "".concat(monomers.IDT_ALIAS_SLASH_ERROR_MESSAGE, " The monomer was not added to the library."));
            return;
          }
          var tooLongEntries = monomers.getTooLongIdtAliasEntries(newMonomer.props.idtAliases);
          if (tooLongEntries.length > 0) {
            var offenders = tooLongEntries.map(function (_ref3) {
              var field = _ref3.alias,
                value = _ref3.value;
              return "".concat(field, "=\"").concat(value, "\"");
            }).join(', ');
            reportValidationError(newMonomer.props.MonomerName, "".concat(monomers.IDT_ALIAS_LENGTH_ERROR_MESSAGE, " Offending field(s): ").concat(offenders, "."));
            return;
          }
        }
        var existingMonomerIndex = _this5._monomersLibrary.findIndex(function (monomer) {
          return areSameMonomers(monomer, newMonomer);
        });
        var newMonomerTemplateRef = helpers$1.getMonomerTemplateRefFromMonomerItem(newMonomer);
        if (existingMonomerIndex !== -1) {
          var existingMonomerTemplateRef = helpers$1.getMonomerTemplateRefFromMonomerItem(_this5._monomersLibrary[existingMonomerIndex]);
          var existingMonomerRefIndex = monomersLibraryParsedJson.root.templates.findIndex(function (template) {
            return template.$ref === existingMonomerTemplateRef;
          });
          if (existingMonomerRefIndex !== -1) {
            var existingMonomer = _this5._monomersLibrary[existingMonomerIndex];
            var id = existingMonomer.props.id;
            var existingMonomerId = id !== null && id !== void 0 ? id : monomers$1.getMonomerUniqueKey(existingMonomer);
            _this5._monomersLibrary[existingMonomerIndex] = newMonomer;
            _this5._monomersLibrary[existingMonomerIndex].props.id = existingMonomerId;
            didCommitAnyItem = true;
            monomersLibraryParsedJson[existingMonomerTemplateRef] = newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
          } else {
            KetcherLogger.KetcherLogger.error('Editor::updateMonomersLibrary: A ref is missing for a monomer in library', existingMonomerTemplateRef);
          }
        } else {
          _this5._monomersLibrary.push(newMonomer);
          didCommitAnyItem = true;
          monomersLibraryParsedJson.root.templates.push(helpers$1.getKetRef(newMonomerTemplateRef));
          monomersLibraryParsedJson[newMonomerTemplateRef] = newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
        }
      });
      newMonomersLibraryChunkParsedJson.root.templates.forEach(function (templateRef) {
        var templateDefinition = newMonomersLibraryChunkParsedJson[templateRef.$ref];
        if (templateDefinition.type !== ket.KetTemplateType.MONOMER_GROUP_TEMPLATE) {
          return;
        }
        if (templateDefinition["class"] !== ket.KetMonomerGroupTemplateClass.RNA) {
          reportValidationError(templateRef.$ref, "Monomer group template class must be \"".concat(ket.KetMonomerGroupTemplateClass.RNA, "\". The template was not added to the library."));
          return;
        }
        var monomerNameValidationResult = helpers.validateMonomerName(templateDefinition.name);
        if (!monomerNameValidationResult.isValid) {
          switch (monomerNameValidationResult.error) {
            case helpers.MonomerNameValidationErrorType.Empty:
              reportValidationError(templateRef.$ref, "Monomer group template name cannot be empty or whitespace. The template was not added to the library.");
              return;
            case helpers.MonomerNameValidationErrorType.TooLong:
              {
                var truncatedTemplateName = "".concat(templateDefinition.name.slice(0, monomers.MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH), "...");
                KetcherLogger.KetcherLogger.error("Editor::updateMonomersLibrary: Load of monomer group template \"".concat(truncatedTemplateName, "\" (length: ").concat(templateDefinition.name.length, ", template: ").concat(templateRef.$ref, ") has failed. ").concat(monomers.MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE, " The template was not added to the library."));
                return;
              }
            case helpers.MonomerNameValidationErrorType.InvalidCharacters:
              KetcherLogger.KetcherLogger.error("Editor::updateMonomersLibrary: Load of monomer group template \"".concat(templateDefinition.name, "\" (template: ").concat(templateRef.$ref, ") has failed. Monomer group template name must consist only of letters, numbers, hyphens, underscores and asterisks. The template was not added to the library."));
              return;
          }
        }
        var newTemplateIdtAliases = getIdtAliasesList(templateDefinition.idtAliases);
        if (newTemplateIdtAliases.length > 0) {
          var conflictingMonomer = _this5._monomersLibrary.find(function (monomer) {
            return getIdtModificationAliases(monomer).some(function (alias) {
              return newTemplateIdtAliases.includes(alias);
            });
          });
          var conflictingTemplateRef = monomersLibraryParsedJson.root.templates.find(function (existingTemplateRef) {
            if (existingTemplateRef.$ref === templateRef.$ref) {
              return false;
            }
            var existingTemplate = monomersLibraryParsedJson[existingTemplateRef.$ref];
            if ((existingTemplate === null || existingTemplate === void 0 ? void 0 : existingTemplate.type) !== ket.KetTemplateType.MONOMER_GROUP_TEMPLATE) {
              return false;
            }
            return getIdtAliasesList(existingTemplate.idtAliases).some(function (alias) {
              return newTemplateIdtAliases.includes(alias);
            });
          });
          if (conflictingMonomer || conflictingTemplateRef) {
            var detail = formatIdtAliasDetails(templateDefinition.idtAliases).join(', ');
            reportValidationError(templateDefinition.name, "Duplicate IDT aliases detected".concat(detail ? " (".concat(detail, ")") : '', ". IDT aliases for 5', 3', internal and base positions must be unique."));
            return;
          }
        }
        monomersLibraryParsedJson[templateRef.$ref] = templateDefinition;
        didCommitAnyItem = true;
        if (!monomersLibraryParsedJson.root.templates.find(function (existingTemplateRef) {
          return existingTemplateRef.$ref === templateRef.$ref;
        })) {
          monomersLibraryParsedJson.root.templates.push(templateRef);
        }
      });
      this.events.updateMonomersLibrary.dispatch();
      if (skippedItems.length > 0) {
        throw new MonomerLibraryUpdateError(skippedItems, didCommitAnyItem);
      }
    }
  }, {
    key: "monomersLibraryParsedJson",
    get: function get() {
      return this._monomersLibraryParsedJson;
    }
  }, {
    key: "monomersLibrary",
    get: function get() {
      return this._monomersLibrary;
    }
  }, {
    key: "checkIfMonomerSymbolClassPairExists",
    value: function checkIfMonomerSymbolClassPairExists(symbol, monomerClass) {
      if (!monomerClass) {
        return true;
      }
      return this._monomersLibrary.some(function (monomerItem) {
        if (monomers$1.isAmbiguousMonomerLibraryItem(monomerItem)) {
          return false;
        }
        var props = monomerItem.props;
        return props.MonomerClass === monomerClass && (props.aliasHELM === symbol || props.MonomerName === symbol);
      });
    }
  }, {
    key: "checkIfBilnAliasExists",
    value: function checkIfBilnAliasExists(alias) {
      return this._monomersLibrary.some(function (monomerItem) {
        if (monomers$1.isAmbiguousMonomerLibraryItem(monomerItem)) {
          return false;
        }
        return hasBilnAliasUniquenessScope(monomerItem.props.MonomerClass) && monomerItem.props.aliasBILN === alias;
      });
    }
  }, {
    key: "checkIfPresetCodeExists",
    value: function checkIfPresetCodeExists(code) {
      var rnaPresets = this.defaultRnaPresetsLibraryItems;
      return rnaPresets.some(function (preset) {
        return preset.name === code;
      });
    }
  }, {
    key: "defaultRnaPresetsLibraryItems",
    get: function get() {
      var monomersLibraryJson = this.monomersLibraryParsedJson;
      if (!monomersLibraryJson) {
        return [];
      }
      return monomersLibraryJson.root.templates.filter(function (templateRef) {
        var template = monomersLibraryJson[templateRef.$ref];
        if (!template) {
          KetcherLogger.KetcherLogger.error("There is a ref for rna preset template ".concat(templateRef.$ref, ", but template definition is not found"));
          return false;
        }
        return template.type === ket.KetTemplateType.MONOMER_GROUP_TEMPLATE && template["class"] === ket.KetMonomerGroupTemplateClass.RNA;
      }).map(function (templateRef) {
        return monomersLibraryJson[templateRef.$ref];
      });
    }
  }, {
    key: "isLibraryItemDragCancelled",
    get: function get() {
      return this.libraryItemDragCancelled;
    },
    set: function set(value) {
      this.libraryItemDragCancelled = value;
    }
  }, {
    key: "cancelLibraryItemDrag",
    value: function cancelLibraryItemDrag() {
      if (this.dragDropHandler.isDragging) {
        this.libraryItemDragCancelled = true;
        this.events.setLibraryItemDragState.dispatch(null);
      }
    }
  }, {
    key: "handleHotKeyEvents",
    value: function handleHotKeyEvents(event) {
      var _keyNorm$lookup, _keySettings$shortcut;
      if (this._type === editor_types.EditorType.Micromolecules) return;
      if (!(event.target instanceof HTMLElement)) return;
      var keySettings = editorEvents.hotkeysConfiguration;
      var hotKeys = keynorm.initHotKeys(keySettings);
      var shortcutKey = (_keyNorm$lookup = keynorm.keyNorm.lookup(hotKeys, event)) === null || _keyNorm$lookup === void 0 ? void 0 : _keyNorm$lookup[0];
      if (shortcutKey && (_keySettings$shortcut = keySettings[shortcutKey]) !== null && _keySettings$shortcut !== void 0 && _keySettings$shortcut.handler && !dom.isEditableInputTarget(event.target)) {
        keySettings[shortcutKey].handler(this);
        event.preventDefault();
      }
    }
  }, {
    key: "setupKeyboardEvents",
    value: function setupKeyboardEvents() {
      var _this6 = this;
      this.keydownEventHandler = function (event) {
        if (_this6._type === editor_types.EditorType.Micromolecules) {
          return;
        }
        var isPropagationStopped = false;
        var originalStopPropagation = event.stopPropagation.bind(event);
        event.stopPropagation = function () {
          isPropagationStopped = true;
          originalStopPropagation();
        };
        _this6.events.keyDown.dispatch(event);
        if (!isPropagationStopped) {
          _this6.mode.onKeyDown(event)["catch"](function (error) {
            KetcherLogger.KetcherLogger.error('Editor.ts::keydownEventHandler', error);
          });
        }
      };
      document.addEventListener('keydown', this.keydownEventHandler);
    }
  }, {
    key: "setupCopyPasteEvent",
    value: function setupCopyPasteEvent() {
      var _this7 = this;
      this.copyEventHandler = function (event) {
        if (_this7._type === editor_types.EditorType.Micromolecules) {
          return;
        }
        _this7.mode.onCopy(event);
        _this7.clearSelectionAfterCopy();
      };
      this.pasteEventHandler = function (event) {
        if (_this7._type === editor_types.EditorType.Micromolecules) {
          return;
        }
        _this7.mode.onPaste(event);
      };
      this.cutEventHandler = function (event) {
        if (_this7._type === editor_types.EditorType.Micromolecules) {
          return;
        }
        _this7.mode.onCut(event);
      };
      document.addEventListener('copy', this.copyEventHandler);
      document.addEventListener('paste', this.pasteEventHandler);
      document.addEventListener('cut', this.cutEventHandler);
    }
  }, {
    key: "setupHotKeysEvents",
    value: function setupHotKeysEvents() {
      var _this8 = this;
      this.hotKeyEventHandler = function (event) {
        return _this8.handleHotKeyEvents(event);
      };
      document.addEventListener('keydown', this.hotKeyEventHandler);
    }
  }, {
    key: "setupContextMenuEvents",
    value: function setupContextMenuEvents() {
      var _this9 = this;
      this.contextMenuEventHandler = function (event) {
        var _event$target, _event$target2, _eventData$drawingEnt;
        var target = event.target;
        if (!_this9.ketcherRootElement || !target || !_this9.ketcherRootElement.contains(target)) {
          return;
        }
        event.preventDefault();
        if (_this9.dragDropHandler.isDragging) {
          _this9.cancelLibraryItemDrag();
          return;
        }
        if ((_event$target = event.target) !== null && _event$target !== void 0 && _event$target.closest('.contexify')) {
          return;
        }
        var eventData = (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.__data__;
        var canvasBoundingClientRect = _this9.canvas.getBoundingClientRect();
        var isClickOnCanvas = event.clientX >= canvasBoundingClientRect.left && event.clientX <= canvasBoundingClientRect.right && event.clientY >= canvasBoundingClientRect.top && event.clientY <= canvasBoundingClientRect.bottom;
        var sequenceSelections = SequenceRenderer.SequenceRenderer.selections.map(function (selectionRange) {
          return selectionRange.flatMap(function (twoStrandedNodeSelection) {
            var result = [];
            var _twoStrandedNodeSelec = twoStrandedNodeSelection.node,
              senseNode = _twoStrandedNodeSelec.senseNode,
              antisenseNode = _twoStrandedNodeSelec.antisenseNode;
            if (senseNode !== null && senseNode !== void 0 && senseNode.monomer.selected && senseNode) {
              result.push(_objectSpread(_objectSpread({}, twoStrandedNodeSelection), {}, {
                node: senseNode,
                twoStrandedNode: twoStrandedNodeSelection.node
              }));
            }
            if (antisenseNode !== null && antisenseNode !== void 0 && antisenseNode.monomer.selected && antisenseNode) {
              result.push(_objectSpread(_objectSpread({}, twoStrandedNodeSelection), {}, {
                node: antisenseNode,
                twoStrandedNode: twoStrandedNodeSelection.node
              }));
            }
            return result;
          });
        });
        var selectedMonomers = _this9.drawingEntitiesManager.selectedEntities.filter(function (_ref4) {
          var _ref5 = _slicedToArray__default["default"](_ref4, 2),
            drawingEntity = _ref5[1];
          return drawingEntity instanceof BaseMonomer.BaseMonomer;
        }).map(function (_ref6) {
          var _ref7 = _slicedToArray__default["default"](_ref6, 2),
            drawingEntity = _ref7[1];
          return drawingEntity;
        });
        var hasSelectedEntities = _this9.drawingEntitiesManager.selectedEntitiesArr.length > 0;
        if (eventData instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) {
          _this9.events.rightClickSequence.dispatch([event, sequenceSelections]);
        } else if (eventData instanceof FlexModePolymerBondRenderer.FlexModePolymerBondRenderer || eventData instanceof SnakeModePolymerBondRenderer.SnakeModePolymerBondRenderer && !(eventData.polymerBond instanceof HydrogenBond.HydrogenBond)) {
          _this9.events.rightClickPolymerBond.dispatch([event, eventData]);
        } else if (eventData instanceof BaseMonomerRenderer.BaseMonomerRenderer && !eventData.monomer.selected) {
          var modelChanges = _this9.drawingEntitiesManager.selectDrawingEntity(eventData.monomer);
          _this9.renderersContainer.update(modelChanges);
          _this9.events.selectEntities.dispatch(_this9.drawingEntitiesManager.selectedEntities.map(function (entity) {
            return entity[1];
          }));
          _this9.events.rightClickSelectedMonomers.dispatch([event, [eventData.monomer]]);
        } else if (eventData instanceof BaseMonomerRenderer.BaseMonomerRenderer && eventData.monomer.selected || hasSelectedEntities && eventData !== null && eventData !== void 0 && (_eventData$drawingEnt = eventData.drawingEntity) !== null && _eventData$drawingEnt !== void 0 && _eventData$drawingEnt.selected) {
          _this9.events.rightClickSelectedMonomers.dispatch([event]);
          _this9.events.rightClickSelectedMonomers.dispatch([event, selectedMonomers]);
        } else if (isClickOnCanvas) {
          if (_this9.mode.modeName === 'sequence-layout-mode') {
            _this9.events.rightClickCanvasSequence.dispatch([event, sequenceSelections]);
          } else {
            _this9.events.rightClickCanvas.dispatch([event, selectedMonomers]);
          }
        }
        return false;
      };
      document.addEventListener('contextmenu', this.contextMenuEventHandler);
    }
  }, {
    key: "onLayoutCircular",
    value: function () {
      var _onLayoutCircular = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2() {
        var ketcher;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              ketcher = ketcherProvider.ketcherProvider.getKetcher(this.ketcherId);
              _context2.next = 3;
              return ketcher.circularLayoutMonomers();
            case 3:
              this.clearTransientViews();
              this.clearSelection();
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function onLayoutCircular() {
        return _onLayoutCircular.apply(this, arguments);
      }
      return onLayoutCircular;
    }()
  }, {
    key: "subscribeEvents",
    value: function subscribeEvents() {
      var _this0 = this;
      this.events.layoutCircular.add(function () {
        return _this0.onLayoutCircular();
      });
      this.events.selectMonomer.add(function (monomer) {
        return _this0.onSelectMonomer(monomer);
      });
      this.events.selectPreset.add(function (preset) {
        return _this0.onSelectRNAPreset(preset);
      });
      this.events.selectTool.add(function (_ref8) {
        var _ref9 = _slicedToArray__default["default"](_ref8, 2),
          tool = _ref9[0],
          options = _ref9[1];
        return _this0.onSelectTool(tool, options);
      });
      this.events.createBondViaModal.add(function (payload) {
        return _this0.onCreateBond(payload);
      });
      this.events.cancelBondCreationViaModal.add(function (secondMonomer) {
        return _this0.onCancelBondCreation(secondMonomer);
      });
      this.events.selectMode.add(function (isSnakeMode) {
        return _this0.onSelectMode(isSnakeMode);
      });
      this.events.selectHistory.add(function (name) {
        return _this0.onSelectHistory(name);
      });
      editorEvents.renderersEvents.forEach(function (eventName) {
        _this0.events[eventName].add(function (event) {
          _this0.useModeIfNeeded(eventName, event);
          _this0.useToolIfNeeded(eventName, event);
        });
      });
      this.events.editSequence.add(function (sequenceItemRenderer) {
        return _this0.onEditSequence(sequenceItemRenderer);
      });
      this.events.establishHydrogenBond.add(function (sequenceItemRenderer) {
        return _this0.onEstablishHydrogenBondSequenceMode(sequenceItemRenderer);
      });
      this.events.deleteHydrogenBond.add(function (sequenceItemRenderer) {
        return _this0.onDeleteHydrogenBondSequenceMode(sequenceItemRenderer);
      });
      this.events.turnOnSequenceEditInRNABuilderMode.add(function () {
        return _this0.onTurnOnSequenceEditInRNABuilderMode();
      });
      this.events.turnOffSequenceEditInRNABuilderMode.add(function () {
        return _this0.onTurnOffSequenceEditInRNABuilderMode();
      });
      this.events.changeSequenceTypeEnterMode.add(function (mode) {
        return _this0.onChangeSequenceTypeEnterMode(mode);
      });
      this.events.toggleIsSequenceSyncEditMode.add(function (isSequenceSyncEditMode) {
        return _this0.onChangeToggleIsSequenceSyncEditMode(isSequenceSyncEditMode);
      });
      this.events.resetSequenceEditMode.add(function () {
        return _this0.onResetSequenceSyncEditMode();
      });
      this.events.createAntisenseChain.add(function (isDnaAntisense) {
        _this0.onCreateAntisenseChain(isDnaAntisense);
      });
      this.events.copySelectedStructure.add(function () {
        _this0.mode.onCopy();
        _this0.clearSelectionAfterCopy();
      });
      this.events.pasteFromClipboard.add(function () {
        _this0.mode.onPaste();
      });
      this.events.deleteSelectedStructure.add(function () {
        if (_this0.mode.modeName === 'sequence-layout-mode') {
          _this0.sequenceMode.deleteSelection();
          return;
        }
        var command = new Command.Command();
        var history = EditorHistory.EditorHistory.getInstance(_this0);
        command.merge(_this0.drawingEntitiesManager.deleteSelectedEntities());
        history.update(command);
        _this0.renderersContainer.update(command);
        _this0.events.selectEntities.dispatch(_this0.drawingEntitiesManager.selectedEntities.map(function (entity) {
          return entity[1];
        }));
        _this0.clearTransientViews();
      });
      this.events.modifyAminoAcids.add(function (_ref0) {
        var monomers = _ref0.monomers,
          modificationType = _ref0.modificationType;
        _this0.onModifyAminoAcids(monomers, modificationType);
      });
      this.events.setEditorLineLength.add(function (lineLengthUpdate) {
        if (window._ketcher_isChainLengthRulerDisabled) {
          return;
        }
        _this0.transientDrawingView.hideLineLengthHighlight();
        _this0.transientDrawingView.update();
        var command = new Command.Command();
        var history = EditorHistory.EditorHistory.getInstance(_this0);
        command.addOperation(new LineLengthChangeOperation.LineLengthChangeOperation(lineLengthUpdate));
        history.update(command);
      });
      this.events.toggleLineLengthHighlighting.add(function (value) {
        var currentPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        if (window._ketcher_isChainLengthRulerDisabled) {
          return;
        }
        if (value) {
          _this0.transientDrawingView.showLineLengthHighlight({
            currentPosition: currentPosition
          });
        } else {
          _this0.transientDrawingView.hideLineLengthHighlight();
        }
        _this0.transientDrawingView.update();
      });
      this.events.autochain.add(function (monomerItem) {
        return _this0.onAutochain(monomerItem);
      });
      this.events.previewAutochain.add(function (monomerItem) {
        return _this0.onPreviewAutochain(monomerItem);
      });
      this.events.removeAutochainPreview.add(function () {
        return _this0.onRemoveAutochainPreview();
      });
      this.events.flipHorizontal.add(function () {
        return _this0.onFlipHorizontal();
      });
      this.events.flipVertical.add(function () {
        return _this0.onFlipVertical();
      });
    }
  }, {
    key: "onFlipHorizontal",
    value: function onFlipHorizontal() {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var command = new Command.Command();
      var history = EditorHistory.EditorHistory.getInstance(this);
      command.merge(this.drawingEntitiesManager.flipSelectedDrawingEntities('horizontal'));
      history.update(command);
      this.renderersContainer.update(command);
      this.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
      this.events.selectEntities.dispatch(this.drawingEntitiesManager.selectedEntities.map(function (entity) {
        return entity[1];
      }));
    }
  }, {
    key: "onFlipVertical",
    value: function onFlipVertical() {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var command = new Command.Command();
      var history = EditorHistory.EditorHistory.getInstance(this);
      command.merge(this.drawingEntitiesManager.flipSelectedDrawingEntities('vertical'));
      history.update(command);
      this.renderersContainer.update(command);
      this.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
      this.events.selectEntities.dispatch(this.drawingEntitiesManager.selectedEntities.map(function (entity) {
        return entity[1];
      }));
    }
  }, {
    key: "getDataForAutochain",
    value: function getDataForAutochain() {
      var selectedMonomers = this.drawingEntitiesManager.selectedMonomers;
      var selectedMonomersWithFreeR2 = selectedMonomers.filter(function (monomer) {
        return monomer.isAttachmentPointExistAndFree(monomers$2.AttachmentPointName.R2);
      });
      var selectedMonomerToConnect = selectedMonomersWithFreeR2.length === 1 ? selectedMonomersWithFreeR2[0] : undefined;
      var newMonomerPosition;
      if (selectedMonomerToConnect) {
        newMonomerPosition = selectedMonomerToConnect.position.add(new vec2.Vec2(1.5, 0));
      } else if (this.drawingEntitiesManager.hasMonomers) {
        if (this.nextAutochainPosition && this.mode.modeName !== 'snake-layout-mode') {
          newMonomerPosition = this.nextAutochainPosition;
        } else {
          newMonomerPosition = this.drawingEntitiesManager.bottomLeftMonomerPosition.add(new vec2.Vec2(0, 1.5));
        }
      } else {
        newMonomerPosition = coordinates.Coordinates.canvasToModel(new vec2.Vec2(DrawingEntitiesManager.MONOMER_START_X_POSITION, DrawingEntitiesManager.MONOMER_START_Y_POSITION));
      }
      return {
        selectedMonomerToConnect: selectedMonomerToConnect,
        newMonomerPosition: newMonomerPosition,
        selectedMonomersWithFreeR2: selectedMonomersWithFreeR2,
        selectedMonomers: selectedMonomers
      };
    }
  }, {
    key: "onRemoveAutochainPreview",
    value: function onRemoveAutochainPreview() {
      this.transientDrawingView.hideAutochainPreview();
      this.transientDrawingView.update();
    }
  }, {
    key: "onPreviewAutochain",
    value: function onPreviewAutochain(monomerOrRnaItem) {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      this.invalidateNextAutochainPositionIfNeeded(monomers$1.isLibraryItemRnaPreset(monomerOrRnaItem));
      var _this$getDataForAutoc = this.getDataForAutochain(),
        selectedMonomerToConnect = _this$getDataForAutoc.selectedMonomerToConnect,
        newMonomerPosition = _this$getDataForAutoc.newMonomerPosition;
      this.transientDrawingView.showAutochainPreview(monomerOrRnaItem, newMonomerPosition, selectedMonomerToConnect);
      this.transientDrawingView.update();
    }
  }, {
    key: "onAutochain",
    value: function onAutochain(monomerOrRnaItem) {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      this.invalidateNextAutochainPositionIfNeeded(monomers$1.isLibraryItemRnaPreset(monomerOrRnaItem));
      var canvasWasEmptyBeforeAutochain = this.drawingEntitiesManager.allEntities.length === 0;
      var modelChanges = new Command.Command();
      var history = EditorHistory.EditorHistory.getInstance(this);
      var _this$getDataForAutoc2 = this.getDataForAutochain(),
        selectedMonomerToConnect = _this$getDataForAutoc2.selectedMonomerToConnect,
        newMonomerPosition = _this$getDataForAutoc2.newMonomerPosition;
      var monomersAddResult;
      if (monomers$1.isLibraryItemRnaPreset(monomerOrRnaItem)) {
        monomersAddResult = this.onPlaceRnaPresetOnCanvas(monomerOrRnaItem, newMonomerPosition);
      } else if (monomers$1.isAmbiguousMonomerLibraryItem(monomerOrRnaItem)) {
        monomersAddResult = this.onPlaceAmbiguousMonomerOnCanvas(monomerOrRnaItem, newMonomerPosition);
      } else {
        monomersAddResult = this.onPlaceMonomerOnCanvas(monomerOrRnaItem, newMonomerPosition);
      }
      if (!monomersAddResult) {
        return;
      }
      modelChanges.merge(monomersAddResult.modelChanges);
      if (selectedMonomerToConnect) {
        modelChanges.merge(this.drawingEntitiesManager.createPolymerBond(selectedMonomerToConnect, monomersAddResult.firstMonomer, monomers$2.AttachmentPointName.R2, monomers$2.AttachmentPointName.R1));
        modelChanges.merge(this.drawingEntitiesManager.unselectDrawingEntity(selectedMonomerToConnect));
        modelChanges.merge(this.drawingEntitiesManager.selectDrawingEntity(monomersAddResult.lastMonomer));
      }
      if (this.mode.modeName === 'snake-layout-mode') {
        modelChanges.merge(this.drawingEntitiesManager.applySnakeLayout(true));
      }
      if (canvasWasEmptyBeforeAutochain) {
        modelChanges.merge(this.drawingEntitiesManager.selectDrawingEntities(monomersAddResult.drawingEntities));
      }
      modelChanges.setUndoOperationsByPriority();
      this.renderersContainer.update(modelChanges);
      history.update(modelChanges);
      this.calculateAndStoreNextAutochainPosition(monomersAddResult.lastMonomer);
      if (this.mode.modeName === 'snake-layout-mode') {
        this.zoomTool.scrollToVerticalBottom();
      } else if (this.mode.modeName === 'flex-layout-mode') {
        var editorSettings$1 = editorSettings.provideEditorSettings();
        var oneLayoutCellInAngstroms = layout.SnakeLayoutCellWidth / editorSettings$1.macroModeScale;
        var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers([monomersAddResult.lastMonomer]);
        var monomersInChainUsedForAutochain = chainsCollection.chains[0].monomers;
        var chainBbox = structureBbox.getStructureBbox(monomersInChainUsedForAutochain);
        var canvasWrapperSize = this.zoomTool.canvasWrapperSize;
        var MIN_OFFSET_FROM_RIGHT = oneLayoutCellInAngstroms * 5 * editorSettings$1.macroModeScale;
        var offsetFromRight = Math.min(MIN_OFFSET_FROM_RIGHT, canvasWrapperSize.width / 2);
        var chainLeftTopInViewCoordinates = coordinates.Coordinates.modelToView(new vec2.Vec2(chainBbox.left, chainBbox.top));
        var chainRightBottomInViewCoordinates = coordinates.Coordinates.modelToView(new vec2.Vec2(chainBbox.right, chainBbox.bottom));
        var chainWidthInViewCoordinates = chainRightBottomInViewCoordinates.x - chainLeftTopInViewCoordinates.x;
        var lastAddedMonomerPositionInViewCoordinates = coordinates.Coordinates.modelToView(monomersAddResult.lastMonomer.position);
        var isStructureWithAutochainOffsetFitCanvas = canvasWrapperSize.width - chainWidthInViewCoordinates > offsetFromRight;
        var isAddedMonomerHorizontallyOutOfCanvas = lastAddedMonomerPositionInViewCoordinates.x <= 0 || lastAddedMonomerPositionInViewCoordinates.x >= canvasWrapperSize.width;
        var isAddedMonomerOutAboveCanvas = lastAddedMonomerPositionInViewCoordinates.y <= 0;
        var isAddedMonomerOutBelowCanvas = lastAddedMonomerPositionInViewCoordinates.y >= canvasWrapperSize.height;
        var isAddedMonomerVerticallyOutOfCanvas = isAddedMonomerOutAboveCanvas || isAddedMonomerOutBelowCanvas;
        if (isAddedMonomerHorizontallyOutOfCanvas || isAddedMonomerVerticallyOutOfCanvas) {
          var needToScrollToBeginningOfChain = Boolean(selectedMonomerToConnect) && isStructureWithAutochainOffsetFitCanvas;
          turnOnScrollAnimation(this.zoomTool.canvas);
          this.zoomTool.scrollTo(needToScrollToBeginningOfChain ? coordinates.Coordinates.modelToCanvas(chainsCollection.firstNode.firstMonomerInNode.position) : coordinates.Coordinates.modelToCanvas(monomersAddResult.lastMonomer.position).sub(new vec2.Vec2(this.zoomTool.unzoomValue(canvasWrapperSize.width) - offsetFromRight, 0)), isAddedMonomerOutBelowCanvas, needToScrollToBeginningOfChain ? oneLayoutCellInAngstroms * editorSettings$1.macroModeScale : 0, isAddedMonomerOutBelowCanvas ? oneLayoutCellInAngstroms * 2 * editorSettings$1.macroModeScale : undefined, false, isAddedMonomerVerticallyOutOfCanvas);
          debouncedTurnOffScrollAnimation(this.zoomTool.canvas);
        }
      }
      this.onRemoveAutochainPreview();
      this.onPreviewAutochain(monomerOrRnaItem);
    }
  }, {
    key: "placeItemOnCanvasForHandler",
    value: function placeItemOnCanvasForHandler(item, position) {
      var modelPosition = coordinates.Coordinates.canvasToModel(position);
      if (monomers$1.isLibraryItemRnaPreset(item)) {
        if (!item.sugar) return undefined;
        return this.onPlaceRnaPresetOnCanvas(item, modelPosition);
      } else if (monomers$1.isAmbiguousMonomerLibraryItem(item)) {
        return this.onPlaceAmbiguousMonomerOnCanvas(item, modelPosition);
      } else {
        return this.onPlaceMonomerOnCanvas(item, modelPosition);
      }
    }
  }, {
    key: "onPlaceRnaPresetOnCanvas",
    value: function onPlaceRnaPresetOnCanvas(rnaPresetItem, sugarPosition) {
      var _sugar$attachmentPoin, _phosphate$attachment;
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      if (!rnaPresetItem.sugar) {
        this.events.error.dispatch('No sugar in RNA preset found');
        return;
      }
      var modelChanges = new Command.Command();
      var _this$drawingEntities = this.drawingEntitiesManager.addRnaPreset({
          sugar: rnaPresetItem.sugar,
          sugarPosition: new vec2.Vec2(sugarPosition.x, sugarPosition.y),
          phosphate: rnaPresetItem.phosphate,
          phosphatePosition: rnaPresetItem.phosphate ? new vec2.Vec2(sugarPosition.x + 1.5, sugarPosition.y) : undefined,
          rnaBase: rnaPresetItem.base,
          rnaBasePosition: rnaPresetItem.base ? new vec2.Vec2(sugarPosition.x, sugarPosition.y + 1.5) : undefined,
          connections: rnaPresetItem.connections
        }),
        addPresetModelChanges = _this$drawingEntities.command,
        monomers = _this$drawingEntities.monomers;
      var sugar = monomers.find(function (monomer) {
        return monomer instanceof Sugar.Sugar;
      });
      var phosphate = monomers.find(function (monomer) {
        return monomer instanceof Phosphate.Phosphate;
      });
      var isFivePrimePhosphate = phosphate && ((_sugar$attachmentPoin = sugar.attachmentPointsToBonds.R1) === null || _sugar$attachmentPoin === void 0 ? void 0 : _sugar$attachmentPoin.getAnotherEntity(sugar)) === phosphate && ((_phosphate$attachment = phosphate.attachmentPointsToBonds.R2) === null || _phosphate$attachment === void 0 ? void 0 : _phosphate$attachment.getAnotherEntity(phosphate)) === sugar;
      modelChanges.merge(addPresetModelChanges);
      return {
        modelChanges: modelChanges,
        firstMonomer: isFivePrimePhosphate ? phosphate : sugar,
        lastMonomer: isFivePrimePhosphate ? sugar : phosphate !== null && phosphate !== void 0 ? phosphate : sugar,
        drawingEntities: [].concat(_toConsumableArray__default["default"](monomers), _toConsumableArray__default["default"](sugar.attachmentPointsToBonds.R2 ? [sugar.attachmentPointsToBonds.R2] : []), _toConsumableArray__default["default"](sugar.attachmentPointsToBonds.R3 ? [sugar.attachmentPointsToBonds.R3] : []))
      };
    }
  }, {
    key: "onPlaceMonomerOnCanvas",
    value: function onPlaceMonomerOnCanvas(monomerItem, position) {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var modelChanges = new Command.Command();
      var monomerAddModelChanges = this.drawingEntitiesManager.addMonomer(monomerItem, position);
      var monomer = monomerAddModelChanges.operations[0].monomer;
      modelChanges.merge(monomerAddModelChanges);
      return {
        modelChanges: modelChanges,
        firstMonomer: monomer,
        lastMonomer: monomer,
        drawingEntities: [monomer]
      };
    }
  }, {
    key: "onPlaceAmbiguousMonomerOnCanvas",
    value: function onPlaceAmbiguousMonomerOnCanvas(monomerItem, position) {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var modelChanges = new Command.Command();
      var monomerAddModelChanges = this.drawingEntitiesManager.addAmbiguousMonomer(monomerItem, position);
      var monomer = monomerAddModelChanges.operations[0].monomer;
      modelChanges.merge(monomerAddModelChanges);
      return {
        modelChanges: modelChanges,
        firstMonomer: monomer,
        lastMonomer: monomer,
        drawingEntities: [monomer]
      };
    }
  }, {
    key: "clearTransientViews",
    value: function clearTransientViews() {
      this.transientDrawingView.clear();
      this.transientDrawingView.update();
    }
  }, {
    key: "clearSelection",
    value: function clearSelection() {
      var turnOffSelectionCommand = this.drawingEntitiesManager.unselectAllDrawingEntities();
      this.renderersContainer.update(turnOffSelectionCommand);
    }
  }, {
    key: "calculateAndStoreNextAutochainPosition",
    value: function calculateAndStoreNextAutochainPosition(drawingEntitiesManagerOrMonomer) {
      var nextAutochainPosition;
      if (drawingEntitiesManagerOrMonomer instanceof DrawingEntitiesManager.DrawingEntitiesManager) {
        var chainsCollection = ChainsCollection.ChainsCollection.fromMonomers(drawingEntitiesManagerOrMonomer.monomersArray);
        if (chainsCollection.chains.length === 1) {
          var lastMonomerInChain = chainsCollection.lastNode.lastMonomerInNode;
          nextAutochainPosition = lastMonomerInChain.position.add(new vec2.Vec2(1.5, 0));
        } else {
          var bottomLeftMonomerPosition = drawingEntitiesManagerOrMonomer.bottomLeftMonomerPosition;
          nextAutochainPosition = bottomLeftMonomerPosition.add(new vec2.Vec2(0, 1.5));
        }
      } else {
        var monomer = drawingEntitiesManagerOrMonomer;
        nextAutochainPosition = monomer.position.add(new vec2.Vec2(1.5, 0));
      }
      this.nextAutochainPosition = nextAutochainPosition;
    }
  }, {
    key: "invalidateNextAutochainPositionIfNeeded",
    value: function invalidateNextAutochainPositionIfNeeded() {
      var isRnaPreset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var nextAutochainPosition = this.nextAutochainPosition;
      if (!nextAutochainPosition) {
        return;
      }
      var areaToCheck = {
        width: 1.5,
        height: 1.5
      };
      var additionalAreaToCheck = isRnaPreset ? 1.5 : 0;
      var monomerIntersection = this.drawingEntitiesManager.monomersArray.find(function (monomer) {
        return nextAutochainPosition.x + areaToCheck.width / 2 + additionalAreaToCheck > monomer.position.x && nextAutochainPosition.x < monomer.position.x + areaToCheck.width / 2 && nextAutochainPosition.y + areaToCheck.height / 2 + additionalAreaToCheck > monomer.position.y && nextAutochainPosition.y < monomer.position.y + areaToCheck.height / 2;
      });
      if (monomerIntersection) {
        this.nextAutochainPosition = undefined;
      }
    }
  }, {
    key: "onEditSequence",
    value: function onEditSequence(sequenceItemRenderer) {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.turnOnEditMode(sequenceItemRenderer);
    }
  }, {
    key: "onEstablishHydrogenBondSequenceMode",
    value: function onEstablishHydrogenBondSequenceMode(sequenceItemRenderer) {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.establishHydrogenBond(sequenceItemRenderer);
    }
  }, {
    key: "onDeleteHydrogenBondSequenceMode",
    value: function onDeleteHydrogenBondSequenceMode(sequenceItemRenderer) {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.deleteHydrogenBond(sequenceItemRenderer);
    }
  }, {
    key: "onTurnOnSequenceEditInRNABuilderMode",
    value: function onTurnOnSequenceEditInRNABuilderMode() {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.turnOnSequenceEditInRNABuilderMode();
    }
  }, {
    key: "onTurnOffSequenceEditInRNABuilderMode",
    value: function onTurnOffSequenceEditInRNABuilderMode() {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.turnOffSequenceEditInRNABuilderMode();
    }
  }, {
    key: "onChangeSequenceTypeEnterMode",
    value: function onChangeSequenceTypeEnterMode(mode) {
      this.sequenceTypeEnterMode = mode;
    }
  }, {
    key: "onChangeToggleIsSequenceSyncEditMode",
    value: function onChangeToggleIsSequenceSyncEditMode(isSequenceSyncEditMode) {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      var sequenceMode = this.sequenceMode;
      if (isSequenceSyncEditMode) {
        sequenceMode.turnOnSyncEditMode();
      } else {
        sequenceMode.turnOffSyncEditMode();
      }
    }
  }, {
    key: "onResetSequenceSyncEditMode",
    value: function onResetSequenceSyncEditMode() {
      if (this.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      this.sequenceMode.resetEditMode();
    }
  }, {
    key: "onCreateAntisenseChain",
    value: function onCreateAntisenseChain(isDnaAntisense) {
      var history = EditorHistory.EditorHistory.getInstance(this);
      var modelChanges = this.drawingEntitiesManager.createAntisenseChain(isDnaAntisense);
      modelChanges.merge(this.drawingEntitiesManager.unselectAllDrawingEntities());
      modelChanges.setUndoOperationsByPriority();
      this.renderersContainer.update(modelChanges);
      history.update(modelChanges);
      this.scrollToTopLeftCorner();
      this.clearTransientViews();
    }
  }, {
    key: "onSelectMonomer",
    value: function onSelectMonomer(monomer) {
      if (this.mode.modeName === 'sequence-layout-mode' && !this.isSequenceEditMode && SequenceRenderer.SequenceRenderer.chainsCollection.length === 0) {
        this.sequenceMode.turnOnEditMode();
      }
      if (this.mode.modeName === 'sequence-layout-mode') {
        this.sequenceMode.insertMonomerFromLibrary(monomer);
      }
    }
  }, {
    key: "onSelectRNAPreset",
    value: function onSelectRNAPreset(preset) {
      if (this.mode.modeName === 'sequence-layout-mode' && !this.isSequenceEditMode && SequenceRenderer.SequenceRenderer.chainsCollection.length === 0) {
        this.sequenceMode.turnOnEditMode();
      }
      if (this.mode.modeName === 'sequence-layout-mode') {
        this.sequenceMode.insertPresetFromLibrary(preset);
      }
    }
  }, {
    key: "onSelectTool",
    value: function onSelectTool(tool, options) {
      this.selectTool(tool, options);
    }
  }, {
    key: "onCreateBond",
    value: function onCreateBond(payload) {
      if (payload.isReconnection && payload.polymerBond) {
        var command = new Command.Command();
        var history = EditorHistory.EditorHistory.getInstance(this);
        if (!payload.initialFirstMonomerAttachmentPoint || !payload.initialSecondMonomerAttachmentPoint) {
          KetcherLogger.KetcherLogger.error('Attachment points are not found for the bond');
          return;
        }
        command.merge(this.drawingEntitiesManager.reconnectPolymerBond(payload.polymerBond, payload.firstSelectedAttachmentPoint, payload.secondSelectedAttachmentPoint, payload.initialFirstMonomerAttachmentPoint, payload.initialSecondMonomerAttachmentPoint));
        if (this.mode.modeName === 'snake-layout-mode') {
          var _this$drawingEntities2;
          command.merge(this.drawingEntitiesManager.recalculateCanvasMatrix((_this$drawingEntities2 = this.drawingEntitiesManager.canvasMatrix) === null || _this$drawingEntities2 === void 0 ? void 0 : _this$drawingEntities2.chainsCollection, this.drawingEntitiesManager.snakeLayoutMatrix));
        }
        history.update(command);
        this.renderersContainer.update(command);
        return;
      }
      if (this.tool instanceof Bond.PolymerBond) {
        this.tool.handleBondCreation(payload);
        return;
      }
      if (this.dragDropHandler.isModalOpen) {
        this.dragDropHandler.handleMonomerConnection(payload);
      }
    }
  }, {
    key: "onCancelBondCreation",
    value: function onCancelBondCreation(secondMonomer) {
      if (this.tool instanceof Bond.PolymerBond) {
        this.tool.handleBondCreationCancellation(secondMonomer);
        return;
      }
      if (this.dragDropHandler.isModalOpen) {
        this.dragDropHandler.handleMonomerConnectionCancel();
      }
    }
  }, {
    key: "onSelectMode",
    value: function onSelectMode(data) {
      var _history$previousComm;
      var command = new Command.Command();
      var mode = _typeof__default["default"](data) === 'object' ? data.mode : data;
      var ModeConstructor = modesRegistry.getModeConstructor(mode);
      var history = EditorHistory.EditorHistory.getInstance(this);
      var hasModeChanged = this.mode.modeName !== mode;
      var isLastCommandTurnOnSnakeMode = (_history$previousComm = history.previousCommand) === null || _history$previousComm === void 0 ? void 0 : _history$previousComm.operations.find(function (operation) {
        return operation instanceof index.SelectLayoutModeOperation && operation.mode === 'snake-layout-mode' && operation.prevMode !== 'snake-layout-mode';
      });
      if (isLastCommandTurnOnSnakeMode) {
        history.undo();
      }
      this.mode.destroy();
      this.previousModes.push(this.mode);
      this.mode = new ModeConstructor(this.mode.modeName);
      command.merge(this.mode.initialize(true, false, !hasModeChanged));
      history.update(command, _typeof__default["default"](data) === 'object' ? data === null || data === void 0 ? void 0 : data.mergeWithLatestHistoryCommand : false);
    }
  }, {
    key: "setMode",
    value: function setMode(mode) {
      this.mode = mode;
    }
  }, {
    key: "getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue",
    value: function getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue() {
      var grouped = {};
      this.monomersLibrary.forEach(function (monomerItem) {
        var _monomerItem$props, _monomerItem$props2;
        var naturalAnalogue = (_monomerItem$props = monomerItem.props) === null || _monomerItem$props === void 0 ? void 0 : _monomerItem$props.MonomerNaturalAnalogCode;
        if ((_monomerItem$props2 = monomerItem.props) !== null && _monomerItem$props2 !== void 0 && _monomerItem$props2.modificationTypes) {
          if (!grouped[naturalAnalogue]) {
            grouped[naturalAnalogue] = new Set();
          }
          monomerItem.props.modificationTypes.forEach(function (modificationType) {
            grouped[naturalAnalogue].add(modificationType);
          });
        }
      });
      var result = {};
      Object.entries(grouped).forEach(function (_ref1) {
        var _ref10 = _slicedToArray__default["default"](_ref1, 2),
          analogue = _ref10[0],
          typesSet = _ref10[1];
        var types = Array.from(typesSet).sort(function (a, b) {
          var aTitle = a.toLowerCase();
          var bTitle = b.toLowerCase();
          var naturalType = NATURAL_AMINO_ACID_MODIFICATION_TYPE.toLowerCase();
          if (aTitle === naturalType) return -1;
          if (bTitle === naturalType) return 1;
          return aTitle.localeCompare(bTitle);
        });
        result[analogue] = types;
      });
      return result;
    }
  }, {
    key: "onModifyAminoAcids",
    value: function onModifyAminoAcids(monomers, modificationType) {
      var _this1 = this;
      var modelChanges = new Command.Command();
      var editorHistory = EditorHistory.EditorHistory.getInstance(this);
      var aminoAcidsToModify = monomers$1.getAminoAcidsToModify(monomers, modificationType, this.monomersLibrary);
      var bondsToDelete = new Set();
      _toConsumableArray__default["default"](aminoAcidsToModify.entries()).forEach(function (_ref11) {
        var _ref12 = _slicedToArray__default["default"](_ref11, 2),
          aminoAcidToModify = _ref12[0],
          modifiedMonomerItem = _ref12[1];
        aminoAcidToModify.covalentBonds.forEach(function (polymerBond) {
          var _modifiedMonomerItem$;
          var attachmentPoint = aminoAcidToModify.getAttachmentPointByBond(polymerBond);
          if (!attachmentPoint) {
            KetcherLogger.KetcherLogger.error('Attachment point not found for the bond');
            return;
          }
          var modificationHasAttachmentPointForBond = (_modifiedMonomerItem$ = modifiedMonomerItem.props.MonomerCaps) === null || _modifiedMonomerItem$ === void 0 ? void 0 : _modifiedMonomerItem$[attachmentPoint];
          if (!modificationHasAttachmentPointForBond) {
            bondsToDelete.add(polymerBond);
          }
        });
      });
      var modificationFunction = function modificationFunction() {
        aminoAcidsToModify.forEach(function (modifiedMonomerItem, aminoAcidToModify) {
          modelChanges.merge(_this1.drawingEntitiesManager.modifyMonomerItem(aminoAcidToModify, modifiedMonomerItem));
        });
        modelChanges.addOperation(new index$4.ReinitializeModeOperation());
        _this1.renderersContainer.update(modelChanges);
        editorHistory.update(modelChanges);
        _this1.transientDrawingView.hideModifyAminoAcidsView();
        _this1.transientDrawingView.update();
      };
      if (bondsToDelete.size > 0) {
        this.events.openConfirmationDialog.dispatch({
          confirmationText: 'Some side chain connections will be deleted during replacement. Do you want to proceed?',
          onConfirm: function onConfirm() {
            bondsToDelete.forEach(function (bond) {
              modelChanges.merge(_this1.drawingEntitiesManager.deleteDrawingEntity(bond));
            });
            modificationFunction();
          }
        });
      } else {
        modificationFunction();
      }
    }
  }, {
    key: "sequenceMode",
    get: function get() {
      return this.mode;
    }
  }, {
    key: "isSequenceMode",
    get: function get() {
      return this.mode.modeName === 'sequence-layout-mode';
    }
  }, {
    key: "isSequenceEditMode",
    get: function get() {
      return this.mode.modeName === 'sequence-layout-mode' && this.sequenceMode.isEditMode;
    }
  }, {
    key: "isSequenceEditInRNABuilderMode",
    get: function get() {
      return this.mode.modeName === 'sequence-layout-mode' && this.sequenceMode.isEditInRNABuilderMode;
    }
  }, {
    key: "isSequenceAnyEditMode",
    get: function get() {
      var sequenceMode = this.sequenceMode;
      return this.mode.modeName === 'sequence-layout-mode' && (sequenceMode.isEditMode || sequenceMode.isEditInRNABuilderMode);
    }
  }, {
    key: "onSelectHistory",
    value: function onSelectHistory(name) {
      var history = EditorHistory.EditorHistory.getInstance(this);
      if (name === 'undo') {
        history.undo();
        this.clearTransientViews();
      } else if (name === 'redo') {
        history.redo();
        this.clearTransientViews();
      }
      this.calculateAndStoreNextAutochainPosition(this.drawingEntitiesManager);
    }
  }, {
    key: "selectTool",
    value: function selectTool(name, options) {
      var ToolConstructor = index$1.toolsMap[name];
      var oldTool = this.tool;
      this.clearTransientViews();
      this.tool = new ToolConstructor(this, options);
      if (Tool.isBaseTool(oldTool)) {
        oldTool === null || oldTool === void 0 || oldTool.destroy();
      }
    }
  }, {
    key: "isHandToolSelected",
    get: function get() {
      return this.selectedTool instanceof Hand.HandTool;
    }
  }, {
    key: "unsubscribeEvents",
    value: function unsubscribeEvents() {
      var _this10 = this;
      var _loop = function _loop(eventName) {
        _this10.events[eventName].handlers.forEach(function (handler) {
          _this10.events[eventName].remove(handler);
        });
        _this10.events[eventName].handlers = [];
      };
      for (var eventName in this.events) {
        _loop(eventName);
      }
      document.removeEventListener('keydown', this.hotKeyEventHandler);
      document.removeEventListener('copy', this.copyEventHandler);
      document.removeEventListener('paste', this.pasteEventHandler);
      document.removeEventListener('cut', this.cutEventHandler);
      document.removeEventListener('keydown', this.keydownEventHandler);
      document.removeEventListener('contextmenu', this.contextMenuEventHandler);
      this.canvas.removeEventListener('mousedown', dom.blurActiveElement);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('blur', this.handleWindowBlur);
      window.removeEventListener('resize', this.handleWindowResize);
      this.cleanupsForDomEvents.forEach(function (cleanupFunction) {
        cleanupFunction();
      });
    }
  }, {
    key: "trackedDomEvents",
    get: function get() {
      var trackedDomEvents = [{
        target: this.canvas,
        eventName: 'click',
        toolEventHandler: 'click'
      }, {
        target: this.canvas,
        eventName: 'dblclick',
        toolEventHandler: 'dblclick'
      }, {
        target: this.canvas,
        eventName: 'mousedown',
        toolEventHandler: 'mousedown'
      }, {
        target: document,
        eventName: 'mousemove',
        toolEventHandler: 'mousemove'
      }, {
        target: document,
        eventName: 'mouseup',
        toolEventHandler: 'mouseup'
      }, {
        target: document,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseleave'
      }, {
        target: this.canvas,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseLeaveClientArea'
      }, {
        target: this.canvas,
        eventName: 'mouseover',
        toolEventHandler: 'mouseover'
      }];
      return trackedDomEvents;
    }
  }, {
    key: "isMouseMainButtonPressed",
    value: function isMouseMainButtonPressed(event) {
      return (event === null || event === void 0 ? void 0 : event.button) === 0;
    }
  }, {
    key: "domEventSetup",
    value: function domEventSetup() {
      var _this11 = this;
      this.canvas.addEventListener('mousedown', dom.blurActiveElement);
      this.trackedDomEvents.forEach(function (_ref13) {
        var target = _ref13.target,
          eventName = _ref13.eventName,
          toolEventHandler = _ref13.toolEventHandler;
        _this11.events[eventName] = new index$2.DOMSubscription();
        var subs = _this11.events[eventName];
        var handler = subs.dispatch.bind(subs);
        target.addEventListener(eventName, handler);
        _this11.cleanupsForDomEvents.push(function () {
          target.removeEventListener(eventName, handler);
        });
        subs.add(function (event) {
          _this11.updateLastCursorPosition(event);
          if (!['mouseup', 'mousedown', 'click', 'dbclick'].includes(event.type) || _this11.isMouseMainButtonPressed(event)) {
            _this11.useModeIfNeeded(toolEventHandler, event);
            _this11.useToolIfNeeded(toolEventHandler, event);
          }
          return true;
        }, -1);
      });
    }
  }, {
    key: "updateLastCursorPosition",
    value: function updateLastCursorPosition(event) {
      var events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
      if (events.includes(event.type)) {
        var clientAreaBoundingBox = this.canvasOffset;
        this.lastCursorPosition = new vec2.Vec2({
          x: event.pageX - clientAreaBoundingBox.x,
          y: event.pageY - clientAreaBoundingBox.y
        });
        this.lastCursorPositionOfCanvas = coordinates.Coordinates.viewToCanvas(this.lastCursorPosition);
      }
    }
  }, {
    key: "useToolIfNeeded",
    value: function useToolIfNeeded(eventHandlerName, event) {
      var _editorTool$isSelecti;
      var editorTool = this.tool;
      if (!editorTool) {
        return false;
      }
      var conditions = [eventHandlerName in editorTool, this.canvas.contains(event === null || event === void 0 ? void 0 : event.target) || ((_editorTool$isSelecti = editorTool.isSelectionRunning) === null || _editorTool$isSelecti === void 0 ? void 0 : _editorTool$isSelecti.call(editorTool))];
      if (conditions.every(function (condition) {
        return condition;
      })) {
        var _editorTool$eventHand;
        (_editorTool$eventHand = editorTool[eventHandlerName]) === null || _editorTool$eventHand === void 0 || _editorTool$eventHand.call(editorTool, event);
        return true;
      }
      return false;
    }
  }, {
    key: "useModeIfNeeded",
    value: function useModeIfNeeded(eventHandlerName, event) {
      var _this$mode, _this$mode$eventHandl;
      if (this.isHandToolSelected) {
        return;
      }
      (_this$mode = this.mode) === null || _this$mode === void 0 || (_this$mode$eventHandl = _this$mode[eventHandlerName]) === null || _this$mode$eventHandl === void 0 || _this$mode$eventHandl.call(_this$mode, event);
    }
  }, {
    key: "switchToMicromolecules",
    value: function switchToMicromolecules() {
      var history = EditorHistory.EditorHistory.getInstance(this);
      var struct = this.micromoleculesEditor.struct();
      var reStruct = this.micromoleculesEditor.render.ctab;
      var zoomTool = Zoom.ZoomTool.instance;
      this.clearTransientViews();
      this.clearSelection();
      var _MacromoleculesConver = MacromoleculesConverter.MacromoleculesConverter.convertDrawingEntitiesToStruct(this.drawingEntitiesManager, struct, reStruct),
        conversionErrorMessage = _MacromoleculesConver.conversionErrorMessage;
      if (conversionErrorMessage) {
        var ketcher = ketcherProvider.ketcherProvider.getKetcher(this.ketcherId);
        ketcher.editor.setMacromoleculeConvertionError(conversionErrorMessage);
      }
      var scaleFactor = this.rescaleStructForModeTransition(struct, 'macroToMicro');
      history.destroy();
      this.drawingEntitiesManager.clearCanvas();
      zoomTool.resetZoom();
      struct.applyMonomersTransformations(scaleFactor);
      reStruct.render.setMolecule(struct);
      this._type = editor_types.EditorType.Micromolecules;
      this.drawingEntitiesManager = new DrawingEntitiesManager.DrawingEntitiesManager();
    }
  }, {
    key: "resetModeIfNeeded",
    value: function resetModeIfNeeded() {
      if (this.previousModes.length === 0) {
        var _ketcher$editor, _this$mode2;
        var ketcher = ketcherProvider.ketcherProvider.getKetcher(this.ketcherId);
        var isBlank = ketcher === null || ketcher === void 0 || (_ketcher$editor = ketcher.editor) === null || _ketcher$editor === void 0 ? void 0 : _ketcher$editor.struct().isBlank();
        var oldModeName = (_this$mode2 = this.mode) === null || _this$mode2 === void 0 ? void 0 : _this$mode2.modeName;
        var newModeName = isBlank ? index$3.DEFAULT_LAYOUT_MODE : index$3.HAS_CONTENT_LAYOUT_MODE;
        if (oldModeName === newModeName) {
          return;
        }
        this.onSelectMode(newModeName);
        this.events.layoutModeChange.dispatch(newModeName);
      }
    }
  }, {
    key: "switchToMacromolecules",
    value: function switchToMacromolecules() {
      var _this$micromoleculesE, _this$micromoleculesE2;
      this.resetCanvasOffset();
      this.resetKetcherRootElementOffset();
      this.resetModeIfNeeded();
      this.clearTransientViews();
      this.clearSelection();
      var struct$1 = (_this$micromoleculesE = (_this$micromoleculesE2 = this.micromoleculesEditor) === null || _this$micromoleculesE2 === void 0 ? void 0 : _this$micromoleculesE2.struct()) !== null && _this$micromoleculesE !== void 0 ? _this$micromoleculesE : new struct.Struct();
      this.rescaleStructForModeTransition(struct$1, 'microToMacro');
      var ketcher = ketcherProvider.ketcherProvider.getKetcher(this.ketcherId);
      var _MacromoleculesConver2 = MacromoleculesConverter.MacromoleculesConverter.convertStructToDrawingEntities(struct$1, this.drawingEntitiesManager),
        modelChanges = _MacromoleculesConver2.modelChanges;
      this.viewModel.initialize(_toConsumableArray__default["default"](this.drawingEntitiesManager.bonds.values()));
      if (this.mode.modeName === 'snake-layout-mode') {
        modelChanges.merge(this.drawingEntitiesManager.applySnakeLayout(true, true, false));
      }
      if (this.mode.modeName === 'flex-layout-mode') {
        modelChanges.merge(this.drawingEntitiesManager.recalculateAntisenseChains());
      }
      if (this.mode.modeName === 'sequence-layout-mode') {
        this.mode.initialize(false, false, false);
      } else {
        this.renderersContainer.update(modelChanges);
      }
      ketcher === null || ketcher === void 0 || ketcher.editor.clear();
      ketcher === null || ketcher === void 0 || ketcher.editor.clearHistory();
      ketcher === null || ketcher === void 0 || ketcher.editor.zoom(1);
      this._type = editor_types.EditorType.Macromolecules;
    }
  }, {
    key: "rescaleStructForModeTransition",
    value: function rescaleStructForModeTransition(struct, direction) {
      var _this$micromoleculesE3;
      var microModeScale = (_this$micromoleculesE3 = this.micromoleculesEditor) === null || _this$micromoleculesE3 === void 0 || (_this$micromoleculesE3 = _this$micromoleculesE3.render) === null || _this$micromoleculesE3 === void 0 || (_this$micromoleculesE3 = _this$micromoleculesE3.options) === null || _this$micromoleculesE3 === void 0 ? void 0 : _this$micromoleculesE3.microModeScale;
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      if (microModeScale == null || microModeScale === macroModeScale) {
        return 1;
      }
      var sourceScale = direction === 'microToMacro' ? microModeScale : macroModeScale;
      var targetScale = direction === 'microToMacro' ? macroModeScale : microModeScale;
      var scaleFactor = sourceScale / targetScale;
      struct.scale(scaleFactor);
      if (direction === 'microToMacro') {
        struct.scaleMonomerMicromoleculeSgroups(scaleFactor);
      }
      return scaleFactor;
    }
  }, {
    key: "isCurrentModeWithAutozoom",
    value: function isCurrentModeWithAutozoom() {
      return this.mode.modeName === 'flex-layout-mode' || this.mode.modeName === 'snake-layout-mode';
    }
  }, {
    key: "zoomToStructuresIfNeeded",
    value: function zoomToStructuresIfNeeded() {
      if (
      window._ketcher_isAutozoomDisabled || !this.isCurrentModeWithAutozoom() || !this.drawingEntitiesManager.hasMonomers) {
        return;
      }
      var structureBbox = utils.getRenderedStructuresBbox();
      Zoom.ZoomTool.instance.zoomStructureToFitHalfOfCanvas(structureBbox);
    }
  }, {
    key: "scrollToTopLeftCorner",
    value: function scrollToTopLeftCorner() {
      var drawnEntitiesBoundingBox = utils.getRenderedStructuresBbox();
      Zoom.ZoomTool.instance.scrollTo(new vec2.Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top), false, DrawingEntitiesManager.MONOMER_START_X_POSITION - layout.SnakeLayoutCellWidth / 4, DrawingEntitiesManager.MONOMER_START_Y_POSITION - layout.SnakeLayoutCellWidth / 4, false);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.unsubscribeEvents();
      editorSingleton.resetEditorInstance(this.ketcherId);
    }
  }]);
  return CoreEditor;
}();

exports.CoreEditor = CoreEditor;
exports.MonomerLibraryConvertError = MonomerLibraryConvertError;
exports.MonomerLibraryUpdateError = MonomerLibraryUpdateError;
exports.NATURAL_AMINO_ACID_MODIFICATION_TYPE = NATURAL_AMINO_ACID_MODIFICATION_TYPE;
//# sourceMappingURL=Editor.js.map
