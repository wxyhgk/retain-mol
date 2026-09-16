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
require('../../../../render/renderStruct.js');
require('../../../../render/raphaelRender.js');
require('../../../../render/restruct/reobject.js');
require('../../../../render/restruct/reatom.js');
require('../../../../render/restruct/rebond.js');
require('../../../../render/restruct/reenhancedFlag.js');
require('../../../../render/restruct/refrag.js');
require('../../../../render/restruct/rergroup.js');
require('../../../../render/restruct/rerxnarrow.js');
var rerxnplus = require('../../../../render/restruct/rerxnplus.js');
require('../../../../render/restruct/resgroup.js');
require('../../../../render/restruct/resimpleObject.js');
require('../../../../render/restruct/restruct.js');
require('../../../../render/restruct/retext.js');
require('../../../../render/restruct/visel.js');
require('../../../../render/restruct/generalEnumTypes.js');
require('../../../../render/restruct/showHydrogenLabels.js');
require('../../../../render/restruct/rergroupAttachmentPoint.js');
require('../../../../render/restruct/reImage.js');
require('../../../../render/restruct/remultitailArrow.js');
require('../../../../render/renderers/BaseRenderer.js');
require('../../../../render/renderers/BaseMonomerRenderer.js');
require('../../../../render/renderers/AtomRenderer.js');
require('../../../../render/renderers/ChemRenderer.js');
require('../../../../render/renderers/PeptideRenderer.js');
require('../../../../render/renderers/PhosphateRenderer.js');
require('../../../../render/renderers/SugarRenderer.js');
require('../../../../render/renderers/RNABaseRenderer.js');
require('../../../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../../../render/renderers/UnsplitNucleotideRenderer.js');
require('../../../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../../../render/renderers/SGroupRenderer.js');
require('../../../../render/renderers/RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../../../utilities/runAsyncAction.js');
require('../../../../../utilities/KetcherLogger.js');
require('../../../../../utilities/SettingsManager.js');
require('../../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../../utilities/clipboardUtils.js');
require('../../../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../../../../domain/entities/Chem.js');
require('../../../../render/renderers/StereoFlagRenderer.js');
require('../../../../render/renderers/sequence/SequenceRenderer.js');
require('../../../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
var vec2 = require('../../../../../domain/entities/vec2.js');
require('../../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../../domain/constants/generics.js');
require('../../../../../domain/helpers/attachmentPointCalculations.js');
require('../../../../render/scrollbar/scrollbar-container.js');
require('../../../../render/notifyRenderComplete.js');
require('lodash');
require('../../../../render/renderers/constants.js');
require('../../../../render/render.types.js');
var rxnPlus = require('../../../../../domain/entities/rxnPlus.js');
var BaseOperation = require('../../BaseOperation.js');
var OperationType = require('../../OperationType.js');
var RxnPlusMove = require('./RxnPlusMove.js');

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
var RxnPlusAdd = function (_BaseOperation) {
  _inherits__default["default"](RxnPlusAdd, _BaseOperation);
  function RxnPlusAdd(pos) {
    var _this;
    _classCallCheck__default["default"](this, RxnPlusAdd);
    _this = _callSuper(this, RxnPlusAdd, [OperationType.OperationType.RXN_PLUS_ADD]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      plid: null,
      pos: pos !== null && pos !== void 0 ? pos : null
    };
    return _this;
  }
  _createClass__default["default"](RxnPlusAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var newRxn = new rxnPlus.RxnPlus();
      if (typeof this.data.plid === 'number') {
        struct.rxnPluses.set(this.data.plid, newRxn);
      } else {
        this.data.plid = struct.rxnPluses.add(newRxn);
      }
      var pos = this.data.pos;
      var plid = this.data.plid;
      var structRxn = struct.rxnPluses.get(plid);
      if (!structRxn) return;
      restruct.rxnPluses.set(plid, new rerxnplus["default"](structRxn));
      struct.rxnPlusSetPos(plid, pos ? new vec2.Vec2(pos) : new vec2.Vec2());
      BaseOperation.BaseOperation.invalidateItem(restruct, 'rxnPluses', plid, 1);
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
}(BaseOperation.BaseOperation);
var RxnPlusDelete = function (_BaseOperation2) {
  _inherits__default["default"](RxnPlusDelete, _BaseOperation2);
  function RxnPlusDelete(plid) {
    var _this2;
    _classCallCheck__default["default"](this, RxnPlusDelete);
    _this2 = _callSuper(this, RxnPlusDelete, [OperationType.OperationType.RXN_PLUS_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      plid: plid !== null && plid !== void 0 ? plid : null,
      pos: null
    };
    return _this2;
  }
  _createClass__default["default"](RxnPlusDelete, [{
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
}(BaseOperation.BaseOperation);

exports.RxnPlusMove = RxnPlusMove.RxnPlusMove;
exports.RxnPlusAdd = RxnPlusAdd;
exports.RxnPlusDelete = RxnPlusDelete;
//# sourceMappingURL=index.js.map
