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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReassignAttachmentPointOperation = function (_BaseOperation) {
  _inherits(ReassignAttachmentPointOperation, _BaseOperation);
  function ReassignAttachmentPointOperation(monomerCreationState, currentName, newName) {
    var _this;
    _classCallCheck(this, ReassignAttachmentPointOperation);
    _this = _callSuper(this, ReassignAttachmentPointOperation, [OperationType.MONOMER_CREATION_REASSIGN_AP]);
    _defineProperty(_assertThisInitialized(_this), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this), "currentName", void 0);
    _defineProperty(_assertThisInitialized(_this), "newName", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.currentName = currentName;
    _this.newName = newName;
    assert(_this.monomerCreationState);
    return _this;
  }
  _createClass(ReassignAttachmentPointOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert(this.monomerCreationState);
      var _this$monomerCreation = this.monomerCreationState,
        assignedAttachmentPoints = _this$monomerCreation.assignedAttachmentPoints,
        problematicAttachmentPoints = _this$monomerCreation.problematicAttachmentPoints;
      problematicAttachmentPoints["delete"](this.currentName);
      var atomPair = assignedAttachmentPoints.get(this.currentName);
      assert(atomPair);
      if (assignedAttachmentPoints.has(this.newName)) {
        var existingAtomPair = assignedAttachmentPoints.get(this.newName);
        assert(existingAtomPair);
        assignedAttachmentPoints.set(this.newName, atomPair);
        assignedAttachmentPoints.set(this.currentName, existingAtomPair);
        BaseOperation.invalidateAtom(restruct, atomPair[0]);
        BaseOperation.invalidateAtom(restruct, atomPair[1]);
        BaseOperation.invalidateAtom(restruct, existingAtomPair[0]);
        BaseOperation.invalidateAtom(restruct, existingAtomPair[1]);
      } else {
        assignedAttachmentPoints.set(this.newName, atomPair);
        assignedAttachmentPoints["delete"](this.currentName);
        BaseOperation.invalidateAtom(restruct, atomPair[0]);
        BaseOperation.invalidateAtom(restruct, atomPair[1]);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new ReassignAttachmentPointOperation(this.monomerCreationState, this.newName, this.currentName);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.currentName === this.newName;
    }
  }]);
  return ReassignAttachmentPointOperation;
}(BaseOperation);

export { ReassignAttachmentPointOperation };
//# sourceMappingURL=ReassignAttachmentPointOperation.modern.js.map
