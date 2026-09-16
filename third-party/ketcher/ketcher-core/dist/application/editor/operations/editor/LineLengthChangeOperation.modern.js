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
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import { SettingsManager } from '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';

var LineLengthChangeOperation = function () {
  function LineLengthChangeOperation(lineLengthUpdate) {
    _classCallCheck(this, LineLengthChangeOperation);
    _defineProperty(this, "lineLengthUpdate", void 0);
    _defineProperty(this, "previousLineLength", void 0);
    this.lineLengthUpdate = lineLengthUpdate;
    this.previousLineLength = SettingsManager.editorLineLength;
    this.execute();
  }
  _createClass(LineLengthChangeOperation, [{
    key: "execute",
    value: function execute() {
      SettingsManager.editorLineLength = this.lineLengthUpdate;
      var editor = provideEditorInstance();
      editor.mode.initialize();
    }
  }, {
    key: "invert",
    value: function invert() {
      SettingsManager.editorLineLength = this.previousLineLength;
      var editor = provideEditorInstance();
      editor.mode.initialize();
    }
  }]);
  return LineLengthChangeOperation;
}();

export { LineLengthChangeOperation };
//# sourceMappingURL=LineLengthChangeOperation.modern.js.map
