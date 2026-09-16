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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

function addBondToMoleculeStruct(bond, bondInMoleculeStruct) {
  var moleculeStruct = bond.firstAtom.monomer.monomerItem.struct;
  moleculeStruct.bonds.set(bond.bondIdInMicroMode, bondInMoleculeStruct);
}
function deleteBondFromMoleculeStruct(bond) {
  var moleculeStruct = bond.firstAtom.monomer.monomerItem.struct;
  var bondInMoleculeStruct = moleculeStruct.bonds.get(bond.bondIdInMicroMode);
  moleculeStruct.bonds["delete"](bond.bondIdInMicroMode);
  return bondInMoleculeStruct;
}
var BondAddOperation = function () {
  function BondAddOperation(addBondChangeModel, deleteBondChangeModel) {
    _classCallCheck(this, BondAddOperation);
    _defineProperty(this, "addBondChangeModel", void 0);
    _defineProperty(this, "deleteBondChangeModel", void 0);
    _defineProperty(this, "bond", void 0);
    _defineProperty(this, "bondInMoleculeStruct", void 0);
    _defineProperty(this, "priority", 1);
    this.addBondChangeModel = addBondChangeModel;
    this.deleteBondChangeModel = deleteBondChangeModel;
    this.bond = this.addBondChangeModel();
  }
  _createClass(BondAddOperation, [{
    key: "execute",
    value: function execute() {
      this.bond = this.addBondChangeModel(this.bond);
      if (this.bondInMoleculeStruct) {
        addBondToMoleculeStruct(this.bond, this.bondInMoleculeStruct);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.bond) {
        this.deleteBondChangeModel(this.bond);
      }
      this.bondInMoleculeStruct = deleteBondFromMoleculeStruct(this.bond);
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      renderersManager.addBond(this.bond);
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      renderersManager.deleteBond(this.bond);
    }
  }]);
  return BondAddOperation;
}();
var BondDeleteOperation = function () {
  function BondDeleteOperation(bond, deleteBondChangeModel, addBondChangeModel) {
    _classCallCheck(this, BondDeleteOperation);
    _defineProperty(this, "bond", void 0);
    _defineProperty(this, "deleteBondChangeModel", void 0);
    _defineProperty(this, "addBondChangeModel", void 0);
    _defineProperty(this, "bondInMoleculeStruct", void 0);
    _defineProperty(this, "priority", 1);
    this.bond = bond;
    this.deleteBondChangeModel = deleteBondChangeModel;
    this.addBondChangeModel = addBondChangeModel;
  }
  _createClass(BondDeleteOperation, [{
    key: "execute",
    value: function execute() {
      this.deleteBondChangeModel(this.bond);
      this.bondInMoleculeStruct = deleteBondFromMoleculeStruct(this.bond);
    }
  }, {
    key: "invert",
    value: function invert() {
      this.addBondChangeModel(this.bond);
      if (this.bondInMoleculeStruct) {
        addBondToMoleculeStruct(this.bond, this.bondInMoleculeStruct);
      }
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      renderersManager.deleteBond(this.bond);
      renderersManager.rerenderSGroups();
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      renderersManager.addBond(this.bond);
      renderersManager.rerenderSGroups();
    }
  }]);
  return BondDeleteOperation;
}();

export { BondAddOperation, BondDeleteOperation };
//# sourceMappingURL=bond.modern.js.map
