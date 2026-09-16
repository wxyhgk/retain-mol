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
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var editorSingleton = require('./editor/editorSingleton.js');
require('./formatters/supportedFormatProperties.js');
require('./formatters/formatProperties.js');
var structFormatter_types = require('./formatters/structFormatter.types.js');
var formatterFactory = require('./formatters/formatterFactory.js');
require('./formatters/mol2Formatter.js');
require('./formatters/xyzFormatter.js');
require('./formatters/qcSchemaFormatter.js');
require('@babel/runtime/helpers/defineProperty');
var identifyStructFormat = require('./formatters/identifyStructFormat.js');
require('./formatters/types/ket.js');
var structService_types = require('../domain/services/struct/structService.types.js');
var EditorHistory = require('./editor/EditorHistory.js');
require('./editor/shared/coordinates.js');
require('./editor/editor.types.js');
require('./editor/tools/select/SelectBase.js');
require('./editor/tools/select/SelectRectangle.js');
require('./editor/tools/select/SelectLasso.js');
require('./editor/tools/select/SelectFragment.js');
var ketSerializer = require('../domain/serializers/ket/ketSerializer.js');
require('@babel/runtime/helpers/typeof');
require('../domain/entities/Axis.js');
require('../domain/entities/vec2.js');
require('lodash');
require('../domain/constants/elements.js');
require('../domain/constants/element.types.js');
require('../domain/constants/generics.js');
require('../domain/constants/chains.js');
require('../domain/constants/monomers.js');
require('../domain/helpers/monomers.js');
require('../domain/serializers/mol/molSerializer.js');
require('../domain/serializers/sdf/sdfSerializer.js');
require('../utilities/runAsyncAction.js');
require('../utilities/KetcherLogger.js');
require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
var assert = require('../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function prepareStructToRender(_x, _x2, _x3) {
  return _prepareStructToRender.apply(this, arguments);
}
function _prepareStructToRender() {
  _prepareStructToRender = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(structStr, structService, ketcherInstance) {
    var struct;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return parseStruct(structStr, structService, ketcherInstance);
        case 2:
          struct = _context.sent;
          struct.initHalfBonds();
          struct.initNeighbors();
          struct.setImplicitHydrogen();
          struct.setStereoLabelsToAtoms();
          struct.markFragments();
          return _context.abrupt("return", struct);
        case 9:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _prepareStructToRender.apply(this, arguments);
}
function parseStruct(structStr, structService, ketcherInstance) {
  var format = identifyStructFormat.identifyStructFormat(structStr);
  var factory = new formatterFactory.FormatterFactory(structService);
  var options = ketcherInstance.editor.options();
  var service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag
  });
  return service.getStructureFromStringAsync(structStr);
}
function deleteAllEntitiesOnCanvas() {
  var editor = editorSingleton.provideEditorInstance();
  var modelChanges = editor.drawingEntitiesManager.deleteAllEntities();
  EditorHistory.EditorHistory.getInstance(editor).update(modelChanges);
  editor.renderersContainer.update(modelChanges);
}
function parseAndAddMacromoleculesOnCanvas(_x4, _x5) {
  return _parseAndAddMacromoleculesOnCanvas.apply(this, arguments);
}
function _parseAndAddMacromoleculesOnCanvas() {
  _parseAndAddMacromoleculesOnCanvas = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(struct, structService) {
    var mergeWithLatestHistoryCommand,
      editor,
      ketSerializer$1,
      format,
      ketStruct,
      deserialisedKet,
      _deserialisedKet$draw,
      modelChanges,
      _args2 = arguments;
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          mergeWithLatestHistoryCommand = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;
          editor = editorSingleton.provideEditorInstance();
          ketSerializer$1 = new ketSerializer.KetSerializer();
          format = identifyStructFormat.identifyStructFormat(struct, true);
          ketStruct = struct;
          if (!(format !== structFormatter_types.SupportedFormat.ket)) {
            _context2.next = 9;
            break;
          }
          _context2.next = 8;
          return structService.convert({
            struct: struct,
            output_format: structService_types.ChemicalMimeType.KET
          });
        case 8:
          ketStruct = _context2.sent.struct;
        case 9:
          deserialisedKet = ketSerializer$1.deserializeToDrawingEntities(ketStruct);
          assert.assert(deserialisedKet);
          _deserialisedKet$draw = deserialisedKet.drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager), modelChanges = _deserialisedKet$draw.command;
          EditorHistory.EditorHistory.getInstance(editor).update(modelChanges, mergeWithLatestHistoryCommand);
          editor.renderersContainer.update(modelChanges);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _parseAndAddMacromoleculesOnCanvas.apply(this, arguments);
}

exports.deleteAllEntitiesOnCanvas = deleteAllEntitiesOnCanvas;
exports.parseAndAddMacromoleculesOnCanvas = parseAndAddMacromoleculesOnCanvas;
exports.parseStruct = parseStruct;
exports.prepareStructToRender = prepareStructToRender;
//# sourceMappingURL=utils.js.map
