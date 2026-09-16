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

var AttachmentPointHoverOperation = function () {
  function AttachmentPointHoverOperation(peptide, attachmentPointName) {
    _classCallCheck(this, AttachmentPointHoverOperation);
    _defineProperty(this, "peptide", void 0);
    _defineProperty(this, "attachmentPointName", void 0);
    this.peptide = peptide;
    this.attachmentPointName = attachmentPointName;
  }
  _createClass(AttachmentPointHoverOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      renderersManager.hoverAttachmentPoint(this.peptide, this.attachmentPointName);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return AttachmentPointHoverOperation;
}();

export { AttachmentPointHoverOperation };
//# sourceMappingURL=AttachmentPointHoverOperation.modern.js.map
