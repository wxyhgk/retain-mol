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

var SaltsAndSolventsProvider = function () {
  function SaltsAndSolventsProvider() {
    _classCallCheck(this, SaltsAndSolventsProvider);
    _defineProperty(this, "saltsAndSolventsList", void 0);
    this.saltsAndSolventsList = [];
  }
  _createClass(SaltsAndSolventsProvider, [{
    key: "getSaltsAndSolventsList",
    value: function getSaltsAndSolventsList() {
      return this.saltsAndSolventsList;
    }
  }, {
    key: "setSaltsAndSolventsList",
    value: function setSaltsAndSolventsList(list) {
      this.saltsAndSolventsList = list;
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!SaltsAndSolventsProvider.instance) {
        SaltsAndSolventsProvider.instance = new SaltsAndSolventsProvider();
      }
      return SaltsAndSolventsProvider.instance;
    }
  }]);
  return SaltsAndSolventsProvider;
}();
_defineProperty(SaltsAndSolventsProvider, "instance", void 0);

export { SaltsAndSolventsProvider };
//# sourceMappingURL=saltsAndSolventsProvider.modern.js.map
