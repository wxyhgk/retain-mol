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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { DrawingEntity } from './DrawingEntity.modern.js';
import { Vec2 } from './vec2.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { PolymerBond } from './PolymerBond.modern.js';
import { getAttachmentPointLabel } from '../helpers/attachmentPointCalculations.modern.js';
import { compact, values, isNumber } from 'lodash';
import { MonomerToAtomBond } from './MonomerToAtomBond.modern.js';
import { HydrogenBond } from './HydrogenBond.modern.js';
import { isMonomerItemPhosphate, isMonomerItemSugar } from '../helpers/monomerItem.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var HYDROGEN_BOND_ATTACHMENT_POINT = 'hydrogen';
var BaseMonomer = function (_DrawingEntity) {
  _inherits(BaseMonomer, _DrawingEntity);
  function BaseMonomer(monomerItem, _position, config) {
    var _this$monomerItem$att;
    var _this;
    _classCallCheck(this, BaseMonomer);
    _this = _callSuper(this, BaseMonomer, [_position, config]);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _defineProperty(_assertThisInitialized(_this), "attachmentPointsToBonds", {});
    _defineProperty(_assertThisInitialized(_this), "chosenFirstAttachmentPointForBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "potentialSecondAttachmentPointForBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "chosenSecondAttachmentPointForBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "potentialAttachmentPointsToBonds", {});
    _defineProperty(_assertThisInitialized(_this), "attachmentPointsVisible", false);
    _defineProperty(_assertThisInitialized(_this), "monomerItem", void 0);
    _defineProperty(_assertThisInitialized(_this), "hydrogenBonds", []);
    _this.monomerItem = _objectSpread({}, monomerItem);
    _this.monomerItem.expanded = monomerItem.expanded;
    _this.recalculateAttachmentPoints();
    _this.monomerItem.attachmentPoints = (_this$monomerItem$att = _this.monomerItem.attachmentPoints) !== null && _this$monomerItem$att !== void 0 ? _this$monomerItem$att : _this.getMonomerDefinitionAttachmentPoints();
    _this.chosenFirstAttachmentPointForBond = null;
    _this.potentialSecondAttachmentPointForBond = null;
    _this.chosenSecondAttachmentPointForBond = null;
    return _this;
  }
  _createClass(BaseMonomer, [{
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
        var attachmentPointLabel = getAttachmentPointLabel(i);
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
      if (potentialBond instanceof HydrogenBond) {
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
      if (bond instanceof HydrogenBond) {
        return this.hydrogenBonds.find(function (hydrogenBond) {
          return hydrogenBond === bond;
        }) ? AttachmentPointName.HYDROGEN : undefined;
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
        return AttachmentPointName.R1;
      }
      return undefined;
    }
  }, {
    key: "R2AttachmentPoint",
    get: function get() {
      if (this.attachmentPointsToBonds.R2 === null) {
        return AttachmentPointName.R2;
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
      _get(_getPrototypeOf(BaseMonomer.prototype), "setBaseRenderer", this).call(this, renderer);
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
        callback(hydrogenBond, AttachmentPointName.HYDROGEN);
      });
    }
  }, {
    key: "setBond",
    value: function setBond(attachmentPointName, bond) {
      if (!(bond instanceof HydrogenBond)) {
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
      if (bondToDelete instanceof HydrogenBond) {
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
      return compact(values(this.attachmentPointsToBonds));
    }
  }, {
    key: "polymerBonds",
    get: function get() {
      return this.covalentBonds.filter(function (bond) {
        return bond instanceof PolymerBond;
      });
    }
  }, {
    key: "monomerToAtomBonds",
    get: function get() {
      return this.bonds.filter(function (bond) {
        return bond instanceof MonomerToAtomBond;
      });
    }
  }, {
    key: "bonds",
    get: function get() {
      return [].concat(_toConsumableArray(this.covalentBonds), _toConsumableArray(this.hydrogenBonds));
    }
  }, {
    key: "bondsSortedByLength",
    get: function get() {
      var bonds = _toConsumableArray(this.bonds);
      return bonds.sort(function (firstBond, secondBond) {
        var _firstBond$secondEndE, _secondBond$secondEnd;
        if (!firstBond.secondEndEntity || !secondBond.secondEndEntity) {
          return 0;
        }
        var firstLength = Vec2.diff(firstBond.firstEndEntity.position, (_firstBond$secondEndE = firstBond.secondEndEntity) === null || _firstBond$secondEndE === void 0 ? void 0 : _firstBond$secondEndE.position).length();
        var secondLength = Vec2.diff(secondBond.firstEndEntity.position, (_secondBond$secondEnd = secondBond.secondEndEntity) === null || _secondBond$secondEnd === void 0 ? void 0 : _secondBond$secondEnd.position).length();
        return firstLength - secondLength;
      });
    }
  }, {
    key: "polymerBondsSortedByLength",
    get: function get() {
      return this.bondsSortedByLength.filter(function (bond) {
        return !(bond instanceof MonomerToAtomBond);
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
      return isMonomerItemPhosphate(this.monomerItem);
    }
  }, {
    key: "isSugar",
    get: function get() {
      return isMonomerItemSugar(this.monomerItem);
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
        if (!isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
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
        if (!isNumber(superatomAttachmentPoint.attachmentPointNumber)) {
          return;
        }
        var label = getAttachmentPointLabel(superatomAttachmentPoint.attachmentPointNumber);
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
        return AttachmentPointName.R2;
      }
      if (this.attachmentPointsToBonds.R1 === null) {
        return AttachmentPointName.R1;
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
      var naturalAnaloguesToCompare = [].concat(_toConsumableArray(naturalAnalogThreeLettersCode ? [naturalAnalogThreeLettersCode] : []), [naturalAnalogCode]);
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
        if (!(bond instanceof MonomerToAtomBond) && bond.isSideChainConnection) {
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
}(DrawingEntity);

export { BaseMonomer, HYDROGEN_BOND_ATTACHMENT_POINT };
//# sourceMappingURL=BaseMonomer.modern.js.map
