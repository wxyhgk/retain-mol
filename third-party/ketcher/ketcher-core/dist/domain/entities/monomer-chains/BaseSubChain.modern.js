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

var BaseSubChain = function () {
  function BaseSubChain() {
    _classCallCheck(this, BaseSubChain);
    _defineProperty(this, "nodes", []);
    _defineProperty(this, "bonds", []);
    _defineProperty(this, "modified", true);
  }
  _createClass(BaseSubChain, [{
    key: "lastNode",
    get: function get() {
      return this.nodes[this.nodes.length - 1];
    }
  }, {
    key: "firstNode",
    get: function get() {
      return this.nodes[0];
    }
  }, {
    key: "add",
    value: function add(node) {
      this.nodes.push(node);
      this.modified = true;
    }
  }, {
    key: "addBond",
    value: function addBond(bond) {
      this.bonds.push(bond);
      this.modified = true;
    }
  }, {
    key: "length",
    get: function get() {
      return this.nodes.length;
    }
  }]);
  return BaseSubChain;
}();

export { BaseSubChain };
//# sourceMappingURL=BaseSubChain.modern.js.map
