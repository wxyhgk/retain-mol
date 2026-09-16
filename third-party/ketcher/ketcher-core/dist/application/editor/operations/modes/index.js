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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var ReinitializeModeOperation = function () {
  function ReinitializeModeOperation() {
    var forceRecalculateAntisense = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    _classCallCheck__default["default"](this, ReinitializeModeOperation);
    _defineProperty__default["default"](this, "forceRecalculateAntisense", void 0);
    _defineProperty__default["default"](this, "priority", 2);
    this.forceRecalculateAntisense = forceRecalculateAntisense;
  }
  _createClass__default["default"](ReinitializeModeOperation, [{
    key: "execute",
    value: function execute(_renderersManager) {
      var editor = editorSingleton.provideEditorInstance();
      editor.mode.initialize(false, undefined, true, this.forceRecalculateAntisense);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.execute(renderersManager);
    }
  }]);
  return ReinitializeModeOperation;
}();
var RestoreSequenceCaretPositionOperation = function () {
  function RestoreSequenceCaretPositionOperation(previousPosition, nextPosition, setCaretPosition) {
    _classCallCheck__default["default"](this, RestoreSequenceCaretPositionOperation);
    _defineProperty__default["default"](this, "previousPosition", void 0);
    _defineProperty__default["default"](this, "nextPosition", void 0);
    _defineProperty__default["default"](this, "setCaretPosition", void 0);
    this.previousPosition = previousPosition;
    this.nextPosition = nextPosition;
    this.setCaretPosition = setCaretPosition;
    this.execute();
  }
  _createClass__default["default"](RestoreSequenceCaretPositionOperation, [{
    key: "execute",
    value: function execute() {
      this.setCaretPosition(this.nextPosition);
    }
  }, {
    key: "invert",
    value: function invert(_renderersManager) {
      this.setCaretPosition(this.previousPosition);
    }
  }]);
  return RestoreSequenceCaretPositionOperation;
}();

exports.ReinitializeModeOperation = ReinitializeModeOperation;
exports.RestoreSequenceCaretPositionOperation = RestoreSequenceCaretPositionOperation;
//# sourceMappingURL=index.js.map
