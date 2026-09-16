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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

var Action = function () {
  function Action() {
    var operations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    _classCallCheck(this, Action);
    _defineProperty(this, "operations", void 0);
    this.operations = operations;
  }
  _createClass(Action, [{
    key: "addOp",
    value: function addOp(operation, restruct) {
      if (!restruct || !operation.isDummy(restruct)) {
        this.operations.push(operation);
      }
      return operation;
    }
  }, {
    key: "mergeWith",
    value: function mergeWith(action) {
      this.operations = this.operations.concat(action.operations);
      return this;
    }
  }, {
    key: "perform",
    value: function perform(restruct) {
      var action = new Action();
      var sortedOperations = _toConsumableArray(this.operations).sort(function (a, b) {
        return a.priority - b.priority;
      });
      try {
        sortedOperations.forEach(function (operation) {
          var invertedOperation = operation.perform(restruct);
          action.addOp(invertedOperation);
        });
      } catch (cause) {
        var rollbackErrors = [];
        _toConsumableArray(action.operations).reverse().forEach(function (operation) {
          try {
            operation.perform(restruct);
          } catch (rollbackCause) {
            rollbackErrors.push(rollbackCause);
          }
        });
        if (rollbackErrors.length > 0) {
          throw new AggregateError([cause].concat(rollbackErrors), 'Action failed and could not be rolled back completely', {
            cause: cause
          });
        }
        throw cause;
      }
      return action;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      return this.operations.find(function (operation) {
        return restruct ? !operation.isDummy(restruct) : true;
      }) === undefined;
    }
  }]);
  return Action;
}();

export { Action };
//# sourceMappingURL=action.modern.js.map
