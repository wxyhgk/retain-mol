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

var RxnArrowAddOperation = function () {
  function RxnArrowAddOperation(addArrowChangeModel, deleteArrowChangeModel) {
    _classCallCheck(this, RxnArrowAddOperation);
    _defineProperty(this, "addArrowChangeModel", void 0);
    _defineProperty(this, "deleteArrowChangeModel", void 0);
    _defineProperty(this, "rxnArrow", void 0);
    _defineProperty(this, "priority", 2);
    this.addArrowChangeModel = addArrowChangeModel;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.rxnArrow = this.addArrowChangeModel();
  }
  _createClass(RxnArrowAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.rxnArrow = this.addArrowChangeModel(this.rxnArrow);
      renderersManager.addRxnArrow(this.rxnArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.rxnArrow) {
        this.deleteArrowChangeModel(this.rxnArrow);
        renderersManager.deleteRxnArrow(this.rxnArrow);
      }
    }
  }]);
  return RxnArrowAddOperation;
}();
var RxnArrowDeleteOperation = function () {
  function RxnArrowDeleteOperation(rxnArrow, deleteArrowChangeModel, addArrowChangeModel) {
    _classCallCheck(this, RxnArrowDeleteOperation);
    _defineProperty(this, "rxnArrow", void 0);
    _defineProperty(this, "deleteArrowChangeModel", void 0);
    _defineProperty(this, "addArrowChangeModel", void 0);
    _defineProperty(this, "priority", 2);
    this.rxnArrow = rxnArrow;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.addArrowChangeModel = addArrowChangeModel;
  }
  _createClass(RxnArrowDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteArrowChangeModel(this.rxnArrow);
      renderersManager.deleteRxnArrow(this.rxnArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addArrowChangeModel(this.rxnArrow);
      renderersManager.addRxnArrow(this.rxnArrow);
    }
  }]);
  return RxnArrowDeleteOperation;
}();

export { RxnArrowAddOperation, RxnArrowDeleteOperation };
//# sourceMappingURL=rxnArrow.modern.js.map
