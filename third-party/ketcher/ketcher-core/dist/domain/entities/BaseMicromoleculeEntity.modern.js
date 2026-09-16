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

var INVALID = 'invalid';
var BaseMicromoleculeEntity = function () {
  function BaseMicromoleculeEntity(initiallySelected) {
    _classCallCheck(this, BaseMicromoleculeEntity);
    _defineProperty(this, "initiallySelected", void 0);
    this.initiallySelected = initiallySelected;
  }
  _createClass(BaseMicromoleculeEntity, [{
    key: "getInitiallySelected",
    value: function getInitiallySelected() {
      if (this.initiallySelected === INVALID) {
        throw new Error('this field is used only for serialization/deserialization');
      }
      return this.initiallySelected;
    }
  }, {
    key: "setInitiallySelected",
    value: function setInitiallySelected(value) {
      if (this.initiallySelected === INVALID) {
        throw new Error('this field is used only for serialization/deserialization');
      }
      this.initiallySelected = value;
    }
  }, {
    key: "resetInitiallySelected",
    value: function resetInitiallySelected(invalidate) {
      this.initiallySelected = invalidate ? INVALID : undefined;
    }
  }]);
  return BaseMicromoleculeEntity;
}();

export { BaseMicromoleculeEntity, INVALID };
//# sourceMappingURL=BaseMicromoleculeEntity.modern.js.map
