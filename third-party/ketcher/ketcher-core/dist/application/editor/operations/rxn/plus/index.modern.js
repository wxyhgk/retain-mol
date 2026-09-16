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
import '../../../../render/renderStruct.modern.js';
import '../../../../render/raphaelRender.modern.js';
import '../../../../render/restruct/reobject.modern.js';
import '../../../../render/restruct/reatom.modern.js';
import '../../../../render/restruct/rebond.modern.js';
import '../../../../render/restruct/reenhancedFlag.modern.js';
import '../../../../render/restruct/refrag.modern.js';
import '../../../../render/restruct/rergroup.modern.js';
import '../../../../render/restruct/rerxnarrow.modern.js';
import ReRxnPlus from '../../../../render/restruct/rerxnplus.modern.js';
import '../../../../render/restruct/resgroup.modern.js';
import '../../../../render/restruct/resimpleObject.modern.js';
import '../../../../render/restruct/restruct.modern.js';
import '../../../../render/restruct/retext.modern.js';
import '../../../../render/restruct/visel.modern.js';
import '../../../../render/restruct/generalEnumTypes.modern.js';
import '../../../../render/restruct/showHydrogenLabels.modern.js';
import '../../../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../../../render/restruct/reImage.modern.js';
import '../../../../render/restruct/remultitailArrow.modern.js';
import '../../../../render/renderers/BaseRenderer.modern.js';
import '../../../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../../../render/renderers/AtomRenderer.modern.js';
import '../../../../render/renderers/ChemRenderer.modern.js';
import '../../../../render/renderers/PeptideRenderer.modern.js';
import '../../../../render/renderers/PhosphateRenderer.modern.js';
import '../../../../render/renderers/SugarRenderer.modern.js';
import '../../../../render/renderers/RNABaseRenderer.modern.js';
import '../../../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../../../render/renderers/SGroupRenderer.modern.js';
import '../../../../render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../../../utilities/runAsyncAction.modern.js';
import '../../../../../utilities/KetcherLogger.modern.js';
import '../../../../../utilities/SettingsManager.modern.js';
import '../../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../../utilities/clipboardUtils.modern.js';
import '../../../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../../../../domain/entities/Chem.modern.js';
import '../../../../render/renderers/StereoFlagRenderer.modern.js';
import '../../../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import { Vec2 } from '../../../../../domain/entities/vec2.modern.js';
import '../../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../../domain/constants/generics.modern.js';
import '../../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../../../render/scrollbar/scrollbar-container.modern.js';
import '../../../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../../../render/renderers/constants.modern.js';
import '../../../../render/render.types.modern.js';
import { RxnPlus } from '../../../../../domain/entities/rxnPlus.modern.js';
import { BaseOperation } from '../../BaseOperation.modern.js';
import { OperationType } from '../../OperationType.modern.js';
export { RxnPlusMove } from './RxnPlusMove.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnPlusAdd = function (_BaseOperation) {
  _inherits(RxnPlusAdd, _BaseOperation);
  function RxnPlusAdd(pos) {
    var _this;
    _classCallCheck(this, RxnPlusAdd);
    _this = _callSuper(this, RxnPlusAdd, [OperationType.RXN_PLUS_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      plid: null,
      pos: pos !== null && pos !== void 0 ? pos : null
    };
    return _this;
  }
  _createClass(RxnPlusAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var newRxn = new RxnPlus();
      if (typeof this.data.plid === 'number') {
        struct.rxnPluses.set(this.data.plid, newRxn);
      } else {
        this.data.plid = struct.rxnPluses.add(newRxn);
      }
      var pos = this.data.pos;
      var plid = this.data.plid;
      var structRxn = struct.rxnPluses.get(plid);
      if (!structRxn) return;
      restruct.rxnPluses.set(plid, new ReRxnPlus(structRxn));
      struct.rxnPlusSetPos(plid, pos ? new Vec2(pos) : new Vec2());
      BaseOperation.invalidateItem(restruct, 'rxnPluses', plid, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new RxnPlusDelete();
      inverted.data = this.data;
      return inverted;
    }
  }]);
  return RxnPlusAdd;
}(BaseOperation);
var RxnPlusDelete = function (_BaseOperation2) {
  _inherits(RxnPlusDelete, _BaseOperation2);
  function RxnPlusDelete(plid) {
    var _this2;
    _classCallCheck(this, RxnPlusDelete);
    _this2 = _callSuper(this, RxnPlusDelete, [OperationType.RXN_PLUS_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      plid: plid !== null && plid !== void 0 ? plid : null,
      pos: null
    };
    return _this2;
  }
  _createClass(RxnPlusDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var plid = this.data.plid;
      if (plid === null) return;
      var struct = restruct.molecule;
      if (!this.data.pos) {
        var rxnPlus = struct.rxnPluses.get(plid);
        if (!rxnPlus) return;
        this.data.pos = rxnPlus.pp;
      }
      restruct.markItemRemoved();
      var rxn = restruct.rxnPluses.get(plid);
      if (!rxn) return;
      restruct.clearVisel(rxn.visel);
      restruct.rxnPluses["delete"](plid);
      struct.rxnPluses["delete"](plid);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new RxnPlusAdd();
      inverted.data = this.data;
      return inverted;
    }
  }]);
  return RxnPlusDelete;
}(BaseOperation);

export { RxnPlusAdd, RxnPlusDelete };
//# sourceMappingURL=index.modern.js.map
