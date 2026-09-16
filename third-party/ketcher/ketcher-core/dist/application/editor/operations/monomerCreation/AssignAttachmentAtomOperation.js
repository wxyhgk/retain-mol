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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
var AssignLeavingGroupAtomOperation = require('./AssignLeavingGroupAtomOperation.js');
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

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AssignAttachmentAtomOperation = function (_BaseOperation) {
  _inherits__default["default"](AssignAttachmentAtomOperation, _BaseOperation);
  function AssignAttachmentAtomOperation(monomerCreationState, attachmentAtomId, leavingAtomId, _attachmentPointName, _assignedAttachmentPoints) {
    var _this;
    _classCallCheck__default["default"](this, AssignAttachmentAtomOperation);
    _this = _callSuper(this, AssignAttachmentAtomOperation, [OperationType.OperationType.MONOMER_CREATION_ASSIGN_AA]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentAtomId", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "leavingAtomId", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "_attachmentPointName", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "_assignedAttachmentPoints", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentPointName", null);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "assignedAttachmentPoints", new Map());
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentAtomId = attachmentAtomId;
    _this.leavingAtomId = leavingAtomId;
    _this._attachmentPointName = _attachmentPointName;
    _this._assignedAttachmentPoints = _assignedAttachmentPoints;
    return _this;
  }
  _createClass__default["default"](AssignAttachmentAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$_assignedAttach, _this$_attachmentPoin;
      assert.assert(this.monomerCreationState);
      var potentialAttachmentPoints = this.monomerCreationState.potentialAttachmentPoints;
      this.assignedAttachmentPoints = (_this$_assignedAttach = this._assignedAttachmentPoints) !== null && _this$_assignedAttach !== void 0 ? _this$_assignedAttach : this.monomerCreationState.assignedAttachmentPoints;
      this.attachmentPointName = (_this$_attachmentPoin = this._attachmentPointName) !== null && _this$_attachmentPoin !== void 0 ? _this$_attachmentPoin : attachmentPointCalculations.getNextFreeAttachmentPoint(Array.from(this.assignedAttachmentPoints.keys()));
      this.assignedAttachmentPoints.set(this.attachmentPointName, [this.attachmentAtomId, this.leavingAtomId]);
      potentialAttachmentPoints["delete"](this.attachmentAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, this.leavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      assert.assert(this.attachmentPointName !== null);
      return new AssignLeavingGroupAtomOperation.RemoveAttachmentPointOperation(this.monomerCreationState, this.attachmentPointName, undefined, this.assignedAttachmentPoints);
    }
  }]);
  return AssignAttachmentAtomOperation;
}(BaseOperation.BaseOperation);

exports.AssignAttachmentAtomOperation = AssignAttachmentAtomOperation;
//# sourceMappingURL=AssignAttachmentAtomOperation.js.map
