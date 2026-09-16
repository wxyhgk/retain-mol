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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var Action = function () {
  function Action() {
    var operations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    _classCallCheck__default["default"](this, Action);
    _defineProperty__default["default"](this, "operations", void 0);
    this.operations = operations;
  }
  _createClass__default["default"](Action, [{
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
      var sortedOperations = _toConsumableArray__default["default"](this.operations).sort(function (a, b) {
        return a.priority - b.priority;
      });
      try {
        sortedOperations.forEach(function (operation) {
          var invertedOperation = operation.perform(restruct);
          action.addOp(invertedOperation);
        });
      } catch (cause) {
        var rollbackErrors = [];
        _toConsumableArray__default["default"](action.operations).reverse().forEach(function (operation) {
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

exports.Action = Action;
//# sourceMappingURL=action.js.map
