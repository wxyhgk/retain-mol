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
import { Atom } from '../../../../domain/entities/atom.modern.js';
import '../../../../domain/entities/atomList.modern.js';
import '../../../../domain/entities/bond.modern.js';
import '../../../../domain/entities/fixedPrecision.modern.js';
import '../../../../domain/entities/fragment.modern.js';
import '../../../../domain/entities/functionalGroup.modern.js';
import '../../../../domain/entities/halfBond.modern.js';
import '../../../../domain/entities/loop.modern.js';
import '../../../../domain/entities/rgroup.modern.js';
import '../../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../../domain/entities/rxnArrow.modern.js';
import '../../../../domain/entities/rxnPlus.modern.js';
import '../../../../domain/entities/sgroup.modern.js';
import '../../../../domain/entities/sgroupForest.modern.js';
import '../../../../domain/entities/simpleObject.modern.js';
import '../../../../domain/entities/struct.modern.js';
import '../../../../domain/entities/text.modern.js';
import { Pile } from '../../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/entities/box2Abs.modern.js';
import '../../../../domain/entities/pool.modern.js';
import '../../../../domain/entities/image.modern.js';
import '../../../../domain/entities/multitailArrow.modern.js';
import '../../../../domain/entities/highlight.modern.js';
import '../../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../../domain/entities/Peptide.modern.js';
import '../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../../domain/entities/Sugar.modern.js';
import '../../../../domain/entities/RNABase.modern.js';
import '../../../../domain/entities/Phosphate.modern.js';
import '../../../../domain/entities/Axis.modern.js';
import '../../../../domain/entities/Nucleoside.modern.js';
import '../../../../domain/entities/Nucleotide.modern.js';
import '../../../../domain/entities/monomer-chains/types.modern.js';
import '../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../../domain/entities/PolymerBond.modern.js';
import '../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../../domain/entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';
import '../../../render/renderStruct.modern.js';
import '../../../render/raphaelRender.modern.js';
import '../../../render/restruct/reobject.modern.js';
import ReAtom from '../../../render/restruct/reatom.modern.js';
import '../../../render/restruct/rebond.modern.js';
import '../../../render/restruct/reenhancedFlag.modern.js';
import '../../../render/restruct/refrag.modern.js';
import '../../../render/restruct/rergroup.modern.js';
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
import '../../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
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
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../../render/scrollbar/scrollbar-container.modern.js';
import '../../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../../render/renderers/constants.modern.js';
import '../../../render/render.types.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AtomAdd = function (_BaseOperation) {
  _inherits(AtomAdd, _BaseOperation);
  function AtomAdd(atom, pos) {
    var _this;
    _classCallCheck(this, AtomAdd);
    _this = _callSuper(this, AtomAdd, [OperationType.ATOM_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      atom: atom !== null && atom !== void 0 ? atom : null,
      pos: pos !== null && pos !== void 0 ? pos : null,
      aid: null
    };
    return _this;
  }
  _createClass(AtomAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        atom = _this$data.atom,
        pos = _this$data.pos;
      var struct = restruct.molecule;
      var pp = _objectSpread({
        label: ''
      }, atom !== null && atom !== void 0 ? atom : {});
      pp.label = pp.label || 'C';
      var aid;
      if (typeof this.data.aid !== 'number') {
        aid = struct.atoms.add(new Atom(pp));
        this.data.aid = aid;
      } else {
        aid = this.data.aid;
        struct.atoms.set(aid, new Atom(pp));
      }
      var reAtom = struct.atoms.get(aid);
      if (!reAtom) return;
      var atomData = new ReAtom(reAtom);
      atomData.component = restruct.connectedComponents.add(new Pile([aid]));
      restruct.atoms.set(aid, atomData);
      restruct.markAtom(aid, 1);
      struct.atomSetPos(aid, new Vec2(pos));
      var arrow = struct.rxnArrows.get(0);
      if (arrow) {
        var atomInstance = struct.atoms.get(aid);
        if (atomInstance) {
          atomInstance.rxnFragmentType = struct.defineRxnFragmentTypeForAtomset(new Pile([aid]), arrow.pos[0].x);
        }
      }
    }
  }]);
  return AtomAdd;
}(BaseOperation);

export { AtomAdd };
//# sourceMappingURL=AtomAdd.modern.js.map
