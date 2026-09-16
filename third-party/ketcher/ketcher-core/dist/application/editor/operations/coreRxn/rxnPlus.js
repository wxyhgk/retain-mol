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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var RxnPlusAddOperation = function () {
  function RxnPlusAddOperation(addRxnPlusChangeModel, deleteRxnPlusChangeModel) {
    _classCallCheck__default["default"](this, RxnPlusAddOperation);
    _defineProperty__default["default"](this, "addRxnPlusChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteRxnPlusChangeModel", void 0);
    _defineProperty__default["default"](this, "rxnPlus", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.addRxnPlusChangeModel = addRxnPlusChangeModel;
    this.deleteRxnPlusChangeModel = deleteRxnPlusChangeModel;
    this.rxnPlus = this.addRxnPlusChangeModel();
  }
  _createClass__default["default"](RxnPlusAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.rxnPlus = this.addRxnPlusChangeModel(this.rxnPlus);
      renderersManager.addRxnPlus(this.rxnPlus);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.rxnPlus) {
        this.deleteRxnPlusChangeModel(this.rxnPlus);
        renderersManager.deleteRxnPlus(this.rxnPlus);
      }
    }
  }]);
  return RxnPlusAddOperation;
}();
var RxnPlusDeleteOperation = function () {
  function RxnPlusDeleteOperation(rxnPlus, deleteRxnPlusChangeModel, addRxnPlusChangeModel) {
    _classCallCheck__default["default"](this, RxnPlusDeleteOperation);
    _defineProperty__default["default"](this, "rxnPlus", void 0);
    _defineProperty__default["default"](this, "deleteRxnPlusChangeModel", void 0);
    _defineProperty__default["default"](this, "addRxnPlusChangeModel", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.rxnPlus = rxnPlus;
    this.deleteRxnPlusChangeModel = deleteRxnPlusChangeModel;
    this.addRxnPlusChangeModel = addRxnPlusChangeModel;
  }
  _createClass__default["default"](RxnPlusDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteRxnPlusChangeModel(this.rxnPlus);
      renderersManager.deleteRxnPlus(this.rxnPlus);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addRxnPlusChangeModel(this.rxnPlus);
      renderersManager.addRxnPlus(this.rxnPlus);
    }
  }]);
  return RxnPlusDeleteOperation;
}();

exports.RxnPlusAddOperation = RxnPlusAddOperation;
exports.RxnPlusDeleteOperation = RxnPlusDeleteOperation;
//# sourceMappingURL=rxnPlus.js.map
