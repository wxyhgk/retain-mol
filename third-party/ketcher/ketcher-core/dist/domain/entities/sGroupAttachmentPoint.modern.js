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
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { RGroupAttachmentPoint } from './rgroupAttachmentPoint.modern.js';

var SGroupAttachmentPoint = function () {
  function SGroupAttachmentPoint(atomId, leaveAtomId, attachmentId, attachmentPointNumber) {
    _classCallCheck(this, SGroupAttachmentPoint);
    _defineProperty(this, "atomId", void 0);
    _defineProperty(this, "leaveAtomId", void 0);
    _defineProperty(this, "attachmentId", void 0);
    _defineProperty(this, "attachmentPointNumber", void 0);
    this.atomId = atomId;
    this.leaveAtomId = leaveAtomId;
    this.attachmentId = attachmentId;
    this.attachmentPointNumber = attachmentPointNumber;
  }
  _createClass(SGroupAttachmentPoint, [{
    key: "clone",
    value: function clone(atomIdMap) {
      var newAtomId = atomIdMap.get(this.atomId);
      assert(newAtomId != null);
      var newLeaveAtomId = atomIdMap.get(this.leaveAtomId);
      return new SGroupAttachmentPoint(newAtomId, newLeaveAtomId, this.attachmentId, this.attachmentPointNumber);
    }
  }, {
    key: "convertToRGroupAttachmentPointForDisplayPurpose",
    value: function convertToRGroupAttachmentPointForDisplayPurpose(attachedAtomId) {
      return new RGroupAttachmentPoint(attachedAtomId, 'primary');
    }
  }]);
  return SGroupAttachmentPoint;
}();

export { SGroupAttachmentPoint };
//# sourceMappingURL=sGroupAttachmentPoint.modern.js.map
