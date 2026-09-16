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

var MonomerMoveOperation = function () {
  function MonomerMoveOperation(monomerMoveModelChange, invertMonomerMoveModelChange) {
    _classCallCheck(this, MonomerMoveOperation);
    _defineProperty(this, "monomerMoveModelChange", void 0);
    _defineProperty(this, "invertMonomerMoveModelChange", void 0);
    _defineProperty(this, "monomer", void 0);
    this.monomerMoveModelChange = monomerMoveModelChange;
    this.invertMonomerMoveModelChange = invertMonomerMoveModelChange;
    this.monomer = this.monomerMoveModelChange();
  }
  _createClass(MonomerMoveOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.monomer = this.monomerMoveModelChange();
      renderersManager.moveMonomer(this.monomer);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.monomer = this.invertMonomerMoveModelChange();
      renderersManager.moveMonomer(this.monomer);
    }
  }]);
  return MonomerMoveOperation;
}();

export { MonomerMoveOperation };
//# sourceMappingURL=MonomerMoveOperation.modern.js.map
