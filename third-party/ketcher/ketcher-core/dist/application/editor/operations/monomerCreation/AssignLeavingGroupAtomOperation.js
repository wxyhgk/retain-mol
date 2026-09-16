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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
var attachmentPointCalculations = require('../../../../domain/helpers/attachmentPointCalculations.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RemoveAttachmentPointOperation = function (_BaseOperation) {
  _inherits__default["default"](RemoveAttachmentPointOperation, _BaseOperation);
  function RemoveAttachmentPointOperation(monomerCreationState, attachmentPointName, potentialLeavingAtoms, _assignedAttachmentPoints) {
    var _this;
    _classCallCheck__default["default"](this, RemoveAttachmentPointOperation);
    _this = _callSuper(this, RemoveAttachmentPointOperation, [OperationType.OperationType.MONOMER_CREATION_REMOVE_AP]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentPointName", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "potentialLeavingAtoms", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "_assignedAttachmentPoints", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "atomPair", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "assignedAttachmentPoints", new Map());
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentPointName = attachmentPointName;
    _this.potentialLeavingAtoms = potentialLeavingAtoms;
    _this._assignedAttachmentPoints = _assignedAttachmentPoints;
    assert.assert(_this.monomerCreationState);
    _this.assignedAttachmentPoints = _this._assignedAttachmentPoints || _this.monomerCreationState.assignedAttachmentPoints;
    var atomPair = _this.assignedAttachmentPoints.get(_this.attachmentPointName);
    assert.assert(atomPair);
    _this.atomPair = atomPair;
    return _this;
  }
  _createClass__default["default"](RemoveAttachmentPointOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert.assert(this.monomerCreationState);
      var potentialAttachmentPoints = this.monomerCreationState.potentialAttachmentPoints;
      var _this$atomPair = _slicedToArray__default["default"](this.atomPair, 2),
        attachmentAtomId = _this$atomPair[0],
        leavingAtomId = _this$atomPair[1];
      this.assignedAttachmentPoints["delete"](this.attachmentPointName);
      if (this.potentialLeavingAtoms) potentialAttachmentPoints.set(attachmentAtomId, this.potentialLeavingAtoms);
      BaseOperation.BaseOperation.invalidateAtom(restruct, attachmentAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, leavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      var leavingAtomId = this.atomPair[1];
      return new AssignLeavingGroupAtomOperation(this.monomerCreationState, leavingAtomId);
    }
  }]);
  return RemoveAttachmentPointOperation;
}(BaseOperation.BaseOperation);
var AssignLeavingGroupAtomOperation = function (_BaseOperation2) {
  _inherits__default["default"](AssignLeavingGroupAtomOperation, _BaseOperation2);
  function AssignLeavingGroupAtomOperation(monomerCreationState, atomId) {
    var _this2;
    _classCallCheck__default["default"](this, AssignLeavingGroupAtomOperation);
    _this2 = _callSuper(this, AssignLeavingGroupAtomOperation, [OperationType.OperationType.MONOMER_CREATION_ASSIGN_LGA]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "atomId", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "attachmentPointName", null);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "potentialLeavingAtoms", new Set());
    _this2.monomerCreationState = monomerCreationState;
    _this2.atomId = atomId;
    return _this2;
  }
  _createClass__default["default"](AssignLeavingGroupAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert.assert(this.monomerCreationState);
      var _this$monomerCreation = this.monomerCreationState,
        assignedAttachmentPoints = _this$monomerCreation.assignedAttachmentPoints,
        potentialAttachmentPoints = _this$monomerCreation.potentialAttachmentPoints;
      var atomPairForLeavingGroup = null;
      var _iterator = _createForOfIteratorHelper(potentialAttachmentPoints.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var attachmentPointAtoms = _step.value;
          var _attachmentPointAtoms = _slicedToArray__default["default"](attachmentPointAtoms, 2),
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
        _atomPairForLeavingGr2 = _slicedToArray__default["default"](_atomPairForLeavingGr, 2),
        attachmentAtomId = _atomPairForLeavingGr2[0],
        leavingAtomId = _atomPairForLeavingGr2[1];
      var attachmentPointName = attachmentPointCalculations.getNextFreeAttachmentPoint(Array.from(assignedAttachmentPoints.keys()));
      this.attachmentPointName = attachmentPointName;
      assignedAttachmentPoints.set(attachmentPointName, atomPairForLeavingGroup);
      var potentialAttachmentAtoms = potentialAttachmentPoints.get(attachmentAtomId);
      assert.assert(potentialAttachmentAtoms);
      this.potentialLeavingAtoms = potentialAttachmentAtoms;
      potentialAttachmentPoints["delete"](attachmentAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, leavingAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, attachmentAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      assert.assert(this.attachmentPointName !== null);
      return new RemoveAttachmentPointOperation(this.monomerCreationState, this.attachmentPointName, this.potentialLeavingAtoms);
    }
  }]);
  return AssignLeavingGroupAtomOperation;
}(BaseOperation.BaseOperation);

exports.AssignLeavingGroupAtomOperation = AssignLeavingGroupAtomOperation;
exports.RemoveAttachmentPointOperation = RemoveAttachmentPointOperation;
//# sourceMappingURL=AssignLeavingGroupAtomOperation.js.map
