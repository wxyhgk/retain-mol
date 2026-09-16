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
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RGroupAttachmentPoint = function (_BaseMicromoleculeEnt) {
  _inherits(RGroupAttachmentPoint, _BaseMicromoleculeEnt);
  function RGroupAttachmentPoint(atomId, type, initiallySelected) {
    var _this;
    _classCallCheck(this, RGroupAttachmentPoint);
    _this = _callSuper(this, RGroupAttachmentPoint, [initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "atomId", void 0);
    _defineProperty(_assertThisInitialized(_this), "type", void 0);
    _this.atomId = atomId;
    _this.type = type;
    return _this;
  }
  _createClass(RGroupAttachmentPoint, [{
    key: "clone",
    value: function clone(atomToNewAtom) {
      var newAtomId = atomToNewAtom === null || atomToNewAtom === void 0 ? void 0 : atomToNewAtom.get(this.atomId);
      return new RGroupAttachmentPoint(newAtomId !== null && newAtomId !== void 0 ? newAtomId : this.atomId, this.type, this.initiallySelected);
    }
  }]);
  return RGroupAttachmentPoint;
}(BaseMicromoleculeEntity);

export { RGroupAttachmentPoint };
//# sourceMappingURL=rgroupAttachmentPoint.modern.js.map
