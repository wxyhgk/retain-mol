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
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { RECOGNIZED_MOLECULE_SCHEMA_VERSION } from './recognition.types.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MoleculeRecognitionError = function (_Error) {
  _inherits(MoleculeRecognitionError, _Error);
  function MoleculeRecognitionError(issues) {
    var _this;
    _classCallCheck(this, MoleculeRecognitionError);
    _this = _callSuper(this, MoleculeRecognitionError, [issues.map(function (_ref) {
      var message = _ref.message;
      return message;
    }).join('; ')]);
    _defineProperty(_assertThisInitialized(_this), "issues", void 0);
    _this.name = 'MoleculeRecognitionError';
    _this.issues = issues;
    return _this;
  }
  return _createClass(MoleculeRecognitionError);
}(_wrapNativeSuper(Error));
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
    schemaVersion: RECOGNIZED_MOLECULE_SCHEMA_VERSION,
    provider: provider,
    structure: structure,
    issues: issues
  };
  if (options.confidence !== undefined && Number.isFinite(options.confidence) && options.confidence >= 0 && options.confidence <= 1) {
    recognizedMolecule.confidence = options.confidence;
  }
  return recognizedMolecule;
}

export { MoleculeRecognitionError, createRecognizedMolecule, validateRecognizedStructure };
//# sourceMappingURL=recognizedMolecule.modern.js.map
