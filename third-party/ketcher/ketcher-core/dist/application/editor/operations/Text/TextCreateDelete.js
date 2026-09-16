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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../../render/renderStruct.js');
require('../../../render/raphaelRender.js');
require('../../../render/restruct/reobject.js');
require('../../../render/restruct/reatom.js');
require('../../../render/restruct/rebond.js');
require('../../../render/restruct/reenhancedFlag.js');
require('../../../render/restruct/refrag.js');
require('../../../render/restruct/rergroup.js');
require('../../../render/restruct/rerxnarrow.js');
require('../../../render/restruct/rerxnplus.js');
require('../../../render/restruct/resgroup.js');
require('../../../render/restruct/resimpleObject.js');
require('../../../render/restruct/restruct.js');
var retext = require('../../../render/restruct/retext.js');
require('../../../render/restruct/visel.js');
require('../../../render/restruct/generalEnumTypes.js');
require('../../../render/restruct/showHydrogenLabels.js');
require('../../../render/restruct/rergroupAttachmentPoint.js');
require('../../../render/restruct/reImage.js');
require('../../../render/restruct/remultitailArrow.js');
require('../../../render/renderers/BaseRenderer.js');
require('../../../render/renderers/BaseMonomerRenderer.js');
require('../../../render/renderers/AtomRenderer.js');
require('../../../render/renderers/ChemRenderer.js');
require('../../../render/renderers/PeptideRenderer.js');
require('../../../render/renderers/PhosphateRenderer.js');
require('../../../render/renderers/SugarRenderer.js');
require('../../../render/renderers/RNABaseRenderer.js');
require('../../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../../render/renderers/UnsplitNucleotideRenderer.js');
require('../../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../../render/renderers/SGroupRenderer.js');
require('../../../render/renderers/RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../../../domain/entities/Chem.js');
require('../../../render/renderers/StereoFlagRenderer.js');
require('../../../render/renderers/sequence/SequenceRenderer.js');
require('../../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
var vec2 = require('../../../../domain/entities/vec2.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
require('../../../render/scrollbar/scrollbar-container.js');
require('../../../render/notifyRenderComplete.js');
require('lodash');
require('../../../render/renderers/constants.js');
require('../../../render/render.types.js');
var text = require('../../../../domain/entities/text.js');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var TextCreate = function (_BaseOperation) {
  _inherits__default["default"](TextCreate, _BaseOperation);
  function TextCreate(content, position, pos, id) {
    var _this;
    _classCallCheck__default["default"](this, TextCreate);
    _this = _callSuper(this, TextCreate, [OperationType.OperationType.TEXT_CREATE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      content: content,
      position: position,
      pos: pos,
      id: id
    };
    return _this;
  }
  _createClass__default["default"](TextCreate, [{
    key: "execute",
    value: function execute(restruct) {
      var item = new text.Text(this.data);
      if (this.data.id == null) {
        var index = restruct.molecule.texts.add(item);
        this.data.id = index;
      } else {
        restruct.molecule.texts.set(this.data.id, item);
      }
      var itemId = this.data.id;
      restruct.texts.set(itemId, new retext["default"](item));
      restruct.molecule.textSetPosition(itemId, new vec2.Vec2(this.data.position));
      BaseOperation.BaseOperation.invalidateItem(restruct, 'texts', itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new TextDelete(this.data.id);
    }
  }]);
  return TextCreate;
}(BaseOperation.BaseOperation);
var TextDelete = function (_BaseOperation2) {
  _inherits__default["default"](TextDelete, _BaseOperation2);
  function TextDelete(id) {
    var _this2;
    _classCallCheck__default["default"](this, TextDelete);
    _this2 = _callSuper(this, TextDelete, [OperationType.OperationType.TEXT_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      id: id
    };
    return _this2;
  }
  _createClass__default["default"](TextDelete, [{
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
}(BaseOperation.BaseOperation);

exports.TextCreate = TextCreate;
exports.TextDelete = TextDelete;
//# sourceMappingURL=TextCreateDelete.js.map
