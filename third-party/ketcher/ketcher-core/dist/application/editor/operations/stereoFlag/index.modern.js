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

var StereoFlagAddOperation = function () {
  function StereoFlagAddOperation(addStereoFlagChangeModel, deleteStereoFlagChangeModel) {
    _classCallCheck(this, StereoFlagAddOperation);
    _defineProperty(this, "addStereoFlagChangeModel", void 0);
    _defineProperty(this, "deleteStereoFlagChangeModel", void 0);
    _defineProperty(this, "stereoFlag", void 0);
    _defineProperty(this, "priority", 2);
    this.addStereoFlagChangeModel = addStereoFlagChangeModel;
    this.deleteStereoFlagChangeModel = deleteStereoFlagChangeModel;
    this.stereoFlag = this.addStereoFlagChangeModel();
  }
  _createClass(StereoFlagAddOperation, [{
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
    _classCallCheck(this, StereoFlagDeleteOperation);
    _defineProperty(this, "stereoFlag", void 0);
    _defineProperty(this, "deleteStereoFlagChangeModel", void 0);
    _defineProperty(this, "addStereoFlagChangeModel", void 0);
    _defineProperty(this, "priority", 2);
    this.stereoFlag = stereoFlag;
    this.deleteStereoFlagChangeModel = deleteStereoFlagChangeModel;
    this.addStereoFlagChangeModel = addStereoFlagChangeModel;
  }
  _createClass(StereoFlagDeleteOperation, [{
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

export { StereoFlagAddOperation, StereoFlagDeleteOperation };
//# sourceMappingURL=index.modern.js.map
