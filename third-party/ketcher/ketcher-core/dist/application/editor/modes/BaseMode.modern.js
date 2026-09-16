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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { Command } from '../../../domain/entities/Command.modern.js';
import { SelectLayoutModeOperation } from '../operations/polymerBond/index.modern.js';
import { EditorHistory } from '../EditorHistory.modern.js';
import { provideEditorInstance } from '../editorSingleton.modern.js';
import { DEFAULT_LAYOUT_MODE } from './types/index.modern.js';
import { getModeConstructor } from './modesRegistry.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import { initHotKeys, keyNorm } from '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import { isClipboardAPIAvailable, legacyCopy, PLAIN_TEXT_MIME_TYPE, legacyPaste, getStructStringFromClipboardData } from '../../../utilities/clipboardUtils.modern.js';
import { normalizeError } from '../../../utilities/normalizeError.modern.js';
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
import { Struct } from '../../../domain/entities/struct.modern.js';
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
import '../../../domain/entities/BaseMonomer.modern.js';
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
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { identifyStructFormat } from '../../formatters/identifyStructFormat.modern.js';
import { SupportedFormat } from '../../formatters/structFormatter.types.modern.js';
import { KetSerializer } from '../../../domain/serializers/ket/ketSerializer.modern.js';
import { ChemicalMimeType } from '../../../domain/services/struct/structService.types.modern.js';
import { ketcherProvider } from '../../ketcherProvider.modern.js';

var BaseMode = function () {
  function BaseMode(modeName) {
    var previousMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_LAYOUT_MODE;
    _classCallCheck(this, BaseMode);
    _defineProperty(this, "modeName", void 0);
    _defineProperty(this, "previousMode", void 0);
    _defineProperty(this, "_pasteIsInProgress", false);
    this.modeName = modeName;
    this.previousMode = previousMode;
  }
  _createClass(BaseMode, [{
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
      var ModeConstructor = getModeConstructor(modeName);
      editor.mode.destroy();
      editor.setMode(new ModeConstructor());
      editor.mode.initialize(true, isUndo, false);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var needRemoveSelection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var command = new Command();
      var editor = provideEditorInstance();
      command.addOperation(new SelectLayoutModeOperation(this.changeMode.bind(this, editor, this.modeName), this.changeMode.bind(this, editor, this.previousMode, true), this.modeName, this.previousMode));
      if (needRemoveSelection) {
        editor.events.selectSelectionTool.dispatch();
      }
      return command;
    }
  }, {
    key: "onKeyDown",
    value: function () {
      var _onKeyDown = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(event) {
        var _this = this;
        var _keyNorm$lookup, hotKeys, shortcutKey;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!this.checkIfTargetIsInput(event)) {
                hotKeys = initHotKeys(this.keyboardEventHandlers);
                shortcutKey = (_keyNorm$lookup = keyNorm.lookup(hotKeys, event)) === null || _keyNorm$lookup === void 0 ? void 0 : _keyNorm$lookup[0];
                if (shortcutKey && this.keyboardEventHandlers[shortcutKey]) {
                  event.stopImmediatePropagation();
                }
              }
              _context.next = 3;
              return new Promise(function (resolve) {
                setTimeout(function () {
                  var editor = provideEditorInstance();
                  if (!_this.checkIfTargetIsInput(event)) {
                    var _keyNorm$lookup2;
                    var _hotKeys = initHotKeys(_this.keyboardEventHandlers);
                    var _shortcutKey = (_keyNorm$lookup2 = keyNorm.lookup(_hotKeys, event)) === null || _keyNorm$lookup2 === void 0 ? void 0 : _keyNorm$lookup2[0];
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
      var editor = provideEditorInstance();
      var drawingEntitiesManager = editor.drawingEntitiesManager.filterSelection();
      var ketSerializer = new KetSerializer();
      var serializedKet = ketSerializer.serialize(new Struct(), drawingEntitiesManager);
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(serializedKet);
      } else if (event) {
        legacyCopy(event.clipboardData, _defineProperty({}, PLAIN_TEXT_MIME_TYPE, serializedKet));
        event.preventDefault();
      }
    }
  }, {
    key: "onCut",
    value: function onCut(event) {
      if (event && this.checkIfTargetIsInput(event)) {
        return;
      }
      var editor = provideEditorInstance();
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
      var _onPaste = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(event) {
        var _this2 = this;
        var editor, isCanvasEmptyBeforePaste, isSequenceEditInRNABuilderMode, clipboardData, _clipboardData;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!(event && this.checkIfTargetIsInput(event))) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return");
            case 2:
              editor = provideEditorInstance();
              isCanvasEmptyBeforePaste = !editor.drawingEntitiesManager.hasDrawingEntities;
              if (!isClipboardAPIAvailable()) {
                _context2.next = 15;
                break;
              }
              isSequenceEditInRNABuilderMode = provideEditorInstance().isSequenceEditInRNABuilderMode;
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
              _clipboardData = legacyPaste(event.clipboardData, [PLAIN_TEXT_MIME_TYPE]);
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
              KetcherLogger.warn('Cannot paste because Clipboard API is not available and paste event does not contain clipboardData');
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
      var _pasteFromClipboard = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(clipboardData) {
        var pasteOperations, editor, pastedStr, format;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              editor = provideEditorInstance();
              _context3.next = 3;
              return getStructStringFromClipboardData(clipboardData);
            case 3:
              pastedStr = _context3.sent;
              if (pastedStr !== null && pastedStr !== void 0 && pastedStr.trim()) {
                _context3.next = 6;
                break;
              }
              return _context3.abrupt("return");
            case 6:
              format = identifyStructFormat(pastedStr, true);
              if (!(format === SupportedFormat.ket)) {
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
              EditorHistory.getInstance(editor).update(pasteOperations);
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
      var editor = provideEditorInstance();
      var ketSerializer = new KetSerializer();
      var deserialisedKet = ketSerializer.deserializeToDrawingEntities(pastedStr);
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
      var _pasteWithIndigoConversion = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(pastedStr, sequenceType) {
        var editor, indigo, ketStruct, stringError, errorMessage;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              editor = provideEditorInstance();
              indigo = ketcherProvider.getKetcher(editor.ketcherId).indigo;
              _context4.prev = 2;
              _context4.next = 5;
              return indigo.convert(pastedStr, {
                outputFormat: ChemicalMimeType.KET,
                sequenceType: sequenceType
              });
            case 5:
              ketStruct = _context4.sent;
              return _context4.abrupt("return", this.pasteKetFormatFragment(ketStruct.struct));
            case 9:
              _context4.prev = 9;
              _context4.t0 = _context4["catch"](2);
              stringError = normalizeError(_context4.t0).message;
              errorMessage = 'Convert error! ' + stringError;
              this.unsupportedSymbolsError(errorMessage);
              return _context4.abrupt("return", new Command());
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
      var offset = Vec2.diff(newNodePosition, new Vec2(firstEntityPosition));
      drawingEntitiesManager.allEntities.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          drawindEntity = _ref2[1];
        drawingEntitiesManager.moveDrawingEntityModelChange(drawindEntity, offset);
      });
    }
  }, {
    key: "unsupportedSymbolsError",
    value: function unsupportedSymbolsError(errorMessage) {
      var editor = provideEditorInstance();
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

export { BaseMode };
//# sourceMappingURL=BaseMode.modern.js.map
