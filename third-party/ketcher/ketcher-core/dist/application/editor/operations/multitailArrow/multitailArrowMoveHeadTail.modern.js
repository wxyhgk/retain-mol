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
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';
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
import '../../../render/restruct/resgroup.modern.js';
import '../../../render/restruct/resimpleObject.modern.js';
import '../../../render/restruct/restruct.modern.js';
import '../../../render/restruct/retext.modern.js';
import '../../../render/restruct/visel.modern.js';
import '../../../render/restruct/generalEnumTypes.modern.js';
import '../../../render/restruct/showHydrogenLabels.modern.js';
import '../../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../../render/restruct/reImage.modern.js';
import { MultitailArrowRefName } from '../../../render/restruct/remultitailArrow.modern.js';
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
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import { MULTITAIL_ARROW_KEY } from '../../../../domain/constants/multitailArrow.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MultitailArrowMoveHeadTail = function (_BaseOperation) {
  _inherits(MultitailArrowMoveHeadTail, _BaseOperation);
  function MultitailArrowMoveHeadTail(id, offset, name, tailId, normalize) {
    var _this;
    _classCallCheck(this, MultitailArrowMoveHeadTail);
    _this = _callSuper(this, MultitailArrowMoveHeadTail, [OperationType.MULTITAIL_ARROW_MOVE_HEAD_TAIL]);
    _defineProperty(_assertThisInitialized(_this), "id", void 0);
    _defineProperty(_assertThisInitialized(_this), "offset", void 0);
    _defineProperty(_assertThisInitialized(_this), "name", void 0);
    _defineProperty(_assertThisInitialized(_this), "tailId", void 0);
    _defineProperty(_assertThisInitialized(_this), "normalize", void 0);
    _this.id = id;
    _this.offset = offset;
    _this.name = name;
    _this.tailId = tailId;
    _this.normalize = normalize;
    return _this;
  }
  _createClass(MultitailArrowMoveHeadTail, [{
    key: "execute",
    value: function execute(reStruct) {
      var reMultitailArrow = reStruct.multitailArrows.get(this.id);
      var multitailArrow = reStruct.molecule.multitailArrows.get(this.id);
      if (!multitailArrow || !reMultitailArrow) {
        return;
      }
      switch (this.name) {
        case MultitailArrowRefName.HEAD:
          this.offset = multitailArrow.moveHead(this.offset);
          break;
        case MultitailArrowRefName.TOP_TAIL:
          this.offset = multitailArrow.moveTail(this.offset, this.name);
          break;
        case MultitailArrowRefName.BOTTOM_TAIL:
          this.offset = multitailArrow.moveTail(this.offset, this.name);
          break;
        default:
          this.offset = multitailArrow.moveTail(this.offset, this.tailId, this.normalize);
      }
      BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, this.id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new MultitailArrowMoveHeadTail(this.id, -this.offset, this.name, this.tailId);
    }
  }]);
  return MultitailArrowMoveHeadTail;
}(BaseOperation);

export { MultitailArrowMoveHeadTail };
//# sourceMappingURL=multitailArrowMoveHeadTail.modern.js.map
