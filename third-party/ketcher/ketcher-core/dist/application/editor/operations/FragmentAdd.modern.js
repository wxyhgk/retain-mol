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
import '../../render/renderStruct.modern.js';
import '../../render/raphaelRender.modern.js';
import '../../render/restruct/reobject.modern.js';
import '../../render/restruct/reatom.modern.js';
import '../../render/restruct/rebond.modern.js';
import ReEnhancedFlag from '../../render/restruct/reenhancedFlag.modern.js';
import ReFrag from '../../render/restruct/refrag.modern.js';
import '../../render/restruct/rergroup.modern.js';
import '../../render/restruct/rerxnarrow.modern.js';
import '../../render/restruct/rerxnplus.modern.js';
import '../../render/restruct/resgroup.modern.js';
import '../../render/restruct/resimpleObject.modern.js';
import '../../render/restruct/restruct.modern.js';
import '../../render/restruct/retext.modern.js';
import '../../render/restruct/visel.modern.js';
import '../../render/restruct/generalEnumTypes.modern.js';
import '../../render/restruct/showHydrogenLabels.modern.js';
import '../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../render/restruct/reImage.modern.js';
import '../../render/restruct/remultitailArrow.modern.js';
import '../../render/renderers/BaseRenderer.modern.js';
import '../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../render/renderers/AtomRenderer.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../render/renderers/SGroupRenderer.modern.js';
import '../../render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../render/renderers/StereoFlagRenderer.modern.js';
import '../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../../domain/entities/vec2.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../render/scrollbar/scrollbar-container.modern.js';
import '../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../render/renderers/constants.modern.js';
import '../../render/render.types.modern.js';
import { BaseOperation } from './BaseOperation.modern.js';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import { Fragment } from '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../domain/entities/Command.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { OperationType } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FragmentAdd = function (_BaseOperation) {
  _inherits(FragmentAdd, _BaseOperation);
  function FragmentAdd(fragmentId, properties) {
    var _this;
    _classCallCheck(this, FragmentAdd);
    _this = _callSuper(this, FragmentAdd, [OperationType.FRAGMENT_ADD]);
    _defineProperty(_assertThisInitialized(_this), "frid", void 0);
    _defineProperty(_assertThisInitialized(_this), "properties", void 0);
    _this.frid = typeof fragmentId === 'undefined' ? null : fragmentId;
    if (properties) {
      _this.properties = properties;
    }
    return _this;
  }
  _createClass(FragmentAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var frag = new Fragment([], null, this.properties);
      if (this.frid === null) {
        this.frid = struct.frags.add(frag);
      } else {
        struct.frags.set(this.frid, frag);
      }
      restruct.frags.set(this.frid, new ReFrag(frag));
      restruct.markItem('frags', this.frid, 1);
      restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag());
    }
  }, {
    key: "invert",
    value: function invert() {
      return new FragmentAdd.InverseConstructor(this.frid);
    }
  }]);
  return FragmentAdd;
}(BaseOperation);
_defineProperty(FragmentAdd, "InverseConstructor", void 0);

export { FragmentAdd };
//# sourceMappingURL=FragmentAdd.modern.js.map
