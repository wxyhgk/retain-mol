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
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var molSerializer = require('../../domain/serializers/mol/molSerializer.js');
var recognizedMolecule = require('./recognizedMolecule.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

var ImagoRecognitionAdapter = function () {
  function ImagoRecognitionAdapter(recognizeImage) {
    var serializer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new molSerializer.MolSerializer();
    _classCallCheck__default["default"](this, ImagoRecognitionAdapter);
    _defineProperty__default["default"](this, "recognizeImage", void 0);
    _defineProperty__default["default"](this, "serializer", void 0);
    _defineProperty__default["default"](this, "provider", 'imago');
    this.recognizeImage = recognizeImage;
    this.serializer = serializer;
  }
  _createClass__default["default"](ImagoRecognitionAdapter, [{
    key: "recognize",
    value: function () {
      var _recognize = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(input) {
        var _input$version;
        var response, structure;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.recognizeImage(input.image, (_input$version = input.version) !== null && _input$version !== void 0 ? _input$version : '');
            case 2:
              response = _context.sent;
              structure = this.serializer.deserialize(response.struct);
              return _context.abrupt("return", recognizedMolecule.createRecognizedMolecule(this.provider, structure));
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

exports.ImagoRecognitionAdapter = ImagoRecognitionAdapter;
//# sourceMappingURL=ImagoRecognitionAdapter.js.map
