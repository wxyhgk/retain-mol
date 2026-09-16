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
import { OperationType, OperationPriority } from '../OperationType.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupAttachmentPointAdd = function (_BaseOperation) {
  _inherits(SGroupAttachmentPointAdd, _BaseOperation);
  function SGroupAttachmentPointAdd(sGroupId, attachmentPoint) {
    var _this;
    _classCallCheck(this, SGroupAttachmentPointAdd);
    _this = _callSuper(this, SGroupAttachmentPointAdd, [OperationType.S_GROUP_ATTACHMENT_POINT_ADD, OperationPriority.S_GROUP_ATTACHMENT_POINT_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      sGroupId: sGroupId,
      attachmentPoint: attachmentPoint
    };
    return _this;
  }
  _createClass(SGroupAttachmentPointAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var sgroup = struct.sgroups.get(this.data.sGroupId);
      assert(sgroup != null);
      var attachmentPoint = this.data.attachmentPoint;
      if (attachmentPoint.atomId === undefined) {
        return;
      }
      var apAtom = struct.atoms.get(attachmentPoint.atomId);
      if (!apAtom) {
        throw new Error("attachmentPoint for Atom with id \"".concat(attachmentPoint.atomId, "\" is not found"));
      }
      sgroup.addAttachmentPoint(attachmentPoint);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new SGroupAttachmentPointRemove(this.data.sGroupId, this.data.attachmentPoint);
    }
  }]);
  return SGroupAttachmentPointAdd;
}(BaseOperation);
var SGroupAttachmentPointRemove = function (_BaseOperation2) {
  _inherits(SGroupAttachmentPointRemove, _BaseOperation2);
  function SGroupAttachmentPointRemove(sGroupId, attachmentPoint) {
    var _this2;
    _classCallCheck(this, SGroupAttachmentPointRemove);
    _this2 = _callSuper(this, SGroupAttachmentPointRemove, [OperationType.S_GROUP_ATTACHMENT_POINT_REMOVE, 4]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      sGroupId: sGroupId,
      attachmentPoint: attachmentPoint
    };
    return _this2;
  }
  _createClass(SGroupAttachmentPointRemove, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        sGroupId = _this$data.sGroupId,
        attachmentPoint = _this$data.attachmentPoint;
      var struct = restruct.molecule;
      var sgroup = struct.sgroups.get(sGroupId);
      sgroup === null || sgroup === void 0 || sgroup.removeAttachmentPoint(attachmentPoint);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new SGroupAttachmentPointAdd(this.data.sGroupId, this.data.attachmentPoint);
    }
  }]);
  return SGroupAttachmentPointRemove;
}(BaseOperation);

export { SGroupAttachmentPointAdd, SGroupAttachmentPointRemove };
//# sourceMappingURL=sgroupAttachmentPoints.modern.js.map
