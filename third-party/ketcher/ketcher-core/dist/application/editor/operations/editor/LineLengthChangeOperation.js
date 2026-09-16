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
var editorSingleton = require('../../editorSingleton.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
var SettingsManager = require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var LineLengthChangeOperation = function () {
  function LineLengthChangeOperation(lineLengthUpdate) {
    _classCallCheck__default["default"](this, LineLengthChangeOperation);
    _defineProperty__default["default"](this, "lineLengthUpdate", void 0);
    _defineProperty__default["default"](this, "previousLineLength", void 0);
    this.lineLengthUpdate = lineLengthUpdate;
    this.previousLineLength = SettingsManager.SettingsManager.editorLineLength;
    this.execute();
  }
  _createClass__default["default"](LineLengthChangeOperation, [{
    key: "execute",
    value: function execute() {
      SettingsManager.SettingsManager.editorLineLength = this.lineLengthUpdate;
      var editor = editorSingleton.provideEditorInstance();
      editor.mode.initialize();
    }
  }, {
    key: "invert",
    value: function invert() {
      SettingsManager.SettingsManager.editorLineLength = this.previousLineLength;
      var editor = editorSingleton.provideEditorInstance();
      editor.mode.initialize();
    }
  }]);
  return LineLengthChangeOperation;
}();

exports.LineLengthChangeOperation = LineLengthChangeOperation;
//# sourceMappingURL=LineLengthChangeOperation.js.map
