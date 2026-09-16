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
var functionalGroup = require('../../../../domain/entities/functionalGroup.js');
var sgroup = require('../../../../domain/entities/sgroup.js');
var vec2 = require('../../../../domain/entities/vec2.js');
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
var resgroup = require('../../../render/restruct/resgroup.js');
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
var monomerMicromolecule = require('../../../../domain/entities/monomerMicromolecule.js');
var sgroupAtom = require('./sgroupAtom.js');
var SGroupAttr = require('./SGroupAttr.js');
var SGroupDataMove = require('./SGroupDataMove.js');
var sgroupHierarchy = require('./sgroupHierarchy.js');
var sgroupAttachmentPoints = require('./sgroupAttachmentPoints.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGROUP_TYPE_MAPPING = {
  nucleotideComponent: sgroup.SGroup.TYPES.SUP
};
var SGroupCreate = function (_BaseOperation) {
  _inherits__default["default"](SGroupCreate, _BaseOperation);
  function SGroupCreate(sgroupId, type, pp, expanded, name, oldSgroup, monomer) {
    var _this;
    _classCallCheck__default["default"](this, SGroupCreate);
    _this = _callSuper(this, SGroupCreate, [OperationType.OperationType.S_GROUP_CREATE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.monomer = monomer;
    _this.data = {
      sgid: sgroupId,
      type: type,
      pp: pp,
      expanded: expanded,
      name: name,
      oldSgroup: oldSgroup
    };
    return _this;
  }
  _createClass__default["default"](SGroupCreate, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var _this$data = this.data,
        sgid = _this$data.sgid,
        type = _this$data.type,
        pp = _this$data.pp,
        expanded = _this$data.expanded,
        name = _this$data.name,
        oldSgroup = _this$data.oldSgroup;
      if (sgid === undefined || type === undefined) {
        return;
      }
      var sgroup$1;
      if (oldSgroup && oldSgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
        sgroup$1 = new monomerMicromolecule.MonomerMicromolecule(sgroup.SGroup.TYPES.SUP, oldSgroup.monomer);
      } else if (this.monomer) {
        sgroup$1 = new monomerMicromolecule.MonomerMicromolecule(sgroup.SGroup.TYPES.SUP, this.monomer);
      } else {
        sgroup$1 = new sgroup.SGroup(SGROUP_TYPE_MAPPING[type] || type);
      }
      sgroup$1.id = sgid;
      struct.sgroups.set(sgid, sgroup$1);
      if (pp) {
        sgroup$1.pp = new vec2.Vec2(pp);
      }
      if (expanded !== undefined) {
        sgroup$1.data.expanded = expanded;
        if (sgroup$1 instanceof monomerMicromolecule.MonomerMicromolecule) {
          if (Object.isFrozen(sgroup$1.monomer.monomerItem)) {
            sgroup$1.monomer.monomerItem = _objectSpread({}, sgroup$1.monomer.monomerItem);
          }
          sgroup$1.monomer.monomerItem.expanded = expanded;
        }
      }
      if (name) {
        sgroup$1.data.name = name;
      }
      var existingSGroup = struct.sgroups.get(sgid);
      if (existingSGroup) {
        restruct.sgroups.set(sgid, new resgroup["default"](existingSGroup));
        if (functionalGroup.FunctionalGroup.isFunctionalGroup(sgroup$1) || sgroup.SGroup.isSuperAtom(sgroup$1)) {
          restruct.molecule.functionalGroups.add(new functionalGroup.FunctionalGroup(sgroup$1));
        }
      }
      this.data.sgid = sgid;
    }
  }]);
  return SGroupCreate;
}(BaseOperation.BaseOperation);
var SGroupDelete = function (_BaseOperation2) {
  _inherits__default["default"](SGroupDelete, _BaseOperation2);
  function SGroupDelete(sgroupId) {
    var _this2;
    _classCallCheck__default["default"](this, SGroupDelete);
    _this2 = _callSuper(this, SGroupDelete, [OperationType.OperationType.S_GROUP_DELETE, OperationType.OperationPriority.S_GROUP_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      sgid: sgroupId
    };
    return _this2;
  }
  _createClass__default["default"](SGroupDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var _sgroup$item, _sgroup$item2, _sgroup$item3, _sgroup$item4;
      var struct = restruct.molecule;
      var sgid = this.data.sgid;
      if (sgid === undefined) {
        return;
      }
      var sgroup$1 = restruct.sgroups.get(sgid);
      var sgroupData = restruct.sgroupData.get(sgid);
      if (!sgroup$1) return;
      this.data.type = sgroup$1 === null || sgroup$1 === void 0 || (_sgroup$item = sgroup$1.item) === null || _sgroup$item === void 0 ? void 0 : _sgroup$item.type;
      this.data.pp = sgroup$1 === null || sgroup$1 === void 0 || (_sgroup$item2 = sgroup$1.item) === null || _sgroup$item2 === void 0 ? void 0 : _sgroup$item2.pp;
      this.data.oldSgroup = sgroup$1.item;
      if ((sgroup$1 === null || sgroup$1 === void 0 || (_sgroup$item3 = sgroup$1.item) === null || _sgroup$item3 === void 0 ? void 0 : _sgroup$item3.type) === 'DAT' && sgroupData) {
        restruct.clearVisel(sgroupData.visel);
        restruct.sgroupData["delete"](sgid);
      }
      restruct.clearVisel(sgroup$1.visel);
      if ((sgroup$1 === null || sgroup$1 === void 0 || (_sgroup$item4 = sgroup$1.item) === null || _sgroup$item4 === void 0 || (_sgroup$item4 = _sgroup$item4.atoms) === null || _sgroup$item4 === void 0 ? void 0 : _sgroup$item4.length) !== 0) {
        throw new Error('S-Group not empty!');
      }
      if (functionalGroup.FunctionalGroup.isFunctionalGroup(sgroup$1.item) || sgroup.SGroup.isSuperAtom(sgroup$1.item)) {
        var relatedFGroupId;
        this.data.name = sgroup$1.item.data.name;
        this.data.expanded = sgroup$1.item.isExpanded();
        restruct.molecule.functionalGroups.forEach(function (fg, fgid) {
          if (fg.relatedSGroupId === sgid) {
            relatedFGroupId = fgid;
          }
        });
        restruct.molecule.functionalGroups["delete"](relatedFGroupId);
      }
      restruct.sgroups["delete"](sgid);
      struct.sgroups["delete"](sgid);
    }
  }]);
  return SGroupDelete;
}(BaseOperation.BaseOperation);
SGroupCreate.InverseConstructor = SGroupDelete;
SGroupDelete.InverseConstructor = SGroupCreate;

exports.SGroupAtomAdd = sgroupAtom.SGroupAtomAdd;
exports.SGroupAtomRemove = sgroupAtom.SGroupAtomRemove;
exports.SGroupAttr = SGroupAttr.SGroupAttr;
exports.SGroupDataMove = SGroupDataMove.SGroupDataMove;
exports.SGroupAddToHierarchy = sgroupHierarchy.SGroupAddToHierarchy;
exports.SGroupRemoveFromHierarchy = sgroupHierarchy.SGroupRemoveFromHierarchy;
exports.SGroupAttachmentPointAdd = sgroupAttachmentPoints.SGroupAttachmentPointAdd;
exports.SGroupAttachmentPointRemove = sgroupAttachmentPoints.SGroupAttachmentPointRemove;
exports.SGroupCreate = SGroupCreate;
exports.SGroupDelete = SGroupDelete;
//# sourceMappingURL=index.js.map
