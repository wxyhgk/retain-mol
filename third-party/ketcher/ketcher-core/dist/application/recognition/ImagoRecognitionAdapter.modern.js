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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { MolSerializer } from '../../domain/serializers/mol/molSerializer.modern.js';
import { createRecognizedMolecule } from './recognizedMolecule.modern.js';

var ImagoRecognitionAdapter = function () {
  function ImagoRecognitionAdapter(recognizeImage) {
    var serializer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new MolSerializer();
    _classCallCheck(this, ImagoRecognitionAdapter);
    _defineProperty(this, "recognizeImage", void 0);
    _defineProperty(this, "serializer", void 0);
    _defineProperty(this, "provider", 'imago');
    this.recognizeImage = recognizeImage;
    this.serializer = serializer;
  }
  _createClass(ImagoRecognitionAdapter, [{
    key: "recognize",
    value: function () {
      var _recognize = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(input) {
        var _input$version;
        var response, structure;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.recognizeImage(input.image, (_input$version = input.version) !== null && _input$version !== void 0 ? _input$version : '');
            case 2:
              response = _context.sent;
              structure = this.serializer.deserialize(response.struct);
              return _context.abrupt("return", createRecognizedMolecule(this.provider, structure));
            case 5:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function recognize(_x) {
        return _recognize.apply(this, arguments);
      }
      return recognize;
    }()
  }]);
  return ImagoRecognitionAdapter;
}();

export { ImagoRecognitionAdapter };
//# sourceMappingURL=ImagoRecognitionAdapter.modern.js.map
