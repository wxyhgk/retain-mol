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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var rxnArrow = require('../../../../domain/entities/rxnArrow.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
require('../../../render/renderStruct.js');
require('../../../render/raphaelRender.js');
require('../../../render/restruct/reobject.js');
require('../../../render/restruct/reatom.js');
require('../../../render/restruct/rebond.js');
require('../../../render/restruct/reenhancedFlag.js');
require('../../../render/restruct/refrag.js');
require('../../../render/restruct/rergroup.js');
var rerxnarrow = require('../../../render/restruct/rerxnarrow.js');
require('../../../render/restruct/rerxnplus.js');
require('../../../render/restruct/resgroup.js');
require('../../../render/restruct/resimpleObject.js');
require('../../../render/restruct/restruct.js');
require('../../../render/restruct/retext.js');
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
require('../../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../../utilities/KetcherLogger.js');
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
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
require('../../../render/scrollbar/scrollbar-container.js');
require('../../../render/notifyRenderComplete.js');
require('lodash');
require('../../../render/renderers/constants.js');
require('../../../render/render.types.js');
var RxnArrowMove = require('./RxnArrowMove.js');
var RxnArrowRotate = require('./RxnArrowRotate.js');
var RxnArrowResize = require('./RxnArrowResize.js');
var index = require('./plus/index.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrowAdd = function (_Base) {
  _inherits__default["default"](RxnArrowAdd, _Base);
  function RxnArrowAdd() {
    var _this;
    var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rxnArrow.RxnArrowMode.OpenAngle;
    var id = arguments.length > 2 ? arguments[2] : undefined;
    var height = arguments.length > 3 ? arguments[3] : undefined;
    var arrowId = arguments.length > 4 ? arguments[4] : undefined;
    _classCallCheck__default["default"](this, RxnArrowAdd);
    _this = _callSuper(this, RxnArrowAdd, [OperationType.OperationType.RXN_ARROW_ADD]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      pos: pos,
      mode: mode,
      id: id,
      height: height,
      arrowId: arrowId
    };
    return _this;
  }
  _createClass__default["default"](RxnArrowAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = new rxnArrow.RxnArrow({
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
        KetcherLogger.KetcherLogger.error('RxnArrowAdd.execute(): rxnArrow id was not assigned');
        return;
      }
      restruct.rxnArrows.set(itemId, new rerxnarrow["default"](item));
      var positions = _toConsumableArray__default["default"](this.data.pos);
      struct.rxnArrowSetPos(itemId, positions.map(function (p) {
        return new vec2.Vec2(p);
      }));
      BaseOperation.BaseOperation.invalidateItem(restruct, 'rxnArrows', itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var itemId = this.data.id;
      if (itemId == null) {
        KetcherLogger.KetcherLogger.error('RxnArrowAdd.invert(): rxnArrow id was not assigned');
        return new RxnArrowDelete();
      }
      return new RxnArrowDelete(itemId);
    }
  }]);
  return RxnArrowAdd;
}(BaseOperation.BaseOperation);
var RxnArrowDelete = function (_Base2) {
  _inherits__default["default"](RxnArrowDelete, _Base2);
  function RxnArrowDelete(id) {
    var _this2;
    _classCallCheck__default["default"](this, RxnArrowDelete);
    _this2 = _callSuper(this, RxnArrowDelete, [OperationType.OperationType.RXN_ARROW_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "performed", void 0);
    _this2.data = {
      id: id,
      pos: [],
      mode: rxnArrow.RxnArrowMode.OpenAngle
    };
    _this2.performed = false;
    return _this2;
  }
  _createClass__default["default"](RxnArrowDelete, [{
    key: "execute",
    value: function execute(restruct) {
      KetcherLogger.KetcherLogger.log('RxnArrowDelete.execute(), start', this.data);
      var itemId = this.data.id;
      if (itemId == null) {
        KetcherLogger.KetcherLogger.error('RxnArrowDelete.execute(): rxnArrow id is not assigned');
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
      KetcherLogger.KetcherLogger.log('RxnArrowDelete.execute(), end');
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RxnArrowAdd(this.data.pos, this.data.mode, this.data.id, this.data.height, this.data.arrowId);
    }
  }]);
  return RxnArrowDelete;
}(BaseOperation.BaseOperation);

exports.RxnArrowMove = RxnArrowMove.RxnArrowMove;
exports.RxnArrowRotate = RxnArrowRotate.RxnArrowRotate;
exports.ARROW_MAX_SNAPPING_ANGLE = RxnArrowResize.ARROW_MAX_SNAPPING_ANGLE;
exports.RxnArrowResize = RxnArrowResize.RxnArrowResize;
exports.getSnappedArrowVector = RxnArrowResize.getSnappedArrowVector;
exports.RxnPlusAdd = index.RxnPlusAdd;
exports.RxnPlusDelete = index.RxnPlusDelete;
exports.RxnArrowAdd = RxnArrowAdd;
exports.RxnArrowDelete = RxnArrowDelete;
//# sourceMappingURL=index.js.map
