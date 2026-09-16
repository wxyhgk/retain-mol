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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var MonomerToAtomBondAddOperation = function () {
  function MonomerToAtomBondAddOperation(addMonomerToAtomBondChangeModel, deleteMonomerToAtomBondChangeModel) {
    _classCallCheck__default["default"](this, MonomerToAtomBondAddOperation);
    _defineProperty__default["default"](this, "addMonomerToAtomBondChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteMonomerToAtomBondChangeModel", void 0);
    _defineProperty__default["default"](this, "monomerToAtomBond", void 0);
    this.addMonomerToAtomBondChangeModel = addMonomerToAtomBondChangeModel;
    this.deleteMonomerToAtomBondChangeModel = deleteMonomerToAtomBondChangeModel;
    this.monomerToAtomBond = this.addMonomerToAtomBondChangeModel();
  }
  _createClass__default["default"](MonomerToAtomBondAddOperation, [{
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
    _classCallCheck__default["default"](this, MonomerToAtomBondDeleteOperation);
    _defineProperty__default["default"](this, "monomerToAtomBond", void 0);
    _defineProperty__default["default"](this, "deleteMonomerToAtomBondChangeModel", void 0);
    _defineProperty__default["default"](this, "addMonomerToAtomBondChangeModel", void 0);
    this.monomerToAtomBond = monomerToAtomBond;
    this.deleteMonomerToAtomBondChangeModel = deleteMonomerToAtomBondChangeModel;
    this.addMonomerToAtomBondChangeModel = addMonomerToAtomBondChangeModel;
  }
  _createClass__default["default"](MonomerToAtomBondDeleteOperation, [{
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

exports.MonomerToAtomBondAddOperation = MonomerToAtomBondAddOperation;
exports.MonomerToAtomBondDeleteOperation = MonomerToAtomBondDeleteOperation;
//# sourceMappingURL=monomerToAtomBond.js.map
