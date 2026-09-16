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
import '../../../render/renderStruct.modern.js';
import '../../../render/raphaelRender.modern.js';
import '../../../render/restruct/reobject.modern.js';
import '../../../render/restruct/reatom.modern.js';
import '../../../render/restruct/rebond.modern.js';
import '../../../render/restruct/reenhancedFlag.modern.js';
import '../../../render/restruct/refrag.modern.js';
import ReRGroup from '../../../render/restruct/rergroup.modern.js';
import '../../../render/restruct/rerxnarrow.modern.js';
import '../../../render/restruct/rerxnplus.modern.js';
import '../../../render/restruct/resgroup.modern.js';
import '../../../render/restruct/resimpleObject.modern.js';
import '../../../render/restruct/restruct.modern.js';
import '../../../render/restruct/retext.modern.js';
import '../../../render/restruct/visel.modern.js';
import '../../../render/restruct/generalEnumTypes.modern.js';
import '../../../render/restruct/showHydrogenLabels.modern.js';
import '../../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../../render/restruct/reImage.modern.js';
import '../../../render/restruct/remultitailArrow.modern.js';
import '../../../render/renderers/BaseRenderer.modern.js';
import '../../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../../render/renderers/AtomRenderer.modern.js';
import '../../../render/renderers/ChemRenderer.modern.js';
import '../../../render/renderers/PeptideRenderer.modern.js';
import '../../../render/renderers/PhosphateRenderer.modern.js';
import '../../../render/renderers/SugarRenderer.modern.js';
import '../../../render/renderers/RNABaseRenderer.modern.js';
import '../../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../../render/renderers/SGroupRenderer.modern.js';
import '../../../render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../render/renderers/StereoFlagRenderer.modern.js';
import '../../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../../render/scrollbar/scrollbar-container.modern.js';
import '../../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../../render/renderers/constants.modern.js';
import '../../../render/render.types.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';
import { RGroup } from '../../../../domain/entities/rgroup.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RGroupFragment = function (_BaseOperation) {
  _inherits(RGroupFragment, _BaseOperation);
  function RGroupFragment(rgroupId, fragmentId, rg) {
    var _this;
    _classCallCheck(this, RGroupFragment);
    _this = _callSuper(this, RGroupFragment, [OperationType.R_GROUP_FRAGMENT]);
    _defineProperty(_assertThisInitialized(_this), "rgid_new", void 0);
    _defineProperty(_assertThisInitialized(_this), "rg_new", void 0);
    _defineProperty(_assertThisInitialized(_this), "rgid_old", void 0);
    _defineProperty(_assertThisInitialized(_this), "rg_old", void 0);
    _defineProperty(_assertThisInitialized(_this), "frid", void 0);
    _this.rgid_new = rgroupId;
    _this.rg_new = rg;
    _this.rgid_old = null;
    _this.rg_old = null;
    _this.frid = fragmentId;
    return _this;
  }
  _createClass(RGroupFragment, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      this.rgid_old = this.rgid_old || RGroup.findRGroupByFragment(struct.rgroups, this.frid);
      this.rg_old = this.rgid_old ? struct.rgroups.get(this.rgid_old) : null;
      this.removeOld(struct, restruct);
      this.setNew(struct, restruct);
    }
  }, {
    key: "removeOld",
    value: function removeOld(struct, restruct) {
      if (!this.rg_old) {
        return;
      }
      this.rg_old.frags["delete"](this.frid);
      restruct.clearVisel(restruct.rgroups.get(this.rgid_old).visel);
      if (this.rg_old.frags.size === 0) {
        restruct.rgroups["delete"](this.rgid_old);
        struct.rgroups["delete"](this.rgid_old);
        restruct.markItemRemoved();
      } else {
        restruct.markItem('rgroups', this.rgid_old, 1);
      }
    }
  }, {
    key: "setNew",
    value: function setNew(struct, restruct) {
      if (!this.rgid_new) {
        return;
      }
      var rgNew = struct.rgroups.get(this.rgid_new);
      if (!rgNew) {
        rgNew = this.rg_new || new RGroup();
        struct.rgroups.set(this.rgid_new, rgNew);
        restruct.rgroups.set(this.rgid_new, new ReRGroup(rgNew));
      } else {
        restruct.markItem('rgroups', this.rgid_new, 1);
      }
      rgNew.frags.add(this.frid);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RGroupFragment(this.rgid_old, this.frid, this.rg_old);
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var currentRgid = RGroup.findRGroupByFragment(restruct.molecule.rgroups, this.frid);
      return currentRgid === this.rgid_new;
    }
  }]);
  return RGroupFragment;
}(BaseOperation);

export { RGroupFragment };
//# sourceMappingURL=RGroupFragment.modern.js.map
