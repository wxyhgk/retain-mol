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
import _typeof from '@babel/runtime/helpers/typeof';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { drawnStructuresSelector } from './constants.modern.js';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from './shared/constants.modern.js';
import { EditorType } from './editor.types.modern.js';
import { renderersEvents, createEditorEvents, hotkeysConfiguration } from './editorEvents.modern.js';
import { MacromoleculesConverter } from './MacromoleculesConverter.modern.js';
import { DEFAULT_LAYOUT_MODE, HAS_CONTENT_LAYOUT_MODE } from './modes/types/index.modern.js';
import { getModeConstructor } from './modes/modesRegistry.modern.js';
import { toolsMap } from './tools/index.modern.js';
import { PolymerBond } from './tools/Bond.modern.js';
import { isBaseTool } from './tools/Tool.modern.js';
import { KetTemplateType, KetMonomerGroupTemplateClass } from '../formatters/types/ket.modern.js';
import { FlexModePolymerBondRenderer } from '../render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer.modern.js';
import { SnakeModePolymerBondRenderer } from '../render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer.modern.js';
import { getRenderedStructuresBbox } from '../render/renderers/utils.modern.js';
import { BaseSequenceItemRenderer } from '../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import { SequenceRenderer } from '../render/renderers/sequence/SequenceRenderer.modern.js';
import { ketcherProvider } from '../ketcherProvider.modern.js';
import '../../domain/entities/atom.modern.js';
import '../../domain/entities/atomList.modern.js';
import '../../domain/entities/bond.modern.js';
import '../../domain/entities/fixedPrecision.modern.js';
import '../../domain/entities/fragment.modern.js';
import '../../domain/entities/functionalGroup.modern.js';
import '../../domain/entities/halfBond.modern.js';
import '../../domain/entities/loop.modern.js';
import '../../domain/entities/rgroup.modern.js';
import '../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../domain/entities/rxnArrow.modern.js';
import '../../domain/entities/rxnPlus.modern.js';
import '../../domain/entities/sgroup.modern.js';
import '../../domain/entities/sgroupForest.modern.js';
import '../../domain/entities/simpleObject.modern.js';
import { Struct } from '../../domain/entities/struct.modern.js';
import '../../domain/entities/text.modern.js';
import '../../domain/entities/pile.modern.js';
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import '../../domain/entities/box2Abs.modern.js';
import '../../domain/entities/pool.modern.js';
import '../../domain/entities/image.modern.js';
import '../../domain/entities/multitailArrow.modern.js';
import '../../domain/entities/highlight.modern.js';
import '../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../domain/entities/monomerMicromolecule.modern.js';
import '../../domain/entities/Peptide.modern.js';
import { BaseMonomer } from '../../domain/entities/BaseMonomer.modern.js';
import '../../domain/entities/Chem.modern.js';
import { Sugar } from '../../domain/entities/Sugar.modern.js';
import '../../domain/entities/RNABase.modern.js';
import { Phosphate } from '../../domain/entities/Phosphate.modern.js';
import '../../domain/entities/Axis.modern.js';
import '../../domain/entities/Nucleoside.modern.js';
import '../../domain/entities/Nucleotide.modern.js';
import { SequenceType } from '../../domain/entities/monomer-chains/types.modern.js';
import '../../domain/entities/monomer-chains/Chain.modern.js';
import { ChainsCollection } from '../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../domain/entities/MonomerSequenceNode.modern.js';
import '../../domain/entities/EmptySequenceNode.modern.js';
import '../../domain/entities/LinkerSequenceNode.modern.js';
import '../../domain/entities/UnresolvedMonomer.modern.js';
import '../../domain/entities/UnsplitNucleotide.modern.js';
import '../../domain/entities/PolymerBond.modern.js';
import '../../domain/entities/AmbiguousMonomer.modern.js';
import '../../domain/entities/MonomerToAtomBond.modern.js';
import { HydrogenBond } from '../../domain/entities/HydrogenBond.modern.js';
import '../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../domain/entities/BackBoneSequenceNode.modern.js';
import { Command } from '../../domain/entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../../utilities/SettingsManager.modern.js';
import { initHotKeys, keyNorm } from '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { getDisallowedModificationTypes, DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE, isValidHelmAlias, isValidBilnAlias, isValidHelmAliasLength, isValidIdtAlias, getTooLongIdtAliasEntries, MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH, MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE, HELM_ALIAS_FORMAT_ERROR_MESSAGE, BILN_ALIAS_FORMAT_ERROR_MESSAGE, HELM_ALIAS_LENGTH_ERROR_MESSAGE, IDT_ALIAS_SLASH_ERROR_MESSAGE, IDT_ALIAS_LENGTH_ERROR_MESSAGE } from '../../utilities/monomers.modern.js';
import { isEditableInputTarget, blurActiveElement } from '../../utilities/dom.modern.js';
import '../../domain/entities/CoreAtom.modern.js';
import '../../domain/entities/CoreStereoFlag.modern.js';
import '../../domain/constants/elements.modern.js';
import '../../domain/constants/element.types.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/constants/chains.modern.js';
import { KetMonomerClass } from '../../domain/constants/monomers.modern.js';
import { SnakeLayoutCellWidth } from '../../domain/constants/layout.modern.js';
import { MONOMER_START_X_POSITION, MONOMER_START_Y_POSITION, DrawingEntitiesManager } from '../../domain/entities/DrawingEntitiesManager.modern.js';
import { getStructureBbox } from '../../domain/entities/structureBbox.modern.js';
import { AttachmentPointName } from '../../domain/types/monomers.modern.js';
import '../../domain/types/entities.modern.js';
import { DOMSubscription as DOMSubscription_1 } from '../../node_modules/subscription/index.modern.js';
import monomersDataRaw from './data/monomers.modern.js';
import { EditorHistory } from './EditorHistory.modern.js';
import { Coordinates } from './shared/coordinates.modern.js';
import { ZoomTool } from './tools/Zoom.modern.js';
import { ViewModel } from '../render/view-model/ViewModel.modern.js';
import { HandTool } from './tools/Hand.modern.js';
import '../render/renderStruct.modern.js';
import '../render/raphaelRender.modern.js';
import '../render/restruct/reobject.modern.js';
import '../render/restruct/reatom.modern.js';
import '../render/restruct/rebond.modern.js';
import '../render/restruct/reenhancedFlag.modern.js';
import '../render/restruct/refrag.modern.js';
import '../render/restruct/rergroup.modern.js';
import '../render/restruct/rerxnarrow.modern.js';
import '../render/restruct/rerxnplus.modern.js';
import '../render/restruct/resgroup.modern.js';
import '../render/restruct/resimpleObject.modern.js';
import '../render/restruct/restruct.modern.js';
import '../render/restruct/retext.modern.js';
import '../render/restruct/visel.modern.js';
import '../render/restruct/generalEnumTypes.modern.js';
import '../render/restruct/showHydrogenLabels.modern.js';
import '../render/restruct/rergroupAttachmentPoint.modern.js';
import '../render/restruct/reImage.modern.js';
import '../render/restruct/remultitailArrow.modern.js';
import '../render/renderers/BaseRenderer.modern.js';
import { BaseMonomerRenderer } from '../render/renderers/BaseMonomerRenderer.modern.js';
import '../render/renderers/AtomRenderer.modern.js';
import '../render/renderers/ChemRenderer.modern.js';
import '../render/renderers/PeptideRenderer.modern.js';
import '../render/renderers/PhosphateRenderer.modern.js';
import '../render/renderers/SugarRenderer.modern.js';
import '../render/renderers/RNABaseRenderer.modern.js';
import '../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../render/renderers/SGroupRenderer.modern.js';
import '../render/renderers/RenderersManager.modern.js';
import '../render/renderers/StereoFlagRenderer.modern.js';
import '../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../domain/helpers/attachmentPointCalculations.modern.js';
import '../render/scrollbar/scrollbar-container.modern.js';
import '../render/notifyRenderComplete.modern.js';
import { debounce } from 'lodash';
import '../render/renderers/constants.modern.js';
import '../render/render.types.modern.js';
import { getEmptyMonomersLibraryJson, parseMonomersLibrary, validateMonomerName, MonomerNameValidationErrorType } from './helpers.modern.js';
import { TransientDrawingView } from '../render/renderers/TransientView/TransientDrawingView.modern.js';
import { SelectLayoutModeOperation } from './operations/polymerBond/index.modern.js';
import './operations/atom/index.modern.js';
import './operations/bond/index.modern.js';
import './operations/CanvasLoad.modern.js';
import './operations/descriptors.modern.js';
import './operations/EnhancedFlagMove.modern.js';
import './operations/EnhancedFlagClear.modern.js';
import './operations/ifThen.modern.js';
import './operations/fragment.modern.js';
import './operations/fragmentStereoAtom.modern.js';
import './operations/FragmentStereoFlag.modern.js';
import './operations/calcimplicitH.modern.js';
import './operations/LoopMove.modern.js';
import './operations/OperationType.modern.js';
import './operations/image/imageMove.modern.js';
import './operations/image/imageResize.modern.js';
import './operations/image/imageUpsertDelete.modern.js';
import './operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import './operations/multitailArrow/multitailArrowMove.modern.js';
import './operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import './operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import './operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import './operations/rgroup/RGroupAttr.modern.js';
import './operations/rgroup/RGroupFragment.modern.js';
import './operations/rgroupAttachmentPoint/index.modern.js';
import './operations/rxn/index.modern.js';
import './operations/simpleObject.modern.js';
import './operations/sgroup/index.modern.js';
import './operations/Text/TextCreateDelete.modern.js';
import './operations/Text/TextUpdate.modern.js';
import './operations/Text/TextMove.modern.js';
import './operations/monomer/AttachmentPointHoverOperation.modern.js';
import './operations/monomer/FlipMonomerOperation.modern.js';
import './operations/monomer/MonomerAddOperation.modern.js';
import './operations/monomer/MonomerDeleteOperation.modern.js';
import { monomerFactory } from '../render/renderers/monomerFactory.modern.js';
import './operations/monomer/MonomerHoverOperation.modern.js';
import './operations/monomer/MonomerItemModifyOperation.modern.js';
import './operations/monomer/MonomerMoveOperation.modern.js';
import './operations/monomer/RotateMonomerOperation.modern.js';
import './operations/monomer/ShiftMonomerOperation.modern.js';
import { ReinitializeModeOperation } from './operations/modes/index.modern.js';
import './operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import './operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import './operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import './operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import './operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import { getMonomerUniqueKey, isAmbiguousMonomerLibraryItem, isLibraryItemRnaPreset, getAminoAcidsToModify } from '../../domain/helpers/monomers.modern.js';
import { LineLengthChangeOperation } from './operations/editor/LineLengthChangeOperation.modern.js';
import { resetEditorInstance, setEditorInstance } from './editorSingleton.modern.js';
import { provideEditorSettings } from './editorSettings.modern.js';
import { SelectBase } from './tools/select/SelectBase.modern.js';
import { KetSerializer } from '../../domain/serializers/ket/ketSerializer.modern.js';
import { getMonomerTemplateRefFromMonomerItem, getKetRef } from '../../domain/serializers/ket/helpers.modern.js';
import '../../domain/serializers/mol/molSerializer.modern.js';
import '../../domain/serializers/sdf/sdfSerializer.modern.js';
import { LibraryItemDragDropHandler } from './libraryItemDragDrop/LibraryItemDragDropHandler.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SCROLL_SMOOTHNESS_IM_MS = 300;
var turnOnScrollAnimation = function turnOnScrollAnimation(canvas) {
  canvas.style('transition', "transform ".concat(SCROLL_SMOOTHNESS_IM_MS, "ms ease"));
};
var MonomerLibraryUpdateError = function (_Error) {
  _inherits(MonomerLibraryUpdateError, _Error);
  function MonomerLibraryUpdateError(skippedItems, partialSuccess) {
    var _this;
    _classCallCheck(this, MonomerLibraryUpdateError);
    _this = _callSuper(this, MonomerLibraryUpdateError, [skippedItems.map(function (_ref) {
      var name = _ref.name,
        reason = _ref.reason;
      return "".concat(name, ": ").concat(reason);
    }).join('\n')]);
    _defineProperty(_assertThisInitialized(_this), "partialSuccess", void 0);
    _defineProperty(_assertThisInitialized(_this), "skippedItems", void 0);
    _this.name = 'MonomerLibraryUpdateError';
    _this.skippedItems = _toConsumableArray(skippedItems);
    _this.partialSuccess = partialSuccess;
    return _this;
  }
  return _createClass(MonomerLibraryUpdateError);
}(_wrapNativeSuper(Error));
var MonomerLibraryConvertError = function (_Error2) {
  _inherits(MonomerLibraryConvertError, _Error2);
  function MonomerLibraryConvertError(message, cause) {
    var _this2;
    _classCallCheck(this, MonomerLibraryConvertError);
    _this2 = _callSuper(this, MonomerLibraryConvertError, [message, {
      cause: cause
    }]);
    _this2.name = 'MonomerLibraryConvertError';
    return _this2;
  }
  return _createClass(MonomerLibraryConvertError);
}(_wrapNativeSuper(Error));
var debouncedTurnOffScrollAnimation = debounce(function (canvas) {
  canvas.style('transition', 'none');
}, SCROLL_SMOOTHNESS_IM_MS);
var NATURAL_AMINO_ACID_MODIFICATION_TYPE = 'Natural amino acid';
var hasBilnAliasUniquenessScope = function hasBilnAliasUniquenessScope(monomerClass) {
  return monomerClass === KetMonomerClass.AminoAcid || monomerClass === KetMonomerClass.CHEM;
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
    _classCallCheck(this, CoreEditor);
    _defineProperty(this, "events", void 0);
    _defineProperty(this, "ketcherId", void 0);
    _defineProperty(this, "_type", void 0);
    _defineProperty(this, "renderersContainer", void 0);
    _defineProperty(this, "transientDrawingView", void 0);
    _defineProperty(this, "drawingEntitiesManager", void 0);
    _defineProperty(this, "viewModel", void 0);
    _defineProperty(this, "lastCursorPosition", new Vec2(0, 0));
    _defineProperty(this, "lastCursorPositionOfCanvas", new Vec2(0, 0));
    _defineProperty(this, "_monomersLibraryParsedJson", null);
    _defineProperty(this, "_monomersLibrary", []);
    _defineProperty(this, "canvas", void 0);
    _defineProperty(this, "ketcherRootElement", void 0);
    _defineProperty(this, "drawnStructuresWrapperElement", void 0);
    _defineProperty(this, "canvasOffset", {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    });
    _defineProperty(this, "ketcherRootElementBoundingClientRect", void 0);
    _defineProperty(this, "nextAutochainPosition", undefined);
    _defineProperty(this, "libraryItemDragCancelled", false);
    _defineProperty(this, "theme", void 0);
    _defineProperty(this, "dragDropHandler", void 0);
    _defineProperty(this, "zoomTool", void 0);
    _defineProperty(this, "tool", void 0);
    _defineProperty(this, "mode", void 0);
    _defineProperty(this, "previousModes", []);
    _defineProperty(this, "sequenceTypeEnterMode", SequenceType.RNA);
    _defineProperty(this, "micromoleculesEditor", void 0);
    _defineProperty(this, "hotKeyEventHandler", function () {});
    _defineProperty(this, "copyEventHandler", function () {});
    _defineProperty(this, "pasteEventHandler", function () {});
    _defineProperty(this, "cutEventHandler", function () {});
    _defineProperty(this, "keydownEventHandler", function () {});
    _defineProperty(this, "contextMenuEventHandler", function () {});
    _defineProperty(this, "cleanupsForDomEvents", []);
    _defineProperty(this, "handleVisibilityChange", function () {
      if (document.hidden) {
        _this3.cancelActiveDrag();
      }
    });
    _defineProperty(this, "handleWindowBlur", function () {
      _this3.cancelActiveDrag();
    });
    _defineProperty(this, "handleWindowResize", function () {
      _this3.resetCanvasOffset();
      _this3.resetKetcherRootElementOffset();
    });
    var ketcher = ketcherProvider.getKetcher(ketcherId);
    this._type = EditorType.Micromolecules;
    this.ketcherId = ketcherId;
    this.theme = theme;
    this.canvas = canvas;
    this.ketcherRootElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.closest(KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR);
    this.drawnStructuresWrapperElement = canvas.querySelector(drawnStructuresSelector);
    this.mode = mode !== null && mode !== void 0 ? mode : new (getModeConstructor(DEFAULT_LAYOUT_MODE))();
    this.events = createEditorEvents();
    KetSerializer.setMonomerFactory(monomerFactory);
    this.setMonomersLibrary(monomersDataRaw);
    this.events.updateMonomersLibrary.dispatch();
    this.subscribeEvents();
    this.renderersContainer = renderersContainer;
    this.drawingEntitiesManager = new DrawingEntitiesManager();
    this.viewModel = new ViewModel();
    this.dragDropHandler = new LibraryItemDragDropHandler({
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
    this.zoomTool = ZoomTool.initInstance(this.drawingEntitiesManager, this.canvas);
    this.renderersContainer.zoomTool = this.zoomTool;
    this.renderersContainer.editor = this;
    this.transientDrawingView = new TransientDrawingView();
    setEditorInstance(this);
    this.micromoleculesEditor = ketcher === null || ketcher === void 0 ? void 0 : ketcher.editor;
    this.initializeGlobalEventListeners();
  }
  _createClass(CoreEditor, [{
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
      if (this.tool instanceof SelectBase && this.tool.mode !== 'standby') {
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
      this._monomersLibraryParsedJson = getEmptyMonomersLibraryJson();
    }
  }, {
    key: "initializeMonomersLibraryFromKetcher",
    value: function () {
      var _initializeMonomersLibraryFromKetcher = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(monomersLibraryUpdate, monomersLibraryReplace, onError) {
        var monomersLibraryUpdateData, ketcher, monomersLibraryUpdateInKetFormat, errorMessage, errorTitle;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
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
              ketcher = ketcherProvider.getKetcher(this.ketcherId);
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
              KetcherLogger.error('Editor::initializeMonomersLibraryFromKetcher failed:', _context.t0);
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
      var _parseMonomersLibrary = parseMonomersLibrary(monomersDataRaw),
        monomersLibraryParsedJson = _parseMonomersLibrary.monomersLibraryParsedJson,
        monomersLibrary = _parseMonomersLibrary.monomersLibrary;
      this._monomersLibrary = monomersLibrary;
      this._monomersLibraryParsedJson = monomersLibraryParsedJson;
      var storedMonomerLibraryUpdates = SettingsManager.monomerLibraryUpdates;
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
      var _parseMonomersLibrary2 = parseMonomersLibrary(monomersDataRaw),
        newMonomersLibraryChunkParsedJson = _parseMonomersLibrary2.monomersLibraryParsedJson,
        newMonomersLibraryChunk = _parseMonomersLibrary2.monomersLibrary;
      var skippedItems = [];
      var reportValidationError = function reportValidationError(name, reason) {
        KetcherLogger.error('Editor::updateMonomersLibrary', reason);
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
        return [(_monomer$props2 = monomer.props) !== null && _monomer$props2 !== void 0 && _monomer$props2.aliasHELM ? "HELM alias \"".concat(monomer.props.aliasHELM, "\"") : null, (_monomer$props3 = monomer.props) !== null && _monomer$props3 !== void 0 && _monomer$props3.aliasBILN ? "BILN alias \"".concat(monomer.props.aliasBILN, "\"") : null].concat(_toConsumableArray(formatIdtAliasDetails((_monomer$props4 = monomer.props) === null || _monomer$props4 === void 0 ? void 0 : _monomer$props4.idtAliases))).filter(function (value) {
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
        var disallowedModificationTypes = getDisallowedModificationTypes((_newMonomer$props = newMonomer.props) === null || _newMonomer$props === void 0 ? void 0 : _newMonomer$props.modificationTypes);
        if (disallowedModificationTypes.length > 0) {
          var errorMessage = "Editor::updateMonomersLibrary: Load of \"".concat(newMonomer.props.MonomerName, "\" monomer has failed. ").concat(DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE, " Offending modification type(s): ").concat(disallowedModificationTypes.join(', '), ". The monomer was not added to the library.");
          KetcherLogger.error(errorMessage);
          return;
        }
        var newMonomerHasBilnAliasUniquenessScope = hasBilnAliasUniquenessScope((_newMonomer$props2 = newMonomer.props) === null || _newMonomer$props2 === void 0 ? void 0 : _newMonomer$props2.MonomerClass);
        if ((_newMonomer$props3 = newMonomer.props) !== null && _newMonomer$props3 !== void 0 && _newMonomer$props3.aliasHELM && !isValidHelmAlias(newMonomer.props.aliasHELM)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(HELM_ALIAS_FORMAT_ERROR_MESSAGE));
          return;
        }
        if ((_newMonomer$props4 = newMonomer.props) !== null && _newMonomer$props4 !== void 0 && _newMonomer$props4.aliasBILN && !isValidBilnAlias(newMonomer.props.aliasBILN)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(BILN_ALIAS_FORMAT_ERROR_MESSAGE));
          return;
        }
        if ((_newMonomer$props5 = newMonomer.props) !== null && _newMonomer$props5 !== void 0 && _newMonomer$props5.aliasHELM && !isValidHelmAliasLength(newMonomer.props.aliasHELM)) {
          reportValidationError(newMonomer.props.MonomerName, "".concat(HELM_ALIAS_LENGTH_ERROR_MESSAGE));
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
            return !isValidIdtAlias(alias);
          });
          if (hasInvalidSlash) {
            reportValidationError(newMonomer.props.MonomerName, "".concat(IDT_ALIAS_SLASH_ERROR_MESSAGE, " The monomer was not added to the library."));
            return;
          }
          var tooLongEntries = getTooLongIdtAliasEntries(newMonomer.props.idtAliases);
          if (tooLongEntries.length > 0) {
            var offenders = tooLongEntries.map(function (_ref3) {
              var field = _ref3.alias,
                value = _ref3.value;
              return "".concat(field, "=\"").concat(value, "\"");
            }).join(', ');
            reportValidationError(newMonomer.props.MonomerName, "".concat(IDT_ALIAS_LENGTH_ERROR_MESSAGE, " Offending field(s): ").concat(offenders, "."));
            return;
          }
        }
        var existingMonomerIndex = _this5._monomersLibrary.findIndex(function (monomer) {
          return areSameMonomers(monomer, newMonomer);
        });
        var newMonomerTemplateRef = getMonomerTemplateRefFromMonomerItem(newMonomer);
        if (existingMonomerIndex !== -1) {
          var existingMonomerTemplateRef = getMonomerTemplateRefFromMonomerItem(_this5._monomersLibrary[existingMonomerIndex]);
          var existingMonomerRefIndex = monomersLibraryParsedJson.root.templates.findIndex(function (template) {
            return template.$ref === existingMonomerTemplateRef;
          });
          if (existingMonomerRefIndex !== -1) {
            var existingMonomer = _this5._monomersLibrary[existingMonomerIndex];
            var id = existingMonomer.props.id;
            var existingMonomerId = id !== null && id !== void 0 ? id : getMonomerUniqueKey(existingMonomer);
            _this5._monomersLibrary[existingMonomerIndex] = newMonomer;
            _this5._monomersLibrary[existingMonomerIndex].props.id = existingMonomerId;
            didCommitAnyItem = true;
            monomersLibraryParsedJson[existingMonomerTemplateRef] = newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
          } else {
            KetcherLogger.error('Editor::updateMonomersLibrary: A ref is missing for a monomer in library', existingMonomerTemplateRef);
          }
        } else {
          _this5._monomersLibrary.push(newMonomer);
          didCommitAnyItem = true;
          monomersLibraryParsedJson.root.templates.push(getKetRef(newMonomerTemplateRef));
          monomersLibraryParsedJson[newMonomerTemplateRef] = newMonomersLibraryChunkParsedJson[newMonomerTemplateRef];
        }
      });
      newMonomersLibraryChunkParsedJson.root.templates.forEach(function (templateRef) {
        var templateDefinition = newMonomersLibraryChunkParsedJson[templateRef.$ref];
        if (templateDefinition.type !== KetTemplateType.MONOMER_GROUP_TEMPLATE) {
          return;
        }
        if (templateDefinition["class"] !== KetMonomerGroupTemplateClass.RNA) {
          reportValidationError(templateRef.$ref, "Monomer group template class must be \"".concat(KetMonomerGroupTemplateClass.RNA, "\". The template was not added to the library."));
          return;
        }
        var monomerNameValidationResult = validateMonomerName(templateDefinition.name);
        if (!monomerNameValidationResult.isValid) {
          switch (monomerNameValidationResult.error) {
            case MonomerNameValidationErrorType.Empty:
              reportValidationError(templateRef.$ref, "Monomer group template name cannot be empty or whitespace. The template was not added to the library.");
              return;
            case MonomerNameValidationErrorType.TooLong:
              {
                var truncatedTemplateName = "".concat(templateDefinition.name.slice(0, MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH), "...");
                KetcherLogger.error("Editor::updateMonomersLibrary: Load of monomer group template \"".concat(truncatedTemplateName, "\" (length: ").concat(templateDefinition.name.length, ", template: ").concat(templateRef.$ref, ") has failed. ").concat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE, " The template was not added to the library."));
                return;
              }
            case MonomerNameValidationErrorType.InvalidCharacters:
              KetcherLogger.error("Editor::updateMonomersLibrary: Load of monomer group template \"".concat(templateDefinition.name, "\" (template: ").concat(templateRef.$ref, ") has failed. Monomer group template name must consist only of letters, numbers, hyphens, underscores and asterisks. The template was not added to the library."));
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
            if ((existingTemplate === null || existingTemplate === void 0 ? void 0 : existingTemplate.type) !== KetTemplateType.MONOMER_GROUP_TEMPLATE) {
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
        if (isAmbiguousMonomerLibraryItem(monomerItem)) {
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
        if (isAmbiguousMonomerLibraryItem(monomerItem)) {
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
          KetcherLogger.error("There is a ref for rna preset template ".concat(templateRef.$ref, ", but template definition is not found"));
          return false;
        }
        return template.type === KetTemplateType.MONOMER_GROUP_TEMPLATE && template["class"] === KetMonomerGroupTemplateClass.RNA;
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
      if (this._type === EditorType.Micromolecules) return;
      if (!(event.target instanceof HTMLElement)) return;
      var keySettings = hotkeysConfiguration;
      var hotKeys = initHotKeys(keySettings);
      var shortcutKey = (_keyNorm$lookup = keyNorm.lookup(hotKeys, event)) === null || _keyNorm$lookup === void 0 ? void 0 : _keyNorm$lookup[0];
      if (shortcutKey && (_keySettings$shortcut = keySettings[shortcutKey]) !== null && _keySettings$shortcut !== void 0 && _keySettings$shortcut.handler && !isEditableInputTarget(event.target)) {
        keySettings[shortcutKey].handler(this);
        event.preventDefault();
      }
    }
  }, {
    key: "setupKeyboardEvents",
    value: function setupKeyboardEvents() {
      var _this6 = this;
      this.keydownEventHandler = function (event) {
        if (_this6._type === EditorType.Micromolecules) {
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
            KetcherLogger.error('Editor.ts::keydownEventHandler', error);
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
        if (_this7._type === EditorType.Micromolecules) {
          return;
        }
        _this7.mode.onCopy(event);
        _this7.clearSelectionAfterCopy();
      };
      this.pasteEventHandler = function (event) {
        if (_this7._type === EditorType.Micromolecules) {
          return;
        }
        _this7.mode.onPaste(event);
      };
      this.cutEventHandler = function (event) {
        if (_this7._type === EditorType.Micromolecules) {
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
        var sequenceSelections = SequenceRenderer.selections.map(function (selectionRange) {
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
          var _ref5 = _slicedToArray(_ref4, 2),
            drawingEntity = _ref5[1];
          return drawingEntity instanceof BaseMonomer;
        }).map(function (_ref6) {
          var _ref7 = _slicedToArray(_ref6, 2),
            drawingEntity = _ref7[1];
          return drawingEntity;
        });
        var hasSelectedEntities = _this9.drawingEntitiesManager.selectedEntitiesArr.length > 0;
        if (eventData instanceof BaseSequenceItemRenderer) {
          _this9.events.rightClickSequence.dispatch([event, sequenceSelections]);
        } else if (eventData instanceof FlexModePolymerBondRenderer || eventData instanceof SnakeModePolymerBondRenderer && !(eventData.polymerBond instanceof HydrogenBond)) {
          _this9.events.rightClickPolymerBond.dispatch([event, eventData]);
        } else if (eventData instanceof BaseMonomerRenderer && !eventData.monomer.selected) {
          var modelChanges = _this9.drawingEntitiesManager.selectDrawingEntity(eventData.monomer);
          _this9.renderersContainer.update(modelChanges);
          _this9.events.selectEntities.dispatch(_this9.drawingEntitiesManager.selectedEntities.map(function (entity) {
            return entity[1];
          }));
          _this9.events.rightClickSelectedMonomers.dispatch([event, [eventData.monomer]]);
        } else if (eventData instanceof BaseMonomerRenderer && eventData.monomer.selected || hasSelectedEntities && eventData !== null && eventData !== void 0 && (_eventData$drawingEnt = eventData.drawingEntity) !== null && _eventData$drawingEnt !== void 0 && _eventData$drawingEnt.selected) {
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
      var _onLayoutCircular = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var ketcher;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              ketcher = ketcherProvider.getKetcher(this.ketcherId);
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
        var _ref9 = _slicedToArray(_ref8, 2),
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
      renderersEvents.forEach(function (eventName) {
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
        var command = new Command();
        var history = EditorHistory.getInstance(_this0);
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
        var command = new Command();
        var history = EditorHistory.getInstance(_this0);
        command.addOperation(new LineLengthChangeOperation(lineLengthUpdate));
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
      var command = new Command();
      var history = EditorHistory.getInstance(this);
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
      var command = new Command();
      var history = EditorHistory.getInstance(this);
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
        return monomer.isAttachmentPointExistAndFree(AttachmentPointName.R2);
      });
      var selectedMonomerToConnect = selectedMonomersWithFreeR2.length === 1 ? selectedMonomersWithFreeR2[0] : undefined;
      var newMonomerPosition;
      if (selectedMonomerToConnect) {
        newMonomerPosition = selectedMonomerToConnect.position.add(new Vec2(1.5, 0));
      } else if (this.drawingEntitiesManager.hasMonomers) {
        if (this.nextAutochainPosition && this.mode.modeName !== 'snake-layout-mode') {
          newMonomerPosition = this.nextAutochainPosition;
        } else {
          newMonomerPosition = this.drawingEntitiesManager.bottomLeftMonomerPosition.add(new Vec2(0, 1.5));
        }
      } else {
        newMonomerPosition = Coordinates.canvasToModel(new Vec2(MONOMER_START_X_POSITION, MONOMER_START_Y_POSITION));
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
      this.invalidateNextAutochainPositionIfNeeded(isLibraryItemRnaPreset(monomerOrRnaItem));
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
      this.invalidateNextAutochainPositionIfNeeded(isLibraryItemRnaPreset(monomerOrRnaItem));
      var canvasWasEmptyBeforeAutochain = this.drawingEntitiesManager.allEntities.length === 0;
      var modelChanges = new Command();
      var history = EditorHistory.getInstance(this);
      var _this$getDataForAutoc2 = this.getDataForAutochain(),
        selectedMonomerToConnect = _this$getDataForAutoc2.selectedMonomerToConnect,
        newMonomerPosition = _this$getDataForAutoc2.newMonomerPosition;
      var monomersAddResult;
      if (isLibraryItemRnaPreset(monomerOrRnaItem)) {
        monomersAddResult = this.onPlaceRnaPresetOnCanvas(monomerOrRnaItem, newMonomerPosition);
      } else if (isAmbiguousMonomerLibraryItem(monomerOrRnaItem)) {
        monomersAddResult = this.onPlaceAmbiguousMonomerOnCanvas(monomerOrRnaItem, newMonomerPosition);
      } else {
        monomersAddResult = this.onPlaceMonomerOnCanvas(monomerOrRnaItem, newMonomerPosition);
      }
      if (!monomersAddResult) {
        return;
      }
      modelChanges.merge(monomersAddResult.modelChanges);
      if (selectedMonomerToConnect) {
        modelChanges.merge(this.drawingEntitiesManager.createPolymerBond(selectedMonomerToConnect, monomersAddResult.firstMonomer, AttachmentPointName.R2, AttachmentPointName.R1));
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
        var editorSettings = provideEditorSettings();
        var oneLayoutCellInAngstroms = SnakeLayoutCellWidth / editorSettings.macroModeScale;
        var chainsCollection = ChainsCollection.fromMonomers([monomersAddResult.lastMonomer]);
        var monomersInChainUsedForAutochain = chainsCollection.chains[0].monomers;
        var chainBbox = getStructureBbox(monomersInChainUsedForAutochain);
        var canvasWrapperSize = this.zoomTool.canvasWrapperSize;
        var MIN_OFFSET_FROM_RIGHT = oneLayoutCellInAngstroms * 5 * editorSettings.macroModeScale;
        var offsetFromRight = Math.min(MIN_OFFSET_FROM_RIGHT, canvasWrapperSize.width / 2);
        var chainLeftTopInViewCoordinates = Coordinates.modelToView(new Vec2(chainBbox.left, chainBbox.top));
        var chainRightBottomInViewCoordinates = Coordinates.modelToView(new Vec2(chainBbox.right, chainBbox.bottom));
        var chainWidthInViewCoordinates = chainRightBottomInViewCoordinates.x - chainLeftTopInViewCoordinates.x;
        var lastAddedMonomerPositionInViewCoordinates = Coordinates.modelToView(monomersAddResult.lastMonomer.position);
        var isStructureWithAutochainOffsetFitCanvas = canvasWrapperSize.width - chainWidthInViewCoordinates > offsetFromRight;
        var isAddedMonomerHorizontallyOutOfCanvas = lastAddedMonomerPositionInViewCoordinates.x <= 0 || lastAddedMonomerPositionInViewCoordinates.x >= canvasWrapperSize.width;
        var isAddedMonomerOutAboveCanvas = lastAddedMonomerPositionInViewCoordinates.y <= 0;
        var isAddedMonomerOutBelowCanvas = lastAddedMonomerPositionInViewCoordinates.y >= canvasWrapperSize.height;
        var isAddedMonomerVerticallyOutOfCanvas = isAddedMonomerOutAboveCanvas || isAddedMonomerOutBelowCanvas;
        if (isAddedMonomerHorizontallyOutOfCanvas || isAddedMonomerVerticallyOutOfCanvas) {
          var needToScrollToBeginningOfChain = Boolean(selectedMonomerToConnect) && isStructureWithAutochainOffsetFitCanvas;
          turnOnScrollAnimation(this.zoomTool.canvas);
          this.zoomTool.scrollTo(needToScrollToBeginningOfChain ? Coordinates.modelToCanvas(chainsCollection.firstNode.firstMonomerInNode.position) : Coordinates.modelToCanvas(monomersAddResult.lastMonomer.position).sub(new Vec2(this.zoomTool.unzoomValue(canvasWrapperSize.width) - offsetFromRight, 0)), isAddedMonomerOutBelowCanvas, needToScrollToBeginningOfChain ? oneLayoutCellInAngstroms * editorSettings.macroModeScale : 0, isAddedMonomerOutBelowCanvas ? oneLayoutCellInAngstroms * 2 * editorSettings.macroModeScale : undefined, false, isAddedMonomerVerticallyOutOfCanvas);
          debouncedTurnOffScrollAnimation(this.zoomTool.canvas);
        }
      }
      this.onRemoveAutochainPreview();
      this.onPreviewAutochain(monomerOrRnaItem);
    }
  }, {
    key: "placeItemOnCanvasForHandler",
    value: function placeItemOnCanvasForHandler(item, position) {
      var modelPosition = Coordinates.canvasToModel(position);
      if (isLibraryItemRnaPreset(item)) {
        if (!item.sugar) return undefined;
        return this.onPlaceRnaPresetOnCanvas(item, modelPosition);
      } else if (isAmbiguousMonomerLibraryItem(item)) {
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
      var modelChanges = new Command();
      var _this$drawingEntities = this.drawingEntitiesManager.addRnaPreset({
          sugar: rnaPresetItem.sugar,
          sugarPosition: new Vec2(sugarPosition.x, sugarPosition.y),
          phosphate: rnaPresetItem.phosphate,
          phosphatePosition: rnaPresetItem.phosphate ? new Vec2(sugarPosition.x + 1.5, sugarPosition.y) : undefined,
          rnaBase: rnaPresetItem.base,
          rnaBasePosition: rnaPresetItem.base ? new Vec2(sugarPosition.x, sugarPosition.y + 1.5) : undefined,
          connections: rnaPresetItem.connections
        }),
        addPresetModelChanges = _this$drawingEntities.command,
        monomers = _this$drawingEntities.monomers;
      var sugar = monomers.find(function (monomer) {
        return monomer instanceof Sugar;
      });
      var phosphate = monomers.find(function (monomer) {
        return monomer instanceof Phosphate;
      });
      var isFivePrimePhosphate = phosphate && ((_sugar$attachmentPoin = sugar.attachmentPointsToBonds.R1) === null || _sugar$attachmentPoin === void 0 ? void 0 : _sugar$attachmentPoin.getAnotherEntity(sugar)) === phosphate && ((_phosphate$attachment = phosphate.attachmentPointsToBonds.R2) === null || _phosphate$attachment === void 0 ? void 0 : _phosphate$attachment.getAnotherEntity(phosphate)) === sugar;
      modelChanges.merge(addPresetModelChanges);
      return {
        modelChanges: modelChanges,
        firstMonomer: isFivePrimePhosphate ? phosphate : sugar,
        lastMonomer: isFivePrimePhosphate ? sugar : phosphate !== null && phosphate !== void 0 ? phosphate : sugar,
        drawingEntities: [].concat(_toConsumableArray(monomers), _toConsumableArray(sugar.attachmentPointsToBonds.R2 ? [sugar.attachmentPointsToBonds.R2] : []), _toConsumableArray(sugar.attachmentPointsToBonds.R3 ? [sugar.attachmentPointsToBonds.R3] : []))
      };
    }
  }, {
    key: "onPlaceMonomerOnCanvas",
    value: function onPlaceMonomerOnCanvas(monomerItem, position) {
      if (this.mode.modeName === 'sequence-layout-mode') {
        return;
      }
      var modelChanges = new Command();
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
      var modelChanges = new Command();
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
      if (drawingEntitiesManagerOrMonomer instanceof DrawingEntitiesManager) {
        var chainsCollection = ChainsCollection.fromMonomers(drawingEntitiesManagerOrMonomer.monomersArray);
        if (chainsCollection.chains.length === 1) {
          var lastMonomerInChain = chainsCollection.lastNode.lastMonomerInNode;
          nextAutochainPosition = lastMonomerInChain.position.add(new Vec2(1.5, 0));
        } else {
          var bottomLeftMonomerPosition = drawingEntitiesManagerOrMonomer.bottomLeftMonomerPosition;
          nextAutochainPosition = bottomLeftMonomerPosition.add(new Vec2(0, 1.5));
        }
      } else {
        var monomer = drawingEntitiesManagerOrMonomer;
        nextAutochainPosition = monomer.position.add(new Vec2(1.5, 0));
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
      var history = EditorHistory.getInstance(this);
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
      if (this.mode.modeName === 'sequence-layout-mode' && !this.isSequenceEditMode && SequenceRenderer.chainsCollection.length === 0) {
        this.sequenceMode.turnOnEditMode();
      }
      if (this.mode.modeName === 'sequence-layout-mode') {
        this.sequenceMode.insertMonomerFromLibrary(monomer);
      }
    }
  }, {
    key: "onSelectRNAPreset",
    value: function onSelectRNAPreset(preset) {
      if (this.mode.modeName === 'sequence-layout-mode' && !this.isSequenceEditMode && SequenceRenderer.chainsCollection.length === 0) {
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
        var command = new Command();
        var history = EditorHistory.getInstance(this);
        if (!payload.initialFirstMonomerAttachmentPoint || !payload.initialSecondMonomerAttachmentPoint) {
          KetcherLogger.error('Attachment points are not found for the bond');
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
      if (this.tool instanceof PolymerBond) {
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
      if (this.tool instanceof PolymerBond) {
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
      var command = new Command();
      var mode = _typeof(data) === 'object' ? data.mode : data;
      var ModeConstructor = getModeConstructor(mode);
      var history = EditorHistory.getInstance(this);
      var hasModeChanged = this.mode.modeName !== mode;
      var isLastCommandTurnOnSnakeMode = (_history$previousComm = history.previousCommand) === null || _history$previousComm === void 0 ? void 0 : _history$previousComm.operations.find(function (operation) {
        return operation instanceof SelectLayoutModeOperation && operation.mode === 'snake-layout-mode' && operation.prevMode !== 'snake-layout-mode';
      });
      if (isLastCommandTurnOnSnakeMode) {
        history.undo();
      }
      this.mode.destroy();
      this.previousModes.push(this.mode);
      this.mode = new ModeConstructor(this.mode.modeName);
      command.merge(this.mode.initialize(true, false, !hasModeChanged));
      history.update(command, _typeof(data) === 'object' ? data === null || data === void 0 ? void 0 : data.mergeWithLatestHistoryCommand : false);
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
        var _ref10 = _slicedToArray(_ref1, 2),
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
      var modelChanges = new Command();
      var editorHistory = EditorHistory.getInstance(this);
      var aminoAcidsToModify = getAminoAcidsToModify(monomers, modificationType, this.monomersLibrary);
      var bondsToDelete = new Set();
      _toConsumableArray(aminoAcidsToModify.entries()).forEach(function (_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2),
          aminoAcidToModify = _ref12[0],
          modifiedMonomerItem = _ref12[1];
        aminoAcidToModify.covalentBonds.forEach(function (polymerBond) {
          var _modifiedMonomerItem$;
          var attachmentPoint = aminoAcidToModify.getAttachmentPointByBond(polymerBond);
          if (!attachmentPoint) {
            KetcherLogger.error('Attachment point not found for the bond');
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
        modelChanges.addOperation(new ReinitializeModeOperation());
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
      var history = EditorHistory.getInstance(this);
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
      var ToolConstructor = toolsMap[name];
      var oldTool = this.tool;
      this.clearTransientViews();
      this.tool = new ToolConstructor(this, options);
      if (isBaseTool(oldTool)) {
        oldTool === null || oldTool === void 0 || oldTool.destroy();
      }
    }
  }, {
    key: "isHandToolSelected",
    get: function get() {
      return this.selectedTool instanceof HandTool;
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
      this.canvas.removeEventListener('mousedown', blurActiveElement);
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
      this.canvas.addEventListener('mousedown', blurActiveElement);
      this.trackedDomEvents.forEach(function (_ref13) {
        var target = _ref13.target,
          eventName = _ref13.eventName,
          toolEventHandler = _ref13.toolEventHandler;
        _this11.events[eventName] = new DOMSubscription_1();
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
        this.lastCursorPosition = new Vec2({
          x: event.pageX - clientAreaBoundingBox.x,
          y: event.pageY - clientAreaBoundingBox.y
        });
        this.lastCursorPositionOfCanvas = Coordinates.viewToCanvas(this.lastCursorPosition);
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
      var history = EditorHistory.getInstance(this);
      var struct = this.micromoleculesEditor.struct();
      var reStruct = this.micromoleculesEditor.render.ctab;
      var zoomTool = ZoomTool.instance;
      this.clearTransientViews();
      this.clearSelection();
      var _MacromoleculesConver = MacromoleculesConverter.convertDrawingEntitiesToStruct(this.drawingEntitiesManager, struct, reStruct),
        conversionErrorMessage = _MacromoleculesConver.conversionErrorMessage;
      if (conversionErrorMessage) {
        var ketcher = ketcherProvider.getKetcher(this.ketcherId);
        ketcher.editor.setMacromoleculeConvertionError(conversionErrorMessage);
      }
      var scaleFactor = this.rescaleStructForModeTransition(struct, 'macroToMicro');
      history.destroy();
      this.drawingEntitiesManager.clearCanvas();
      zoomTool.resetZoom();
      struct.applyMonomersTransformations(scaleFactor);
      reStruct.render.setMolecule(struct);
      this._type = EditorType.Micromolecules;
      this.drawingEntitiesManager = new DrawingEntitiesManager();
    }
  }, {
    key: "resetModeIfNeeded",
    value: function resetModeIfNeeded() {
      if (this.previousModes.length === 0) {
        var _ketcher$editor, _this$mode2;
        var ketcher = ketcherProvider.getKetcher(this.ketcherId);
        var isBlank = ketcher === null || ketcher === void 0 || (_ketcher$editor = ketcher.editor) === null || _ketcher$editor === void 0 ? void 0 : _ketcher$editor.struct().isBlank();
        var oldModeName = (_this$mode2 = this.mode) === null || _this$mode2 === void 0 ? void 0 : _this$mode2.modeName;
        var newModeName = isBlank ? DEFAULT_LAYOUT_MODE : HAS_CONTENT_LAYOUT_MODE;
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
      var struct = (_this$micromoleculesE = (_this$micromoleculesE2 = this.micromoleculesEditor) === null || _this$micromoleculesE2 === void 0 ? void 0 : _this$micromoleculesE2.struct()) !== null && _this$micromoleculesE !== void 0 ? _this$micromoleculesE : new Struct();
      this.rescaleStructForModeTransition(struct, 'microToMacro');
      var ketcher = ketcherProvider.getKetcher(this.ketcherId);
      var _MacromoleculesConver2 = MacromoleculesConverter.convertStructToDrawingEntities(struct, this.drawingEntitiesManager),
        modelChanges = _MacromoleculesConver2.modelChanges;
      this.viewModel.initialize(_toConsumableArray(this.drawingEntitiesManager.bonds.values()));
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
      this._type = EditorType.Macromolecules;
    }
  }, {
    key: "rescaleStructForModeTransition",
    value: function rescaleStructForModeTransition(struct, direction) {
      var _this$micromoleculesE3;
      var microModeScale = (_this$micromoleculesE3 = this.micromoleculesEditor) === null || _this$micromoleculesE3 === void 0 || (_this$micromoleculesE3 = _this$micromoleculesE3.render) === null || _this$micromoleculesE3 === void 0 || (_this$micromoleculesE3 = _this$micromoleculesE3.options) === null || _this$micromoleculesE3 === void 0 ? void 0 : _this$micromoleculesE3.microModeScale;
      var macroModeScale = provideEditorSettings().macroModeScale;
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
      var structureBbox = getRenderedStructuresBbox();
      ZoomTool.instance.zoomStructureToFitHalfOfCanvas(structureBbox);
    }
  }, {
    key: "scrollToTopLeftCorner",
    value: function scrollToTopLeftCorner() {
      var drawnEntitiesBoundingBox = getRenderedStructuresBbox();
      ZoomTool.instance.scrollTo(new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top), false, MONOMER_START_X_POSITION - SnakeLayoutCellWidth / 4, MONOMER_START_Y_POSITION - SnakeLayoutCellWidth / 4, false);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.unsubscribeEvents();
      resetEditorInstance(this.ketcherId);
    }
  }]);
  return CoreEditor;
}();

export { CoreEditor, MonomerLibraryConvertError, MonomerLibraryUpdateError, NATURAL_AMINO_ACID_MODIFICATION_TYPE };
//# sourceMappingURL=Editor.modern.js.map
