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
import { RxnArrowMode, RxnArrow } from '../../../../domain/entities/rxnArrow.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
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
import ReRxnArrow from '../../../render/restruct/rerxnarrow.modern.js';
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
import '../../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../../utilities/KetcherLogger.modern.js';
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
export { RxnArrowMove } from './RxnArrowMove.modern.js';
export { RxnArrowRotate } from './RxnArrowRotate.modern.js';
export { ARROW_MAX_SNAPPING_ANGLE, RxnArrowResize, getSnappedArrowVector } from './RxnArrowResize.modern.js';
export { RxnPlusAdd, RxnPlusDelete } from './plus/index.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrowAdd = function (_Base) {
  _inherits(RxnArrowAdd, _Base);
  function RxnArrowAdd() {
    var _this;
    var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : RxnArrowMode.OpenAngle;
    var id = arguments.length > 2 ? arguments[2] : undefined;
    var height = arguments.length > 3 ? arguments[3] : undefined;
    var arrowId = arguments.length > 4 ? arguments[4] : undefined;
    _classCallCheck(this, RxnArrowAdd);
    _this = _callSuper(this, RxnArrowAdd, [OperationType.RXN_ARROW_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      pos: pos,
      mode: mode,
      id: id,
      height: height,
      arrowId: arrowId
    };
    return _this;
  }
  _createClass(RxnArrowAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = new RxnArrow({
        mode: this.data.mode,
        height: this.data.height,
        arrowId: this.data.arrowId
      });
      if (this.data.id == null) {
        var index = struct.addRxnArrow(item);
        this.data.id = index;
        this.data.arrowId = item.arrowId;
      } else {
        struct.setRxnArrow(this.data.id, item);
      }
      var itemId = this.data.id;
      if (itemId == null) {
        KetcherLogger.error('RxnArrowAdd.execute(): rxnArrow id was not assigned');
        return;
      }
      restruct.rxnArrows.set(itemId, new ReRxnArrow(item));
      var positions = _toConsumableArray(this.data.pos);
      struct.rxnArrowSetPos(itemId, positions.map(function (p) {
        return new Vec2(p);
      }));
      BaseOperation.invalidateItem(restruct, 'rxnArrows', itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var itemId = this.data.id;
      if (itemId == null) {
        KetcherLogger.error('RxnArrowAdd.invert(): rxnArrow id was not assigned');
        return new RxnArrowDelete();
      }
      return new RxnArrowDelete(itemId);
    }
  }]);
  return RxnArrowAdd;
}(BaseOperation);
var RxnArrowDelete = function (_Base2) {
  _inherits(RxnArrowDelete, _Base2);
  function RxnArrowDelete(id) {
    var _this2;
    _classCallCheck(this, RxnArrowDelete);
    _this2 = _callSuper(this, RxnArrowDelete, [OperationType.RXN_ARROW_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _defineProperty(_assertThisInitialized(_this2), "performed", void 0);
    _this2.data = {
      id: id,
      pos: [],
      mode: RxnArrowMode.OpenAngle
    };
    _this2.performed = false;
    return _this2;
  }
  _createClass(RxnArrowDelete, [{
    key: "execute",
    value: function execute(restruct) {
      KetcherLogger.log('RxnArrowDelete.execute(), start', this.data);
      var itemId = this.data.id;
      if (itemId == null) {
        KetcherLogger.error('RxnArrowDelete.execute(): rxnArrow id is not assigned');
        return;
      }
      var struct = restruct.molecule;
      var item = struct.rxnArrows.get(itemId);
      if (!item) throw new Error("rxnArrow not found with id: ".concat(itemId));
      this.data.pos = item.pos;
      this.data.mode = item.mode;
      this.data.height = item.height;
      this.data.arrowId = item.arrowId;
      this.performed = true;
      restruct.markItemRemoved();
      var reItem = restruct.rxnArrows.get(itemId);
      if (!reItem) throw new Error("reRxnArrow not found with id: ".concat(itemId));
      restruct.clearVisel(reItem.visel);
      restruct.rxnArrows["delete"](itemId);
      struct.rxnArrows["delete"](itemId);
      KetcherLogger.log('RxnArrowDelete.execute(), end');
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RxnArrowAdd(this.data.pos, this.data.mode, this.data.id, this.data.height, this.data.arrowId);
    }
  }]);
  return RxnArrowDelete;
}(BaseOperation);

export { RxnArrowAdd, RxnArrowDelete };
//# sourceMappingURL=index.modern.js.map
