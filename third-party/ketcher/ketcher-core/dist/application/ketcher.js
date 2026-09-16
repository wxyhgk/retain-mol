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

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var index = require('../node_modules/subscription/index.js');
var fileSaver = require('file-saver');
require('./formatters/supportedFormatProperties.js');
require('./formatters/formatProperties.js');
var structFormatter_types = require('./formatters/structFormatter.types.js');
require('./formatters/formatterFactory.js');
require('./formatters/mol2Formatter.js');
require('./formatters/xyzFormatter.js');
require('./formatters/qcSchemaFormatter.js');
var computationalFormatMetadata = require('./formatters/computationalFormatMetadata.js');
var identifyStructFormat = require('./formatters/identifyStructFormat.js');
require('./formatters/types/ket.js');
require('../domain/entities/vec2.js');
var _ = require('lodash');
require('./editor/operations/atom/index.js');
require('./editor/operations/bond/index.js');
require('./editor/operations/CanvasLoad.js');
require('./editor/operations/descriptors.js');
require('./editor/operations/EnhancedFlagMove.js');
require('./editor/operations/EnhancedFlagClear.js');
require('./editor/operations/ifThen.js');
require('./editor/operations/fragment.js');
require('./editor/operations/fragmentStereoAtom.js');
require('./editor/operations/FragmentStereoFlag.js');
require('./editor/operations/calcimplicitH.js');
require('./editor/operations/LoopMove.js');
require('./editor/operations/OperationType.js');
require('./editor/operations/image/imageMove.js');
require('./editor/operations/image/imageResize.js');
require('./editor/operations/image/imageUpsertDelete.js');
require('./editor/operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('./editor/operations/multitailArrow/multitailArrowMove.js');
require('./editor/operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('./editor/operations/multitailArrow/multitailArrowResizeTailHead.js');
require('./editor/operations/multitailArrow/multitailArrowUpsertDelete.js');
require('./editor/operations/rgroup/RGroupAttr.js');
require('./editor/operations/rgroup/RGroupFragment.js');
require('./editor/operations/rgroupAttachmentPoint/index.js');
require('./editor/operations/rxn/index.js');
require('./editor/operations/simpleObject.js');
require('./editor/operations/sgroup/index.js');
require('./editor/operations/Text/TextCreateDelete.js');
require('./editor/operations/Text/TextUpdate.js');
require('./editor/operations/Text/TextMove.js');
require('./editor/operations/monomer/AttachmentPointHoverOperation.js');
require('./editor/operations/monomer/FlipMonomerOperation.js');
require('./editor/operations/monomer/MonomerAddOperation.js');
require('./editor/operations/monomer/MonomerDeleteOperation.js');
require('../domain/entities/AmbiguousMonomer.js');
require('../domain/helpers/monomers.js');
require('./render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../domain/entities/atom.js');
require('../domain/entities/atomList.js');
require('../domain/entities/bond.js');
require('../domain/entities/fixedPrecision.js');
require('../domain/entities/fragment.js');
require('../domain/entities/functionalGroup.js');
require('../domain/entities/halfBond.js');
require('../domain/entities/loop.js');
require('../domain/entities/rgroup.js');
require('../domain/entities/rgroupAttachmentPoint.js');
require('../domain/entities/rxnArrow.js');
require('../domain/entities/rxnPlus.js');
var sgroup = require('../domain/entities/sgroup.js');
require('../domain/entities/sgroupForest.js');
require('../domain/entities/simpleObject.js');
var struct = require('../domain/entities/struct.js');
require('../domain/entities/text.js');
require('../domain/entities/pile.js');
require('../domain/entities/box2Abs.js');
require('../domain/entities/pool.js');
require('../domain/entities/image.js');
require('../domain/entities/multitailArrow.js');
require('../domain/entities/highlight.js');
require('../domain/entities/sGroupAttachmentPoint.js');
require('../domain/entities/monomerMicromolecule.js');
require('../domain/entities/Peptide.js');
require('../domain/entities/BaseMonomer.js');
require('../domain/entities/Chem.js');
require('../domain/entities/Sugar.js');
require('../domain/entities/RNABase.js');
require('../domain/entities/Phosphate.js');
require('../domain/entities/Axis.js');
require('../domain/entities/Nucleoside.js');
require('../domain/entities/Nucleotide.js');
require('../domain/entities/monomer-chains/types.js');
require('../domain/entities/monomer-chains/Chain.js');
require('../domain/entities/monomer-chains/ChainsCollection.js');
require('../domain/entities/MonomerSequenceNode.js');
require('../domain/entities/EmptySequenceNode.js');
require('../domain/entities/LinkerSequenceNode.js');
require('../domain/entities/UnresolvedMonomer.js');
require('../domain/entities/UnsplitNucleotide.js');
require('../domain/entities/PolymerBond.js');
require('../domain/entities/MonomerToAtomBond.js');
require('../domain/entities/HydrogenBond.js');
require('../domain/entities/SGroupDrawingEntity.js');
require('../domain/entities/BackBoneSequenceNode.js');
require('../domain/entities/Command.js');
var runAsyncAction = require('../utilities/runAsyncAction.js');
var KetcherLogger = require('../utilities/KetcherLogger.js');
var SettingsManager = require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
var getSvgFromDrawnStructures = require('../utilities/getSvgFromDrawnStructures.js');
var ensureString = require('../utilities/ensureString.js');
var assert = require('../utilities/assert.js');
require('../domain/entities/CoreAtom.js');
require('../domain/entities/CoreStereoFlag.js');
var calculationSnapshot = require('../domain/entities/calculation/calculationSnapshot.js');
require('../domain/constants/monomers.js');
require('./render/renderers/ChemRenderer.js');
require('./render/renderers/PeptideRenderer.js');
require('./render/renderers/PhosphateRenderer.js');
require('./render/renderers/RNABaseRenderer.js');
require('./render/renderers/SugarRenderer.js');
require('./render/renderers/UnresolvedMonomerRenderer.js');
require('./render/renderers/UnsplitNucleotideRenderer.js');
require('./editor/operations/monomer/MonomerHoverOperation.js');
require('./editor/operations/monomer/MonomerItemModifyOperation.js');
require('./editor/operations/monomer/MonomerMoveOperation.js');
require('./editor/operations/monomer/RotateMonomerOperation.js');
require('./editor/operations/monomer/ShiftMonomerOperation.js');
require('./editor/operations/modes/index.js');
require('./editor/operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('./editor/operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('./editor/operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('./editor/operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('./editor/operations/monomerCreation/ReassignLeavingAtomOperation.js');
require('./editor/actions/action.js');
require('./editor/actions/actionTransaction.js');
var utils = require('./editor/actions/utils.js');
require('../domain/helpers/functionalGroupsProvider.js');
require('../domain/helpers/saltsAndSolventsProvider.js');
require('../domain/constants/generics.js');
require('../domain/helpers/attachmentPointCalculations.js');
require('lodash/fp');
require('./editor/operations/sgroup/sgroupAttachmentPoints.js');
require('./editor/shared/constants.js');
require('./editor/actions/bond.js');
require('../domain/constants/elements.js');
require('../domain/constants/element.types.js');
require('../domain/constants/chains.js');
require('./editor/operations/highlight.js');
require('./editor/shared/coordinates.js');
var editor_types = require('./editor/editor.types.js');
var Editor = require('./editor/Editor.js');
var editorSingleton = require('./editor/editorSingleton.js');
require('./editor/EditorHistory.js');
require('./editor/modes/FlexMode.js');
require('./editor/modes/SequenceMode.js');
require('./editor/modes/SnakeMode.js');
require('./editor/editorEvents.js');
require('./editor/tools/index.js');
require('./editor/MacromoleculesConverter.js');
var MoleculeEditPlanExecutor = require('./editor/MoleculeEditPlanExecutor.js');
require('./editor/tools/types.js');
require('./editor/previewPosition.js');
var indigo = require('./indigo.js');
var ketSerializer = require('../domain/serializers/ket/ketSerializer.js');
var events = require('events');
var ketcherProvider = require('./ketcherProvider.js');
var utils$1 = require('./utils.js');
var ketcher_types = require('./ketcher.types.js');
var structService_types = require('../domain/services/struct/structService.types.js');
var getStructure = require('./getStructure.js');
var readiness = require('../domain/services/calculation/readiness.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateMethodGet(s, a, r) { return _assertClassBrand(a, s), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var allowedApiSettings = [['general.dearomatize-on-load', 'dearomatize-on-load'], ['ignoreChiralFlag', 'ignoreChiralFlag'], ['disableQueryElements', 'disableQueryElements'], ['bondThickness', 'bondThickness']];
var MONOMER_LIBRARY_FORMAT_OPTIONS = {
  inputFormat: structService_types.ChemicalMimeType.MonomerLibrary,
  outputFormat: structService_types.ChemicalMimeType.MonomerLibrary,
  outputContentType: structService_types.ChemicalMimeType.MonomerLibrary
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
    _classCallCheck__default["default"](this, Ketcher);
    _classPrivateMethodInitSpec(this, _onSettingsChanged);
    _defineProperty__default["default"](this, "_id", void 0);
    _defineProperty__default["default"](this, "logging", void 0);
    _defineProperty__default["default"](this, "structService", void 0);
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
    _defineProperty__default["default"](this, "_indigo", void 0);
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
    _defineProperty__default["default"](this, "changeEvent", void 0);
    _defineProperty__default["default"](this, "libraryUpdateEvent", void 0);
    assert.assert(structService != null);
    assert.assert(formatterFactory != null);
    this._id = _.uniqueId();
    this.changeEvent = new index.Subscription();
    this.libraryUpdateEvent = new index.Subscription();
    this.structService = structService;
    _classPrivateFieldSet__default["default"](this, _formatterFactory, formatterFactory);
    _classPrivateFieldSet__default["default"](this, _settingsService, settingsService);
    this._indigo = new indigo.Indigo(this.structService);
    _classPrivateFieldSet__default["default"](this, _eventBus, new events.EventEmitter());
    this.logging = {
      enabled: false,
      level: KetcherLogger.LogLevel.ERROR,
      showTrace: false
    };
    if (_classPrivateFieldGet__default["default"](this, _settingsService)) {
      _classPrivateFieldGet__default["default"](this, _settingsService).subscribe(function (newSettings) {
        _classPrivateMethodGet(_this, _onSettingsChanged, _onSettingsChanged2).call(_this, newSettings);
      });
    }
  }
  _createClass__default["default"](Ketcher, [{
    key: "editor",
    get: function get() {
      if (!_classPrivateFieldGet__default["default"](this, _editor)) {
        throw new Error('Editor is not initialized yet. It should be assigned right after Ketcher creation.');
      }
      return _classPrivateFieldGet__default["default"](this, _editor);
    }
  }, {
    key: "eventBus",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _eventBus);
    }
  }, {
    key: "molecule",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _moleculeReader);
    }
  }, {
    key: "moleculeCanvasUnavailableReason",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _moleculeCanvasUnavailableReason);
    }
  }, {
    key: "setMoleculeCanvasUnavailableReason",
    value: function setMoleculeCanvasUnavailableReason(reason) {
      var _classPrivateFieldGet2, _classPrivateFieldGet3;
      if (reason === _classPrivateFieldGet__default["default"](this, _moleculeCanvasUnavailableReason)) return;
      _classPrivateFieldSet__default["default"](this, _moleculeCanvasUnavailableReason, reason);
      (_classPrivateFieldGet2 = _classPrivateFieldGet__default["default"](this, _editor)) === null || _classPrivateFieldGet2 === void 0 || (_classPrivateFieldGet3 = _classPrivateFieldGet2.notifyDocumentChange) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.call(_classPrivateFieldGet2, 'mode');
    }
  }, {
    key: "setMoleculeReader",
    value: function setMoleculeReader(reader, dispose) {
      if (reader === _classPrivateFieldGet__default["default"](this, _moleculeReader)) return;
      var previousDispose = _classPrivateFieldGet__default["default"](this, _disposeMoleculeReader);
      _classPrivateFieldSet__default["default"](this, _moleculeReader, reader);
      _classPrivateFieldSet__default["default"](this, _disposeMoleculeReader, dispose);
      previousDispose === null || previousDispose === void 0 || previousDispose();
    }
  }, {
    key: "settingsService",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _settingsService);
    }
  }, {
    key: "id",
    get: function get() {
      return this._id;
    }
  }, {
    key: "formatterFactory",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _formatterFactory);
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
        var _allowedApiSettings$_ = _slicedToArray__default["default"](_allowedApiSettings[_i], 2),
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
      if (_classPrivateFieldGet__default["default"](this, _editor) !== editor) this.setMoleculeReader(null);
      _classPrivateFieldSet__default["default"](this, _editor, editor);
    }
  }, {
    key: "setRecognitionAdapter",
    value: function setRecognitionAdapter(adapter) {
      _classPrivateFieldSet__default["default"](this, _recognitionAdapter, adapter !== null && adapter !== void 0 ? adapter : undefined);
    }
  }, {
    key: "setSettings",
    value: function setSettings(settings) {
      if (!settings) {
        throw new Error('Please provide settings');
      }
      var options = {};
      for (var _i2 = 0, _allowedApiSettings2 = allowedApiSettings; _i2 < _allowedApiSettings2.length; _i2++) {
        var _allowedApiSettings2$ = _slicedToArray__default["default"](_allowedApiSettings2[_i2], 2),
          apiSetting = _allowedApiSettings2$[0],
          clientSetting = _allowedApiSettings2$[1];
        var value = settings[apiSetting];
        if (value !== undefined) {
          options[clientSetting] = value;
        }
      }
      if (Object.hasOwn(settings, 'disableCustomQuery')) {
        SettingsManager.SettingsManager.disableCustomQuery = !!settings.disableCustomQuery;
      }
      if (Object.hasOwn(settings, 'persistMonomerLibraryUpdates')) {
        SettingsManager.SettingsManager.persistMonomerLibraryUpdates = !!settings.persistMonomerLibraryUpdates;
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
      var format = isExtended ? structFormatter_types.SupportedFormat.smilesExt : structFormatter_types.SupportedFormat.smiles;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getExtendedSmiles",
    value: function getExtendedSmiles() {
      return this.getSmiles(true);
    }
  }, {
    key: "getMolfile",
    value: function () {
      var _getMolfile = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(molfileFormat) {
        var _provideEditorInstanc;
        var formatPassed, format, molfile;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.containsReaction()) {
                _context.next = 2;
                break;
              }
              throw Error('The structure cannot be saved as *.MOL due to reaction arrows.');
            case 2:
              formatPassed = molfileFormat === 'v3000' ? structFormatter_types.SupportedFormat.molV3000 : structFormatter_types.SupportedFormat.mol;
              format = molfileFormat ? formatPassed : structFormatter_types.SupportedFormat.molAuto;
              _context.next = 6;
              return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format, (_provideEditorInstanc = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc === void 0 ? void 0 : _provideEditorInstanc.drawingEntitiesManager);
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
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.mol2);
    }
  }, {
    key: "getXYZ",
    value: function getXYZ() {
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.xyz);
    }
  }, {
    key: "getExtendedXYZ",
    value: function getExtendedXYZ() {
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.extendedXYZ);
    }
  }, {
    key: "getQCSchema",
    value: function getQCSchema() {
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.qcSchema);
    }
  }, {
    key: "getIdt",
    value: function getIdt() {
      var _provideEditorInstanc2;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.idt, (_provideEditorInstanc2 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc2 === void 0 ? void 0 : _provideEditorInstanc2.drawingEntitiesManager);
    }
  }, {
    key: "getAxoLabs",
    value: function getAxoLabs() {
      var _provideEditorInstanc3;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.axoLabs, (_provideEditorInstanc3 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc3 === void 0 ? void 0 : _provideEditorInstanc3.drawingEntitiesManager);
    }
  }, {
    key: "getRxn",
    value: function () {
      var _getRxn = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2() {
        var molfileFormat,
          format,
          rxnfile,
          _args2 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
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
              format = molfileFormat === 'v3000' ? structFormatter_types.SupportedFormat.rxnV3000 : structFormatter_types.SupportedFormat.rxn;
              _context2.next = 8;
              return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format);
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
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), ((_provideEditorInstanc4 = (_provideEditorInstanc5 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc5 === void 0 ? void 0 : _provideEditorInstanc5._type) !== null && _provideEditorInstanc4 !== void 0 ? _provideEditorInstanc4 : editor_types.EditorType.Micromolecules) === editor_types.EditorType.Micromolecules ? this.editor.struct() : (_provideEditorInstanc6 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc6 === void 0 || (_provideEditorInstanc6 = _provideEditorInstanc6.drawingEntitiesManager.micromoleculesHiddenEntities) === null || _provideEditorInstanc6 === void 0 ? void 0 : _provideEditorInstanc6.clone(), structFormatter_types.SupportedFormat.ket, ((_provideEditorInstanc7 = (_provideEditorInstanc8 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc8 === void 0 ? void 0 : _provideEditorInstanc8._type) !== null && _provideEditorInstanc7 !== void 0 ? _provideEditorInstanc7 : editor_types.EditorType.Micromolecules) === editor_types.EditorType.Micromolecules ? undefined : (_provideEditorInstanc9 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc9 === void 0 ? void 0 : _provideEditorInstanc9.drawingEntitiesManager, this.editor.selection());
    }
  }, {
    key: "getFasta",
    value: function getFasta() {
      var _provideEditorInstanc0;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.fasta, (_provideEditorInstanc0 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc0 === void 0 ? void 0 : _provideEditorInstanc0.drawingEntitiesManager);
    }
  }, {
    key: "getSequence",
    value: function () {
      var _getSequence = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3() {
        var _provideEditorInstanc1;
        var format,
          editor,
          indigo,
          ketSerializer$1,
          serializedKet,
          formatToUse,
          result,
          errorMessage,
          _args3 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              format = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : '1-letter';
              if (!(format === '1-letter' || format === '3-letter')) {
                _context3.next = 18;
                break;
              }
              editor = editorSingleton.provideEditorInstance();
              indigo = this.indigo;
              ketSerializer$1 = new ketSerializer.KetSerializer();
              serializedKet = ketSerializer$1.serialize(editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(), editor.drawingEntitiesManager);
              formatToUse = format === '1-letter' ? structService_types.ChemicalMimeType.SEQUENCE : structService_types.ChemicalMimeType.PeptideSequenceThreeLetter;
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
              return _context3.abrupt("return", getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format === '3-letter' ? structFormatter_types.SupportedFormat.sequence3Letter : structFormatter_types.SupportedFormat.sequence, (_provideEditorInstanc1 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc1 === void 0 ? void 0 : _provideEditorInstanc1.drawingEntitiesManager));
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
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.smarts);
    }
  }, {
    key: "getCml",
    value: function getCml() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CML format is not available in macro mode');
      }
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.cml);
    }
  }, {
    key: "getSdf",
    value: function getSdf() {
      var molfileFormat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'v2000';
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('SDF format is not available in macro mode');
      }
      var format = molfileFormat === 'v2000' ? structFormatter_types.SupportedFormat.sdf : structFormatter_types.SupportedFormat.sdfV3000;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getRdf",
    value: function getRdf() {
      var molfileFormat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'v2000';
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('RDF format is not available in macro mode');
      }
      var format = molfileFormat === 'v2000' ? structFormatter_types.SupportedFormat.rdf : structFormatter_types.SupportedFormat.rdfV3000;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), format);
    }
  }, {
    key: "getCDXml",
    value: function getCDXml() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CDXML format is not available in macro mode');
      }
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.cdxml);
    }
  }, {
    key: "getCDX",
    value: function getCDX() {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('CDX format is not available in macro mode');
      }
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.cdx);
    }
  }, {
    key: "getInchi",
    value: function getInchi() {
      var withAuxInfo = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), withAuxInfo ? structFormatter_types.SupportedFormat.inChIAuxInfo : structFormatter_types.SupportedFormat.inChI);
    }
  }, {
    key: "getInChIKey",
    value: function () {
      var _getInChIKey = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee4() {
        var struct;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return getStructure.getStructure(this.id, _classPrivateFieldGet__default["default"](this, _formatterFactory), this.editor.struct(), structFormatter_types.SupportedFormat.ket);
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
      var editor = editorSingleton.provideEditorInstance();
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
          assert.assert(atom);
          var sGroupIds = Array.from(atom.sgs.values());
          var isQueryComponentSGroup = sGroupIds.some(function (sGroupId) {
            var sGroup = structure.sgroups.get(sGroupId);
            assert.assert(sGroup);
            return sgroup.SGroup.isQuerySGroup(sGroup);
          });
          return atom.isQuery() || isQueryComponentSGroup;
        });
      }
      var hasQueryBonds = false;
      if (selection.bonds) {
        hasQueryBonds = selection.bonds.some(function (bondId) {
          var bond = structure.bonds.get(bondId);
          assert.assert(bond);
          return bond.isQuery();
        });
      }
      return hasQueryAtoms || hasQueryBonds;
    }
  }, {
    key: "setMolecule",
    value: function () {
      var _setMolecule = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee6(structStr, options) {
        var _this2 = this;
        var macromoleculesEditor;
        return _regeneratorRuntime__default["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              macromoleculesEditor = editorSingleton.provideEditorInstance();
              if (!(macromoleculesEditor !== null && macromoleculesEditor !== void 0 && macromoleculesEditor.isSequenceEditInRNABuilderMode)) {
                _context6.next = 3;
                break;
              }
              return _context6.abrupt("return");
            case 3:
              _context6.next = 5;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee5() {
                var _options$position, sourceFormat, preservesCalculationGeometry, struct, preserveCanvasPosition, _ref2, x, y;
                return _regeneratorRuntime__default["default"].wrap(function _callee5$(_context5) {
                  while (1) switch (_context5.prev = _context5.next) {
                    case 0:
                      assert.assert(typeof structStr === 'string');
                      if (!window.isPolymerEditorTurnedOn) {
                        _context5.next = 8;
                        break;
                      }
                      utils$1.deleteAllEntitiesOnCanvas();
                      _context5.next = 5;
                      return utils$1.parseAndAddMacromoleculesOnCanvas(structStr, _this2.structService);
                    case 5:
                      if ((options === null || options === void 0 ? void 0 : options.needZoom) !== false) {
                        macromoleculesEditor === null || macromoleculesEditor === void 0 || macromoleculesEditor.zoomToStructuresIfNeeded();
                        macromoleculesEditor.mode.initialize();
                      }
                      _context5.next = 21;
                      break;
                    case 8:
                      sourceFormat = identifyStructFormat.identifyStructFormat(structStr);
                      preservesCalculationGeometry = structFormatter_types.isCalculationGeometryFormat(sourceFormat);
                      _context5.next = 12;
                      return utils$1.prepareStructToRender(structStr, _this2.structService, _this2);
                    case 12:
                      struct = _context5.sent;
                      preserveCanvasPosition = (options === null || options === void 0 ? void 0 : options.preserveCanvasPosition) === true;
                      if (!preserveCanvasPosition && !preservesCalculationGeometry) {
                        struct.rescale();
                      }
                      _ref2 = (_options$position = options === null || options === void 0 ? void 0 : options.position) !== null && _options$position !== void 0 ? _options$position : {}, x = _ref2.x, y = _ref2.y;
                      _this2.editor.struct(struct, false, x, _.isNumber(y) ? -y : y);
                      _this2.editor.selection(utils.getSelectionFromStruct(_this2.editor.struct()));
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
      var _setHelm = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee8(helmStr) {
        var _this3 = this;
        return _regeneratorRuntime__default["default"].wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee7() {
                var struct;
                return _regeneratorRuntime__default["default"].wrap(function _callee7$(_context7) {
                  while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                      assert.assert(typeof helmStr === 'string');
                      _context7.next = 3;
                      return utils$1.prepareStructToRender(helmStr, _this3.structService, _this3);
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
      var _addFragment = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee0(structStr, options) {
        var _this4 = this;
        var macromoleculesEditor;
        return _regeneratorRuntime__default["default"].wrap(function _callee0$(_context0) {
          while (1) switch (_context0.prev = _context0.next) {
            case 0:
              macromoleculesEditor = editorSingleton.provideEditorInstance();
              if (!(macromoleculesEditor !== null && macromoleculesEditor !== void 0 && macromoleculesEditor.isSequenceEditInRNABuilderMode)) {
                _context0.next = 3;
                break;
              }
              return _context0.abrupt("return");
            case 3:
              _context0.next = 5;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee9() {
                var isCanvasEmptyBeforeOpenStructure, _options$position2, struct, _ref5, x, y;
                return _regeneratorRuntime__default["default"].wrap(function _callee9$(_context9) {
                  while (1) switch (_context9.prev = _context9.next) {
                    case 0:
                      assert.assert(typeof structStr === 'string');
                      if (!window.isPolymerEditorTurnedOn) {
                        _context9.next = 8;
                        break;
                      }
                      isCanvasEmptyBeforeOpenStructure = !macromoleculesEditor.drawingEntitiesManager.hasDrawingEntities;
                      _context9.next = 5;
                      return utils$1.parseAndAddMacromoleculesOnCanvas(structStr, _this4.structService);
                    case 5:
                      if (isCanvasEmptyBeforeOpenStructure) {
                        macromoleculesEditor === null || macromoleculesEditor === void 0 || macromoleculesEditor.zoomToStructuresIfNeeded();
                      }
                      _context9.next = 16;
                      break;
                    case 8:
                      _context9.next = 10;
                      return utils$1.prepareStructToRender(structStr, _this4.structService, _this4);
                    case 10:
                      struct = _context9.sent;
                      struct.rescale();
                      _ref5 = (_options$position2 = options === null || options === void 0 ? void 0 : options.position) !== null && _options$position2 !== void 0 ? _options$position2 : {}, x = _ref5.x, y = _ref5.y;
                      _this4.editor.structToAddFragment(struct, x, _.isNumber(y) ? -y : y);
                      _this4.editor.selection(utils.getSelectionFromStruct(_this4.editor.struct()));
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
      var _circularLayoutMonomers = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee10() {
        var _this5 = this;
        var editor;
        return _regeneratorRuntime__default["default"].wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              editor = editorSingleton.provideEditorInstance();
              _context10.next = 3;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee1() {
                var ketSerializer$1, serializedKet, result;
                return _regeneratorRuntime__default["default"].wrap(function _callee1$(_context1) {
                  while (1) switch (_context1.prev = _context1.next) {
                    case 0:
                      if (!window.isPolymerEditorTurnedOn) {
                        _context1.next = 9;
                        break;
                      }
                      ketSerializer$1 = new ketSerializer.KetSerializer();
                      serializedKet = ketSerializer$1.serialize(new struct.Struct(), editor.drawingEntitiesManager, undefined, false, true);
                      _context1.next = 5;
                      return _this5.structService.layout({
                        struct: serializedKet,
                        output_format: structService_types.ChemicalMimeType.KET
                      }, {
                        'smart-layout': false
                      });
                    case 5:
                      result = _context1.sent;
                      utils$1.deleteAllEntitiesOnCanvas();
                      _context1.next = 9;
                      return utils$1.parseAndAddMacromoleculesOnCanvas(result.struct, _this5.structService, true);
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
      var _layout = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee12() {
        var _this6 = this;
        return _regeneratorRuntime__default["default"].wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context12.next = 2;
                break;
              }
              throw new Error('Layout is not available in macro mode');
            case 2:
              _context12.next = 4;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee11() {
                var struct, ketSerializer$1;
                return _regeneratorRuntime__default["default"].wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      _context11.next = 2;
                      return _this6._indigo.layout(_this6.editor.struct(), _this6.editor.serverSettings);
                    case 2:
                      struct = _context11.sent;
                      ketSerializer$1 = new ketSerializer.KetSerializer();
                      _context11.next = 6;
                      return _this6.setMolecule(ketSerializer$1.serialize(struct));
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
      var _aromatize = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee14() {
        var _this7 = this;
        return _regeneratorRuntime__default["default"].wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context14.next = 2;
                break;
              }
              throw new Error('Aromatize is not available in macro mode');
            case 2:
              _context14.next = 4;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee13() {
                var struct, ketSerializer$1;
                return _regeneratorRuntime__default["default"].wrap(function _callee13$(_context13) {
                  while (1) switch (_context13.prev = _context13.next) {
                    case 0:
                      _context13.next = 2;
                      return _this7._indigo.aromatize(_this7.editor.struct());
                    case 2:
                      struct = _context13.sent;
                      ketSerializer$1 = new ketSerializer.KetSerializer();
                      _context13.next = 6;
                      return _this7.setMolecule(ketSerializer$1.serialize(struct), {
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
      var _dearomatize = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee16() {
        var _this8 = this;
        return _regeneratorRuntime__default["default"].wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              if (!window.isPolymerEditorTurnedOn) {
                _context16.next = 2;
                break;
              }
              throw new Error('Dearomatize is not available in macro mode');
            case 2:
              _context16.next = 4;
              return runAsyncAction.runAsyncAction(_asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee15() {
                var struct, ketSerializer$1;
                return _regeneratorRuntime__default["default"].wrap(function _callee15$(_context15) {
                  while (1) switch (_context15.prev = _context15.next) {
                    case 0:
                      _context15.next = 2;
                      return _this8._indigo.dearomatize(_this8.editor.struct());
                    case 2:
                      struct = _context15.sent;
                      ketSerializer$1 = new ketSerializer.KetSerializer();
                      _context15.next = 6;
                      return _this8.setMolecule(ketSerializer$1.serialize(struct), {
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
      var _calculate = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee17(options) {
        return _regeneratorRuntime__default["default"].wrap(function _callee17$(_context17) {
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
      var importedMetadata = computationalFormatMetadata.getComputationalFormatMetadata(struct);
      var snapshotOptions = _objectSpread(_objectSpread({}, options), {}, {
        totalCharge: (_options$totalCharge = options === null || options === void 0 ? void 0 : options.totalCharge) !== null && _options$totalCharge !== void 0 ? _options$totalCharge : importedMetadata === null || importedMetadata === void 0 ? void 0 : importedMetadata.molecularCharge,
        multiplicity: (options === null || options === void 0 ? void 0 : options.multiplicity) === undefined ? importedMetadata === null || importedMetadata === void 0 ? void 0 : importedMetadata.molecularMultiplicity : options.multiplicity
      });
      return calculationSnapshot.createCalculationSnapshotV1(struct, snapshotOptions);
    }
  }, {
    key: "checkCalculationReadiness",
    value: function checkCalculationReadiness(options) {
      return readiness.validateCalculationReadiness(this.getCalculationSnapshot(options));
    }
  }, {
    key: "setCalculationSettings",
    value: function setCalculationSettings(settings) {
      var _this$editor$notifyDo, _this$editor;
      this.getCalculationSnapshot(settings);
      computationalFormatMetadata.setComputationalFormatMetadata(this.editor.struct(), {
        molecularCharge: settings.totalCharge,
        molecularMultiplicity: settings.multiplicity
      });
      (_this$editor$notifyDo = (_this$editor = this.editor).notifyDocumentChange) === null || _this$editor$notifyDo === void 0 || _this$editor$notifyDo.call(_this$editor, 'untracked');
    }
  }, {
    key: "setZoom",
    value: function setZoom(value) {
      var editor = editorSingleton.provideEditorInstance();
      if (editor && value) editor.zoomTool.zoomTo(value);
    }
  }, {
    key: "setMode",
    value: function setMode(mode) {
      var editor = editorSingleton.provideEditorInstance();
      if (editor && mode) {
        editor.events.selectMode.dispatch(ketcher_types.ModeTypes[mode]);
        editor.events.layoutModeChange.dispatch(ketcher_types.ModeTypes[mode]);
      }
    }
  }, {
    key: "exportImage",
    value: function exportImage(format, params) {
      var editor = editorSingleton.provideEditorInstance();
      var fileName = 'ketcher';
      var blobPart;
      if (format === 'svg' && editor !== null && editor !== void 0 && editor.canvas) {
        blobPart = getSvgFromDrawnStructures.getSvgFromDrawnStructures(editor.canvas, 'file', params === null || params === void 0 ? void 0 : params.margin);
      }
      if (!blobPart) {
        throw new Error('Cannot export image');
      }
      var blob = new Blob([blobPart], {
        type: ketcher_types.BlobTypes[format]
      });
      fileSaver.saveAs(blob, "".concat(fileName, ".").concat(format));
    }
  }, {
    key: "recognize",
    value: function recognize(image, version) {
      if (window.isPolymerEditorTurnedOn) {
        throw new Error('Recognize is not available in macro mode');
      }
      if (_classPrivateFieldGet__default["default"](this, _recognitionAdapter)) {
        return _classPrivateFieldGet__default["default"](this, _recognitionAdapter).recognize({
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
      var _playMoleculeEditPlan = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee18(plan) {
        var options,
          executor,
          _args18 = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee18$(_context18) {
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
              executor = new MoleculeEditPlanExecutor.MoleculeEditPlanExecutor(this.editor, plan, options.positionOffset);
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
      var _generateImage = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee19(data) {
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
        return _regeneratorRuntime__default["default"].wrap(function _callee19$(_context19) {
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
      this._indigo = new indigo.Indigo(structService);
    }
  }, {
    key: "sendCustomAction",
    value: function sendCustomAction(name) {
      this.eventBus.emit('CUSTOM_BUTTON_PRESSED', name);
    }
  }, {
    key: "ensureMonomersLibraryDataInKetFormat",
    value: (function () {
      var _ensureMonomersLibraryDataInKetFormat = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee20(rawMonomersData, params) {
        var _params$format;
        var serverSettings, rawMonomersDataString, format, dataInKetFormat, convertResult, originalMessage;
        return _regeneratorRuntime__default["default"].wrap(function _callee20$(_context20) {
          while (1) switch (_context20.prev = _context20.next) {
            case 0:
              serverSettings = this.editor.serverSettings;
              rawMonomersDataString = ensureString.ensureString(rawMonomersData);
              format = (_params$format = params === null || params === void 0 ? void 0 : params.format) !== null && _params$format !== void 0 ? _params$format : identifyStructFormat.identifyStructFormat(rawMonomersDataString);
              if (!(format === structFormatter_types.SupportedFormat.ket)) {
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
              throw new Editor.MonomerLibraryConvertError("Monomer item could not be loaded because of an error: ".concat(originalMessage), _context20.t0 instanceof Error ? _context20.t0 : undefined);
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
      var _ensureMonomersLibraryDataInSdfFormat = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee21(rawMonomersData, params) {
        var _params$format2;
        var rawMonomersDataString, format, convertResult;
        return _regeneratorRuntime__default["default"].wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              rawMonomersDataString = ensureString.ensureString(rawMonomersData);
              format = (_params$format2 = params === null || params === void 0 ? void 0 : params.format) !== null && _params$format2 !== void 0 ? _params$format2 : identifyStructFormat.identifyStructFormat(rawMonomersDataString);
              if (!(format === structFormatter_types.SupportedFormat.sdf || format === structFormatter_types.SupportedFormat.sdfV3000)) {
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
      var _updateMonomersLibrary = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee22(rawMonomersData, params) {
        var editor, dataInKetFormat, dataInSdfFormat, updateString;
        return _regeneratorRuntime__default["default"].wrap(function _callee22$(_context22) {
          while (1) switch (_context22.prev = _context22.next) {
            case 0:
              editor = editorSingleton.provideEditorInstance();
              ketcherProvider.ketcherProvider.getKetcher(this.id);
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
              if (SettingsManager.SettingsManager.persistMonomerLibraryUpdates && params !== null && params !== void 0 && params.shouldPersist) {
                updateString = ensureString.ensureString(dataInKetFormat);
                SettingsManager.SettingsManager.addMonomerLibraryUpdate(updateString);
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
      var _replaceMonomersLibrary = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee23(rawMonomersData, params) {
        var editor, dataInKetFormat, dataInSdfFormat;
        return _regeneratorRuntime__default["default"].wrap(function _callee23$(_context23) {
          while (1) switch (_context23.prev = _context23.next) {
            case 0:
              editor = editorSingleton.provideEditorInstance();
              ketcherProvider.ketcherProvider.getKetcher(this.id);
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
      var editor = editorSingleton.provideEditorInstance();
      if (!editor) {
        KetcherLogger.KetcherLogger.error('Editor instance is not available');
        return;
      }
      editor.events.switchToMacromoleculesMode.dispatch();
    }
  }, {
    key: "switchToMoleculesMode",
    value: function switchToMoleculesMode() {
      var editor = editorSingleton.provideEditorInstance();
      if (!editor) {
        KetcherLogger.KetcherLogger.error('Editor instance is not available');
        return;
      }
      editor.events.switchToMoleculesMode.dispatch();
    }
  }]);
  return Ketcher;
}();
function _onSettingsChanged2(settings) {
  KetcherLogger.KetcherLogger.info('Settings changed', settings);
}

exports.Ketcher = Ketcher;
//# sourceMappingURL=ketcher.js.map
