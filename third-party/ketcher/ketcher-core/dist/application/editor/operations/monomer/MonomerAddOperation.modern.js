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

var MonomerAddOperation = function () {
  function MonomerAddOperation(addMonomerChangeModel, deleteMonomerChangeModel, callback) {
    _classCallCheck(this, MonomerAddOperation);
    _defineProperty(this, "addMonomerChangeModel", void 0);
    _defineProperty(this, "deleteMonomerChangeModel", void 0);
    _defineProperty(this, "callback", void 0);
    _defineProperty(this, "monomer", void 0);
    _defineProperty(this, "priority", 1);
    this.addMonomerChangeModel = addMonomerChangeModel;
    this.deleteMonomerChangeModel = deleteMonomerChangeModel;
    this.callback = callback;
    this.monomer = this.addMonomerChangeModel();
  }
  _createClass(MonomerAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.monomer = this.addMonomerChangeModel(this.monomer);
      renderersManager.addMonomer(this.monomer, this.callback);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.monomer) {
        this.deleteMonomerChangeModel(this.monomer);
        renderersManager.deleteMonomer(this.monomer);
      }
    }
  }]);
  return MonomerAddOperation;
}();

export { MonomerAddOperation };
//# sourceMappingURL=MonomerAddOperation.modern.js.map
