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

var Command = function () {
  function Command() {
    _classCallCheck__default["default"](this, Command);
    _defineProperty__default["default"](this, "operations", []);
    _defineProperty__default["default"](this, "undoOperationReverse", false);
    _defineProperty__default["default"](this, "setUndoOperationByPriority", false);
  }
  _createClass__default["default"](Command, [{
    key: "addOperation",
    value: function addOperation(operation) {
      this.operations.push(operation);
    }
  }, {
    key: "merge",
    value: function merge(command) {
      var _this$operations;
      (_this$operations = this.operations).push.apply(_this$operations, _toConsumableArray__default["default"](command.operations));
      this.setUndoOperationByPriority = command.setUndoOperationByPriority;
    }
  }, {
    key: "setUndoOperationReverse",
    value: function setUndoOperationReverse() {
      this.undoOperationReverse = true;
    }
  }, {
    key: "setUndoOperationsByPriority",
    value: function setUndoOperationsByPriority() {
      this.setUndoOperationByPriority = true;
    }
  }, {
    key: "invert",
    value: function invert(renderersManagers) {
      var operations = this.undoOperationReverse ? this.operations.slice().reverse() : _toConsumableArray__default["default"](this.operations);
      if (this.setUndoOperationByPriority) {
        operations.sort(function (a, b) {
          var _a$priority, _b$priority;
          return ((_a$priority = a.priority) !== null && _a$priority !== void 0 ? _a$priority : 0) - ((_b$priority = b.priority) !== null && _b$priority !== void 0 ? _b$priority : 0);
        });
      }
      operations.forEach(function (operation) {
        return operation.invert(renderersManagers);
      });
      renderersManagers.reinitializeViewModel();
      this.invertAfterAllOperations(renderersManagers, operations);
      renderersManagers.runPostRenderMethods();
    }
  }, {
    key: "execute",
    value: function execute(renderersManagers) {
      this.operations.forEach(function (operation) {
        return operation.execute(renderersManagers);
      });
      renderersManagers.reinitializeViewModel();
      this.executeAfterAllOperations(renderersManagers);
      renderersManagers.runPostRenderMethods();
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManagers) {
      var operations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.operations;
      operations.forEach(function (operation) {
        if (operation.executeAfterAllOperations) {
          operation.executeAfterAllOperations(renderersManagers);
        }
      });
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManagers) {
      var operations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.operations;
      operations.forEach(function (operation) {
        if (operation.invertAfterAllOperations) {
          operation.invertAfterAllOperations(renderersManagers);
        }
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      this.operations = [];
    }
  }]);
  return Command;
}();

exports.Command = Command;
//# sourceMappingURL=Command.js.map
