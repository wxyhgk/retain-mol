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
import { ReMultitailArrow } from '../../../render/restruct/remultitailArrow.modern.js';
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
var MultitailArrowUpsert = function (_BaseOperation) {
  _inherits(MultitailArrowUpsert, _BaseOperation);
  function MultitailArrowUpsert(multitailArrow, id, arrowId) {
    var _this;
    _classCallCheck(this, MultitailArrowUpsert);
    _this = _callSuper(this, MultitailArrowUpsert, [OperationType.MULTITAIL_ARROW_UPSERT]);
    _defineProperty(_assertThisInitialized(_this), "multitailArrow", void 0);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.multitailArrow = multitailArrow;
    _this.data = {
      id: id,
      arrowId: arrowId
    };
    return _this;
  }
  _createClass(MultitailArrowUpsert, [{
    key: "execute",
    value: function execute(reStruct) {
      var struct = reStruct.molecule;
      if (this.data.id === undefined) {
        this.data.id = struct.multitailArrows.newId();
      }
      var id = this.data.id;
      var item = this.multitailArrow.clone();
      item.arrowId = this.data.arrowId;
      struct.setMultitailArrow(id, item);
      this.data.arrowId = item.arrowId;
      reStruct.multitailArrows.set(id, new ReMultitailArrow(item));
      BaseOperation.invalidateItem(reStruct, MULTITAIL_ARROW_KEY, id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.data.id === undefined) {
        throw new Error('MultitailArrowUpsert.invert() called before execute()');
      }
      return new MultitailArrowDelete(this.data.id);
    }
  }]);
  return MultitailArrowUpsert;
}(BaseOperation);
var MultitailArrowDelete = function (_BaseOperation2) {
  _inherits(MultitailArrowDelete, _BaseOperation2);
  function MultitailArrowDelete(id) {
    var _this2;
    _classCallCheck(this, MultitailArrowDelete);
    _this2 = _callSuper(this, MultitailArrowDelete, [OperationType.MULTITAIL_ARROW_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "multitailArrow", void 0);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      id: id
    };
    return _this2;
  }
  _createClass(MultitailArrowDelete, [{
    key: "execute",
    value: function execute(reStruct) {
      var reMultitailArrow = reStruct.multitailArrows.get(this.data.id);
      if (!reMultitailArrow) {
        return;
      }
      this.multitailArrow = reMultitailArrow.multitailArrow.clone();
      this.data.arrowId = reMultitailArrow.multitailArrow.arrowId;
      reStruct.clearVisel(reMultitailArrow.visel);
      reStruct.markItemRemoved();
      reStruct.multitailArrows["delete"](this.data.id);
      reStruct.molecule.multitailArrows["delete"](this.data.id);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (!this.multitailArrow) {
        throw new Error('MultitailArrowDelete.invert() called before execute()');
      }
      return new MultitailArrowUpsert(this.multitailArrow, this.data.id, this.data.arrowId);
    }
  }]);
  return MultitailArrowDelete;
}(BaseOperation);

export { MultitailArrowDelete, MultitailArrowUpsert };
//# sourceMappingURL=multitailArrowUpsertDelete.modern.js.map
