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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var recognizedMolecule = require('./recognizedMolecule.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function trimCodeFence(content) {
  return content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}
function parseAiRecognitionPayload(content) {
  var normalized = trimCodeFence(content);
  var objectStart = normalized.indexOf('{');
  var objectEnd = normalized.lastIndexOf('}');
  if (objectStart < 0 || objectEnd <= objectStart) {
    throw new Error('AI recognition response does not contain a JSON object');
  }
  var value = JSON.parse(normalized.slice(objectStart, objectEnd + 1));
  if (typeof value.smiles !== 'string' || !value.smiles.trim()) {
    throw new Error('AI recognition response does not contain SMILES');
  }
  if (value.confidence !== undefined && (typeof value.confidence !== 'number' || value.confidence < 0 || value.confidence > 1)) {
    throw new Error('AI recognition confidence must be between 0 and 1');
  }
  return {
    smiles: value.smiles.trim(),
    confidence: value.confidence
  };
}
function blobToDataUrl(_x) {
  return _blobToDataUrl.apply(this, arguments);
}
function _blobToDataUrl() {
  _blobToDataUrl = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(blob) {
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
              if (typeof reader.result === 'string') resolve(reader.result);else reject(new Error('Unable to encode recognition image'));
            };
            reader.onerror = function () {
              var _reader$error;
              return reject((_reader$error = reader.error) !== null && _reader$error !== void 0 ? _reader$error : new Error('Unable to read recognition image'));
            };
            reader.readAsDataURL(blob);
          });
        case 2:
          return _context2.abrupt("return", _context2.sent);
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _blobToDataUrl.apply(this, arguments);
}
var OpenAICompatibleRecognitionAdapter = function () {
  function OpenAICompatibleRecognitionAdapter(config) {
    var _config$fetch;
    _classCallCheck__default["default"](this, OpenAICompatibleRecognitionAdapter);
    _defineProperty__default["default"](this, "provider", 'openai-compatible-vision');
    _defineProperty__default["default"](this, "baseUrl", void 0);
    _defineProperty__default["default"](this, "apiKey", void 0);
    _defineProperty__default["default"](this, "model", void 0);
    _defineProperty__default["default"](this, "parseSmiles", void 0);
    _defineProperty__default["default"](this, "fetch", void 0);
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.parseSmiles = config.parseSmiles;
    this.fetch = (_config$fetch = config.fetch) !== null && _config$fetch !== void 0 ? _config$fetch : globalThis.fetch.bind(globalThis);
  }
  _createClass__default["default"](OpenAICompatibleRecognitionAdapter, [{
    key: "recognize",
    value: function () {
      var _recognize = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(input) {
        var _body$choices;
        var imageUrl, headers, response, body, content, payload, structure;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return blobToDataUrl(input.image);
            case 2:
              imageUrl = _context.sent;
              headers = {
                'Content-Type': 'application/json'
              };
              if (this.apiKey) {
                headers.Authorization = "Bearer ".concat(this.apiKey);
              }
              _context.next = 7;
              return this.fetch("".concat(this.baseUrl, "/chat/completions"), {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                  model: this.model,
                  temperature: 0,
                  messages: [{
                    role: 'user',
                    content: [{
                      type: 'text',
                      text: ['Read the skeletal chemical structure in the image.', 'Count every vertex and terminal line explicitly.', 'Return exactly one JSON object with keys smiles and confidence.', 'confidence must be a number from 0 to 1.', 'Do not return markdown, a molecule name, or an explanation.'].join(' ')
                    }, {
                      type: 'image_url',
                      image_url: {
                        url: imageUrl
                      }
                    }]
                  }]
                })
              });
            case 7:
              response = _context.sent;
              if (response.ok) {
                _context.next = 10;
                break;
              }
              throw new Error("AI recognition request failed with ".concat(response.status));
            case 10:
              _context.next = 12;
              return response.json();
            case 12:
              body = _context.sent;
              content = (_body$choices = body.choices) === null || _body$choices === void 0 || (_body$choices = _body$choices[0]) === null || _body$choices === void 0 || (_body$choices = _body$choices.message) === null || _body$choices === void 0 ? void 0 : _body$choices.content;
              if (!(typeof content !== 'string')) {
                _context.next = 16;
                break;
              }
              throw new Error('AI recognition response has no text content');
            case 16:
              payload = parseAiRecognitionPayload(content);
              _context.next = 19;
              return this.parseSmiles(payload.smiles);
            case 19:
              structure = _context.sent;
              return _context.abrupt("return", recognizedMolecule.createRecognizedMolecule(this.provider, structure, {
                confidence: payload.confidence
              }));
            case 21:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function recognize(_x2) {
        return _recognize.apply(this, arguments);
      }
      return recognize;
    }()
  }]);
  return OpenAICompatibleRecognitionAdapter;
}();

exports.OpenAICompatibleRecognitionAdapter = OpenAICompatibleRecognitionAdapter;
exports.parseAiRecognitionPayload = parseAiRecognitionPayload;
//# sourceMappingURL=OpenAICompatibleRecognitionAdapter.js.map
