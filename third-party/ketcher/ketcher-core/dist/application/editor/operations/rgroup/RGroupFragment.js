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
var rergroup = require('../../../render/restruct/rergroup.js');
require('../../../render/restruct/rerxnarrow.js');
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
require('../../../../domain/entities/vec2.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
require('../../../render/scrollbar/scrollbar-container.js');
require('../../../render/notifyRenderComplete.js');
require('lodash');
require('../../../render/renderers/constants.js');
require('../../../render/render.types.js');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
var rgroup = require('../../../../domain/entities/rgroup.js');

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
var RGroupFragment = function (_BaseOperation) {
  _inherits__default["default"](RGroupFragment, _BaseOperation);
  function RGroupFragment(rgroupId, fragmentId, rg) {
    var _this;
    _classCallCheck__default["default"](this, RGroupFragment);
    _this = _callSuper(this, RGroupFragment, [OperationType.OperationType.R_GROUP_FRAGMENT]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rgid_new", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rg_new", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rgid_old", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rg_old", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "frid", void 0);
    _this.rgid_new = rgroupId;
    _this.rg_new = rg;
    _this.rgid_old = null;
    _this.rg_old = null;
    _this.frid = fragmentId;
    return _this;
  }
  _createClass__default["default"](RGroupFragment, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      this.rgid_old = this.rgid_old || rgroup.RGroup.findRGroupByFragment(struct.rgroups, this.frid);
      this.rg_old = this.rgid_old ? struct.rgroups.get(this.rgid_old) : null;
      this.removeOld(struct, restruct);
      this.setNew(struct, restruct);
    }
  }, {
    key: "removeOld",
    value: function removeOld(struct, restruct) {
      if (!this.rg_old) {
        return;
      }
      this.rg_old.frags["delete"](this.frid);
      restruct.clearVisel(restruct.rgroups.get(this.rgid_old).visel);
      if (this.rg_old.frags.size === 0) {
        restruct.rgroups["delete"](this.rgid_old);
        struct.rgroups["delete"](this.rgid_old);
        restruct.markItemRemoved();
      } else {
        restruct.markItem('rgroups', this.rgid_old, 1);
      }
    }
  }, {
    key: "setNew",
    value: function setNew(struct, restruct) {
      if (!this.rgid_new) {
        return;
      }
      var rgNew = struct.rgroups.get(this.rgid_new);
      if (!rgNew) {
        rgNew = this.rg_new || new rgroup.RGroup();
        struct.rgroups.set(this.rgid_new, rgNew);
        restruct.rgroups.set(this.rgid_new, new rergroup["default"](rgNew));
      } else {
        restruct.markItem('rgroups', this.rgid_new, 1);
      }
      rgNew.frags.add(this.frid);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RGroupFragment(this.rgid_old, this.frid, this.rg_old);
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var currentRgid = rgroup.RGroup.findRGroupByFragment(restruct.molecule.rgroups, this.frid);
      return currentRgid === this.rgid_new;
    }
  }]);
  return RGroupFragment;
}(BaseOperation.BaseOperation);

exports.RGroupFragment = RGroupFragment;
//# sourceMappingURL=RGroupFragment.js.map
