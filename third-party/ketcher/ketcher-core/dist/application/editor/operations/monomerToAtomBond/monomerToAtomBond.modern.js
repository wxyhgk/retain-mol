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

var MonomerToAtomBondAddOperation = function () {
  function MonomerToAtomBondAddOperation(addMonomerToAtomBondChangeModel, deleteMonomerToAtomBondChangeModel) {
    _classCallCheck(this, MonomerToAtomBondAddOperation);
    _defineProperty(this, "addMonomerToAtomBondChangeModel", void 0);
    _defineProperty(this, "deleteMonomerToAtomBondChangeModel", void 0);
    _defineProperty(this, "monomerToAtomBond", void 0);
    this.addMonomerToAtomBondChangeModel = addMonomerToAtomBondChangeModel;
    this.deleteMonomerToAtomBondChangeModel = deleteMonomerToAtomBondChangeModel;
    this.monomerToAtomBond = this.addMonomerToAtomBondChangeModel();
  }
  _createClass(MonomerToAtomBondAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.monomerToAtomBond = this.addMonomerToAtomBondChangeModel(this.monomerToAtomBond);
      renderersManager.addMonomerToAtomBond(this.monomerToAtomBond);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.monomerToAtomBond) {
        this.deleteMonomerToAtomBondChangeModel(this.monomerToAtomBond);
        renderersManager.deleteMonomerToAtomBond(this.monomerToAtomBond);
      }
    }
  }]);
  return MonomerToAtomBondAddOperation;
}();
var MonomerToAtomBondDeleteOperation = function () {
  function MonomerToAtomBondDeleteOperation(monomerToAtomBond, deleteMonomerToAtomBondChangeModel, addMonomerToAtomBondChangeModel) {
    _classCallCheck(this, MonomerToAtomBondDeleteOperation);
    _defineProperty(this, "monomerToAtomBond", void 0);
    _defineProperty(this, "deleteMonomerToAtomBondChangeModel", void 0);
    _defineProperty(this, "addMonomerToAtomBondChangeModel", void 0);
    this.monomerToAtomBond = monomerToAtomBond;
    this.deleteMonomerToAtomBondChangeModel = deleteMonomerToAtomBondChangeModel;
    this.addMonomerToAtomBondChangeModel = addMonomerToAtomBondChangeModel;
  }
  _createClass(MonomerToAtomBondDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteMonomerToAtomBondChangeModel(this.monomerToAtomBond);
      renderersManager.deleteMonomerToAtomBond(this.monomerToAtomBond);
    }
  }, {
    key: "invert",
    value: function invert(_renderersManager) {
      this.addMonomerToAtomBondChangeModel(this.monomerToAtomBond);
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      renderersManager.addMonomerToAtomBond(this.monomerToAtomBond);
    }
  }]);
  return MonomerToAtomBondDeleteOperation;
}();

export { MonomerToAtomBondAddOperation, MonomerToAtomBondDeleteOperation };
//# sourceMappingURL=monomerToAtomBond.modern.js.map
