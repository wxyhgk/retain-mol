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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { Subscription as Subscription_1 } from '../node_modules/subscription/index.modern.js';
import { saveAs } from 'file-saver';
import './formatters/supportedFormatProperties.modern.js';
import './formatters/formatProperties.modern.js';
import { SupportedFormat, isCalculationGeometryFormat } from './formatters/structFormatter.types.modern.js';
import './formatters/formatterFactory.modern.js';
import './formatters/mol2Formatter.modern.js';
import './formatters/xyzFormatter.modern.js';
import './formatters/qcSchemaFormatter.modern.js';
import { getComputationalFormatMetadata, setComputationalFormatMetadata } from './formatters/computationalFormatMetadata.modern.js';
import { identifyStructFormat } from './formatters/identifyStructFormat.modern.js';
import './formatters/types/ket.modern.js';
import '../domain/entities/vec2.modern.js';
import { isNumber, uniqueId } from 'lodash';
import './editor/operations/atom/index.modern.js';
import './editor/operations/bond/index.modern.js';
import './editor/operations/CanvasLoad.modern.js';
import './editor/operations/descriptors.modern.js';
import './editor/operations/EnhancedFlagMove.modern.js';
import './editor/operations/EnhancedFlagClear.modern.js';
import './editor/operations/ifThen.modern.js';
import './editor/operations/fragment.modern.js';
import './editor/operations/fragmentStereoAtom.modern.js';
import './editor/operations/FragmentStereoFlag.modern.js';
import './editor/operations/calcimplicitH.modern.js';
import './editor/operations/LoopMove.modern.js';
import './editor/operations/OperationType.modern.js';
import './editor/operations/image/imageMove.modern.js';
import './editor/operations/image/imageResize.modern.js';
import './editor/operations/image/imageUpsertDelete.modern.js';
import './editor/operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import './editor/operations/multitailArrow/multitailArrowMove.modern.js';
import './editor/operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import './editor/operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import './editor/operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import './editor/operations/rgroup/RGroupAttr.modern.js';
import './editor/operations/rgroup/RGroupFragment.modern.js';
import './editor/operations/rgroupAttachmentPoint/index.modern.js';
import './editor/operations/rxn/index.modern.js';
import './editor/operations/simpleObject.modern.js';
import './editor/operations/sgroup/index.modern.js';
import './editor/operations/Text/TextCreateDelete.modern.js';
import './editor/operations/Text/TextUpdate.modern.js';
import './editor/operations/Text/TextMove.modern.js';
import './editor/operations/monomer/AttachmentPointHoverOperation.modern.js';
import './editor/operations/monomer/FlipMonomerOperation.modern.js';
import './editor/operations/monomer/MonomerAddOperation.modern.js';
import './editor/operations/monomer/MonomerDeleteOperation.modern.js';
import '../domain/entities/AmbiguousMonomer.modern.js';
import '../domain/helpers/monomers.modern.js';
import './render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../domain/entities/atom.modern.js';
import '../domain/entities/atomList.modern.js';
import '../domain/entities/bond.modern.js';
import '../domain/entities/fixedPrecision.modern.js';
import '../domain/entities/fragment.modern.js';
import '../domain/entities/functionalGroup.modern.js';
import '../domain/entities/halfBond.modern.js';
import '../domain/entities/loop.modern.js';
import '../domain/entities/rgroup.modern.js';
import '../domain/entities/rgroupAttachmentPoint.modern.js';
import '../domain/entities/rxnArrow.modern.js';
import '../domain/entities/rxnPlus.modern.js';
import { SGroup } from '../domain/entities/sgroup.modern.js';
import '../domain/entities/sgroupForest.modern.js';
import '../domain/entities/simpleObject.modern.js';
import { Struct } from '../domain/entities/struct.modern.js';
import '../domain/entities/text.modern.js';
import '../domain/entities/pile.modern.js';
import '../domain/entities/box2Abs.modern.js';
import '../domain/entities/pool.modern.js';
import '../domain/entities/image.modern.js';
import '../domain/entities/multitailArrow.modern.js';
import '../domain/entities/highlight.modern.js';
import '../domain/entities/sGroupAttachmentPoint.modern.js';
import '../domain/entities/monomerMicromolecule.modern.js';
import '../domain/entities/Peptide.modern.js';
import '../domain/entities/BaseMonomer.modern.js';
import '../domain/entities/Chem.modern.js';
import '../domain/entities/Sugar.modern.js';
import '../domain/entities/RNABase.modern.js';
import '../domain/entities/Phosphate.modern.js';
import '../domain/entities/Axis.modern.js';
import '../domain/entities/Nucleoside.modern.js';
import '../domain/entities/Nucleotide.modern.js';
import '../domain/entities/monomer-chains/types.modern.js';
import '../domain/entities/monomer-chains/Chain.modern.js';
import '../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../domain/entities/MonomerSequenceNode.modern.js';
import '../domain/entities/EmptySequenceNode.modern.js';
import '../domain/entities/LinkerSequenceNode.modern.js';
import '../domain/entities/UnresolvedMonomer.modern.js';
import '../domain/entities/UnsplitNucleotide.modern.js';
import '../domain/entities/PolymerBond.modern.js';
import '../domain/entities/MonomerToAtomBond.modern.js';
import '../domain/entities/HydrogenBond.modern.js';
import '../domain/entities/SGroupDrawingEntity.modern.js';
import '../domain/entities/BackBoneSequenceNode.modern.js';
import '../domain/entities/Command.modern.js';
import { runAsyncAction } from '../utilities/runAsyncAction.modern.js';
import { KetcherLogger, LogLevel } from '../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../utilities/SettingsManager.modern.js';
import '../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../utilities/clipboardUtils.modern.js';
import { getSvgFromDrawnStructures } from '../utilities/getSvgFromDrawnStructures.modern.js';
import { ensureString } from '../utilities/ensureString.modern.js';
import { assert } from '../utilities/assert.modern.js';
import '../domain/entities/CoreAtom.modern.js';
import '../domain/entities/CoreStereoFlag.modern.js';
import { createCalculationSnapshotV1 } from '../domain/entities/calculation/calculationSnapshot.modern.js';
import '../domain/constants/monomers.modern.js';
import './render/renderers/ChemRenderer.modern.js';
import './render/renderers/PeptideRenderer.modern.js';
import './render/renderers/PhosphateRenderer.modern.js';
import './render/renderers/RNABaseRenderer.modern.js';
import './render/renderers/SugarRenderer.modern.js';
import './render/renderers/UnresolvedMonomerRenderer.modern.js';
import './render/renderers/UnsplitNucleotideRenderer.modern.js';
import './editor/operations/monomer/MonomerHoverOperation.modern.js';
import './editor/operations/monomer/MonomerItemModifyOperation.modern.js';
import './editor/operations/monomer/MonomerMoveOperation.modern.js';
import './editor/operations/monomer/RotateMonomerOperation.modern.js';
import './editor/operations/monomer/ShiftMonomerOperation.modern.js';
import './editor/operations/modes/index.modern.js';
import './editor/operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import './editor/operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import './editor/operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import './editor/operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import './editor/operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import './editor/actions/action.modern.js';
import './editor/actions/actionTransaction.modern.js';
import { getSelectionFromStruct } from './editor/actions/utils.modern.js';
import '../domain/helpers/functionalGroupsProvider.modern.js';
import '../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../domain/constants/generics.modern.js';
import '../domain/helpers/attachmentPointCalculations.modern.js';
import 'lodash/fp';
import './editor/operations/sgroup/sgroupAttachmentPoints.modern.js';
import './editor/shared/constants.modern.js';
import './editor/actions/bond.modern.js';
import '../domain/constants/elements.modern.js';
import '../domain/constants/element.types.modern.js';
import '../domain/constants/chains.modern.js';
import './editor/operations/highlight.modern.js';
import './editor/shared/coordinates.modern.js';
import { EditorType } from './editor/editor.types.modern.js';
import { MonomerLibraryConvertError } from './editor/Editor.modern.js';
import { provideEditorInstance } from './editor/editorSingleton.modern.js';
import './editor/EditorHistory.modern.js';
import './editor/modes/FlexMode.modern.js';
import './editor/modes/SequenceMode.modern.js';
import './editor/modes/SnakeMode.modern.js';
import './editor/editorEvents.modern.js';
import './editor/tools/index.modern.js';
import './editor/MacromoleculesConverter.modern.js';
import { MoleculeEditPlanExecutor } from './editor/MoleculeEditPlanExecutor.modern.js';
import './editor/tools/types.modern.js';
import './editor/previewPosition.modern.js';
import { Indigo } from './indigo.modern.js';
import { KetSerializer } from '../domain/serializers/ket/ketSerializer.modern.js';
import { EventEmitter } from 'events';
import { ketcherProvider } from './ketcherProvider.modern.js';
import { prepareStructToRender, deleteAllEntitiesOnCanvas, parseAndAddMacromoleculesOnCanvas } from './utils.modern.js';
import { ModeTypes, BlobTypes } from './ketcher.types.modern.js';
import { ChemicalMimeType } from '../domain/services/struct/structService.types.modern.js';
import { getStructure } from './getStructure.modern.js';
import { validateCalculationReadiness } from '../domain/services/calculation/readiness.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateMethodGet(s, a, r) { return _assertClassBrand(a, s), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var allowedApiSettings = [['general.dearomatize-on-load', 'dearomatize-on-load'], ['ignoreChiralFlag', 'ignoreChiralFlag'], ['disableQueryElements', 'disableQueryElements'], ['bondThickness', 'bondThickness']];
var MONOMER_LIBRARY_FORMAT_OPTIONS = {
  inputFormat: ChemicalMimeType.MonomerLibrary,
  outputFormat: ChemicalMimeType.MonomerLibrary,
  outputContentType: ChemicalMimeType.MonomerLibrary
};
var _formatterFactory = new WeakMap();
var _editor = new WeakMap();
var _moleculeReader = new WeakMap();
var _disposeMoleculeReader = new WeakMap();
var _moleculeCanvasUnavailableReason = new WeakMap();
var _recognitionAdapter = new WeakMap();
var _eventBus = new WeakMap();
var _settingsService = new WeakMap();
var _onSettingsChanged = new WeakSet();
var Ketcher = function () {
  function Ketcher(structService, formatterFactory, settingsService) {
    var _this = this;
    _classCallCheck(this, Ketcher);
    _classPrivateMethodInitSpec(this, _onSettingsChanged);
    _defineProperty(this, "_id", void 0);
    _defineProperty(this, "logging", void 0);
    _defineProperty(this, "structService", void 0);
    _classPrivateFieldInitSpec(this, _formatterFactory, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _editor, {
      writable: true,
      value: null
    });
    _classPrivateFieldInitSpec(this, _moleculeReader, {
      writable: true,
      value: null
    });
    _classPrivateFieldInitSpec(this, _disposeMoleculeReader, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _moleculeCanvasUnavailableReason, {
      writable: true,
      value: null
    });
    _defineProperty(this, "_indigo", void 0);
    _classPrivateFieldInitSpec(this, _recognitionAdapter, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _eventBus, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _settingsService, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "changeEvent", void 0);
    _defineProperty(this, "libraryUpdateEvent", void 0);
    assert(structService != null);
    assert(formatterFactory != null);
    this._id = uniqueId();
    this.changeEvent = new Subscription_1();
    this.libraryUpdateEvent = new Subscription_1();
    this.structService = structService;
    _classPrivateFieldSet(this, _formatterFactory, formatterFactory);
    _classPrivateFieldSet(this, _settingsService, settingsService);
    this._indigo = new Indigo(this.structService);
    _classPrivateFieldSet(this, _eventBus, new EventEmitter());
    this.logging = {
      enabled: false,
      level: LogLevel.ERROR,
      showTrace: false
    };
    if (_classPrivateFieldGet(this, _settingsService)) {
      _classPrivateFieldGet(this, _settingsService).subscribe(function (newSettings) {
        _classPrivateMethodGet(_this, _onSettingsChanged, _onSettingsChanged2).call(_this, newSettings);
      });
    }
  }
  _createClass(Ketcher, [{
    key: "editor",
    get: function get() {
      if (!_classPrivateFieldGet(this, _editor)) {
        throw new Error('Editor is not initialized yet. It should be assigned right after Ketcher creation.');
      }
      return _classPrivateFieldGet(this, _editor);
    }
  }, {
    key: "eventBus",
    get: function get() {
      return _classPrivateFieldGet(this, _eventBus);
    }
  }, {
    key: "molecule",
    get: function get() {
      return _classPrivateFieldGet(this, _moleculeReader);
    }
  }, {
    key: "moleculeCanvasUnavailableReason",
    get: function get() {
      return _classPrivateFieldGet(this, _moleculeCanvasUnavailableReason);
    }
  }, {
    key: "setMoleculeCanvasUnavailableReason",
    value: function setMoleculeCanvasUnavailableReason(reason) {
      var _classPrivateFieldGet2, _classPrivateFieldGet3;
      if (reason === _classPrivateFieldGet(this, _moleculeCanvasUnavailableReason)) return;
      _classPrivateFieldSet(this, _moleculeCanvasUnavailableReason, reason);
      (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _editor)) === null || _classPrivateFieldGet2 === void 0 || (_classPrivateFieldGet3 = _classPrivateFieldGet2.notifyDocumentChange) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.call(_classPrivateFieldGet2, 'mode');
    }
  }, {
    key: "setMoleculeReader",
    value: function setMoleculeReader(reader, dispose) {
      if (reader === _classPrivateFieldGet(this, _moleculeReader)) return;
      var previousDispose = _classPrivateFieldGet(this, _disposeMoleculeReader);
      _classPrivateFieldSet(this, _moleculeReader, reader);
      _classPrivateFieldSet(this, _disposeMoleculeReader, dispose);
      previousDispose === null || previousDispose === void 0 || previousDispose();
    }
  }, {
    key: "settingsService",
    get: function get() {
      return _classPrivateFieldGet(this, _settingsService);
    }
  }, {
    key: "id",
    get: function get() {
      return this._id;
    }
  }, {
    key: "formatterFactory",
    get: function get() {
      return _classPrivateFieldGet(this, _formatterFactory);
    }
  }, {
    key: "indigo",
    get: function get() {
      return this._indigo;
    }
  }, {
    key: "settings",
    get: function get() {
      var options = this.editor.options();
      var result = {};
      for (var _i = 0, _allowedApiSettings = allowedApiSettings; _i < _allowedApiSettings.length; _i++) {
        var _allowedApiSettings$_ = _slicedToArray(_allowedApiSettings[_i], 2),
          apiSetting = _allowedApiSettings$_[0],
          clientSetting = _allowedApiSettings$_[1];
        var value = options[clientSetting];
        if (value !== undefined) {
          result[apiSetting] = value;
        }
      }
      if (!Object.keys(result).length) {
        throw new Error('Allowed options are not provided');
      }
      return result;
    }
  }, {
    key: "addEditor",
    value: function addEditor(editor) {
      if (_classPrivateFieldGet(this, _editor) !== editor) this.setMoleculeReader(null);
      _classPrivateFieldSet(this, _editor, editor);
    }
  }, {
    key: "setRecognitionAdapter",
    value: function setRecognitionAdapter(adapter) {
      _classPrivateFieldSet(this, _recognitionAdapter, adapter !== null && adapter !== void 0 ? adapter : undefined);
    }
  }, {
    key: "setSettings",
    value: function setSettings(settings) {
      if (!settings) {
        throw new Error('Please provide settings');
      }
      var options = {};
      for (var _i2 = 0, _allowedApiSettings2 = allowedApiSettings; _i2 < _allowedApiSettings2.length; _i2++) {
        var _allowedApiSettings2$ = _slicedToArray(_allowedApiSettings2[_i2], 2),
          apiSetting = _allowedApiSettings2$[0],
          clientSetting = _allowedApiSettings2$[1];
        var value = settings[apiSetting];
        if (value !== undefined) {
          options[clientSetting] = value;
        }
      }
      if (Object.hasOwn(settings, 'disableCustomQuery')) {
        SettingsManager.disableCustomQuery = !!settings.disableCustomQuery;
      }
      if (Object.hasOwn(settings, 'persistMonomerLibraryUpdates')) {
        SettingsManager.persistMonomerLibraryUpdates = !!settings.persistMonomerLibraryUpdates;
      }
      return this.editor.setOptions(JSON.stringify(options));
    }
  }, {
    key: "getSmiles",
    value: function getSmiles() {
      var isExtended = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('SMILES format is not available in macro mode');
      }
      var format = isExtended ? SupportedFormat.smilesExt : SupportedFormat.smiles;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getExtendedSmiles",
    value: function getExtendedSmiles() {
      return this.getSmiles(true);
    }
  }, {
    key: "getMolfile",
    value: function () {
      var _getMolfile = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(molfileFormat) {
        var _provideEditorInstanc;
        var formatPassed, format, molfile;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.containsReaction()) {
                _context.next = 2;
                break;
              }
              throw Error('The structure cannot be saved as *.MOL due to reaction arrows.');
            case 2:
              formatPassed = molfileFormat === 'v3000' ? SupportedFormat.molV3000 : SupportedFormat.mol;
              format = molfileFormat ? formatPassed : SupportedFormat.molAuto;
              _context.next = 6;
              return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format, (_provideEditorInstanc = provideEditorInstance()) === null || _provideEditorInstanc === void 0 ? void 0 : _provideEditorInstanc.drawingEntitiesManager);
            case 6:
              molfile = _context.sent;
              return _context.abrupt("return", molfile);
            case 8:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getMolfile(_x) {
        return _getMolfile.apply(this, arguments);
      }
      return getMolfile;
    }()
  }, {
    key: "getMol2",
    value: function getMol2() {
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.mol2);
    }
  }, {
    key: "getXYZ",
    value: function getXYZ() {
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.xyz);
    }
  }, {
    key: "getExtendedXYZ",
    value: function getExtendedXYZ() {
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.extendedXYZ);
    }
  }, {
    key: "getQCSchema",
    value: function getQCSchema() {
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.qcSchema);
    }
  }, {
    key: "getIdt",
    value: function getIdt() {
      var _provideEditorInstanc2;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.idt, (_provideEditorInstanc2 = provideEditorInstance()) === null || _provideEditorInstanc2 === void 0 ? void 0 : _provideEditorInstanc2.drawingEntitiesManager);
    }
  }, {
    key: "getAxoLabs",
    value: function getAxoLabs() {
      var _provideEditorInstanc3;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.axoLabs, (_provideEditorInstanc3 = provideEditorInstance()) === null || _provideEditorInstanc3 === void 0 ? void 0 : _provideEditorInstanc3.drawingEntitiesManager);
    }
  }, {
    key: "getRxn",
    value: function () {
      var _getRxn = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var molfileFormat,
          format,
          rxnfile,
          _args2 = arguments;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              molfileFormat = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'v2000';
              if (!window.isPolymerEditorTurnedOn) {
                _context2.next = 3;
                break;
              }
              throw new Error('RXN format is not available in macro mode');
            case 3:
              if (this.containsReaction()) {
                _context2.next = 5;
                break;
              }
              throw Error('The structure cannot be saved as *.RXN: there is no reaction arrows.');
            case 5:
              format = molfileFormat === 'v3000' ? SupportedFormat.rxnV3000 : SupportedFormat.rxn;
              _context2.next = 8;
              return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format);
            case 8:
              rxnfile = _context2.sent;
              return _context2.abrupt("return", rxnfile);
            case 10:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getRxn() {
        return _getRxn.apply(this, arguments);
      }
      return getRxn;
    }()
  }, {
    key: "getKet",
    value: function getKet() {
      var _provideEditorInstanc4, _provideEditorInstanc5, _provideEditorInstanc6, _provideEditorInstanc7, _provideEditorInstanc8, _provideEditorInstanc9;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), ((_provideEditorInstanc4 = (_provideEditorInstanc5 = provideEditorInstance()) === null || _provideEditorInstanc5 === void 0 ? void 0 : _provideEditorInstanc5._type) !== null && _provideEditorInstanc4 !== void 0 ? _provideEditorInstanc4 : EditorType.Micromolecules) === EditorType.Micromolecules ? this.editor.struct() : (_provideEditorInstanc6 = provideEditorInstance()) === null || _provideEditorInstanc6 === void 0 || (_provideEditorInstanc6 = _provideEditorInstanc6.drawingEntitiesManager.micromoleculesHiddenEntities) === null || _provideEditorInstanc6 === void 0 ? void 0 : _provideEditorInstanc6.clone(), SupportedFormat.ket, ((_provideEditorInstanc7 = (_provideEditorInstanc8 = provideEditorInstance()) === null || _provideEditorInstanc8 === void 0 ? void 0 : _provideEditorInstanc8._type) !== null && _provideEditorInstanc7 !== void 0 ? _provideEditorInstanc7 : EditorType.Micromolecules) === EditorType.Micromolecules ? undefined : (_provideEditorInstanc9 = provideEditorInstance()) === null || _provideEditorInstanc9 === void 0 ? void 0 : _provideEditorInstanc9.drawingEntitiesManager, this.editor.selection());
    }
  }, {
    key: "getFasta",
    value: function getFasta() {
      var _provideEditorInstanc0;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.fasta, (_provideEditorInstanc0 = provideEditorInstance()) === null || _provideEditorInstanc0 === void 0 ? void 0 : _provideEditorInstanc0.drawingEntitiesManager);
    }
  }, {
    key: "getSequence",
    value: function () {
      var _getSequence = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3() {
        var _provideEditorInstanc1;
        var format,
          editor,
          indigo,
          ketSerializer,
          serializedKet,
          formatToUse,
          result,
          errorMessage,
          _args3 = arguments;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              format = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : '1-letter';
              if (!(format === '1-letter' || format === '3-letter')) {
                _context3.next = 18;
                break;
              }
              editor = provideEditorInstance();
              indigo = this.indigo;
              ketSerializer = new KetSerializer();
              serializedKet = ketSerializer.serialize(editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(), editor.drawingEntitiesManager);
              formatToUse = format === '1-letter' ? ChemicalMimeType.SEQUENCE : ChemicalMimeType.PeptideSequenceThreeLetter;
              _context3.prev = 7;
              _context3.next = 10;
              return indigo.convert(serializedKet, {
                outputFormat: formatToUse
              });
            case 10:
              result = _context3.sent;
              return _context3.abrupt("return", result.struct);
            case 14:
              _context3.prev = 14;
              _context3.t0 = _context3["catch"](7);
              errorMessage = _context3.t0 instanceof Error ? _context3.t0.message : 'Unknown error occurred';
              throw new Error("Failed to convert structure to ".concat(format, " format: ").concat(errorMessage));
            case 18:
              return _context3.abrupt("return", getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format === '3-letter' ? SupportedFormat.sequence3Letter : SupportedFormat.sequence, (_provideEditorInstanc1 = provideEditorInstance()) === null || _provideEditorInstanc1 === void 0 ? void 0 : _provideEditorInstanc1.drawingEntitiesManager));
            case 19:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[7, 14]]);
      }));
      function getSequence() {
        return _getSequence.apply(this, arguments);
      }
      return getSequence;
    }()
  }, {
    key: "getSmarts",
    value: function getSmarts() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('SMARTS format is not available in macro mode');
      }
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.smarts);
    }
  }, {
    key: "getCml",
    value: function getCml() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CML format is not available in macro mode');
      }
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.cml);
    }
  }, {
    key: "getSdf",
    value: function getSdf() {
      var molfileFormat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'v2000';
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('SDF format is not available in macro mode');
      }
      var format = molfileFormat === 'v2000' ? SupportedFormat.sdf : SupportedFormat.sdfV3000;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getRdf",
    value: function getRdf() {
      var molfileFormat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'v2000';
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('RDF format is not available in macro mode');
      }
      var format = molfileFormat === 'v2000' ? SupportedFormat.rdf : SupportedFormat.rdfV3000;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getCDXml",
    value: function getCDXml() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CDXML format is not available in macro mode');
      }
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.cdxml);
    }
  }, {
    key: "getCDX",
    value: function getCDX() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CDX format is not available in macro mode');
      }
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.cdx);
    }
  }, {
    key: "getInchi",
    value: function getInchi() {
      var withAuxInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), withAuxInfo ? SupportedFormat.inChIAuxInfo : SupportedFormat.inChI);
    }
  }, {
    key: "getInChIKey",
    value: function () {
      var _getInChIKey = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4() {
        var struct;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return getStructure(this.id, _classPrivateFieldGet(this, _formatterFactory), this.editor.struct(), SupportedFormat.ket);
            case 2:
              struct = _context4.sent;
              return _context4.abrupt("return", this.structService.getInChIKey(struct));
            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function getInChIKey() {
        return _getInChIKey.apply(this, arguments);
      }
      return getInChIKey;
    }()
  }, {
    key: "containsReaction",
    value: function containsReaction() {
      var _editor$drawingEntiti;
      var editor = provideEditorInstance();
      return this.editor.struct().hasRxnArrow() || (editor === null || editor === void 0 || (_editor$drawingEntiti = editor.drawingEntitiesManager) === null || _editor$drawingEntiti === void 0 ? void 0 : _editor$drawingEntiti.micromoleculesHiddenEntities.hasRxnArrow());
    }
  }, {
    key: "isQueryStructureSelected",
    value: function isQueryStructureSelected() {
      var structure = this.editor.struct();
      var selection = this.editor.selection();
      if (!selection) {
        return false;
      }
      var hasQueryAtoms = false;
      if (selection.atoms) {
        hasQueryAtoms = selection.atoms.some(function (atomId) {
          var atom = structure.atoms.get(atomId);
          assert(atom);
          var sGroupIds = Array.from(atom.sgs.values());
          var isQueryComponentSGroup = sGroupIds.some(function (sGroupId) {
            var sGroup = structure.sgroups.get(sGroupId);
            assert(sGroup);
            return SGroup.isQuerySGroup(sGroup);
          });
          return atom.isQuery() || isQueryComponentSGroup;
        });
      }
      var hasQueryBonds = false;
      if (selection.bonds) {
        hasQueryBonds = selection.bonds.some(function (bondId) {
          var bond = structure.bonds.get(bondId);
          assert(bond);
          return bond.isQuery();
        });
      }
      return hasQueryAtoms || hasQueryBonds;
    }
  }, {
    key: "setMolecule",
    value: function () {
      var _setMolecule = _asyncToGenerator(_regeneratorRuntime.mark(function _callee6(structStr, options) {
        var _this2 = this;
        var macromoleculesEditor;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              macromoleculesEditor = provideEditorInstance();
              if (!(macromoleculesEditor !== null && macromoleculesEditor !== void 0 && macromoleculesEditor.isSequenceEditInRNABuilderMode)) {
                _context6.next = 3;
                break;
              }
              return _context6.abrupt("return");
            case 3:
              _context6.next = 5;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee5() {
                var _options$position, sourceFormat, preservesCalculationGeometry, struct, preserveCanvasPosition, _ref2, x, y;
                return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) switch (_context5.prev = _context5.next) {
                    case 0:
                      assert(typeof structStr === 'string');
                      if (!window.isPolymerEditorTurnedOn) {
                        _context5.next = 8;
                        break;
                      }
                      deleteAllEntitiesOnCanvas();
                      _context5.next = 5;
                      return parseAndAddMacromoleculesOnCanvas(structStr, _this2.structService);
                    case 5:
                      if ((options === null || options === void 0 ? void 0 : options.needZoom) !== false) {
                        macromoleculesEditor === null || macromoleculesEditor === void 0 || macromoleculesEditor.zoomToStructuresIfNeeded();
                        macromoleculesEditor.mode.initialize();
                      }
                      _context5.next = 21;
                      break;
                    case 8:
                      sourceFormat = identifyStructFormat(structStr);
                      preservesCalculationGeometry = isCalculationGeometryFormat(sourceFormat);
                      _context5.next = 12;
                      return prepareStructToRender(structStr, _this2.structService, _this2);
                    case 12:
                      struct = _context5.sent;
                      preserveCanvasPosition = (options === null || options === void 0 ? void 0 : options.preserveCanvasPosition) === true;
                      if (!preserveCanvasPosition && !preservesCalculationGeometry) {
                        struct.rescale();
                      }
                      _ref2 = (_options$position = options === null || options === void 0 ? void 0 : options.position) !== null && _options$position !== void 0 ? _options$position : {}, x = _ref2.x, y = _ref2.y;
                      _this2.editor.struct(struct, false, x, isNumber(y) ? -y : y);
                      _this2.editor.selection(getSelectionFromStruct(_this2.editor.struct()));
                      _this2.editor.struct().disableInitiallySelected();
                      if (!preserveCanvasPosition) {
                        _this2.editor.zoomAccordingContent(struct);
                      }
                      if (x == null && y == null && !preserveCanvasPosition) {
                        _this2.editor.centerStruct();
                      }
                    case 21:
                    case "end":
                      return _context5.stop();
                  }
                }, _callee5);
              })), this.eventBus);
            case 5:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function setMolecule(_x2, _x3) {
        return _setMolecule.apply(this, arguments);
      }
      return setMolecule;
    }()
  }, {
    key: "setHelm",
    value: function () {
      var _setHelm = _asyncToGenerator(_regeneratorRuntime.mark(function _callee8(helmStr) {
        var _this3 = this;
        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee7() {
                var struct;
                return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                      assert(typeof helmStr === 'string');
                      _context7.next = 3;
                      return prepareStructToRender(helmStr, _this3.structService, _this3);
                    case 3:
                      struct = _context7.sent;
                      struct.rescale();
                      _this3.editor.struct(struct);
                      _this3.editor.zoomAccordingContent(struct);
                      _this3.editor.centerStruct();
                    case 8:
                    case "end":
                      return _context7.stop();
                  }
                }, _callee7);
              })), this.eventBus);
            case 2:
            case "end":
              return _context8.stop();
          }
        }, _callee8, this);
      }));
      function setHelm(_x4) {
        return _setHelm.apply(this, arguments);
      }
      return setHelm;
    }()
  }, {
    key: "addFragment",
    value: function () {
      var _addFragment = _asyncToGenerator(_regeneratorRuntime.mark(function _callee0(structStr, options) {
        var _this4 = this;
        var macromoleculesEditor;
        return _regeneratorRuntime.wrap(function _callee0$(_context0) {
          while (1) switch (_context0.prev = _context0.next) {
            case 0:
              macromoleculesEditor = provideEditorInstance();
              if (!(macromoleculesEditor !== null && macromoleculesEditor !== void 0 && macromoleculesEditor.isSequenceEditInRNABuilderMode)) {
                _context0.next = 3;
                break;
              }
              return _context0.abrupt("return");
            case 3:
              _context0.next = 5;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee9() {
                var isCanvasEmptyBeforeOpenStructure, _options$position2, struct, _ref5, x, y;
                return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) switch (_context9.prev = _context9.next) {
                    case 0:
                      assert(typeof structStr === 'string');
                      if (!window.isPolymerEditorTurnedOn) {
                        _context9.next = 8;
                        break;
                      }
                      isCanvasEmptyBeforeOpenStructure = !macromoleculesEditor.drawingEntitiesManager.hasDrawingEntities;
                      _context9.next = 5;
                      return parseAndAddMacromoleculesOnCanvas(structStr, _this4.structService);
                    case 5:
                      if (isCanvasEmptyBeforeOpenStructure) {
                        macromoleculesEditor === null || macromoleculesEditor === void 0 || macromoleculesEditor.zoomToStructuresIfNeeded();
                      }
                      _context9.next = 16;
                      break;
                    case 8:
                      _context9.next = 10;
                      return prepareStructToRender(structStr, _this4.structService, _this4);
                    case 10:
                      struct = _context9.sent;
                      struct.rescale();
                      _ref5 = (_options$position2 = options === null || options === void 0 ? void 0 : options.position) !== null && _options$position2 !== void 0 ? _options$position2 : {}, x = _ref5.x, y = _ref5.y;
                      _this4.editor.structToAddFragment(struct, x, isNumber(y) ? -y : y);
                      _this4.editor.selection(getSelectionFromStruct(_this4.editor.struct()));
                      _this4.editor.struct().disableInitiallySelected();
                    case 16:
                    case "end":
                      return _context9.stop();
                  }
                }, _callee9);
              })), this.eventBus);
            case 5:
            case "end":
              return _context0.stop();
          }
        }, _callee0, this);
      }));
      function addFragment(_x5, _x6) {
        return _addFragment.apply(this, arguments);
      }
      return addFragment;
    }()
  }, {
    key: "circularLayoutMonomers",
    value: function () {
      var _circularLayoutMonomers = _asyncToGenerator(_regeneratorRuntime.mark(function _callee10() {
        var _this5 = this;
        var editor;
        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              editor = provideEditorInstance();
              _context10.next = 3;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee1() {
                var ketSerializer, serializedKet, result;
                return _regeneratorRuntime.wrap(function _callee1$(_context1) {
                  while (1) switch (_context1.prev = _context1.next) {
                    case 0:
                      if (!window.isPolymerEditorTurnedOn) {
                        _context1.next = 9;
                        break;
                      }
                      ketSerializer = new KetSerializer();
                      serializedKet = ketSerializer.serialize(new Struct(), editor.drawingEntitiesManager, undefined, false, true);
                      _context1.next = 5;
                      return _this5.structService.layout({
                        struct: serializedKet,
                        output_format: ChemicalMimeType.KET
                      }, {
                        'smart-layout': false
                      });
                    case 5:
                      result = _context1.sent;
                      deleteAllEntitiesOnCanvas();
                      _context1.next = 9;
                      return parseAndAddMacromoleculesOnCanvas(result.struct, _this5.structService, true);
                    case 9:
                    case "end":
                      return _context1.stop();
                  }
                }, _callee1);
              })), this.eventBus);
            case 3:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this);
      }));
      function circularLayoutMonomers() {
        return _circularLayoutMonomers.apply(this, arguments);
      }
      return circularLayoutMonomers;
    }()
  }, {
    key: "layout",
    value: function () {
      var _layout = _asyncToGenerator(_regeneratorRuntime.mark(function _callee12() {
        var _this6 = this;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context12.next = 2;
                break;
              }
              throw new Error('Layout is not available in macro mode');
            case 2:
              _context12.next = 4;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee11() {
                var struct, ketSerializer;
                return _regeneratorRuntime.wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      _context11.next = 2;
                      return _this6._indigo.layout(_this6.editor.struct(), _this6.editor.serverSettings);
                    case 2:
                      struct = _context11.sent;
                      ketSerializer = new KetSerializer();
                      _context11.next = 6;
                      return _this6.setMolecule(ketSerializer.serialize(struct));
                    case 6:
                    case "end":
                      return _context11.stop();
                  }
                }, _callee11);
              })), this.eventBus);
            case 4:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this);
      }));
      function layout() {
        return _layout.apply(this, arguments);
      }
      return layout;
    }()
  }, {
    key: "aromatize",
    value: function () {
      var _aromatize = _asyncToGenerator(_regeneratorRuntime.mark(function _callee14() {
        var _this7 = this;
        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context14.next = 2;
                break;
              }
              throw new Error('Aromatize is not available in macro mode');
            case 2:
              _context14.next = 4;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee13() {
                var struct, ketSerializer;
                return _regeneratorRuntime.wrap(function _callee13$(_context13) {
                  while (1) switch (_context13.prev = _context13.next) {
                    case 0:
                      _context13.next = 2;
                      return _this7._indigo.aromatize(_this7.editor.struct());
                    case 2:
                      struct = _context13.sent;
                      ketSerializer = new KetSerializer();
                      _context13.next = 6;
                      return _this7.setMolecule(ketSerializer.serialize(struct), {
                        preserveCanvasPosition: true
                      });
                    case 6:
                    case "end":
                      return _context13.stop();
                  }
                }, _callee13);
              })), this.eventBus);
            case 4:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this);
      }));
      function aromatize() {
        return _aromatize.apply(this, arguments);
      }
      return aromatize;
    }()
  }, {
    key: "dearomatize",
    value: function () {
      var _dearomatize = _asyncToGenerator(_regeneratorRuntime.mark(function _callee16() {
        var _this8 = this;
        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context16.next = 2;
                break;
              }
              throw new Error('Dearomatize is not available in macro mode');
            case 2:
              _context16.next = 4;
              return runAsyncAction(_asyncToGenerator(_regeneratorRuntime.mark(function _callee15() {
                var struct, ketSerializer;
                return _regeneratorRuntime.wrap(function _callee15$(_context15) {
                  while (1) switch (_context15.prev = _context15.next) {
                    case 0:
                      _context15.next = 2;
                      return _this8._indigo.dearomatize(_this8.editor.struct());
                    case 2:
                      struct = _context15.sent;
                      ketSerializer = new KetSerializer();
                      _context15.next = 6;
                      return _this8.setMolecule(ketSerializer.serialize(struct), {
                        preserveCanvasPosition: true
                      });
                    case 6:
                    case "end":
                      return _context15.stop();
                  }
                }, _callee15);
              })), this.eventBus);
            case 4:
            case "end":
              return _context16.stop();
          }
        }, _callee16, this);
      }));
      function dearomatize() {
        return _dearomatize.apply(this, arguments);
      }
      return dearomatize;
    }()
  }, {
    key: "calculate",
    value: function () {
      var _calculate = _asyncToGenerator(_regeneratorRuntime.mark(function _callee17(options) {
        return _regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) switch (_context17.prev = _context17.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context17.next = 2;
                break;
              }
              throw new Error('Calculate is not available in macro mode');
            case 2:
              _context17.next = 4;
              return this._indigo.calculate(this.editor.struct(), options);
            case 4:
              return _context17.abrupt("return", _context17.sent);
            case 5:
            case "end":
              return _context17.stop();
          }
        }, _callee17, this);
      }));
      function calculate(_x7) {
        return _calculate.apply(this, arguments);
      }
      return calculate;
    }()
  }, {
    key: "getCalculationSnapshot",
    value: function getCalculationSnapshot(options) {
      var _options$totalCharge;
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('Calculation snapshots are not available in macro mode');
      }
      var struct = this.editor.struct();
      var importedMetadata = getComputationalFormatMetadata(struct);
      var snapshotOptions = _objectSpread(_objectSpread({}, options), {}, {
        totalCharge: (_options$totalCharge = options === null || options === void 0 ? void 0 : options.totalCharge) !== null && _options$totalCharge !== void 0 ? _options$totalCharge : importedMetadata === null || importedMetadata === void 0 ? void 0 : importedMetadata.molecularCharge,
        multiplicity: (options === null || options === void 0 ? void 0 : options.multiplicity) === undefined ? importedMetadata === null || importedMetadata === void 0 ? void 0 : importedMetadata.molecularMultiplicity : options.multiplicity
      });
      return createCalculationSnapshotV1(struct, snapshotOptions);
    }
  }, {
    key: "checkCalculationReadiness",
    value: function checkCalculationReadiness(options) {
      return validateCalculationReadiness(this.getCalculationSnapshot(options));
    }
  }, {
    key: "setCalculationSettings",
    value: function setCalculationSettings(settings) {
      var _this$editor$notifyDo, _this$editor;
      this.getCalculationSnapshot(settings);
      setComputationalFormatMetadata(this.editor.struct(), {
        molecularCharge: settings.totalCharge,
        molecularMultiplicity: settings.multiplicity
      });
      (_this$editor$notifyDo = (_this$editor = this.editor).notifyDocumentChange) === null || _this$editor$notifyDo === void 0 || _this$editor$notifyDo.call(_this$editor, 'untracked');
    }
  }, {
    key: "setZoom",
    value: function setZoom(value) {
      var editor = provideEditorInstance();
      if (editor && value) editor.zoomTool.zoomTo(value);
    }
  }, {
    key: "setMode",
    value: function setMode(mode) {
      var editor = provideEditorInstance();
      if (editor && mode) {
        editor.events.selectMode.dispatch(ModeTypes[mode]);
        editor.events.layoutModeChange.dispatch(ModeTypes[mode]);
      }
    }
  }, {
    key: "exportImage",
    value: function exportImage(format, params) {
      var editor = provideEditorInstance();
      var fileName = 'ketcher';
      var blobPart;
      if (format === 'svg' && editor !== null && editor !== void 0 && editor.canvas) {
        blobPart = getSvgFromDrawnStructures(editor.canvas, 'file', params === null || params === void 0 ? void 0 : params.margin);
      }
      if (!blobPart) {
        throw new Error('Cannot export image');
      }
      var blob = new Blob([blobPart], {
        type: BlobTypes[format]
      });
      saveAs(blob, "".concat(fileName, ".").concat(format));
    }
  }, {
    key: "recognize",
    value: function recognize(image, version) {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('Recognize is not available in macro mode');
      }
      if (_classPrivateFieldGet(this, _recognitionAdapter)) {
        return _classPrivateFieldGet(this, _recognitionAdapter).recognize({
          image: image,
          version: version
        }).then(function (_ref0) {
          var structure = _ref0.structure;
          return structure;
        });
      }
      return this._indigo.recognize(image, {
        version: version
      });
    }
  }, {
    key: "playMoleculeEditPlan",
    value: function () {
      var _playMoleculeEditPlan = _asyncToGenerator(_regeneratorRuntime.mark(function _callee18(plan) {
        var options,
          executor,
          _args18 = arguments;
        return _regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) switch (_context18.prev = _context18.next) {
            case 0:
              options = _args18.length > 1 && _args18[1] !== undefined ? _args18[1] : {};
              if (!window.isPolymerEditorTurnedOn) {
                _context18.next = 3;
                break;
              }
              throw new Error('Molecule edit plan playback is not available in macro mode');
            case 3:
              if (!this.editor.render.options.viewOnlyMode) {
                _context18.next = 5;
                break;
              }
              throw new Error('Molecule edit plan playback is not available in view-only mode');
            case 5:
              executor = new MoleculeEditPlanExecutor(this.editor, plan, options.positionOffset);
              _context18.next = 8;
              return executor.play(options);
            case 8:
              return _context18.abrupt("return", executor);
            case 9:
            case "end":
              return _context18.stop();
          }
        }, _callee18, this);
      }));
      function playMoleculeEditPlan(_x8) {
        return _playMoleculeEditPlan.apply(this, arguments);
      }
      return playMoleculeEditPlan;
    }()
  }, {
    key: "generateImage",
    value: function () {
      var _generateImage = _asyncToGenerator(_regeneratorRuntime.mark(function _callee19(data) {
        var options,
          meta,
          serverSettings,
          base64,
          byteCharacters,
          byteNumbers,
          i,
          byteArray,
          blob,
          _args19 = arguments;
        return _regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) switch (_context19.prev = _context19.next) {
            case 0:
              options = _args19.length > 1 && _args19[1] !== undefined ? _args19[1] : {
                outputFormat: 'png'
              };
              meta = '';
              _context19.t0 = options.outputFormat;
              _context19.next = _context19.t0 === 'svg' ? 5 : _context19.t0 === 'png' ? 7 : 7;
              break;
            case 5:
              meta = 'image/svg+xml';
              return _context19.abrupt("break", 9);
            case 7:
              meta = 'image/png';
              options.outputFormat = 'png';
            case 9:
              serverSettings = this.editor.serverSettings;
              _context19.next = 12;
              return this.structService.generateImageAsBase64(data, _objectSpread(_objectSpread({}, serverSettings), options));
            case 12:
              base64 = _context19.sent;
              byteCharacters = atob(base64);
              byteNumbers = new Array(byteCharacters.length);
              for (i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              byteArray = new Uint8Array(byteNumbers);
              blob = new Blob([byteArray], {
                type: meta
              });
              return _context19.abrupt("return", blob);
            case 19:
            case "end":
              return _context19.stop();
          }
        }, _callee19, this);
      }));
      function generateImage(_x9) {
        return _generateImage.apply(this, arguments);
      }
      return generateImage;
    }()
  }, {
    key: "reinitializeIndigo",
    value: function reinitializeIndigo(structService) {
      this.structService = structService;
      this._indigo = new Indigo(structService);
    }
  }, {
    key: "sendCustomAction",
    value: function sendCustomAction(name) {
      this.eventBus.emit('CUSTOM_BUTTON_PRESSED', name);
    }
  }, {
    key: "ensureMonomersLibraryDataInKetFormat",
    value: (function () {
      var _ensureMonomersLibraryDataInKetFormat = _asyncToGenerator(_regeneratorRuntime.mark(function _callee20(rawMonomersData, params) {
        var _params$format;
        var serverSettings, rawMonomersDataString, format, dataInKetFormat, convertResult, originalMessage;
        return _regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) switch (_context20.prev = _context20.next) {
            case 0:
              serverSettings = this.editor.serverSettings;
              rawMonomersDataString = ensureString(rawMonomersData);
              format = (_params$format = params === null || params === void 0 ? void 0 : params.format) !== null && _params$format !== void 0 ? _params$format : identifyStructFormat(rawMonomersDataString);
              if (!(format === SupportedFormat.ket)) {
                _context20.next = 7;
                break;
              }
              dataInKetFormat = rawMonomersDataString;
              _context20.next = 18;
              break;
            case 7:
              _context20.prev = 7;
              _context20.next = 10;
              return this.structService.convert({
                struct: rawMonomersDataString,
                input_format: MONOMER_LIBRARY_FORMAT_OPTIONS.inputFormat,
                output_format: MONOMER_LIBRARY_FORMAT_OPTIONS.outputFormat
              }, _objectSpread(_objectSpread({}, serverSettings), {}, {
                outputContentType: MONOMER_LIBRARY_FORMAT_OPTIONS.outputContentType
              }));
            case 10:
              convertResult = _context20.sent;
              dataInKetFormat = convertResult.struct;
              _context20.next = 18;
              break;
            case 14:
              _context20.prev = 14;
              _context20.t0 = _context20["catch"](7);
              originalMessage = _context20.t0 instanceof Error ? _context20.t0.message : String(_context20.t0);
              throw new MonomerLibraryConvertError("Monomer item could not be loaded because of an error: ".concat(originalMessage), _context20.t0 instanceof Error ? _context20.t0 : undefined);
            case 18:
              return _context20.abrupt("return", dataInKetFormat);
            case 19:
            case "end":
              return _context20.stop();
          }
        }, _callee20, this, [[7, 14]]);
      }));
      function ensureMonomersLibraryDataInKetFormat(_x0, _x1) {
        return _ensureMonomersLibraryDataInKetFormat.apply(this, arguments);
      }
      return ensureMonomersLibraryDataInKetFormat;
    }())
  }, {
    key: "ensureMonomersLibraryDataInSdfFormat",
    value: function () {
      var _ensureMonomersLibraryDataInSdfFormat = _asyncToGenerator(_regeneratorRuntime.mark(function _callee21(rawMonomersData, params) {
        var _params$format2;
        var rawMonomersDataString, format, convertResult;
        return _regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              rawMonomersDataString = ensureString(rawMonomersData);
              format = (_params$format2 = params === null || params === void 0 ? void 0 : params.format) !== null && _params$format2 !== void 0 ? _params$format2 : identifyStructFormat(rawMonomersDataString);
              if (!(format === SupportedFormat.sdf || format === SupportedFormat.sdfV3000)) {
                _context21.next = 4;
                break;
              }
              return _context21.abrupt("return", rawMonomersDataString);
            case 4:
              _context21.next = 6;
              return this.indigo.convert(rawMonomersDataString, _objectSpread(_objectSpread({}, MONOMER_LIBRARY_FORMAT_OPTIONS), {}, {
                monomerLibrarySavingMode: 'sdf',
                molfileSavingSkipDate: 'true'
              }));
            case 6:
              convertResult = _context21.sent;
              return _context21.abrupt("return", convertResult.struct);
            case 8:
            case "end":
              return _context21.stop();
          }
        }, _callee21, this);
      }));
      function ensureMonomersLibraryDataInSdfFormat(_x10, _x11) {
        return _ensureMonomersLibraryDataInSdfFormat.apply(this, arguments);
      }
      return ensureMonomersLibraryDataInSdfFormat;
    }()
  }, {
    key: "updateMonomersLibrary",
    value: function () {
      var _updateMonomersLibrary = _asyncToGenerator(_regeneratorRuntime.mark(function _callee22(rawMonomersData, params) {
        var editor, dataInKetFormat, dataInSdfFormat, updateString;
        return _regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) switch (_context22.prev = _context22.next) {
            case 0:
              editor = provideEditorInstance();
              ketcherProvider.getKetcher(this.id);
              if (editor) {
                _context22.next = 4;
                break;
              }
              throw new Error('Updating monomer library in small molecules mode is not allowed, please switch to macromolecules mode');
            case 4:
              _context22.next = 6;
              return this.ensureMonomersLibraryDataInKetFormat(rawMonomersData, params);
            case 6:
              dataInKetFormat = _context22.sent;
              _context22.next = 9;
              return this.ensureMonomersLibraryDataInSdfFormat(rawMonomersData, params);
            case 9:
              dataInSdfFormat = _context22.sent;
              editor.updateMonomersLibrary(dataInKetFormat);
              if (SettingsManager.persistMonomerLibraryUpdates && params !== null && params !== void 0 && params.shouldPersist) {
                updateString = ensureString(dataInKetFormat);
                SettingsManager.addMonomerLibraryUpdate(updateString);
              }
              if (params !== null && params !== void 0 && params.needDispatchLibraryUpdateEvent) {
                this.libraryUpdateEvent.dispatch(dataInSdfFormat);
              }
            case 13:
            case "end":
              return _context22.stop();
          }
        }, _callee22, this);
      }));
      function updateMonomersLibrary(_x12, _x13) {
        return _updateMonomersLibrary.apply(this, arguments);
      }
      return updateMonomersLibrary;
    }()
  }, {
    key: "replaceMonomersLibrary",
    value: function () {
      var _replaceMonomersLibrary = _asyncToGenerator(_regeneratorRuntime.mark(function _callee23(rawMonomersData, params) {
        var editor, dataInKetFormat, dataInSdfFormat;
        return _regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) switch (_context23.prev = _context23.next) {
            case 0:
              editor = provideEditorInstance();
              ketcherProvider.getKetcher(this.id);
              if (editor) {
                _context23.next = 4;
                break;
              }
              throw new Error('Updating monomer library in small molecules mode is not allowed, please switch to macromolecules mode');
            case 4:
              _context23.next = 6;
              return this.ensureMonomersLibraryDataInKetFormat(rawMonomersData, params);
            case 6:
              dataInKetFormat = _context23.sent;
              _context23.next = 9;
              return this.ensureMonomersLibraryDataInSdfFormat(rawMonomersData, params);
            case 9:
              dataInSdfFormat = _context23.sent;
              editor.clearMonomersLibrary();
              editor.updateMonomersLibrary(dataInKetFormat);
              if (params !== null && params !== void 0 && params.needDispatchLibraryUpdateEvent) {
                this.libraryUpdateEvent.dispatch(dataInSdfFormat);
              }
              editor.events.updateMonomersLibrary.dispatch();
            case 14:
            case "end":
              return _context23.stop();
          }
        }, _callee23, this);
      }));
      function replaceMonomersLibrary(_x14, _x15) {
        return _replaceMonomersLibrary.apply(this, arguments);
      }
      return replaceMonomersLibrary;
    }()
  }, {
    key: "switchToMacromoleculesMode",
    value: function switchToMacromoleculesMode() {
      var editor = provideEditorInstance();
      if (!editor) {
        KetcherLogger.error('Editor instance is not available');
        return;
      }
      editor.events.switchToMacromoleculesMode.dispatch();
    }
  }, {
    key: "switchToMoleculesMode",
    value: function switchToMoleculesMode() {
      var editor = provideEditorInstance();
      if (!editor) {
        KetcherLogger.error('Editor instance is not available');
        return;
      }
      editor.events.switchToMoleculesMode.dispatch();
    }
  }]);
  return Ketcher;
}();
function _onSettingsChanged2(settings) {
  KetcherLogger.info('Settings changed', settings);
}

export { Ketcher };
//# sourceMappingURL=ketcher.modern.js.map
