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

var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var recognition_types = require('./recognition.types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultLegacy(_wrapNativeSuper);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MoleculeRecognitionError = function (_Error) {
  _inherits__default["default"](MoleculeRecognitionError, _Error);
  function MoleculeRecognitionError(issues) {
    var _this;
    _classCallCheck__default["default"](this, MoleculeRecognitionError);
    _this = _callSuper(this, MoleculeRecognitionError, [issues.map(function (_ref) {
      var message = _ref.message;
      return message;
    }).join('; ')]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "issues", void 0);
    _this.name = 'MoleculeRecognitionError';
    _this.issues = issues;
    return _this;
  }
  return _createClass__default["default"](MoleculeRecognitionError);
}(_wrapNativeSuper__default["default"](Error));
function validateRecognizedStructure(structure) {
  var issues = [];
  if (structure.atoms.size === 0) {
    issues.push({
      severity: 'error',
      code: 'empty-structure',
      message: 'No atoms were recognized in the image'
    });
  }
  structure.atoms.forEach(function (atom, atomId) {
    var _atom$label;
    if (!((_atom$label = atom.label) !== null && _atom$label !== void 0 && _atom$label.trim())) {
      issues.push({
        severity: 'error',
        code: 'invalid-atom-label',
        message: "Recognized atom ".concat(atomId, " has no label"),
        atomId: atomId
      });
    }
    if (!Number.isFinite(atom.pp.x) || !Number.isFinite(atom.pp.y)) {
      issues.push({
        severity: 'error',
        code: 'invalid-atom-coordinate',
        message: "Recognized atom ".concat(atomId, " has invalid coordinates"),
        atomId: atomId
      });
    }
  });
  structure.bonds.forEach(function (bond, bondId) {
    if (!structure.atoms.has(bond.begin) || !structure.atoms.has(bond.end)) {
      issues.push({
        severity: 'error',
        code: 'dangling-bond',
        message: "Recognized bond ".concat(bondId, " references a missing atom"),
        bondId: bondId
      });
    }
    if (bond.begin === bond.end) {
      issues.push({
        severity: 'error',
        code: 'self-bond',
        message: "Recognized bond ".concat(bondId, " connects an atom to itself"),
        bondId: bondId
      });
    }
    if (!Number.isFinite(bond.type) || bond.type <= 0) {
      issues.push({
        severity: 'error',
        code: 'invalid-bond-order',
        message: "Recognized bond ".concat(bondId, " has an invalid type"),
        bondId: bondId
      });
    }
  });
  return issues;
}
function createRecognizedMolecule(provider, structure) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var issues = validateRecognizedStructure(structure);
  var errors = issues.filter(function (_ref2) {
    var severity = _ref2.severity;
    return severity === 'error';
  });
  if (errors.length) {
    throw new MoleculeRecognitionError(errors);
  }
  var recognizedMolecule = {
    schemaVersion: recognition_types.RECOGNIZED_MOLECULE_SCHEMA_VERSION,
    provider: provider,
    structure: structure,
    issues: issues
  };
  if (options.confidence !== undefined && Number.isFinite(options.confidence) && options.confidence >= 0 && options.confidence <= 1) {
    recognizedMolecule.confidence = options.confidence;
  }
  return recognizedMolecule;
}

exports.MoleculeRecognitionError = MoleculeRecognitionError;
exports.createRecognizedMolecule = createRecognizedMolecule;
exports.validateRecognizedStructure = validateRecognizedStructure;
//# sourceMappingURL=recognizedMolecule.js.map
