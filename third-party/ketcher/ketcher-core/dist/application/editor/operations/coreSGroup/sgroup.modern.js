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

var SGroupAddOperation = function () {
  function SGroupAddOperation(addSGroupChangeModel, deleteSGroupChangeModel) {
    _classCallCheck(this, SGroupAddOperation);
    _defineProperty(this, "addSGroupChangeModel", void 0);
    _defineProperty(this, "deleteSGroupChangeModel", void 0);
    _defineProperty(this, "sgroupDrawingEntity", void 0);
    _defineProperty(this, "priority", 2);
    this.addSGroupChangeModel = addSGroupChangeModel;
    this.deleteSGroupChangeModel = deleteSGroupChangeModel;
    this.sgroupDrawingEntity = this.addSGroupChangeModel();
  }
  _createClass(SGroupAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.sgroupDrawingEntity = this.addSGroupChangeModel(this.sgroupDrawingEntity);
      renderersManager.addSGroup(this.sgroupDrawingEntity);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.deleteSGroupChangeModel(this.sgroupDrawingEntity);
      renderersManager.deleteSGroup(this.sgroupDrawingEntity);
    }
  }]);
  return SGroupAddOperation;
}();
var SGroupDeleteOperation = function () {
  function SGroupDeleteOperation(sgroupDrawingEntity, deleteSGroupChangeModel, addSGroupChangeModel) {
    _classCallCheck(this, SGroupDeleteOperation);
    _defineProperty(this, "sgroupDrawingEntity", void 0);
    _defineProperty(this, "deleteSGroupChangeModel", void 0);
    _defineProperty(this, "addSGroupChangeModel", void 0);
    _defineProperty(this, "priority", 2);
    this.sgroupDrawingEntity = sgroupDrawingEntity;
    this.deleteSGroupChangeModel = deleteSGroupChangeModel;
    this.addSGroupChangeModel = addSGroupChangeModel;
  }
  _createClass(SGroupDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteSGroupChangeModel(this.sgroupDrawingEntity);
      renderersManager.deleteSGroup(this.sgroupDrawingEntity);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addSGroupChangeModel(this.sgroupDrawingEntity);
      renderersManager.addSGroup(this.sgroupDrawingEntity);
    }
  }]);
  return SGroupDeleteOperation;
}();

export { SGroupAddOperation, SGroupDeleteOperation };
//# sourceMappingURL=sgroup.modern.js.map
