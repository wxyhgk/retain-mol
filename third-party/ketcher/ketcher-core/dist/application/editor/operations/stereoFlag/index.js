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

var StereoFlagAddOperation = function () {
  function StereoFlagAddOperation(addStereoFlagChangeModel, deleteStereoFlagChangeModel) {
    _classCallCheck__default["default"](this, StereoFlagAddOperation);
    _defineProperty__default["default"](this, "addStereoFlagChangeModel", void 0);
    _defineProperty__default["default"](this, "deleteStereoFlagChangeModel", void 0);
    _defineProperty__default["default"](this, "stereoFlag", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.addStereoFlagChangeModel = addStereoFlagChangeModel;
    this.deleteStereoFlagChangeModel = deleteStereoFlagChangeModel;
    this.stereoFlag = this.addStereoFlagChangeModel();
  }
  _createClass__default["default"](StereoFlagAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.stereoFlag = this.addStereoFlagChangeModel(this.stereoFlag);
      renderersManager.addStereoFlag(this.stereoFlag);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      if (this.stereoFlag) {
        this.deleteStereoFlagChangeModel(this.stereoFlag);
        renderersManager.deleteStereoFlag(this.stereoFlag);
      }
    }
  }]);
  return StereoFlagAddOperation;
}();
var StereoFlagDeleteOperation = function () {
  function StereoFlagDeleteOperation(stereoFlag, deleteStereoFlagChangeModel, addStereoFlagChangeModel) {
    _classCallCheck__default["default"](this, StereoFlagDeleteOperation);
    _defineProperty__default["default"](this, "stereoFlag", void 0);
    _defineProperty__default["default"](this, "deleteStereoFlagChangeModel", void 0);
    _defineProperty__default["default"](this, "addStereoFlagChangeModel", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.stereoFlag = stereoFlag;
    this.deleteStereoFlagChangeModel = deleteStereoFlagChangeModel;
    this.addStereoFlagChangeModel = addStereoFlagChangeModel;
  }
  _createClass__default["default"](StereoFlagDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deleteStereoFlagChangeModel(this.stereoFlag);
      renderersManager.deleteStereoFlag(this.stereoFlag);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.addStereoFlagChangeModel(this.stereoFlag);
      renderersManager.addStereoFlag(this.stereoFlag);
    }
  }]);
  return StereoFlagDeleteOperation;
}();

exports.StereoFlagAddOperation = StereoFlagAddOperation;
exports.StereoFlagDeleteOperation = StereoFlagDeleteOperation;
//# sourceMappingURL=index.js.map
