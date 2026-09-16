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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';
import { MonomerCreationComponentStructureUpdateEvent } from '../../shared/customEvents.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MarkAsRnaComponentOperation = function (_BaseOperation) {
  _inherits(MarkAsRnaComponentOperation, _BaseOperation);
  function MarkAsRnaComponentOperation(monomerCreationState, componentKey, newAtomIds, newBondIds, prevAtomIds, prevBondIds) {
    var _this;
    _classCallCheck(this, MarkAsRnaComponentOperation);
    _this = _callSuper(this, MarkAsRnaComponentOperation, [OperationType.MONOMER_CREATION_MARK_RNA_COMPONENT]);
    _defineProperty(_assertThisInitialized(_this), "monomerCreationState", void 0);
    _defineProperty(_assertThisInitialized(_this), "componentKey", void 0);
    _defineProperty(_assertThisInitialized(_this), "newAtomIds", void 0);
    _defineProperty(_assertThisInitialized(_this), "newBondIds", void 0);
    _defineProperty(_assertThisInitialized(_this), "prevAtomIds", void 0);
    _defineProperty(_assertThisInitialized(_this), "prevBondIds", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.componentKey = componentKey;
    _this.newAtomIds = newAtomIds;
    _this.newBondIds = newBondIds;
    _this.prevAtomIds = prevAtomIds;
    _this.prevBondIds = prevBondIds;
    return _this;
  }
  _createClass(MarkAsRnaComponentOperation, [{
    key: "execute",
    value: function execute(_restruct) {
      assert(this.monomerCreationState);
      if (!this.monomerCreationState.rnaComponentAtoms) {
        this.monomerCreationState.rnaComponentAtoms = new Map();
      }
      this.monomerCreationState.rnaComponentAtoms.set(this.componentKey, {
        atoms: _toConsumableArray(this.newAtomIds),
        bonds: _toConsumableArray(this.newBondIds)
      });
      var eventData = {
        componentKey: this.componentKey,
        atomIds: this.newAtomIds,
        bondIds: this.newBondIds
      };
      window.dispatchEvent(new CustomEvent(MonomerCreationComponentStructureUpdateEvent, {
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
}(BaseOperation);

export { MarkAsRnaComponentOperation };
//# sourceMappingURL=MarkAsRnaComponentOperation.modern.js.map
