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
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
require('../../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);

function addAtomToMoleculeStruct(atom, atomInMoleculeStruct) {
  var bondsInMoleculeStruct = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var moleculeStruct = atom.monomer.monomerItem.struct;
  moleculeStruct.atoms.set(atom.atomIdInMicroMode, atomInMoleculeStruct);
  bondsInMoleculeStruct.forEach(function (_ref) {
    var bondId = _ref.bondId,
      bond = _ref.bond;
    moleculeStruct.bonds.set(bondId, bond);
  });
}
function deleteAtomFromMoleculeStruct(atom) {
  var moleculeStruct = atom.monomer.monomerItem.struct;
  var atomInMoleculeStruct = moleculeStruct.atoms.get(atom.atomIdInMicroMode);
  if (!atomInMoleculeStruct) {
    KetcherLogger.KetcherLogger.warn('Atom is not found in molecule struct during deletion');
    return;
  }
  var bondsInMoleculeStruct = moleculeStruct.bonds.filter(function (_, bond) {
    return bond.begin === atom.atomIdInMicroMode || bond.end === atom.atomIdInMicroMode;
  });
  moleculeStruct.atoms["delete"](atom.atomIdInMicroMode);
  bondsInMoleculeStruct.forEach(function (_, bondId) {
    moleculeStruct.bonds["delete"](bondId);
  });
  return {
    atomInMoleculeStruct: atomInMoleculeStruct,
    bondsInMoleculeStruct: _toConsumableArray__default["default"](bondsInMoleculeStruct.entries()).map(function (_ref2) {
      var _ref3 = _slicedToArray__default["default"](_ref2, 2),
        bondId = _ref3[0],
        bond = _ref3[1];
      return {
        bondId: bondId,
        bond: bond
      };
    })
  };
}
var AtomAddOperation = function () {
  function AtomAddOperation(addAtomChangeModel, deleteAtomChangeModel) {
    _classCallCheck__default["default"](this, AtomAddOperation);
    _defineProperty__default["default"](this, "addAtomChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteAtomChangeModel", void 0);
    _defineProperty__default["default"](this, "atom", void 0);
    _defineProperty__default["default"](this, "deletedMoleculeStructItems", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.addAtomChangeModel = addAtomChangeModel;
    this.deleteAtomChangeModel = deleteAtomChangeModel;
    this.atom = this.addAtomChangeModel();
  }
  _createClass__default["default"](AtomAddOperation, [{
    key: "execute",
    value: function execute() {
      this.atom = this.addAtomChangeModel(this.atom);
      if (this.deletedMoleculeStructItems) {
        addAtomToMoleculeStruct(this.atom, this.deletedMoleculeStructItems.atomInMoleculeStruct, this.deletedMoleculeStructItems.bondsInMoleculeStruct);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.atom) {
        this.deleteAtomChangeModel(this.atom);
      }
      this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      renderersManager.addAtom(this.atom);
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      renderersManager.deleteAtom(this.atom);
    }
  }]);
  return AtomAddOperation;
}();
var AtomDeleteOperation = function () {
  function AtomDeleteOperation(atom, deleteAtomChangeModel, addAtomChangeModel) {
    _classCallCheck__default["default"](this, AtomDeleteOperation);
    _defineProperty__default["default"](this, "atom", void 0);
    _defineProperty__default["default"](this, "deleteAtomChangeModel", void 0);
    _defineProperty__default["default"](this, "addAtomChangeModel", void 0);
    _defineProperty__default["default"](this, "deletedMoleculeStructItems", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.atom = atom;
    this.deleteAtomChangeModel = deleteAtomChangeModel;
    this.addAtomChangeModel = addAtomChangeModel;
  }
  _createClass__default["default"](AtomDeleteOperation, [{
    key: "execute",
    value: function execute() {
      this.deleteAtomChangeModel();
      this.deletedMoleculeStructItems = deleteAtomFromMoleculeStruct(this.atom);
    }
  }, {
    key: "invert",
    value: function invert() {
      this.addAtomChangeModel(this.atom);
      if (this.deletedMoleculeStructItems) {
        addAtomToMoleculeStruct(this.atom, this.deletedMoleculeStructItems.atomInMoleculeStruct, this.deletedMoleculeStructItems.bondsInMoleculeStruct);
      }
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      renderersManager.addAtom(this.atom);
      renderersManager.rerenderSGroups();
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      renderersManager.deleteAtom(this.atom);
      renderersManager.rerenderSGroups();
    }
  }]);
  return AtomDeleteOperation;
}();

exports.AtomAddOperation = AtomAddOperation;
exports.AtomDeleteOperation = AtomDeleteOperation;
//# sourceMappingURL=atom.js.map
