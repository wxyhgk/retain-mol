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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
var customEvents = require('../../shared/customEvents.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MarkAsRnaComponentOperation = function (_BaseOperation) {
  _inherits__default["default"](MarkAsRnaComponentOperation, _BaseOperation);
  function MarkAsRnaComponentOperation(monomerCreationState, componentKey, newAtomIds, newBondIds, prevAtomIds, prevBondIds) {
    var _this;
    _classCallCheck__default["default"](this, MarkAsRnaComponentOperation);
    _this = _callSuper(this, MarkAsRnaComponentOperation, [OperationType.OperationType.MONOMER_CREATION_MARK_RNA_COMPONENT]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "componentKey", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "newAtomIds", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "newBondIds", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "prevAtomIds", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "prevBondIds", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.componentKey = componentKey;
    _this.newAtomIds = newAtomIds;
    _this.newBondIds = newBondIds;
    _this.prevAtomIds = prevAtomIds;
    _this.prevBondIds = prevBondIds;
    return _this;
  }
  _createClass__default["default"](MarkAsRnaComponentOperation, [{
    key: "execute",
    value: function execute(_restruct) {
      assert.assert(this.monomerCreationState);
      if (!this.monomerCreationState.rnaComponentAtoms) {
        this.monomerCreationState.rnaComponentAtoms = new Map();
      }
      this.monomerCreationState.rnaComponentAtoms.set(this.componentKey, {
        atoms: _toConsumableArray__default["default"](this.newAtomIds),
        bonds: _toConsumableArray__default["default"](this.newBondIds)
      });
      var eventData = {
        componentKey: this.componentKey,
        atomIds: this.newAtomIds,
        bondIds: this.newBondIds
      };
      window.dispatchEvent(new CustomEvent(customEvents.MonomerCreationComponentStructureUpdateEvent, {
        detail: eventData
      }));
    }
  }, {
    key: "invert",
    value: function invert() {
      return new MarkAsRnaComponentOperation(this.monomerCreationState, this.componentKey, this.prevAtomIds, this.prevBondIds, this.newAtomIds, this.newBondIds);
    }
  }]);
  return MarkAsRnaComponentOperation;
}(BaseOperation.BaseOperation);

exports.MarkAsRnaComponentOperation = MarkAsRnaComponentOperation;
//# sourceMappingURL=MarkAsRnaComponentOperation.js.map
