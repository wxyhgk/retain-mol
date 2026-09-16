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

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReassignLeavingAtomOperation = function (_BaseOperation) {
  _inherits(ReassignLeavingAtomOperation, _BaseOperation);
  function ReassignLeavingAtomOperation(monomerCreationState, attachmentPointName, attachmentAtomId, newLeavingAtomId, previousLeavingAtomId) {
    var _this;
    _classCallCheck(this, ReassignLeavingAtomOperation);
    _this = _callSuper(this, ReassignLeavingAtomOperation, [OperationType.MONOMER_CREATION_REASSIGN_LGA]);
    _defineProperty(_assertThisInitialized(_this), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentPointName", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentAtomId", void 0);
    _defineProperty(_assertThisInitialized(_this), "newLeavingAtomId", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousLeavingAtomId", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentPointName = attachmentPointName;
    _this.attachmentAtomId = attachmentAtomId;
    _this.newLeavingAtomId = newLeavingAtomId;
    _this.previousLeavingAtomId = previousLeavingAtomId;
    return _this;
  }
  _createClass(ReassignLeavingAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert(this.monomerCreationState);
      var newAtomPair = [this.attachmentAtomId, this.newLeavingAtomId];
      this.monomerCreationState.assignedAttachmentPoints.set(this.attachmentPointName, newAtomPair);
      this.monomerCreationState = _objectSpread({}, this.monomerCreationState || {});
      BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, this.newLeavingAtomId);
      BaseOperation.invalidateAtom(restruct, this.previousLeavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new ReassignLeavingAtomOperation(this.monomerCreationState, this.attachmentPointName, this.attachmentAtomId, this.previousLeavingAtomId, this.newLeavingAtomId);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.newLeavingAtomId === this.previousLeavingAtomId;
    }
  }]);
  return ReassignLeavingAtomOperation;
}(BaseOperation);

export { ReassignLeavingAtomOperation };
//# sourceMappingURL=ReassignLeavingAtomOperation.modern.js.map
