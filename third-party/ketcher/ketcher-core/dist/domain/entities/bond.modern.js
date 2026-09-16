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
import { Atom } from './atom.modern.js';
import { Pile } from './pile.modern.js';
import { Vec2 } from './vec2.modern.js';
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';

var _Bond;
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Bond = function (_BaseMicromoleculeEnt) {
  _inherits(Bond, _BaseMicromoleculeEnt);
  function Bond(attributes) {
    var _attributes$xxx, _attributes$cip;
    var _this;
    _classCallCheck(this, Bond);
    _this = _callSuper(this, Bond, [attributes.initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "begin", void 0);
    _defineProperty(_assertThisInitialized(_this), "end", void 0);
    _defineProperty(_assertThisInitialized(_this), "type", void 0);
    _defineProperty(_assertThisInitialized(_this), "xxx", void 0);
    _defineProperty(_assertThisInitialized(_this), "stereo", void 0);
    _defineProperty(_assertThisInitialized(_this), "topology", void 0);
    _defineProperty(_assertThisInitialized(_this), "reactingCenterStatus", void 0);
    _defineProperty(_assertThisInitialized(_this), "customQuery", void 0);
    _defineProperty(_assertThisInitialized(_this), "len", void 0);
    _defineProperty(_assertThisInitialized(_this), "sb", void 0);
    _defineProperty(_assertThisInitialized(_this), "sa", void 0);
    _defineProperty(_assertThisInitialized(_this), "cip", void 0);
    _defineProperty(_assertThisInitialized(_this), "hb1", void 0);
    _defineProperty(_assertThisInitialized(_this), "hb2", void 0);
    _defineProperty(_assertThisInitialized(_this), "angle", void 0);
    _defineProperty(_assertThisInitialized(_this), "center", void 0);
    _defineProperty(_assertThisInitialized(_this), "isPreview", void 0);
    _defineProperty(_assertThisInitialized(_this), "beginSuperatomAttachmentPointNumber", void 0);
    _defineProperty(_assertThisInitialized(_this), "endSuperatomAttachmentPointNumber", void 0);
    _defineProperty(_assertThisInitialized(_this), "beginSgroup", void 0);
    _defineProperty(_assertThisInitialized(_this), "endSgroup", void 0);
    _this.begin = attributes.begin;
    _this.end = attributes.end;
    _this.type = attributes.type;
    _this.xxx = (_attributes$xxx = attributes.xxx) !== null && _attributes$xxx !== void 0 ? _attributes$xxx : '';
    _this.stereo = Bond.PATTERN.STEREO.NONE;
    _this.topology = Bond.PATTERN.TOPOLOGY.EITHER;
    _this.customQuery = null;
    _this.reactingCenterStatus = 0;
    _this.cip = (_attributes$cip = attributes.cip) !== null && _attributes$cip !== void 0 ? _attributes$cip : null;
    _this.len = 0;
    _this.sb = 0;
    _this.sa = 0;
    _this.angle = 0;
    _this.isPreview = false;
    _this.beginSuperatomAttachmentPointNumber = attributes.beginSuperatomAttachmentPointNumber;
    _this.endSuperatomAttachmentPointNumber = attributes.endSuperatomAttachmentPointNumber;
    if (attributes.stereo) _this.stereo = attributes.stereo;
    if (attributes.topology) _this.topology = attributes.topology;
    if (attributes.customQuery) {
      _this.customQuery = attributes.customQuery;
      _this.type = Bond.PATTERN.TYPE.ANY;
      _this.reactingCenterStatus = null;
      _this.topology = null;
    }
    if (attributes.reactingCenterStatus) {
      _this.reactingCenterStatus = attributes.reactingCenterStatus;
    }
    _this.center = new Vec2();
    return _this;
  }
  _createClass(Bond, [{
    key: "isQuery",
    value: function isQuery() {
      var TYPES = Bond.PATTERN.TYPE;
      var QUERY_BOND_TYPES = [TYPES.ANY, TYPES.SINGLE_OR_DOUBLE, TYPES.SINGLE_OR_AROMATIC, TYPES.DOUBLE_OR_AROMATIC, TYPES.AROMATIC];
      return this.customQuery !== null || QUERY_BOND_TYPES.includes(this.type) || TYPES.SINGLE === this.type && this.stereo === Bond.PATTERN.STEREO.EITHER;
    }
  }, {
    key: "hasRxnProps",
    value: function hasRxnProps() {
      return !!this.reactingCenterStatus;
    }
  }, {
    key: "getCenter",
    value: function getCenter(struct) {
      var p1 = struct.atoms.get(this.begin).pp;
      var p2 = struct.atoms.get(this.end).pp;
      return Vec2.lc2(p1, 0.5, p2, 0.5);
    }
  }, {
    key: "getDir",
    value: function getDir(struct) {
      var _struct$atoms$get, _struct$atoms$get2;
      var p1 = (_struct$atoms$get = struct.atoms.get(this.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.pp;
      var p2 = (_struct$atoms$get2 = struct.atoms.get(this.end)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.pp;
      if (!p1 || !p2) return new Vec2();
      return p2.sub(p1).normalized();
    }
  }, {
    key: "clone",
    value: function clone(aidMap) {
      var cp = new Bond(this);
      if (aidMap) {
        var newBegin = aidMap.get(cp.begin);
        var newEnd = aidMap.get(cp.end);
        if (newBegin !== undefined) cp.begin = newBegin;
        if (newEnd !== undefined) cp.end = newEnd;
      }
      return cp;
    }
  }, {
    key: "getAttachedSGroups",
    value: function getAttachedSGroups(struct) {
      var _struct$atoms$get$sgs, _struct$atoms$get3, _struct$atoms$get$sgs2, _struct$atoms$get4;
      var sGroupsWithBeginAtom = (_struct$atoms$get$sgs = (_struct$atoms$get3 = struct.atoms.get(this.begin)) === null || _struct$atoms$get3 === void 0 ? void 0 : _struct$atoms$get3.sgs) !== null && _struct$atoms$get$sgs !== void 0 ? _struct$atoms$get$sgs : new Pile();
      var sGroupsWithEndAtom = (_struct$atoms$get$sgs2 = (_struct$atoms$get4 = struct.atoms.get(this.end)) === null || _struct$atoms$get4 === void 0 ? void 0 : _struct$atoms$get4.sgs) !== null && _struct$atoms$get$sgs2 !== void 0 ? _struct$atoms$get$sgs2 : new Pile();
      return sGroupsWithBeginAtom === null || sGroupsWithBeginAtom === void 0 ? void 0 : sGroupsWithBeginAtom.intersection(sGroupsWithEndAtom);
    }
  }, {
    key: "isExternalBondBetweenMonomers",
    value: function isExternalBondBetweenMonomers(struct) {
      if (!struct.isBondFromMacromolecule(this)) {
        return false;
      }
      var sGroup1 = struct.getGroupFromAtomId(this.begin);
      var sGroup2 = struct.getGroupFromAtomId(this.end);
      if (!sGroup1 || !sGroup2) {
        return false;
      }
      return sGroup1 !== sGroup2;
    }
  }], [{
    key: "getAttrHash",
    value: function getAttrHash(bond) {
      var attrs = {};
      for (var attr in Bond.attrlist) {
        if (bond[attr] || attr === 'stereo') {
          attrs[attr] = bond[attr];
        }
      }
      return attrs;
    }
  }, {
    key: "getBondNeighbourIds",
    value: function getBondNeighbourIds(struct, bondId) {
      var bond = struct.bonds.get(bondId);
      if (!bond) return {
        beginBondIds: [],
        endBondIds: []
      };
      var begin = bond.begin,
        end = bond.end;
      var beginBondIds = Atom.getConnectedBondIds(struct, begin).filter(function (id) {
        return id !== bondId;
      });
      var endBondIds = Atom.getConnectedBondIds(struct, end).filter(function (id) {
        return id !== bondId;
      });
      return {
        beginBondIds: beginBondIds,
        endBondIds: endBondIds
      };
    }
  }, {
    key: "getFusingConditions",
    value: function getFusingConditions(bond, bondBegin, bondEnd) {
      var _this$PATTERN$TYPE = this.PATTERN.TYPE,
        DOUBLE = _this$PATTERN$TYPE.DOUBLE,
        SINGLE = _this$PATTERN$TYPE.SINGLE;
      var isFusingToDoubleBond = bondBegin.type === SINGLE && bond.type === DOUBLE && bondEnd.type === SINGLE;
      var isFusingToSingleBond = bondBegin.type === DOUBLE && bond.type === SINGLE && bondEnd.type === DOUBLE;
      var isFusingDoubleSingleSingle = bondBegin.type === DOUBLE && bond.type === SINGLE && bondEnd.type === SINGLE;
      var isFusingSingleSingleDouble = bondBegin.type === SINGLE && bond.type === SINGLE && bondEnd.type === DOUBLE;
      var isAllSingle = bondBegin.type === SINGLE && bond.type === SINGLE && bondEnd.type === SINGLE;
      return {
        isFusingToSingleBond: isFusingToSingleBond,
        isFusingToDoubleBond: isFusingToDoubleBond,
        isFusingDoubleSingleSingle: isFusingDoubleSingleSingle,
        isFusingSingleSingleDouble: isFusingSingleSingleDouble,
        isAllSingle: isAllSingle
      };
    }
  }, {
    key: "getBenzeneConnectingBondType",
    value: function getBenzeneConnectingBondType(bond, bondBegin, bondEnd) {
      var _this$PATTERN$TYPE2 = this.PATTERN.TYPE,
        DOUBLE = _this$PATTERN$TYPE2.DOUBLE,
        SINGLE = _this$PATTERN$TYPE2.SINGLE;
      var _Bond$getFusingCondit = Bond.getFusingConditions(bond, bondBegin, bondEnd),
        isFusingToSingleBond = _Bond$getFusingCondit.isFusingToSingleBond,
        isFusingToDoubleBond = _Bond$getFusingCondit.isFusingToDoubleBond;
      if (isFusingToDoubleBond) {
        return DOUBLE;
      } else if (isFusingToSingleBond) {
        return SINGLE;
      }
      return null;
    }
  }, {
    key: "getCyclopentadieneFusingBondType",
    value: function getCyclopentadieneFusingBondType(bond, bondBegin, bondEnd) {
      var _this$PATTERN$TYPE3 = this.PATTERN.TYPE,
        DOUBLE = _this$PATTERN$TYPE3.DOUBLE,
        SINGLE = _this$PATTERN$TYPE3.SINGLE;
      var _Bond$getFusingCondit2 = Bond.getFusingConditions(bond, bondBegin, bondEnd),
        isFusingToSingleBond = _Bond$getFusingCondit2.isFusingToSingleBond,
        isFusingToDoubleBond = _Bond$getFusingCondit2.isFusingToDoubleBond,
        isFusingDoubleSingleSingle = _Bond$getFusingCondit2.isFusingDoubleSingleSingle,
        isAllSingle = _Bond$getFusingCondit2.isAllSingle;
      if (isFusingToDoubleBond) {
        return DOUBLE;
      } else if (isFusingToSingleBond || isAllSingle || isFusingDoubleSingleSingle) {
        return SINGLE;
      }
      return null;
    }
  }, {
    key: "getCyclopentadieneDoubleBondIndexes",
    value: function getCyclopentadieneDoubleBondIndexes(bond, bondBegin, bondEnd) {
      var _Bond$getFusingCondit3 = Bond.getFusingConditions(bond, bondBegin, bondEnd),
        isFusingToSingleBond = _Bond$getFusingCondit3.isFusingToSingleBond,
        isFusingToDoubleBond = _Bond$getFusingCondit3.isFusingToDoubleBond,
        isFusingDoubleSingleSingle = _Bond$getFusingCondit3.isFusingDoubleSingleSingle;
      if (isFusingToSingleBond || isFusingToDoubleBond) {
        return [3];
      }
      if (isFusingDoubleSingleSingle) {
        return [2, 4];
      }
      return [1, 3];
    }
  }, {
    key: "attrGetDefault",
    value: function attrGetDefault(attr) {
      if (attr in Bond.attrlist) {
        return Bond.attrlist[attr];
      }
    }
  }, {
    key: "isBondToHiddenLeavingGroup",
    value: function isBondToHiddenLeavingGroup(struct, bond) {
      var includeAtomsInCollapsedSgroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var beginSuperatomAttachmentPoint = Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, bond.begin);
      var endSuperatomAttachmentPoint = Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, bond.end);
      return beginSuperatomAttachmentPoint && Atom.isHiddenLeavingGroupAtom(struct, bond.begin, false, includeAtomsInCollapsedSgroups) && bond.end === beginSuperatomAttachmentPoint.atomId || endSuperatomAttachmentPoint && Atom.isHiddenLeavingGroupAtom(struct, bond.end, false, includeAtomsInCollapsedSgroups) && bond.begin === endSuperatomAttachmentPoint.atomId;
    }
  }, {
    key: "isBondToExpandedMonomer",
    value: function isBondToExpandedMonomer(struct, bond) {
      return _toConsumableArray(struct.sgroups.values()).some(function (sgroup) {
        return (sgroup.atoms.includes(bond.begin) && !sgroup.atoms.includes(bond.end) || sgroup.atoms.includes(bond.end) && !sgroup.atoms.includes(bond.begin)) && sgroup.isExpanded() && sgroup.isMonomer;
      });
    }
  }]);
  return Bond;
}(BaseMicromoleculeEntity);
_Bond = Bond;
_defineProperty(Bond, "PATTERN", {
  TYPE: {
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    AROMATIC: 4,
    SINGLE_OR_DOUBLE: 5,
    SINGLE_OR_AROMATIC: 6,
    DOUBLE_OR_AROMATIC: 7,
    ANY: 8,
    DATIVE: 9,
    HYDROGEN: 10
  },
  STEREO: {
    NONE: 0,
    UP: 1,
    EITHER: 4,
    DOWN: 6,
    CIS_TRANS: 3
  },
  TOPOLOGY: {
    EITHER: 0,
    RING: 1,
    CHAIN: 2
  },
  REACTING_CENTER: {
    NOT_CENTER: -1,
    UNMARKED: 0,
    CENTER: 1,
    UNCHANGED: 2,
    MADE_OR_BROKEN: 4,
    ORDER_CHANGED: 8,
    MADE_OR_BROKEN_AND_CHANGED: 12
  }
});
_defineProperty(Bond, "attrlist", {
  type: _Bond.PATTERN.TYPE.SINGLE,
  stereo: _Bond.PATTERN.STEREO.NONE,
  topology: _Bond.PATTERN.TOPOLOGY.EITHER,
  reactingCenterStatus: _Bond.PATTERN.REACTING_CENTER.UNMARKED,
  cip: null,
  customQuery: null
});

export { Bond };
//# sourceMappingURL=bond.modern.js.map
