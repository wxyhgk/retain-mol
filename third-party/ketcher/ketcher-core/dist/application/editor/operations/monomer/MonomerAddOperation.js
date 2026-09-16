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

var MonomerAddOperation = function () {
  function MonomerAddOperation(addMonomerChangeModel, deleteMonomerChangeModel, callback) {
    _classCallCheck__default["default"](this, MonomerAddOperation);
    _defineProperty__default["default"](this, "addMonomerChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteMonomerChangeModel", void 0);
    _defineProperty__default["default"](this, "callback", void 0);
    _defineProperty__default["default"](this, "monomer", void 0);
    _defineProperty__default["default"](this, "priority", 1);
    this.addMonomerChangeModel = addMonomerChangeModel;
    this.deleteMonomerChangeModel = deleteMonomerChangeModel;
    this.callback = callback;
    this.monomer = this.addMonomerChangeModel();
  }
  _createClass__default["default"](MonomerAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.monomer = this.addMonomerChangeModel(this.monomer);
      renderersManager.addMonomer(this.monomer, this.callback);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.monomer) {
        this.deleteMonomerChangeModel(this.monomer);
        renderersManager.deleteMonomer(this.monomer);
      }
    }
  }]);
  return MonomerAddOperation;
}();

exports.MonomerAddOperation = MonomerAddOperation;
//# sourceMappingURL=MonomerAddOperation.js.map
