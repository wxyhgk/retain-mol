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
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';
import { OperationType, OperationPriority } from '../OperationType.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var INITIAL_DATA = {
  atomId: 0,
  attachmentPointType: 1,
  attachmentPointId: 0
};
var RGroupAttachmentPointRemove = function (_BaseOperation) {
  _inherits(RGroupAttachmentPointRemove, _BaseOperation);
  function RGroupAttachmentPointRemove() {
    var _this;
    var attachmentPointId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_DATA.attachmentPointId;
    _classCallCheck(this, RGroupAttachmentPointRemove);
    _this = _callSuper(this, RGroupAttachmentPointRemove, [OperationType.R_GROUP_ATTACHMENT_POINT_REMOVE, OperationPriority.R_GROUP_ATTACHMENT_POINT_REMOVE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = _objectSpread(_objectSpread({}, INITIAL_DATA), {}, {
      attachmentPointId: attachmentPointId
    });
    return _this;
  }
  _createClass(RGroupAttachmentPointRemove, [{
    key: "execute",
    value: function execute(restruct) {
      var attachmentPointId = this.data.attachmentPointId;
      var struct = restruct.molecule;
      var item = struct.rgroupAttachmentPoints.get(attachmentPointId);
      var reItem = restruct.rgroupAttachmentPoints.get(attachmentPointId);
      assert(item != null && reItem != null);
      this.data.atomId = item.atomId;
      this.data.attachmentPointType = item.type;
      restruct.markItemRemoved();
      restruct.clearVisel(reItem.visel);
      restruct.rgroupAttachmentPoints["delete"](attachmentPointId);
      struct.rgroupAttachmentPoints["delete"](attachmentPointId);
    }
  }]);
  return RGroupAttachmentPointRemove;
}(BaseOperation);

export { RGroupAttachmentPointRemove };
//# sourceMappingURL=RGroupAttachmentPointRemove.modern.js.map
