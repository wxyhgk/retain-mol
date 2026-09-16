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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { SGroup } from './sgroup.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MonomerMicromolecule = function (_SGroup) {
  _inherits(MonomerMicromolecule, _SGroup);
  function MonomerMicromolecule(type, monomer) {
    var _this;
    _classCallCheck(this, MonomerMicromolecule);
    _this = _callSuper(this, MonomerMicromolecule, [type]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _this.monomer = monomer;
    _this.data.absolute = false;
    _this.data.attached = false;
    _this.data.expanded = Boolean(monomer.monomerItem.expanded);
    return _this;
  }
  _createClass(MonomerMicromolecule, [{
    key: "isMonomer",
    get: function get() {
      return true;
    }
  }, {
    key: "getContractedPosition",
    value: function getContractedPosition(struct) {
      assert(this.pp);
      var sgroupContractedPosition = _get(_getPrototypeOf(MonomerMicromolecule.prototype), "getContractedPosition", this).call(this, struct);
      return {
        position: this.pp,
        atomId: sgroupContractedPosition.atomId
      };
    }
  }], [{
    key: "clone",
    value: function clone(monomerMicromolecule, atomIdMap) {
      var needCloneAttachmentPoints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var monomerMicromoleculeClone = new MonomerMicromolecule(monomerMicromolecule.type, monomerMicromolecule.monomer);
      monomerMicromoleculeClone.pp = monomerMicromolecule.pp;
      monomerMicromoleculeClone.atoms = atomIdMap ? monomerMicromolecule.atoms.map(function (elem) {
        var mappedAtomId = atomIdMap.get(elem);
        assert(mappedAtomId !== undefined);
        return mappedAtomId;
      }) : monomerMicromolecule.atoms;
      monomerMicromoleculeClone.data.expanded = monomerMicromolecule.isExpanded();
      monomerMicromoleculeClone.data.name = monomerMicromolecule.data.name;
      if (needCloneAttachmentPoints && atomIdMap) {
        monomerMicromoleculeClone.addAttachmentPoints(monomerMicromolecule.cloneAttachmentPoints(atomIdMap), false);
      }
      return monomerMicromoleculeClone;
    }
  }]);
  return MonomerMicromolecule;
}(SGroup);

export { MonomerMicromolecule };
//# sourceMappingURL=monomerMicromolecule.modern.js.map
