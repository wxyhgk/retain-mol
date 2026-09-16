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

var RxnPlusAddOperation = function () {
  function RxnPlusAddOperation(addRxnPlusChangeModel, deleteRxnPlusChangeModel) {
    _classCallCheck(this, RxnPlusAddOperation);
    _defineProperty(this, "addRxnPlusChangeModel", void 0);
    _defineProperty(this, "deleteRxnPlusChangeModel", void 0);
    _defineProperty(this, "rxnPlus", void 0);
    _defineProperty(this, "priority", 2);
    this.addRxnPlusChangeModel = addRxnPlusChangeModel;
    this.deleteRxnPlusChangeModel = deleteRxnPlusChangeModel;
    this.rxnPlus = this.addRxnPlusChangeModel();
  }
  _createClass(RxnPlusAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.rxnPlus = this.addRxnPlusChangeModel(this.rxnPlus);
      renderersManager.addRxnPlus(this.rxnPlus);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.rxnPlus) {
        this.deleteRxnPlusChangeModel(this.rxnPlus);
        renderersManager.deleteRxnPlus(this.rxnPlus);
      }
    }
  }]);
  return RxnPlusAddOperation;
}();
var RxnPlusDeleteOperation = function () {
  function RxnPlusDeleteOperation(rxnPlus, deleteRxnPlusChangeModel, addRxnPlusChangeModel) {
    _classCallCheck(this, RxnPlusDeleteOperation);
    _defineProperty(this, "rxnPlus", void 0);
    _defineProperty(this, "deleteRxnPlusChangeModel", void 0);
    _defineProperty(this, "addRxnPlusChangeModel", void 0);
    _defineProperty(this, "priority", 2);
    this.rxnPlus = rxnPlus;
    this.deleteRxnPlusChangeModel = deleteRxnPlusChangeModel;
    this.addRxnPlusChangeModel = addRxnPlusChangeModel;
  }
  _createClass(RxnPlusDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteRxnPlusChangeModel(this.rxnPlus);
      renderersManager.deleteRxnPlus(this.rxnPlus);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addRxnPlusChangeModel(this.rxnPlus);
      renderersManager.addRxnPlus(this.rxnPlus);
    }
  }]);
  return RxnPlusDeleteOperation;
}();

export { RxnPlusAddOperation, RxnPlusDeleteOperation };
//# sourceMappingURL=rxnPlus.modern.js.map
