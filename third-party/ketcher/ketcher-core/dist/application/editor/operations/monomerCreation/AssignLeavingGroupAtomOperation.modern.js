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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
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
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import { getNextFreeAttachmentPoint } from '../../../../domain/helpers/attachmentPointCalculations.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RemoveAttachmentPointOperation = function (_BaseOperation) {
  _inherits(RemoveAttachmentPointOperation, _BaseOperation);
  function RemoveAttachmentPointOperation(monomerCreationState, attachmentPointName, potentialLeavingAtoms, _assignedAttachmentPoints) {
    var _this;
    _classCallCheck(this, RemoveAttachmentPointOperation);
    _this = _callSuper(this, RemoveAttachmentPointOperation, [OperationType.MONOMER_CREATION_REMOVE_AP]);
    _defineProperty(_assertThisInitialized(_this), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentPointName", void 0);
    _defineProperty(_assertThisInitialized(_this), "potentialLeavingAtoms", void 0);
    _defineProperty(_assertThisInitialized(_this), "_assignedAttachmentPoints", void 0);
    _defineProperty(_assertThisInitialized(_this), "atomPair", void 0);
    _defineProperty(_assertThisInitialized(_this), "assignedAttachmentPoints", new Map());
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentPointName = attachmentPointName;
    _this.potentialLeavingAtoms = potentialLeavingAtoms;
    _this._assignedAttachmentPoints = _assignedAttachmentPoints;
    assert(_this.monomerCreationState);
    _this.assignedAttachmentPoints = _this._assignedAttachmentPoints || _this.monomerCreationState.assignedAttachmentPoints;
    var atomPair = _this.assignedAttachmentPoints.get(_this.attachmentPointName);
    assert(atomPair);
    _this.atomPair = atomPair;
    return _this;
  }
  _createClass(RemoveAttachmentPointOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert(this.monomerCreationState);
      var potentialAttachmentPoints = this.monomerCreationState.potentialAttachmentPoints;
      var _this$atomPair = _slicedToArray(this.atomPair, 2),
        attachmentAtomId = _this$atomPair[0],
        leavingAtomId = _this$atomPair[1];
      this.assignedAttachmentPoints["delete"](this.attachmentPointName);
      if (this.potentialLeavingAtoms) potentialAttachmentPoints.set(attachmentAtomId, this.potentialLeavingAtoms);
      BaseOperation.invalidateAtom(restruct, attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, leavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      var leavingAtomId = this.atomPair[1];
      return new AssignLeavingGroupAtomOperation(this.monomerCreationState, leavingAtomId);
    }
  }]);
  return RemoveAttachmentPointOperation;
}(BaseOperation);
var AssignLeavingGroupAtomOperation = function (_BaseOperation2) {
  _inherits(AssignLeavingGroupAtomOperation, _BaseOperation2);
  function AssignLeavingGroupAtomOperation(monomerCreationState, atomId) {
    var _this2;
    _classCallCheck(this, AssignLeavingGroupAtomOperation);
    _this2 = _callSuper(this, AssignLeavingGroupAtomOperation, [OperationType.MONOMER_CREATION_ASSIGN_LGA]);
    _defineProperty(_assertThisInitialized(_this2), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this2), "atomId", void 0);
    _defineProperty(_assertThisInitialized(_this2), "attachmentPointName", null);
    _defineProperty(_assertThisInitialized(_this2), "potentialLeavingAtoms", new Set());
    _this2.monomerCreationState = monomerCreationState;
    _this2.atomId = atomId;
    return _this2;
  }
  _createClass(AssignLeavingGroupAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert(this.monomerCreationState);
      var _this$monomerCreation = this.monomerCreationState,
        assignedAttachmentPoints = _this$monomerCreation.assignedAttachmentPoints,
        potentialAttachmentPoints = _this$monomerCreation.potentialAttachmentPoints;
      var atomPairForLeavingGroup = null;
      var _iterator = _createForOfIteratorHelper(potentialAttachmentPoints.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var attachmentPointAtoms = _step.value;
          var _attachmentPointAtoms = _slicedToArray(attachmentPointAtoms, 2),
            _attachmentAtomId = _attachmentPointAtoms[0],
            leavingAtomIds = _attachmentPointAtoms[1];
          if (leavingAtomIds.has(this.atomId)) {
            atomPairForLeavingGroup = [_attachmentAtomId, this.atomId];
            break;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (!atomPairForLeavingGroup) {
        return;
      }
      var _atomPairForLeavingGr = atomPairForLeavingGroup,
        _atomPairForLeavingGr2 = _slicedToArray(_atomPairForLeavingGr, 2),
        attachmentAtomId = _atomPairForLeavingGr2[0],
        leavingAtomId = _atomPairForLeavingGr2[1];
      var attachmentPointName = getNextFreeAttachmentPoint(Array.from(assignedAttachmentPoints.keys()));
      this.attachmentPointName = attachmentPointName;
      assignedAttachmentPoints.set(attachmentPointName, atomPairForLeavingGroup);
      var potentialAttachmentAtoms = potentialAttachmentPoints.get(attachmentAtomId);
      assert(potentialAttachmentAtoms);
      this.potentialLeavingAtoms = potentialAttachmentAtoms;
      potentialAttachmentPoints["delete"](attachmentAtomId);
      BaseOperation.invalidateAtom(restruct, leavingAtomId);
      BaseOperation.invalidateAtom(restruct, attachmentAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      assert(this.attachmentPointName !== null);
      return new RemoveAttachmentPointOperation(this.monomerCreationState, this.attachmentPointName, this.potentialLeavingAtoms);
    }
  }]);
  return AssignLeavingGroupAtomOperation;
}(BaseOperation);

export { AssignLeavingGroupAtomOperation, RemoveAttachmentPointOperation };
//# sourceMappingURL=AssignLeavingGroupAtomOperation.modern.js.map
