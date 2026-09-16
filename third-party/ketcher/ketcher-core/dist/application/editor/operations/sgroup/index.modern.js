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
import { FunctionalGroup } from '../../../../domain/entities/functionalGroup.modern.js';
import { SGroup } from '../../../../domain/entities/sgroup.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../render/renderStruct.modern.js';
import '../../../render/raphaelRender.modern.js';
import '../../../render/restruct/reobject.modern.js';
import '../../../render/restruct/reatom.modern.js';
import '../../../render/restruct/rebond.modern.js';
import '../../../render/restruct/reenhancedFlag.modern.js';
import '../../../render/restruct/refrag.modern.js';
import '../../../render/restruct/rergroup.modern.js';
import '../../../render/restruct/rerxnarrow.modern.js';
import '../../../render/restruct/rerxnplus.modern.js';
import ReSGroup from '../../../render/restruct/resgroup.modern.js';
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
import { OperationType, OperationPriority } from '../OperationType.modern.js';
import { MonomerMicromolecule } from '../../../../domain/entities/monomerMicromolecule.modern.js';
export { SGroupAtomAdd, SGroupAtomRemove } from './sgroupAtom.modern.js';
export { SGroupAttr } from './SGroupAttr.modern.js';
export { SGroupDataMove } from './SGroupDataMove.modern.js';
export { SGroupAddToHierarchy, SGroupRemoveFromHierarchy } from './sgroupHierarchy.modern.js';
export { SGroupAttachmentPointAdd, SGroupAttachmentPointRemove } from './sgroupAttachmentPoints.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGROUP_TYPE_MAPPING = {
  nucleotideComponent: SGroup.TYPES.SUP
};
var SGroupCreate = function (_BaseOperation) {
  _inherits(SGroupCreate, _BaseOperation);
  function SGroupCreate(sgroupId, type, pp, expanded, name, oldSgroup, monomer) {
    var _this;
    _classCallCheck(this, SGroupCreate);
    _this = _callSuper(this, SGroupCreate, [OperationType.S_GROUP_CREATE]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.monomer = monomer;
    _this.data = {
      sgid: sgroupId,
      type: type,
      pp: pp,
      expanded: expanded,
      name: name,
      oldSgroup: oldSgroup
    };
    return _this;
  }
  _createClass(SGroupCreate, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var _this$data = this.data,
        sgid = _this$data.sgid,
        type = _this$data.type,
        pp = _this$data.pp,
        expanded = _this$data.expanded,
        name = _this$data.name,
        oldSgroup = _this$data.oldSgroup;
      if (sgid === undefined || type === undefined) {
        return;
      }
      var sgroup;
      if (oldSgroup && oldSgroup instanceof MonomerMicromolecule) {
        sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, oldSgroup.monomer);
      } else if (this.monomer) {
        sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, this.monomer);
      } else {
        sgroup = new SGroup(SGROUP_TYPE_MAPPING[type] || type);
      }
      sgroup.id = sgid;
      struct.sgroups.set(sgid, sgroup);
      if (pp) {
        sgroup.pp = new Vec2(pp);
      }
      if (expanded !== undefined) {
        sgroup.data.expanded = expanded;
        if (sgroup instanceof MonomerMicromolecule) {
          if (Object.isFrozen(sgroup.monomer.monomerItem)) {
            sgroup.monomer.monomerItem = _objectSpread({}, sgroup.monomer.monomerItem);
          }
          sgroup.monomer.monomerItem.expanded = expanded;
        }
      }
      if (name) {
        sgroup.data.name = name;
      }
      var existingSGroup = struct.sgroups.get(sgid);
      if (existingSGroup) {
        restruct.sgroups.set(sgid, new ReSGroup(existingSGroup));
        if (FunctionalGroup.isFunctionalGroup(sgroup) || SGroup.isSuperAtom(sgroup)) {
          restruct.molecule.functionalGroups.add(new FunctionalGroup(sgroup));
        }
      }
      this.data.sgid = sgid;
    }
  }]);
  return SGroupCreate;
}(BaseOperation);
var SGroupDelete = function (_BaseOperation2) {
  _inherits(SGroupDelete, _BaseOperation2);
  function SGroupDelete(sgroupId) {
    var _this2;
    _classCallCheck(this, SGroupDelete);
    _this2 = _callSuper(this, SGroupDelete, [OperationType.S_GROUP_DELETE, OperationPriority.S_GROUP_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      sgid: sgroupId
    };
    return _this2;
  }
  _createClass(SGroupDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var _sgroup$item, _sgroup$item2, _sgroup$item3, _sgroup$item4;
      var struct = restruct.molecule;
      var sgid = this.data.sgid;
      if (sgid === undefined) {
        return;
      }
      var sgroup = restruct.sgroups.get(sgid);
      var sgroupData = restruct.sgroupData.get(sgid);
      if (!sgroup) return;
      this.data.type = sgroup === null || sgroup === void 0 || (_sgroup$item = sgroup.item) === null || _sgroup$item === void 0 ? void 0 : _sgroup$item.type;
      this.data.pp = sgroup === null || sgroup === void 0 || (_sgroup$item2 = sgroup.item) === null || _sgroup$item2 === void 0 ? void 0 : _sgroup$item2.pp;
      this.data.oldSgroup = sgroup.item;
      if ((sgroup === null || sgroup === void 0 || (_sgroup$item3 = sgroup.item) === null || _sgroup$item3 === void 0 ? void 0 : _sgroup$item3.type) === 'DAT' && sgroupData) {
        restruct.clearVisel(sgroupData.visel);
        restruct.sgroupData["delete"](sgid);
      }
      restruct.clearVisel(sgroup.visel);
      if ((sgroup === null || sgroup === void 0 || (_sgroup$item4 = sgroup.item) === null || _sgroup$item4 === void 0 || (_sgroup$item4 = _sgroup$item4.atoms) === null || _sgroup$item4 === void 0 ? void 0 : _sgroup$item4.length) !== 0) {
        throw new Error('S-Group not empty!');
      }
      if (FunctionalGroup.isFunctionalGroup(sgroup.item) || SGroup.isSuperAtom(sgroup.item)) {
        var relatedFGroupId;
        this.data.name = sgroup.item.data.name;
        this.data.expanded = sgroup.item.isExpanded();
        restruct.molecule.functionalGroups.forEach(function (fg, fgid) {
          if (fg.relatedSGroupId === sgid) {
            relatedFGroupId = fgid;
          }
        });
        restruct.molecule.functionalGroups["delete"](relatedFGroupId);
      }
      restruct.sgroups["delete"](sgid);
      struct.sgroups["delete"](sgid);
    }
  }]);
  return SGroupDelete;
}(BaseOperation);
SGroupCreate.InverseConstructor = SGroupDelete;
SGroupDelete.InverseConstructor = SGroupCreate;

export { SGroupCreate, SGroupDelete };
//# sourceMappingURL=index.modern.js.map
