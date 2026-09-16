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
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { provideEditorInstance } from './editor/editorSingleton.modern.js';
import './formatters/supportedFormatProperties.modern.js';
import './formatters/formatProperties.modern.js';
import { SupportedFormat } from './formatters/structFormatter.types.modern.js';
import { FormatterFactory } from './formatters/formatterFactory.modern.js';
import './formatters/mol2Formatter.modern.js';
import './formatters/xyzFormatter.modern.js';
import './formatters/qcSchemaFormatter.modern.js';
import '@babel/runtime/helpers/defineProperty';
import { identifyStructFormat } from './formatters/identifyStructFormat.modern.js';
import './formatters/types/ket.modern.js';
import { ChemicalMimeType } from '../domain/services/struct/structService.types.modern.js';
import { EditorHistory } from './editor/EditorHistory.modern.js';
import './editor/shared/coordinates.modern.js';
import './editor/editor.types.modern.js';
import './editor/tools/select/SelectBase.modern.js';
import './editor/tools/select/SelectRectangle.modern.js';
import './editor/tools/select/SelectLasso.modern.js';
import './editor/tools/select/SelectFragment.modern.js';
import { KetSerializer } from '../domain/serializers/ket/ketSerializer.modern.js';
import '@babel/runtime/helpers/typeof';
import '../domain/entities/Axis.modern.js';
import '../domain/entities/vec2.modern.js';
import 'lodash';
import '../domain/constants/elements.modern.js';
import '../domain/constants/element.types.modern.js';
import '../domain/constants/generics.modern.js';
import '../domain/constants/chains.modern.js';
import '../domain/constants/monomers.modern.js';
import '../domain/helpers/monomers.modern.js';
import '../domain/serializers/mol/molSerializer.modern.js';
import '../domain/serializers/sdf/sdfSerializer.modern.js';
import '../utilities/runAsyncAction.modern.js';
import '../utilities/KetcherLogger.modern.js';
import '../utilities/SettingsManager.modern.js';
import '../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../utilities/clipboardUtils.modern.js';
import { assert } from '../utilities/assert.modern.js';

function prepareStructToRender(_x, _x2, _x3) {
  return _prepareStructToRender.apply(this, arguments);
}
function _prepareStructToRender() {
  _prepareStructToRender = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(structStr, structService, ketcherInstance) {
    var struct;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
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
  var format = identifyStructFormat(structStr);
  var factory = new FormatterFactory(structService);
  var options = ketcherInstance.editor.options();
  var service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag
  });
  return service.getStructureFromStringAsync(structStr);
}
function deleteAllEntitiesOnCanvas() {
  var editor = provideEditorInstance();
  var modelChanges = editor.drawingEntitiesManager.deleteAllEntities();
  EditorHistory.getInstance(editor).update(modelChanges);
  editor.renderersContainer.update(modelChanges);
}
function parseAndAddMacromoleculesOnCanvas(_x4, _x5) {
  return _parseAndAddMacromoleculesOnCanvas.apply(this, arguments);
}
function _parseAndAddMacromoleculesOnCanvas() {
  _parseAndAddMacromoleculesOnCanvas = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(struct, structService) {
    var mergeWithLatestHistoryCommand,
      editor,
      ketSerializer,
      format,
      ketStruct,
      deserialisedKet,
      _deserialisedKet$draw,
      modelChanges,
      _args2 = arguments;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          mergeWithLatestHistoryCommand = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;
          editor = provideEditorInstance();
          ketSerializer = new KetSerializer();
          format = identifyStructFormat(struct, true);
          ketStruct = struct;
          if (!(format !== SupportedFormat.ket)) {
            _context2.next = 9;
            break;
          }
          _context2.next = 8;
          return structService.convert({
            struct: struct,
            output_format: ChemicalMimeType.KET
          });
        case 8:
          ketStruct = _context2.sent.struct;
        case 9:
          deserialisedKet = ketSerializer.deserializeToDrawingEntities(ketStruct);
          assert(deserialisedKet);
          _deserialisedKet$draw = deserialisedKet.drawingEntitiesManager.mergeInto(editor.drawingEntitiesManager), modelChanges = _deserialisedKet$draw.command;
          EditorHistory.getInstance(editor).update(modelChanges, mergeWithLatestHistoryCommand);
          editor.renderersContainer.update(modelChanges);
        case 14:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _parseAndAddMacromoleculesOnCanvas.apply(this, arguments);
}

export { deleteAllEntitiesOnCanvas, parseAndAddMacromoleculesOnCanvas, parseStruct, prepareStructToRender };
//# sourceMappingURL=utils.modern.js.map
