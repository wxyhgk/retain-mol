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
import '../../../render/restruct/rergroup.modern.js';
import '../../../render/restruct/rerxnarrow.modern.js';
import '../../../render/restruct/rerxnplus.modern.js';
import '../../../render/restruct/resgroup.modern.js';
import '../../../render/restruct/resimpleObject.modern.js';
import '../../../render/restruct/restruct.modern.js';
import ReText from '../../../render/restruct/retext.modern.js';
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
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../../render/scrollbar/scrollbar-container.modern.js';
import '../../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../../render/renderers/constants.modern.js';
import '../../../render/render.types.modern.js';
import { Text } from '../../../../domain/entities/text.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var TextCreate = function (_BaseOperation) {
  _inherits(TextCreate, _BaseOperation);
  function TextCreate(content, position, pos, id) {
    var _this;
    _classCallCheck(this, TextCreate);
    _this = _callSuper(this, TextCreate, [OperationType.TEXT_CREATE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      content: content,
      position: position,
      pos: pos,
      id: id
    };
    return _this;
  }
  _createClass(TextCreate, [{
    key: "execute",
    value: function execute(restruct) {
      var item = new Text(this.data);
      if (this.data.id == null) {
        var index = restruct.molecule.texts.add(item);
        this.data.id = index;
      } else {
        restruct.molecule.texts.set(this.data.id, item);
      }
      var itemId = this.data.id;
      restruct.texts.set(itemId, new ReText(item));
      restruct.molecule.textSetPosition(itemId, new Vec2(this.data.position));
      BaseOperation.invalidateItem(restruct, 'texts', itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new TextDelete(this.data.id);
    }
  }]);
  return TextCreate;
}(BaseOperation);
var TextDelete = function (_BaseOperation2) {
  _inherits(TextDelete, _BaseOperation2);
  function TextDelete(id) {
    var _this2;
    _classCallCheck(this, TextDelete);
    _this2 = _callSuper(this, TextDelete, [OperationType.TEXT_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      id: id
    };
    return _this2;
  }
  _createClass(TextDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = struct.texts.get(this.data.id);
      if (!item) return;
      this.data.content = item.content;
      this.data.position = item.position;
      restruct.markItemRemoved();
      var reText = restruct.texts.get(this.data.id);
      if (reText) {
        restruct.clearVisel(reText.visel);
      }
      restruct.texts["delete"](this.data.id);
      struct.texts["delete"](this.data.id);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new TextCreate(this.data.content, this.data.position, this.data.pos, this.data.id);
    }
  }]);
  return TextDelete;
}(BaseOperation);

export { TextCreate, TextDelete };
//# sourceMappingURL=TextCreateDelete.modern.js.map
