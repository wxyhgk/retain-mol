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

var MultitailArrowAddOperation = function () {
  function MultitailArrowAddOperation(addArrowChangeModel, deleteArrowChangeModel) {
    _classCallCheck(this, MultitailArrowAddOperation);
    _defineProperty(this, "addArrowChangeModel", void 0);
    _defineProperty(this, "deleteArrowChangeModel", void 0);
    _defineProperty(this, "multitailArrow", void 0);
    _defineProperty(this, "priority", 2);
    this.addArrowChangeModel = addArrowChangeModel;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.multitailArrow = this.addArrowChangeModel();
  }
  _createClass(MultitailArrowAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.multitailArrow = this.addArrowChangeModel(this.multitailArrow);
      renderersManager.addMultitailArrow(this.multitailArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.multitailArrow) {
        this.deleteArrowChangeModel(this.multitailArrow);
        renderersManager.deleteMultitailArrow(this.multitailArrow);
      }
    }
  }]);
  return MultitailArrowAddOperation;
}();
var MultitailArrowDeleteOperation = function () {
  function MultitailArrowDeleteOperation(multitailArrow, deleteArrowChangeModel, addArrowChangeModel) {
    _classCallCheck(this, MultitailArrowDeleteOperation);
    _defineProperty(this, "multitailArrow", void 0);
    _defineProperty(this, "deleteArrowChangeModel", void 0);
    _defineProperty(this, "addArrowChangeModel", void 0);
    _defineProperty(this, "priority", 2);
    this.multitailArrow = multitailArrow;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.addArrowChangeModel = addArrowChangeModel;
  }
  _createClass(MultitailArrowDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteArrowChangeModel(this.multitailArrow);
      renderersManager.deleteMultitailArrow(this.multitailArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addArrowChangeModel(this.multitailArrow);
      renderersManager.addMultitailArrow(this.multitailArrow);
    }
  }]);
  return MultitailArrowDeleteOperation;
}();

export { MultitailArrowAddOperation, MultitailArrowDeleteOperation };
//# sourceMappingURL=multitailArrow.modern.js.map
