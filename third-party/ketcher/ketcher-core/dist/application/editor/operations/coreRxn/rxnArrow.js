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

var RxnArrowAddOperation = function () {
  function RxnArrowAddOperation(addArrowChangeModel, deleteArrowChangeModel) {
    _classCallCheck__default["default"](this, RxnArrowAddOperation);
    _defineProperty__default["default"](this, "addArrowChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteArrowChangeModel", void 0);
    _defineProperty__default["default"](this, "rxnArrow", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.addArrowChangeModel = addArrowChangeModel;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.rxnArrow = this.addArrowChangeModel();
  }
  _createClass__default["default"](RxnArrowAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.rxnArrow = this.addArrowChangeModel(this.rxnArrow);
      renderersManager.addRxnArrow(this.rxnArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.rxnArrow) {
        this.deleteArrowChangeModel(this.rxnArrow);
        renderersManager.deleteRxnArrow(this.rxnArrow);
      }
    }
  }]);
  return RxnArrowAddOperation;
}();
var RxnArrowDeleteOperation = function () {
  function RxnArrowDeleteOperation(rxnArrow, deleteArrowChangeModel, addArrowChangeModel) {
    _classCallCheck__default["default"](this, RxnArrowDeleteOperation);
    _defineProperty__default["default"](this, "rxnArrow", void 0);
    _defineProperty__default["default"](this, "deleteArrowChangeModel", void 0);
    _defineProperty__default["default"](this, "addArrowChangeModel", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.rxnArrow = rxnArrow;
    this.deleteArrowChangeModel = deleteArrowChangeModel;
    this.addArrowChangeModel = addArrowChangeModel;
  }
  _createClass__default["default"](RxnArrowDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteArrowChangeModel(this.rxnArrow);
      renderersManager.deleteRxnArrow(this.rxnArrow);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addArrowChangeModel(this.rxnArrow);
      renderersManager.addRxnArrow(this.rxnArrow);
    }
  }]);
  return RxnArrowDeleteOperation;
}();

exports.RxnArrowAddOperation = RxnArrowAddOperation;
exports.RxnArrowDeleteOperation = RxnArrowDeleteOperation;
//# sourceMappingURL=rxnArrow.js.map
