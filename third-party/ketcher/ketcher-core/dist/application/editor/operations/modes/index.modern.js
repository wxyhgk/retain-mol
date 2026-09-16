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
import { provideEditorInstance } from '../../editorSingleton.modern.js';

var ReinitializeModeOperation = function () {
  function ReinitializeModeOperation() {
    var forceRecalculateAntisense = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    _classCallCheck(this, ReinitializeModeOperation);
    _defineProperty(this, "forceRecalculateAntisense", void 0);
    _defineProperty(this, "priority", 2);
    this.forceRecalculateAntisense = forceRecalculateAntisense;
  }
  _createClass(ReinitializeModeOperation, [{
    key: "execute",
    value: function execute(_renderersManager) {
      var editor = provideEditorInstance();
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
    _classCallCheck(this, RestoreSequenceCaretPositionOperation);
    _defineProperty(this, "previousPosition", void 0);
    _defineProperty(this, "nextPosition", void 0);
    _defineProperty(this, "setCaretPosition", void 0);
    this.previousPosition = previousPosition;
    this.nextPosition = nextPosition;
    this.setCaretPosition = setCaretPosition;
    this.execute();
  }
  _createClass(RestoreSequenceCaretPositionOperation, [{
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

export { ReinitializeModeOperation, RestoreSequenceCaretPositionOperation };
//# sourceMappingURL=index.modern.js.map
