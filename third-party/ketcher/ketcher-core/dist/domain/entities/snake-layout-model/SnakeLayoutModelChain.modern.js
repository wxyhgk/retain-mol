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

var SnakeLayoutModelChain = function () {
  function SnakeLayoutModelChain() {
    _classCallCheck(this, SnakeLayoutModelChain);
    _defineProperty(this, "rows", []);
  }
  _createClass(SnakeLayoutModelChain, [{
    key: "lastRow",
    get: function get() {
      return this.rows[this.rows.length - 1];
    }
  }, {
    key: "lastNode",
    get: function get() {
      return this.lastRow.snakeLayoutModelItems[this.lastRow.snakeLayoutModelItems.length - 1];
    }
  }, {
    key: "firstRow",
    get: function get() {
      return this.rows[0];
    }
  }, {
    key: "firstNode",
    get: function get() {
      return this.firstRow.snakeLayoutModelItems[0];
    }
  }, {
    key: "nodes",
    get: function get() {
      return this.rows.reduce(function (acc, row) {
        return acc.concat(row.snakeLayoutModelItems);
      }, []);
    }
  }, {
    key: "length",
    get: function get() {
      return this.nodes.length;
    }
  }, {
    key: "rowsLength",
    get: function get() {
      return this.rows.length;
    }
  }, {
    key: "addRow",
    value: function addRow(row) {
      this.rows.push(row);
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(callback) {
      var nodeIndexInChain = 0;
      this.rows.forEach(function (row) {
        row.snakeLayoutModelItems.forEach(function (node) {
          callback(node, nodeIndexInChain);
          nodeIndexInChain++;
        });
      });
    }
  }, {
    key: "forEachRow",
    value: function forEachRow(callback) {
      this.rows.forEach(function (row, rowIndex) {
        callback(row, rowIndex);
      });
    }
  }]);
  return SnakeLayoutModelChain;
}();

export { SnakeLayoutModelChain };
//# sourceMappingURL=SnakeLayoutModelChain.modern.js.map
