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

var MonomerItemModifyOperation = function () {
  function MonomerItemModifyOperation(monomer, updateMonomerItem, revertMonomerItem) {
    _classCallCheck(this, MonomerItemModifyOperation);
    _defineProperty(this, "updateMonomerItem", void 0);
    _defineProperty(this, "revertMonomerItem", void 0);
    _defineProperty(this, "monomer", void 0);
    this.updateMonomerItem = updateMonomerItem;
    this.revertMonomerItem = revertMonomerItem;
    this.monomer = monomer;
    this.execute();
  }
  _createClass(MonomerItemModifyOperation, [{
    key: "execute",
    value: function execute() {
      this.monomer = this.updateMonomerItem();
    }
  }, {
    key: "invert",
    value: function invert() {
      this.monomer = this.revertMonomerItem();
    }
  }]);
  return MonomerItemModifyOperation;
}();

export { MonomerItemModifyOperation };
//# sourceMappingURL=MonomerItemModifyOperation.modern.js.map
