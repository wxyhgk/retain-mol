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
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var Command = require('../../../domain/entities/Command.js');
var index = require('../operations/polymerBond/index.js');
var EditorHistory = require('../EditorHistory.js');
var editorSingleton = require('../editorSingleton.js');
var index$1 = require('./types/index.js');
var modesRegistry = require('./modesRegistry.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
var keynorm = require('../../../utilities/keynorm.js');
require('react-device-detect');
var clipboardUtils = require('../../../utilities/clipboardUtils.js');
var normalizeError = require('../../../utilities/normalizeError.js');
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
var struct = require('../../../domain/entities/struct.js');
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
require('../../../domain/entities/BaseMonomer.js');
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
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var identifyStructFormat = require('../../formatters/identifyStructFormat.js');
var structFormatter_types = require('../../formatters/structFormatter.types.js');
var ketSerializer = require('../../../domain/serializers/ket/ketSerializer.js');
var structService_types = require('../../../domain/services/struct/structService.types.js');
var ketcherProvider = require('../../ketcherProvider.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

var BaseMode = function () {
  function BaseMode(modeName) {
    var previousMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : index$1.DEFAULT_LAYOUT_MODE;
    _classCallCheck__default["default"](this, BaseMode);
    _defineProperty__default["default"](this, "modeName", void 0);
    _defineProperty__default["default"](this, "previousMode", void 0);
    _defineProperty__default["default"](this, "_pasteIsInProgress", false);
    this.modeName = modeName;
    this.previousMode = previousMode;
  }
  _createClass__default["default"](BaseMode, [{
    key: "isAntisenseEditMode",
    get: function get() {
      return false;
    }
  }, {
    key: "isSyncEditMode",
    get: function get() {
      return false;
    }
  }, {
    key: "changeMode",
    value: function changeMode(editor, modeName) {
      var isUndo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      editor.events.layoutModeChange.dispatch(modeName);
      var ModeConstructor = modesRegistry.getModeConstructor(modeName);
      editor.mode.destroy();
      editor.setMode(new ModeConstructor());
      editor.mode.initialize(true, isUndo, false);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var needRemoveSelection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var command = new Command.Command();
      var editor = editorSingleton.provideEditorInstance();
      command.addOperation(new index.SelectLayoutModeOperation(this.changeMode.bind(this, editor, this.modeName), this.changeMode.bind(this, editor, this.previousMode, true), this.modeName, this.previousMode));
      if (needRemoveSelection) {
        editor.events.selectSelectionTool.dispatch();
      }
      return command;
    }
  }, {
    key: "onKeyDown",
    value: function () {
      var _onKeyDown = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(event) {
        var _this = this;
        var _keyNorm$lookup, hotKeys, shortcutKey;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.checkIfTargetIsInput(event)) {
                hotKeys = keynorm.initHotKeys(this.keyboardEventHandlers);
                shortcutKey = (_keyNorm$lookup = keynorm.keyNorm.lookup(hotKeys, event)) === null || _keyNorm$lookup === void 0 ? void 0 : _keyNorm$lookup[0];
                if (shortcutKey && this.keyboardEventHandlers[shortcutKey]) {
                  event.stopImmediatePropagation();
                }
              }
              _context.next = 3;
              return new Promise(function (resolve) {
                setTimeout(function () {
                  var editor = editorSingleton.provideEditorInstance();
                  if (!_this.checkIfTargetIsInput(event)) {
                    var _keyNorm$lookup2;
                    var _hotKeys = keynorm.initHotKeys(_this.keyboardEventHandlers);
                    var _shortcutKey = (_keyNorm$lookup2 = keynorm.keyNorm.lookup(_hotKeys, event)) === null || _keyNorm$lookup2 === void 0 ? void 0 : _keyNorm$lookup2[0];
                    if (_shortcutKey) {
                      var _this$keyboardEventHa;
                      (_this$keyboardEventHa = _this.keyboardEventHandlers[_shortcutKey]) === null || _this$keyboardEventHa === void 0 || _this$keyboardEventHa.handler(event);
                    }
                  }
                  editor.events.mouseLeaveSequenceItem.dispatch();
                  resolve();
                }, 0);
              });
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function onKeyDown(_x) {
        return _onKeyDown.apply(this, arguments);
      }
      return onKeyDown;
    }()
  }, {
    key: "keyboardEventHandlers",
    get: function get() {
      return {};
    }
  }, {
    key: "onCopy",
    value: function onCopy(event) {
      if (event && this.checkIfTargetIsInput(event)) {
        return;
      }
      var editor = editorSingleton.provideEditorInstance();
      var drawingEntitiesManager = editor.drawingEntitiesManager.filterSelection();
      var ketSerializer$1 = new ketSerializer.KetSerializer();
      var serializedKet = ketSerializer$1.serialize(new struct.Struct(), drawingEntitiesManager);
      if (clipboardUtils.isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(serializedKet);
      } else if (event) {
        clipboardUtils.legacyCopy(event.clipboardData, _defineProperty__default["default"]({}, clipboardUtils.PLAIN_TEXT_MIME_TYPE, serializedKet));
        event.preventDefault();
      }
    }
  }, {
    key: "onCut",
    value: function onCut(event) {
      if (event && this.checkIfTargetIsInput(event)) {
        return;
      }
      var editor = editorSingleton.provideEditorInstance();
      if (editor.drawingEntitiesManager.selectedEntities.length === 0) {
        return;
      }
      this.onCopy(event);
      editor.events.deleteSelectedStructure.dispatch();
      if (event) {
        event.preventDefault();
      }
    }
  }, {
    key: "onPaste",
    value: function () {
      var _onPaste = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(event) {
        var _this2 = this;
        var editor, isCanvasEmptyBeforePaste, isSequenceEditInRNABuilderMode, clipboardData, _clipboardData;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!(event && this.checkIfTargetIsInput(event))) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return");
            case 2:
              editor = editorSingleton.provideEditorInstance();
              isCanvasEmptyBeforePaste = !editor.drawingEntitiesManager.hasDrawingEntities;
              if (!clipboardUtils.isClipboardAPIAvailable()) {
                _context2.next = 15;
                break;
              }
              isSequenceEditInRNABuilderMode = editorSingleton.provideEditorInstance().isSequenceEditInRNABuilderMode;
              if (!(isSequenceEditInRNABuilderMode || this._pasteIsInProgress)) {
                _context2.next = 8;
                break;
              }
              return _context2.abrupt("return");
            case 8:
              this._pasteIsInProgress = true;
              _context2.next = 11;
              return navigator.clipboard.read();
            case 11:
              clipboardData = _context2.sent;
              this.pasteFromClipboard(clipboardData)["finally"](function () {
                _this2._pasteIsInProgress = false;
                if (!isCanvasEmptyBeforePaste) {
                  return;
                }
                editor.zoomToStructuresIfNeeded();
              });
              _context2.next = 25;
              break;
            case 15:
              if (!event) {
                _context2.next = 24;
                break;
              }
              _clipboardData = clipboardUtils.legacyPaste(event.clipboardData, [clipboardUtils.PLAIN_TEXT_MIME_TYPE]);
              this.pasteFromClipboard(_clipboardData);
              event.preventDefault();
              if (isCanvasEmptyBeforePaste) {
                _context2.next = 21;
                break;
              }
              return _context2.abrupt("return");
            case 21:
              editor.zoomToStructuresIfNeeded();
              _context2.next = 25;
              break;
            case 24:
              KetcherLogger.KetcherLogger.warn('Cannot paste because Clipboard API is not available and paste event does not contain clipboardData');
            case 25:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function onPaste(_x2) {
        return _onPaste.apply(this, arguments);
      }
      return onPaste;
    }()
  }, {
    key: "pasteFromClipboard",
    value: function () {
      var _pasteFromClipboard = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3(clipboardData) {
        var pasteOperations, editor, pastedStr, format;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              editor = editorSingleton.provideEditorInstance();
              _context3.next = 3;
              return clipboardUtils.getStructStringFromClipboardData(clipboardData);
            case 3:
              pastedStr = _context3.sent;
              if (pastedStr !== null && pastedStr !== void 0 && pastedStr.trim()) {
                _context3.next = 6;
                break;
              }
              return _context3.abrupt("return");
            case 6:
              format = identifyStructFormat.identifyStructFormat(pastedStr, true);
              if (!(format === structFormatter_types.SupportedFormat.ket)) {
                _context3.next = 11;
                break;
              }
              pasteOperations = this.pasteKetFormatFragment(pastedStr);
              _context3.next = 14;
              break;
            case 11:
              _context3.next = 13;
              return this.pasteWithIndigoConversion(pastedStr, editor.sequenceTypeEnterMode);
            case 13:
              pasteOperations = _context3.sent;
            case 14:
              if (!(!pasteOperations || pasteOperations.operations.length === 0)) {
                _context3.next = 16;
                break;
              }
              return _context3.abrupt("return");
            case 16:
              editor.drawingEntitiesManager.detectBondsOverlappedByMonomers();
              editor.renderersContainer.update(pasteOperations);
              EditorHistory.EditorHistory.getInstance(editor).update(pasteOperations);
              editor.events.mouseLeaveSequenceItem.dispatch();
              _context3.next = 22;
              return this.scrollForView();
            case 22:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function pasteFromClipboard(_x3) {
        return _pasteFromClipboard.apply(this, arguments);
      }
      return pasteFromClipboard;
    }()
  }, {
    key: "pasteKetFormatFragment",
    value: function pasteKetFormatFragment(pastedStr) {
      var editor = editorSingleton.provideEditorInstance();
      var ketSerializer$1 = new ketSerializer.KetSerializer();
      var deserialisedKet = ketSerializer$1.deserializeToDrawingEntities(pastedStr);
      if (!deserialisedKet) {
        throw new Error('Error during parsing file');
      }
      var drawingEntitiesManager = deserialisedKet === null || deserialisedKet === void 0 ? void 0 : deserialisedKet.drawingEntitiesManager;
      if (!drawingEntitiesManager || !this.isPasteAllowedByMode(drawingEntitiesManager)) {
        return;
      }
      if (!this.isPasteAvailable(drawingEntitiesManager)) {
        editor.events.openErrorModal.dispatch({
          errorTitle: 'Error Message',
          errorMessage: 'It is impossible to merge fragments. Attachment point to establish bonds are not available.'
        });
        return;
      }
      this.updateEntitiesPosition(drawingEntitiesManager);
      editor.calculateAndStoreNextAutochainPosition(drawingEntitiesManager);
      var _drawingEntitiesManag = drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager),
        modelChanges = _drawingEntitiesManag.command,
        mergedDrawingEntities = _drawingEntitiesManag.mergedDrawingEntities;
      modelChanges.merge(this.applyAdditionalPasteOperations(mergedDrawingEntities));
      return modelChanges;
    }
  }, {
    key: "pasteWithIndigoConversion",
    value: function () {
      var _pasteWithIndigoConversion = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee4(pastedStr, sequenceType) {
        var editor, indigo, ketStruct, stringError, errorMessage;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              editor = editorSingleton.provideEditorInstance();
              indigo = ketcherProvider.ketcherProvider.getKetcher(editor.ketcherId).indigo;
              _context4.prev = 2;
              _context4.next = 5;
              return indigo.convert(pastedStr, {
                outputFormat: structService_types.ChemicalMimeType.KET,
                sequenceType: sequenceType
              });
            case 5:
              ketStruct = _context4.sent;
              return _context4.abrupt("return", this.pasteKetFormatFragment(ketStruct.struct));
            case 9:
              _context4.prev = 9;
              _context4.t0 = _context4["catch"](2);
              stringError = normalizeError.normalizeError(_context4.t0).message;
              errorMessage = 'Convert error! ' + stringError;
              this.unsupportedSymbolsError(errorMessage);
              return _context4.abrupt("return", new Command.Command());
            case 15:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[2, 9]]);
      }));
      function pasteWithIndigoConversion(_x4, _x5) {
        return _pasteWithIndigoConversion.apply(this, arguments);
      }
      return pasteWithIndigoConversion;
    }()
  }, {
    key: "updateEntitiesPosition",
    value: function updateEntitiesPosition(drawingEntitiesManager) {
      var _drawingEntitiesManag2;
      var newNodePosition = this.getNewNodePosition();
      var firstEntityPosition = (_drawingEntitiesManag2 = drawingEntitiesManager.allEntities[0]) === null || _drawingEntitiesManag2 === void 0 ? void 0 : _drawingEntitiesManag2[1].position;
      var offset = vec2.Vec2.diff(newNodePosition, new vec2.Vec2(firstEntityPosition));
      drawingEntitiesManager.allEntities.forEach(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          drawindEntity = _ref2[1];
        drawingEntitiesManager.moveDrawingEntityModelChange(drawindEntity, offset);
      });
    }
  }, {
    key: "unsupportedSymbolsError",
    value: function unsupportedSymbolsError(errorMessage) {
      var editor = editorSingleton.provideEditorInstance();
      editor.events.openErrorModal.dispatch({
        errorTitle: 'Error',
        errorMessage: errorMessage
      });
    }
  }, {
    key: "checkIfTargetIsInput",
    value: function checkIfTargetIsInput(event) {
      var _event$target, _event$target2;
      return event.target instanceof HTMLElement && (((_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.nodeName) === 'INPUT' || ((_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.nodeName) === 'TEXTAREA' || event.target.contentEditable === 'true');
    }
  }, {
    key: "destroy",
    value: function destroy() {
    }
  }]);
  return BaseMode;
}();

exports.BaseMode = BaseMode;
//# sourceMappingURL=BaseMode.js.map
