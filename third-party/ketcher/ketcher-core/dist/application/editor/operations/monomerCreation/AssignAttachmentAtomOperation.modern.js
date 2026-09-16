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
import { RemoveAttachmentPointOperation } from './AssignLeavingGroupAtomOperation.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import { getNextFreeAttachmentPoint } from '../../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AssignAttachmentAtomOperation = function (_BaseOperation) {
  _inherits(AssignAttachmentAtomOperation, _BaseOperation);
  function AssignAttachmentAtomOperation(monomerCreationState, attachmentAtomId, leavingAtomId, _attachmentPointName, _assignedAttachmentPoints) {
    var _this;
    _classCallCheck(this, AssignAttachmentAtomOperation);
    _this = _callSuper(this, AssignAttachmentAtomOperation, [OperationType.MONOMER_CREATION_ASSIGN_AA]);
    _defineProperty(_assertThisInitialized(_this), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentAtomId", void 0);
    _defineProperty(_assertThisInitialized(_this), "leavingAtomId", void 0);
    _defineProperty(_assertThisInitialized(_this), "_attachmentPointName", void 0);
    _defineProperty(_assertThisInitialized(_this), "_assignedAttachmentPoints", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentPointName", null);
    _defineProperty(_assertThisInitialized(_this), "assignedAttachmentPoints", new Map());
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentAtomId = attachmentAtomId;
    _this.leavingAtomId = leavingAtomId;
    _this._attachmentPointName = _attachmentPointName;
    _this._assignedAttachmentPoints = _assignedAttachmentPoints;
    return _this;
  }
  _createClass(AssignAttachmentAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$_assignedAttach, _this$_attachmentPoin;
      assert(this.monomerCreationState);
      var potentialAttachmentPoints = this.monomerCreationState.potentialAttachmentPoints;
      this.assignedAttachmentPoints = (_this$_assignedAttach = this._assignedAttachmentPoints) !== null && _this$_assignedAttach !== void 0 ? _this$_assignedAttach : this.monomerCreationState.assignedAttachmentPoints;
      this.attachmentPointName = (_this$_attachmentPoin = this._attachmentPointName) !== null && _this$_attachmentPoin !== void 0 ? _this$_attachmentPoin : getNextFreeAttachmentPoint(Array.from(this.assignedAttachmentPoints.keys()));
      this.assignedAttachmentPoints.set(this.attachmentPointName, [this.attachmentAtomId, this.leavingAtomId]);
      potentialAttachmentPoints["delete"](this.attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      assert(this.attachmentPointName !== null);
      return new RemoveAttachmentPointOperation(this.monomerCreationState, this.attachmentPointName, undefined, this.assignedAttachmentPoints);
    }
  }]);
  return AssignAttachmentAtomOperation;
}(BaseOperation);

export { AssignAttachmentAtomOperation };
//# sourceMappingURL=AssignAttachmentAtomOperation.modern.js.map
