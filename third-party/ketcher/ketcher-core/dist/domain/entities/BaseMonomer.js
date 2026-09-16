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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var DrawingEntity = require('./DrawingEntity.js');
var vec2 = require('./vec2.js');
var monomers = require('../types/monomers.js');
require('../types/entities.js');
var PolymerBond = require('./PolymerBond.js');
var attachmentPointCalculations = require('../helpers/attachmentPointCalculations.js');
var _ = require('lodash');
var MonomerToAtomBond = require('./MonomerToAtomBond.js');
var HydrogenBond = require('./HydrogenBond.js');
var monomerItem = require('../helpers/monomerItem.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var HYDROGEN_BOND_ATTACHMENT_POINT = 'hydrogen';
var BaseMonomer = function (_DrawingEntity) {
  _inherits__default["default"](BaseMonomer, _DrawingEntity);
  function BaseMonomer(monomerItem, _position, config) {
    var _this$monomerItem$att;
    var _this;
    _classCallCheck__default["default"](this, BaseMonomer);
    _this = _callSuper(this, BaseMonomer, [_position, config]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentPointsToBonds", {});
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "chosenFirstAttachmentPointForBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "potentialSecondAttachmentPointForBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "chosenSecondAttachmentPointForBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "potentialAttachmentPointsToBonds", {});
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentPointsVisible", false);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerItem", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "hydrogenBonds", []);
    _this.monomerItem = _objectSpread({}, monomerItem);
    _this.monomerItem.expanded = monomerItem.expanded;
    _this.recalculateAttachmentPoints();
    _this.monomerItem.attachmentPoints = (_this$monomerItem$att = _this.monomerItem.attachmentPoints) !== null && _this$monomerItem$att !== void 0 ? _this$monomerItem$att : _this.getMonomerDefinitionAttachmentPoints();
    _this.chosenFirstAttachmentPointForBond = null;
    _this.potentialSecondAttachmentPointForBond = null;
    _this.chosenSecondAttachmentPointForBond = null;
    return _this;
  }
  _createClass__default["default"](BaseMonomer, [{
    key: "label",
    get: function get() {
      return this.monomerItem.label;
    }
  }, {
    key: "center",
    get: function get() {
      return this.position;
    }
  }, {
    key: "listOfAttachmentPoints",
    get: function get() {
      var maxAttachmentPointNumber = this.getMaxAttachmentPointNumber();
      var attachmentPointList = [];
      for (var i = 1; i <= maxAttachmentPointNumber; i++) {
        var attachmentPointLabel = attachmentPointCalculations.getAttachmentPointLabel(i);
        if (attachmentPointLabel in this.attachmentPointsToBonds) {
          attachmentPointList.push(attachmentPointLabel);
        }
      }
      return attachmentPointList;
    }
  }, {
    key: "turnOnAttachmentPointsVisibility",
    value: function turnOnAttachmentPointsVisibility() {
      this.attachmentPointsVisible = true;
    }
  }, {
    key: "turnOffAttachmentPointsVisibility",
    value: function turnOffAttachmentPointsVisibility() {
      this.attachmentPointsVisible = false;
    }
  }, {
    key: "setChosenFirstAttachmentPoint",
    value: function setChosenFirstAttachmentPoint(attachmentPoint) {
      this.chosenFirstAttachmentPointForBond = attachmentPoint;
    }
  }, {
    key: "setChosenSecondAttachmentPoint",
    value: function setChosenSecondAttachmentPoint(attachmentPoint) {
      this.chosenSecondAttachmentPointForBond = attachmentPoint;
    }
  }, {
    key: "setPotentialSecondAttachmentPoint",
    value: function setPotentialSecondAttachmentPoint(attachmentPoint) {
      this.potentialSecondAttachmentPointForBond = attachmentPoint;
    }
  }, {
    key: "setPotentialBond",
    value: function setPotentialBond(attachmentPoint, potentialBond) {
      if (potentialBond instanceof HydrogenBond.HydrogenBond) {
        this.hydrogenBonds.push(potentialBond);
        return;
      }
      if (attachmentPoint !== undefined) {
        this.potentialAttachmentPointsToBonds[attachmentPoint] = potentialBond;
      }
    }
  }, {
    key: "getAttachmentPointByBond",
    value: function getAttachmentPointByBond(bond) {
      if (bond instanceof HydrogenBond.HydrogenBond) {
        return this.hydrogenBonds.find(function (hydrogenBond) {
          return hydrogenBond === bond;
        }) ? monomers.AttachmentPointName.HYDROGEN : undefined;
      }
      for (var attachmentPointName in this.attachmentPointsToBonds) {
        if (this.attachmentPointsToBonds[attachmentPointName] === bond) {
          return attachmentPointName;
        }
      }
      return undefined;
    }
  }, {
    key: "getPotentialAttachmentPointByBond",
    value: function getPotentialAttachmentPointByBond(bond) {
      for (var attachmentPointName in this.potentialAttachmentPointsToBonds) {
        if (this.potentialAttachmentPointsToBonds[attachmentPointName] === bond) {
          return attachmentPointName;
        }
      }
      return undefined;
    }
  }, {
    key: "firstFreeAttachmentPoint",
    get: function get() {
      var maxAttachmentPointNumber = this.getMaxAttachmentPointNumber();
      for (var i = 1; i <= maxAttachmentPointNumber; i++) {
        var attachmentPoint = "R".concat(i);
        if (this.hasAttachmentPoint(attachmentPoint) && this.attachmentPointsToBonds[attachmentPoint] === null) {
          return attachmentPoint;
        }
      }
      return undefined;
    }
  }, {
    key: "getMaxAttachmentPointNumber",
    value: function getMaxAttachmentPointNumber() {
      var maxAttachmentPointNumber = 1;
      for (var attachmentPoint in this.attachmentPointsToBonds) {
        var match = /R(\d+)/.exec(attachmentPoint);
        if (match) {
          var pointNumber = parseInt(match[1]);
          if (!isNaN(pointNumber) && pointNumber > maxAttachmentPointNumber) {
            maxAttachmentPointNumber = pointNumber;
          }
        }
      }
      return maxAttachmentPointNumber;
    }
  }, {
    key: "R1AttachmentPoint",
    get: function get() {
      if (this.attachmentPointsToBonds.R1 === null) {
        return monomers.AttachmentPointName.R1;
      }
      return undefined;
    }
  }, {
    key: "R2AttachmentPoint",
    get: function get() {
      if (this.attachmentPointsToBonds.R2 === null) {
        return monomers.AttachmentPointName.R2;
      }
      return undefined;
    }
  }, {
    key: "hasFreeAttachmentPoint",
    get: function get() {
      return Boolean(this.firstFreeAttachmentPoint);
    }
  }, {
    key: "isAttachmentPointExistAndFree",
    value: function isAttachmentPointExistAndFree(attachmentPoint) {
      return this.hasAttachmentPoint(attachmentPoint) && !this.isAttachmentPointUsed(attachmentPoint);
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](BaseMonomer.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "forEachBond",
    value: function forEachBond(callback) {
      for (var attachmentPointName in this.attachmentPointsToBonds) {
        if (this.attachmentPointsToBonds[attachmentPointName]) {
          callback(this.attachmentPointsToBonds[attachmentPointName], attachmentPointName);
        }
      }
      this.hydrogenBonds.forEach(function (hydrogenBond) {
        callback(hydrogenBond, monomers.AttachmentPointName.HYDROGEN);
      });
    }
  }, {
    key: "setBond",
    value: function setBond(attachmentPointName, bond) {
      if (!(bond instanceof HydrogenBond.HydrogenBond)) {
        this.attachmentPointsToBonds[attachmentPointName] = bond;
        return;
      }
      if (!this.hydrogenBonds.includes(bond)) {
        this.hydrogenBonds.push(bond);
      }
    }
  }, {
    key: "unsetBond",
    value: function unsetBond(attachmentPointName, bondToDelete) {
      if (bondToDelete instanceof HydrogenBond.HydrogenBond) {
        this.hydrogenBonds = this.hydrogenBonds.filter(function (bond) {
          return bond !== bondToDelete;
        });
        return;
      }
      if (attachmentPointName) {
        this.attachmentPointsToBonds[attachmentPointName] = null;
      }
    }
  }, {
    key: "covalentBonds",
    get: function get() {
      return _.compact(_.values(this.attachmentPointsToBonds));
    }
  }, {
    key: "polymerBonds",
    get: function get() {
      return this.covalentBonds.filter(function (bond) {
        return bond instanceof PolymerBond.PolymerBond;
      });
    }
  }, {
    key: "monomerToAtomBonds",
    get: function get() {
      return this.bonds.filter(function (bond) {
        return bond instanceof MonomerToAtomBond.MonomerToAtomBond;
      });
    }
  }, {
    key: "bonds",
    get: function get() {
      return [].concat(_toConsumableArray__default["default"](this.covalentBonds), _toConsumableArray__default["default"](this.hydrogenBonds));
    }
  }, {
    key: "bondsSortedByLength",
    get: function get() {
      var bonds = _toConsumableArray__default["default"](this.bonds);
      return bonds.sort(function (firstBond, secondBond) {
        var _firstBond$secondEndE, _secondBond$secondEnd;
        if (!firstBond.secondEndEntity || !secondBond.secondEndEntity) {
          return 0;
        }
        var firstLength = vec2.Vec2.diff(firstBond.firstEndEntity.position, (_firstBond$secondEndE = firstBond.secondEndEntity) === null || _firstBond$secondEndE === void 0 ? void 0 : _firstBond$secondEndE.position).length();
        var secondLength = vec2.Vec2.diff(secondBond.firstEndEntity.position, (_secondBond$secondEnd = secondBond.secondEndEntity) === null || _secondBond$secondEnd === void 0 ? void 0 : _secondBond$secondEnd.position).length();
        return firstLength - secondLength;
      });
    }
  }, {
    key: "polymerBondsSortedByLength",
    get: function get() {
      return this.bondsSortedByLength.filter(function (bond) {
        return !(bond instanceof MonomerToAtomBond.MonomerToAtomBond);
      });
    }
  }, {
    key: "hasBonds",
    get: function get() {
      var hasBonds = false;
      for (var bondName in this.attachmentPointsToBonds) {
        if (this.attachmentPointsToBonds[bondName]) {
          hasBonds = true;
        }
      }
      return hasBonds || this.hydrogenBonds.length > 0;
    }
  }, {
    key: "hasHydrogenBondWithMonomer",
    value: function hasHydrogenBondWithMonomer(monomer) {
      return this.hydrogenBonds.find(function (bond) {
        return bond.firstMonomer === monomer || bond.secondMonomer === monomer;
      });
    }
  }, {
    key: "hasPotentialBonds",
    value: function hasPotentialBonds() {
      return Object.values(this.potentialAttachmentPointsToBonds).some(function (bond) {
        return !!bond;
      });
    }
  }, {
    key: "getPotentialBond",
    value: function getPotentialBond(attachmentPointName) {
      return this.potentialAttachmentPointsToBonds[attachmentPointName];
    }
  }, {
    key: "removeBond",
    value: function removeBond(polymerBond) {
      var attachmentPointName = this.getAttachmentPointByBond(polymerBond);
      if (!attachmentPointName) return;
      this.unsetBond(attachmentPointName);
    }
  }, {
    key: "removePotentialBonds",
    value: function removePotentialBonds() {
      var clearSelectedPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (clearSelectedPoints) {
        this.chosenFirstAttachmentPointForBond = null;
        this.chosenSecondAttachmentPointForBond = null;
        this.potentialSecondAttachmentPointForBond = null;
      }
      for (var attachmentPointName in this.potentialAttachmentPointsToBonds) {
        this.potentialAttachmentPointsToBonds[attachmentPointName] = null;
      }
    }
  }, {
    key: "availableAttachmentPointForBondEnd",
    get: function get() {
      if (this.chosenSecondAttachmentPointForBond) {
        return this.chosenSecondAttachmentPointForBond;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "hasAttachmentPoint",
    value: function hasAttachmentPoint(attachmentPointName) {
      return this.attachmentPointsToBonds[attachmentPointName] !== undefined;
    }
  }, {
    key: "isPhosphate",
    get: function get() {
      return monomerItem.isMonomerItemPhosphate(this.monomerItem);
    }
  }, {
    key: "isSugar",
    get: function get() {
      return monomerItem.isMonomerItemSugar(this.monomerItem);
    }
  }, {
    key: "usedAttachmentPointsNamesList",
    get: function get() {
      var _this2 = this;
      var list = [];
      this.listOfAttachmentPoints.forEach(function (attachmentPointName) {
        if (_this2.isAttachmentPointUsed(attachmentPointName)) {
          list.push(attachmentPointName);
        }
      });
      return list;
    }
  }, {
    key: "unUsedAttachmentPointsNamesList",
    get: function get() {
      var _this3 = this;
      var list = [];
      this.listOfAttachmentPoints.forEach(function (attachmentPointName) {
        if (!_this3.isAttachmentPointUsed(attachmentPointName)) {
          list.push(attachmentPointName);
        }
      });
      return list;
    }
  }, {
    key: "getBondByAttachmentPoint",
    value: function getBondByAttachmentPoint(attachmentPointName) {
      return this.attachmentPointsToBonds[attachmentPointName];
    }
  }, {
    key: "getPotentialBondByAttachmentPoint",
    value: function getPotentialBondByAttachmentPoint(attachmentPointName) {
      return this.potentialAttachmentPointsToBonds[attachmentPointName];
    }
  }, {
    key: "isAttachmentPointUsed",
    value: function isAttachmentPointUsed(attachmentPointName) {
      return Boolean(this.getBondByAttachmentPoint(attachmentPointName));
    }
  }, {
    key: "isAttachmentPointPotentiallyUsed",
    value: function isAttachmentPointPotentiallyUsed(attachmentPointName) {
      return Boolean(this.getPotentialBondByAttachmentPoint(attachmentPointName));
    }
  }, {
    key: "getAttachmentPointDict",
    value: function getAttachmentPointDict() {
      if (this.monomerItem.attachmentPoints) {
        var _BaseMonomer$getAttac = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(this.monomerItem.attachmentPoints),
          attachmentPointDictionary = _BaseMonomer$getAttac.attachmentPointDictionary;
        return attachmentPointDictionary;
      } else {
        return this.getAttachmentPointDictFromAtoms();
      }
    }
  }, {
    key: "attachmentPointNumberToType",
    get: function get() {
      return {
        1: 'left',
        2: 'right',
        moreThanTwo: 'side'
      };
    }
  }, {
    key: "getMonomerDefinitionAttachmentPoints",
    value: function getMonomerDefinitionAttachmentPoints() {
      var _this4 = this;
      var monomerDefinitionAttachmentPoints = [];
      this.superatomAttachmentPoints.forEach(function (superatomAttachmentPoint) {
        var _this4$attachmentPoin;
        if (!_.isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
          return;
        }
        var bondsToLeavingGroupAtom = _this4.monomerItem.struct.bonds.filter(function (_, bond) {
          return bond.begin === superatomAttachmentPoint.leaveAtomId || bond.end === superatomAttachmentPoint.leaveAtomId;
        });
        if (bondsToLeavingGroupAtom.size > 1) {
          return;
        }
        monomerDefinitionAttachmentPoints.push({
          attachmentAtom: superatomAttachmentPoint.atomId,
          leavingGroup: {
            atoms: superatomAttachmentPoint.leaveAtomId === 0 || superatomAttachmentPoint.leaveAtomId ? [superatomAttachmentPoint.leaveAtomId] : []
          },
          type: (_this4$attachmentPoin = _this4.attachmentPointNumberToType[superatomAttachmentPoint.attachmentPointNumber]) !== null && _this4$attachmentPoin !== void 0 ? _this4$attachmentPoin : _this4.attachmentPointNumberToType.moreThanTwo
        });
      });
      return monomerDefinitionAttachmentPoints;
    }
  }, {
    key: "superatomAttachmentPoints",
    get: function get() {
      var _struct$sgroups$filte;
      var struct = this.monomerItem.struct;
      var superatomWithoutLabel = (_struct$sgroups$filte = struct.sgroups.filter(function (_, sgroup) {
        return sgroup.isSuperatomWithoutLabel;
      })) === null || _struct$sgroups$filte === void 0 ? void 0 : _struct$sgroups$filte.get(0);
      if (!superatomWithoutLabel) {
        return [];
      }
      return superatomWithoutLabel.getAttachmentPoints();
    }
  }, {
    key: "getAttachmentPointDictFromAtoms",
    value: function getAttachmentPointDictFromAtoms() {
      var _this5 = this;
      var attachmentPointNameToBond = {};
      this.superatomAttachmentPoints.forEach(function (superatomAttachmentPoint) {
        if (!_.isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
          return;
        }
        var label = attachmentPointCalculations.getAttachmentPointLabel(superatomAttachmentPoint.attachmentPointNumber);
        var leavingGroupAtomId = superatomAttachmentPoint.leaveAtomId;
        var bondsToLeavingGroupAtom = _this5.monomerItem.struct.bonds.filter(function (_, bond) {
          return bond.begin === leavingGroupAtomId || bond.end === leavingGroupAtomId;
        });
        if (bondsToLeavingGroupAtom.size > 1) {
          return;
        }
        attachmentPointNameToBond[label] = null;
      });
      return attachmentPointNameToBond;
    }
  }, {
    key: "startBondAttachmentPoint",
    get: function get() {
      if (this.chosenFirstAttachmentPointForBond) {
        return this.chosenFirstAttachmentPointForBond;
      }
      if (this.attachmentPointsToBonds.R2 === null) {
        return monomers.AttachmentPointName.R2;
      }
      if (this.attachmentPointsToBonds.R1 === null) {
        return monomers.AttachmentPointName.R1;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return this.SubChainConstructor !== monomerToChain.SubChainConstructor;
    }
  }, {
    key: "isModification",
    get: function get() {
      var naturalAnalogThreeLettersCode = this.monomerItem.props.MonomerNaturalAnalogThreeLettersCode;
      var naturalAnalogCode = this.monomerItem.props.MonomerNaturalAnalogCode;
      var namesToCompareNaturalAnalog = [this.label, this.monomerItem.props.MonomerName];
      var naturalAnaloguesToCompare = [].concat(_toConsumableArray__default["default"](naturalAnalogThreeLettersCode ? [naturalAnalogThreeLettersCode] : []), [naturalAnalogCode]);
      return namesToCompareNaturalAnalog.every(function (nameToCompare) {
        if (naturalAnaloguesToCompare.includes(nameToCompare)) {
          return false;
        }
        var nameWithoutAsterisk = nameToCompare.replace(/\*$/, '');
        return !naturalAnaloguesToCompare.includes(nameWithoutAsterisk);
      });
    }
  }, {
    key: "sideConnections",
    get: function get() {
      var sideConnections = [];
      this.forEachBond(function (bond) {
        if (!(bond instanceof MonomerToAtomBond.MonomerToAtomBond) && bond.isSideChainConnection) {
          sideConnections.push(bond);
        }
      });
      return sideConnections;
    }
  }, {
    key: "monomerCaps",
    get: function get() {
      return this.monomerItem.props.MonomerCaps;
    }
  }, {
    key: "recalculateAttachmentPoints",
    value: function recalculateAttachmentPoints() {
      var oldAttachmentPointsToBonds = this.attachmentPointsToBonds;
      this.attachmentPointsToBonds = this.getAttachmentPointDict();
      for (var attachmentPointName in this.attachmentPointsToBonds) {
        if (oldAttachmentPointsToBonds[attachmentPointName]) {
          this.attachmentPointsToBonds[attachmentPointName] = oldAttachmentPointsToBonds[attachmentPointName];
        }
      }
      this.potentialAttachmentPointsToBonds = this.getAttachmentPointDict();
    }
  }], [{
    key: "getAttachmentPointDictFromMonomerDefinition",
    value: function getAttachmentPointDictFromMonomerDefinition(attachmentPoints) {
      var attachmentPointDictionary = {};
      var attachmentPointsList = [];
      attachmentPoints.forEach(function (attachmentPoint, attachmentPointIndex) {
        var _attachmentPoint$labe;
        var attachmentPointNumber = attachmentPointIndex + 1;
        var calculatedAttachmentPointNumber;
        if (attachmentPoint.type) {
          if (attachmentPoint.type === 'left') {
            calculatedAttachmentPointNumber = 1;
          } else if (attachmentPoint.type === 'right') {
            calculatedAttachmentPointNumber = 2;
          } else if (attachmentPoint.type === 'side') {
            calculatedAttachmentPointNumber = attachmentPointNumber + ('R1' in attachmentPointDictionary ? 0 : 1) + ('R2' in attachmentPointDictionary ? 0 : 1);
          } else {
            calculatedAttachmentPointNumber = attachmentPointNumber;
          }
        } else {
          calculatedAttachmentPointNumber = attachmentPointNumber;
        }
        var calculatedLabel = (_attachmentPoint$labe = attachmentPoint.label) !== null && _attachmentPoint$labe !== void 0 ? _attachmentPoint$labe : "R".concat(calculatedAttachmentPointNumber);
        attachmentPointDictionary[calculatedLabel] = null;
        attachmentPointsList.push(calculatedLabel);
      });
      return {
        attachmentPointDictionary: attachmentPointDictionary,
        attachmentPointsList: attachmentPointsList
      };
    }
  }]);
  return BaseMonomer;
}(DrawingEntity.DrawingEntity);

exports.BaseMonomer = BaseMonomer;
exports.HYDROGEN_BOND_ATTACHMENT_POINT = HYDROGEN_BOND_ATTACHMENT_POINT;
//# sourceMappingURL=BaseMonomer.js.map
