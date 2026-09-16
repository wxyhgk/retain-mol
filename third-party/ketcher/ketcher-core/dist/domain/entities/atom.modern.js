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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { AtomList } from './atomList.modern.js';
import { Vec2 } from './vec2.modern.js';
import { Elements } from '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import '../constants/monomers.modern.js';
import { Pile } from './pile.modern.js';
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';
import { isNumber } from 'lodash';
import { SGroup } from './sgroup.modern.js';
import { FunctionalGroup } from './functionalGroup.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AttachmentPoints;
(function (AttachmentPoints) {
  AttachmentPoints[AttachmentPoints["None"] = 0] = "None";
  AttachmentPoints[AttachmentPoints["FirstSideOnly"] = 1] = "FirstSideOnly";
  AttachmentPoints[AttachmentPoints["SecondSideOnly"] = 2] = "SecondSideOnly";
  AttachmentPoints[AttachmentPoints["BothSides"] = 3] = "BothSides";
})(AttachmentPoints || (AttachmentPoints = {}));
var StereoLabel;
(function (StereoLabel) {
  StereoLabel["Abs"] = "abs";
  StereoLabel["And"] = "&";
  StereoLabel["Or"] = "or";
})(StereoLabel || (StereoLabel = {}));
var Atom = function (_BaseMicromoleculeEnt) {
  _inherits(Atom, _BaseMicromoleculeEnt);
  function Atom(attributes) {
    var _ref, _attributes$implicitH;
    var _this;
    _classCallCheck(this, Atom);
    _this = _callSuper(this, Atom, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "label", void 0);
    _defineProperty(_assertThisInitialized(_this), "fragment", void 0);
    _defineProperty(_assertThisInitialized(_this), "atomList", void 0);
    _defineProperty(_assertThisInitialized(_this), "attachmentPoints", void 0);
    _defineProperty(_assertThisInitialized(_this), "isotope", void 0);
    _defineProperty(_assertThisInitialized(_this), "isPreview", void 0);
    _defineProperty(_assertThisInitialized(_this), "hCount", void 0);
    _defineProperty(_assertThisInitialized(_this), "radical", void 0);
    _defineProperty(_assertThisInitialized(_this), "cip", void 0);
    _defineProperty(_assertThisInitialized(_this), "charge", void 0);
    _defineProperty(_assertThisInitialized(_this), "explicitValence", void 0);
    _defineProperty(_assertThisInitialized(_this), "ringBondCount", void 0);
    _defineProperty(_assertThisInitialized(_this), "queryProperties", void 0);
    _defineProperty(_assertThisInitialized(_this), "unsaturatedAtom", void 0);
    _defineProperty(_assertThisInitialized(_this), "substitutionCount", void 0);
    _defineProperty(_assertThisInitialized(_this), "valence", void 0);
    _defineProperty(_assertThisInitialized(_this), "implicitH", void 0);
    _defineProperty(_assertThisInitialized(_this), "implicitHCount", void 0);
    _defineProperty(_assertThisInitialized(_this), "pp", void 0);
    _defineProperty(_assertThisInitialized(_this), "neighbors", void 0);
    _defineProperty(_assertThisInitialized(_this), "sgs", void 0);
    _defineProperty(_assertThisInitialized(_this), "badConn", void 0);
    _defineProperty(_assertThisInitialized(_this), "alias", void 0);
    _defineProperty(_assertThisInitialized(_this), "rglabel", void 0);
    _defineProperty(_assertThisInitialized(_this), "aam", void 0);
    _defineProperty(_assertThisInitialized(_this), "invRet", void 0);
    _defineProperty(_assertThisInitialized(_this), "exactChangeFlag", void 0);
    _defineProperty(_assertThisInitialized(_this), "rxnFragmentType", void 0);
    _defineProperty(_assertThisInitialized(_this), "stereoLabel", void 0);
    _defineProperty(_assertThisInitialized(_this), "stereoParity", void 0);
    _defineProperty(_assertThisInitialized(_this), "hasImplicitH", void 0);
    _defineProperty(_assertThisInitialized(_this), "pseudo", void 0);
    _this.label = attributes.label;
    _this.fragment = getValueOrDefault(attributes.fragment, -1);
    _this.alias = getValueOrDefault(attributes.alias, Atom.attrlist.alias);
    _this.isotope = getValueOrDefault(attributes.isotope, Atom.attrlist.isotope);
    _this.radical = getValueOrDefault(attributes.radical, Atom.attrlist.radical);
    _this.cip = getValueOrDefault(attributes.cip, Atom.attrlist.cip);
    _this.charge = getValueOrDefault(attributes.charge, Atom.attrlist.charge);
    _this.rglabel = getValueOrDefault(attributes.rglabel, Atom.attrlist.rglabel);
    _this.attachmentPoints = getValueOrDefault(attributes.attachmentPoints, Atom.attrlist.attachmentPoints);
    _this.implicitHCount = getValueOrDefault(attributes.implicitHCount, null);
    _this.explicitValence = getValueOrDefault(attributes.explicitValence, Atom.attrlist.explicitValence);
    _this.isPreview = getValueOrDefault(attributes.isPreview, Atom.attrlist.isPreview);
    _this.valence = 0;
    _this.implicitH = (_ref = (_attributes$implicitH = attributes.implicitHCount) !== null && _attributes$implicitH !== void 0 ? _attributes$implicitH : attributes.implicitH) !== null && _ref !== void 0 ? _ref : 0;
    _this.pp = attributes.pp ? new Vec2(attributes.pp) : new Vec2();
    _this.sgs = new Pile();
    _this.ringBondCount = getValueOrDefault(attributes.ringBondCount, Atom.attrlist.ringBondCount);
    _this.substitutionCount = getValueOrDefault(attributes.substitutionCount, Atom.attrlist.substitutionCount);
    _this.unsaturatedAtom = getValueOrDefault(attributes.unsaturatedAtom, Atom.attrlist.unsaturatedAtom);
    _this.hCount = getValueOrDefault(attributes.hCount, Atom.attrlist.hCount);
    _this.queryProperties = {};
    for (var property in Atom.attrlist.queryProperties) {
      var _attributes$queryProp;
      _this.queryProperties[property] = getValueOrDefault((_attributes$queryProp = attributes.queryProperties) === null || _attributes$queryProp === void 0 ? void 0 : _attributes$queryProp[property], Atom.attrlist.queryProperties[property]);
    }
    _this.aam = getValueOrDefault(attributes.aam, Atom.attrlist.aam);
    _this.invRet = getValueOrDefault(attributes.invRet, Atom.attrlist.invRet);
    _this.exactChangeFlag = getValueOrDefault(attributes.exactChangeFlag, Atom.attrlist.exactChangeFlag);
    _this.rxnFragmentType = getValueOrDefault(attributes.rxnFragmentType, -1);
    _this.stereoLabel = getValueOrDefault(attributes.stereoLabel, Atom.attrlist.stereoLabel);
    _this.stereoParity = getValueOrDefault(attributes.stereoParity, Atom.attrlist.stereoParity);
    _this.atomList = attributes.atomList ? new AtomList(attributes.atomList) : null;
    _this.neighbors = [];
    _this.badConn = false;
    Object.defineProperty(_assertThisInitialized(_this), 'pseudo', {
      enumerable: true,
      get: function get() {
        return getPseudo(this.label);
      },
      set: function set(value) {
        if (isCorrectPseudo(value)) {
          this.label = value;
        }
      }
    });
    return _this;
  }
  _createClass(Atom, [{
    key: "attpnt",
    get:
    function get() {
      return this.attachmentPoints;
    }
  }, {
    key: "isRGroupAttachmentPointEditDisabled",
    get: function get() {
      return this.label === 'R#' && this.rglabel !== null;
    }
  }, {
    key: "setRGAttachmentPointForDisplayPurpose",
    value: function setRGAttachmentPointForDisplayPurpose() {
      this.attachmentPoints = AttachmentPoints.FirstSideOnly;
    }
  }, {
    key: "clone",
    value: function clone(fidMap) {
      var ret = new Atom(this);
      var fragmentId = fidMap === null || fidMap === void 0 ? void 0 : fidMap.get(this.fragment);
      if (fragmentId !== undefined) {
        ret.fragment = fragmentId;
      }
      return ret;
    }
  }, {
    key: "isQuery",
    value: function isQuery() {
      var queryProperties = this.queryProperties;
      var isAnyAtom = this.label === 'A';
      var isAnyMetal = this.label === 'M' || this.label === 'MH';
      var isAnyHalogen = this.label === 'X' || this.label === 'XH';
      var isAnyGroup = this.label === 'G' || this.label === 'G*' || this.label === 'GH' || this.label === 'GH*';
      return Boolean(this.substitutionCount !== 0 || this.unsaturatedAtom !== 0 || this.ringBondCount !== 0 || isAnyAtom || isAnyMetal || isAnyHalogen || isAnyGroup || this.hCount !== 0 || this.atomList !== null || Object.values(queryProperties).some(function (value) {
        return Boolean(value) || value === 0;
      }));
    }
  }, {
    key: "pureHydrogen",
    value: function pureHydrogen() {
      return this.label === 'H' && this.isotope === 0;
    }
  }, {
    key: "isPlainCarbon",
    value: function isPlainCarbon() {
      return this.label === 'C' && this.isotope === null && this.radical === 0 && this.charge === null && this.explicitValence < 0 && this.ringBondCount === 0 && this.substitutionCount === 0 && this.unsaturatedAtom === 0 && this.hCount === 0 && !this.atomList;
    }
  }, {
    key: "isPseudo",
    value: function isPseudo() {
      return !this.atomList && !this.rglabel && !Elements.get(this.label);
    }
  }, {
    key: "hasRxnProps",
    value: function hasRxnProps() {
      return !!(this.invRet || this.exactChangeFlag || this.attachmentPoints !== null || this.aam);
    }
  }, {
    key: "calcValence",
    value: function calcValence(connectionCount) {
      var _this$charge;
      var label = this.label;
      var charge = (_this$charge = this.charge) !== null && _this$charge !== void 0 ? _this$charge : 0;
      if (this.isQuery() || this.attachmentPoints) {
        this.implicitH = 0;
        return true;
      }
      var element = Elements.get(label);
      var radicalCount = radicalElectrons(this.radical);
      var absCharge = Math.abs(charge);
      var valenceResult = this.calculateValenceResult(element === null || element === void 0 ? void 0 : element.group, {
        label: label,
        charge: charge,
        connectionCount: connectionCount,
        radicalCount: radicalCount,
        absCharge: absCharge
      });
      if (!valenceResult) {
        return true;
      }
      var hydrogenCount = this.overrideHydrogenCountIfNeeded(valenceResult.hydrogenCount);
      return this.applyValenceResult(valenceResult.valence, hydrogenCount, connectionCount);
    }
  }, {
    key: "calculateValenceResult",
    value: function calculateValenceResult(groupno, context) {
      if (groupno === undefined) {
        return this.calculateUndefinedGroupValence(context);
      }
      switch (groupno) {
        case 1:
          return this.calculateGroup1Valence(context);
        case 2:
          return this.calculateGroup2Valence(context);
        case 3:
          return this.calculateGroup3Valence(context);
        case 4:
          return this.calculateGroup4Valence(context);
        case 5:
          return this.calculateGroup5Valence(context);
        case 6:
          return this.calculateGroup6Valence(context);
        case 7:
          return this.calculateGroup7Valence(context);
        case 8:
          return this.calculateGroup8Valence(context);
        default:
          return {
            valence: context.connectionCount,
            hydrogenCount: 0
          };
      }
    }
  }, {
    key: "calculateUndefinedGroupValence",
    value: function calculateUndefinedGroupValence(_ref2) {
      var label = _ref2.label,
        connectionCount = _ref2.connectionCount,
        radicalCount = _ref2.radicalCount,
        absCharge = _ref2.absCharge;
      if (label === 'D' || label === 'T') {
        return {
          valence: 1,
          hydrogenCount: 1 - radicalCount - connectionCount - absCharge
        };
      }
      this.implicitH = 0;
      return null;
    }
  }, {
    key: "calculateGroup1Valence",
    value: function calculateGroup1Valence(_ref3) {
      var label = _ref3.label,
        connectionCount = _ref3.connectionCount,
        radicalCount = _ref3.radicalCount,
        absCharge = _ref3.absCharge;
      if (label === 'H' || label === 'Li' || label === 'Na' || label === 'K' || label === 'Rb' || label === 'Cs' || label === 'Fr') {
        return {
          valence: 1,
          hydrogenCount: 1 - radicalCount - connectionCount - absCharge
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup2Valence",
    value: function calculateGroup2Valence(_ref4) {
      var connectionCount = _ref4.connectionCount,
        radicalCount = _ref4.radicalCount,
        absCharge = _ref4.absCharge;
      if (connectionCount + radicalCount + absCharge === 2 || connectionCount + radicalCount + absCharge === 0) {
        return {
          valence: 2,
          hydrogenCount: 0
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: -1
      };
    }
  }, {
    key: "calculateGroup3Valence",
    value: function calculateGroup3Valence(_ref5) {
      var label = _ref5.label,
        charge = _ref5.charge,
        connectionCount = _ref5.connectionCount,
        radicalCount = _ref5.radicalCount,
        absCharge = _ref5.absCharge;
      if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
        if (charge === -1) {
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount
          };
        }
        return {
          valence: 3,
          hydrogenCount: 3 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'Tl') {
        if (charge === -1) {
          if (radicalCount + connectionCount <= 2) {
            return {
              valence: 2,
              hydrogenCount: 2 - radicalCount - connectionCount
            };
          }
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount
          };
        }
        if (charge === -2) {
          if (radicalCount + connectionCount <= 3) {
            return {
              valence: 3,
              hydrogenCount: 3 - radicalCount - connectionCount
            };
          }
          return {
            valence: 5,
            hydrogenCount: 5 - radicalCount - connectionCount
          };
        }
        if (radicalCount + connectionCount + absCharge <= 1) {
          return {
            valence: 1,
            hydrogenCount: 1 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: 3,
          hydrogenCount: 3 - radicalCount - connectionCount - absCharge
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup4Valence",
    value: function calculateGroup4Valence(_ref6) {
      var label = _ref6.label,
        connectionCount = _ref6.connectionCount,
        radicalCount = _ref6.radicalCount,
        absCharge = _ref6.absCharge;
      if (label === 'C' || label === 'Si' || label === 'Ge') {
        return {
          valence: 4,
          hydrogenCount: 4 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'Sn' || label === 'Pb') {
        if (connectionCount + radicalCount + absCharge <= 2) {
          return {
            valence: 2,
            hydrogenCount: 2 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: 4,
          hydrogenCount: 4 - radicalCount - connectionCount - absCharge
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup5Valence",
    value: function calculateGroup5Valence(_ref7) {
      var label = _ref7.label,
        charge = _ref7.charge,
        connectionCount = _ref7.connectionCount,
        radicalCount = _ref7.radicalCount,
        absCharge = _ref7.absCharge;
      if (label === 'N' || label === 'P') {
        if (charge === 1) {
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount
          };
        }
        if (charge === 2) {
          return {
            valence: 3,
            hydrogenCount: 3 - radicalCount - connectionCount
          };
        }
        if (radicalCount + connectionCount + absCharge <= 3) {
          return {
            valence: 3,
            hydrogenCount: 3 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: 5,
          hydrogenCount: 5 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'Bi' || label === 'Sb' || label === 'As') {
        if (charge === 1) {
          if (radicalCount + connectionCount <= 2 && label !== 'As') {
            return {
              valence: 2,
              hydrogenCount: 2 - radicalCount - connectionCount
            };
          }
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount
          };
        }
        if (charge === 2) {
          return {
            valence: 3,
            hydrogenCount: 3 - radicalCount - connectionCount
          };
        }
        if (radicalCount + connectionCount <= 3) {
          return {
            valence: 3,
            hydrogenCount: 3 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: 5,
          hydrogenCount: 5 - radicalCount - connectionCount - absCharge
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup6Valence",
    value: function calculateGroup6Valence(_ref8) {
      var label = _ref8.label,
        charge = _ref8.charge,
        connectionCount = _ref8.connectionCount,
        radicalCount = _ref8.radicalCount,
        absCharge = _ref8.absCharge;
      if (label === 'O') {
        if (charge >= 1) {
          return {
            valence: 3,
            hydrogenCount: 3 - radicalCount - connectionCount
          };
        }
        return {
          valence: 2,
          hydrogenCount: 2 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'S' || label === 'Se' || label === 'Po') {
        if (charge === 1) {
          if (connectionCount <= 3) {
            return {
              valence: 3,
              hydrogenCount: 3 - radicalCount - connectionCount
            };
          }
          return {
            valence: 5,
            hydrogenCount: 5 - radicalCount - connectionCount
          };
        }
        if (connectionCount + radicalCount + absCharge <= 2) {
          return {
            valence: 2,
            hydrogenCount: 2 - radicalCount - connectionCount - absCharge
          };
        }
        if (connectionCount + radicalCount + absCharge <= 4) {
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: 6,
          hydrogenCount: 6 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'Te') {
        var valence = connectionCount;
        var hydrogenCount = 0;
        if ((charge === -1 || charge === 0 || charge === 2) && connectionCount <= 2) {
          valence = 2;
          hydrogenCount = 2 - radicalCount - connectionCount - absCharge;
        } else if (charge === 0 || charge === 2) {
          if (connectionCount <= 4) {
            valence = 4;
            hydrogenCount = 4 - radicalCount - connectionCount - absCharge;
          } else if (charge === 0 && connectionCount <= 6) {
            valence = 6;
            hydrogenCount = 6 - radicalCount - connectionCount - absCharge;
          } else {
            hydrogenCount = -1;
          }
        }
        return {
          valence: valence,
          hydrogenCount: hydrogenCount
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup7Valence",
    value: function calculateGroup7Valence(_ref9) {
      var label = _ref9.label,
        charge = _ref9.charge,
        connectionCount = _ref9.connectionCount,
        radicalCount = _ref9.radicalCount,
        absCharge = _ref9.absCharge;
      if (label === 'F') {
        return {
          valence: 1,
          hydrogenCount: 1 - radicalCount - connectionCount - absCharge
        };
      }
      if (label === 'Cl' || label === 'Br' || label === 'I' || label === 'At') {
        if (charge === 1) {
          if (connectionCount <= 2) {
            return {
              valence: 2,
              hydrogenCount: 2 - radicalCount - connectionCount
            };
          }
          if (connectionCount === 3 || connectionCount === 5 || connectionCount >= 7) {
            return {
              valence: connectionCount,
              hydrogenCount: -1
            };
          }
        } else if (charge === 0) {
          if (connectionCount <= 1) {
            return {
              valence: 1,
              hydrogenCount: 1 - radicalCount - connectionCount
            };
          }
          if (connectionCount === 2 || connectionCount === 4 || connectionCount === 6) {
            if (radicalCount === 1) {
              return {
                valence: connectionCount,
                hydrogenCount: 0
              };
            }
            return {
              valence: connectionCount,
              hydrogenCount: -1
            };
          }
          if (connectionCount > 7) {
            return {
              valence: connectionCount,
              hydrogenCount: -1
            };
          }
        }
      }
      return {
        valence: connectionCount,
        hydrogenCount: 0
      };
    }
  }, {
    key: "calculateGroup8Valence",
    value: function calculateGroup8Valence(_ref0) {
      var label = _ref0.label,
        connectionCount = _ref0.connectionCount,
        radicalCount = _ref0.radicalCount,
        absCharge = _ref0.absCharge;
      if (label === 'Pt') {
        if (connectionCount + radicalCount + absCharge <= 2) {
          return {
            valence: 2,
            hydrogenCount: 2 - radicalCount - connectionCount - absCharge
          };
        }
        if (connectionCount + radicalCount + absCharge <= 4) {
          return {
            valence: 4,
            hydrogenCount: 4 - radicalCount - connectionCount - absCharge
          };
        }
        return {
          valence: connectionCount,
          hydrogenCount: -1
        };
      }
      if (connectionCount + radicalCount + absCharge === 0) {
        return {
          valence: 1,
          hydrogenCount: 0
        };
      }
      return {
        valence: connectionCount,
        hydrogenCount: -1
      };
    }
  }, {
    key: "overrideHydrogenCountIfNeeded",
    value: function overrideHydrogenCountIfNeeded(hydrogenCount) {
      if (this.implicitHCount !== null) {
        return this.implicitHCount;
      }
      return hydrogenCount;
    }
  }, {
    key: "applyValenceResult",
    value: function applyValenceResult(valence, hydrogenCount, connectionCount) {
      this.valence = valence;
      this.implicitH = hydrogenCount;
      if (this.implicitH < 0) {
        this.valence = connectionCount;
        this.implicitH = 0;
        this.badConn = true;
        return false;
      }
      return true;
    }
  }, {
    key: "calcValenceMinusHyd",
    value: function calcValenceMinusHyd(conn) {
      var _this$charge2;
      var charge = (_this$charge2 = this.charge) !== null && _this$charge2 !== void 0 ? _this$charge2 : 0;
      var label = this.label;
      var element = Elements.get(this.label);
      if (!element) {
        this.implicitH = 0;
        return 0;
      }
      var groupno = element.group;
      var rad = radicalElectrons(this.radical);
      if (groupno === 3) {
        if (label === 'B' || label === 'Al' || label === 'Ga' || label === 'In') {
          if (charge === -1) {
            if (rad + conn <= 4) return rad + conn;
          }
        }
      } else if (groupno === 5) {
        if ((label === 'N' || label === 'P' || label === 'Sb' || label === 'Bi' || label === 'As') && (charge === 1 || charge === 2)) {
          return rad + conn;
        }
      } else if (groupno === 6) {
        if (label === 'O') {
          if (charge >= 1) return rad + conn;
        } else if (label === 'S' || label === 'Se' || label === 'Po') {
          if (charge === 1) return rad + conn;
        }
      } else if (groupno === 7) {
        if (label === 'Cl' || label === 'Br' || label === 'I' || label === 'At') {
          if (charge === 1) return rad + conn;
        }
      }
      return rad + conn + Math.abs(charge);
    }
  }], [{
    key: "getConnectedBondIds",
    value: function getConnectedBondIds(struct, atomId) {
      var result = [];
      var _iterator = _createForOfIteratorHelper(struct.bonds.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            bondId = _step$value[0],
            bond = _step$value[1];
          if (bond.begin === atomId || bond.end === atomId) {
            result.push(bondId);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return result;
    }
  }, {
    key: "getAttrHash",
    value: function getAttrHash(atom) {
      var attrs = {};
      for (var attr in Atom.attrlist) {
        if (typeof atom[attr] !== 'undefined') attrs[attr] = atom[attr];
      }
      return attrs;
    }
  }, {
    key: "attrGetDefault",
    value: function attrGetDefault(attr) {
      if (attr in Atom.attrlist) {
        return Atom.attrlist[attr];
      }
    }
  }, {
    key: "isHeteroAtom",
    value: function isHeteroAtom(label) {
      return label !== 'C' && label !== 'H';
    }
  }, {
    key: "isInAromatizedRing",
    value: function isInAromatizedRing(struct, atomId) {
      var atom = struct.atoms.get(atomId);
      if (atom && Atom.isHeteroAtom(atom.label)) {
        var _iterator2 = _createForOfIteratorHelper(struct.loops),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _slicedToArray(_step2.value, 2),
              _ = _step2$value[0],
              loop = _step2$value[1];
            var halfBondIds = loop.hbs;
            if (loop.aromatic) {
              var _iterator3 = _createForOfIteratorHelper(halfBondIds),
                _step3;
              try {
                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  var halfBondId = _step3.value;
                  var halfBond = struct.halfBonds.get(halfBondId);
                  if (!halfBond) return false;
                  var begin = halfBond.begin,
                    end = halfBond.end;
                  if (begin === atomId || end === atomId) {
                    return true;
                  }
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
      return false;
    }
  }, {
    key: "getSuperAtomAttachmentPointByAttachmentAtom",
    value: function getSuperAtomAttachmentPointByAttachmentAtom(struct, atomId) {
      var searchBySgroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var sgroup = searchBySgroups ? struct.getGroupFromAtomIdBySgroups(atomId) : struct.getGroupFromAtomId(atomId);
      return sgroup === null || sgroup === void 0 ? void 0 : sgroup.getAttachmentPoints().find(function (attachmentPoint) {
        return attachmentPoint.atomId === atomId;
      });
    }
  }, {
    key: "getSuperAtomAttachmentPointByLeavingGroup",
    value: function getSuperAtomAttachmentPointByLeavingGroup(structOrSgroup, atomId) {
      var _sgroup;
      var searchBySgroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var sgroup;
      if (Atom.isSGroup(structOrSgroup)) {
        sgroup = structOrSgroup;
      } else if (searchBySgroups) {
        sgroup = structOrSgroup.getGroupFromAtomIdBySgroups(atomId);
      } else {
        sgroup = structOrSgroup.getGroupFromAtomId(atomId);
      }
      return (_sgroup = sgroup) === null || _sgroup === void 0 ? void 0 : _sgroup.getAttachmentPoints().find(function (attachmentPoint) {
        return attachmentPoint.leaveAtomId === atomId;
      });
    }
  }, {
    key: "isSuperatomLeavingGroupAtom",
    value: function isSuperatomLeavingGroupAtom(structOrSgroup, atomId) {
      var searchBySgroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (atomId === undefined) {
        return false;
      }
      return Boolean(Atom.getSuperAtomAttachmentPointByLeavingGroup(structOrSgroup, atomId, searchBySgroups));
    }
  }, {
    key: "isSuperatomAttachmentAtom",
    value: function isSuperatomAttachmentAtom(struct, atomId) {
      if (atomId === undefined) {
        return false;
      }
      return Boolean(Atom.getSuperAtomAttachmentPointByAttachmentAtom(struct, atomId));
    }
  }, {
    key: "getAttachmentAtomExternalConnections",
    value: function getAttachmentAtomExternalConnections(struct, attachmentAtomId, leavingGroupAtomid) {
      var searchBySgroups = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var bonds = struct.bonds;
      var atomId = isNumber(attachmentAtomId) ? attachmentAtomId : leavingGroupAtomid;
      var atom = struct.atoms.get(atomId);
      var attachmentPoint = isNumber(attachmentAtomId) ? Atom.getSuperAtomAttachmentPointByAttachmentAtom(struct, atomId, searchBySgroups) : Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, atomId, searchBySgroups);
      var attachmentPointAtomBonds = attachmentPoint ? bonds.filter(function (_, bond) {
        return bond.begin === attachmentPoint.atomId && bond.end !== attachmentPoint.leaveAtomId || bond.end === attachmentPoint.atomId && bond.begin !== attachmentPoint.leaveAtomId;
      }) : undefined;
      var attachmentAtomExternalConnection = attachmentPointAtomBonds === null || attachmentPointAtomBonds === void 0 ? void 0 : attachmentPointAtomBonds.filter(function (_, bond) {
        var beginAtom = struct.atoms.get(bond.begin);
        var endAtom = struct.atoms.get(bond.end);
        var isExternalBondBetweenMonomers = bond.isExternalBondBetweenMonomers(struct);
        return isExternalBondBetweenMonomers || (beginAtom === null || beginAtom === void 0 ? void 0 : beginAtom.fragment) !== (atom === null || atom === void 0 ? void 0 : atom.fragment) || (endAtom === null || endAtom === void 0 ? void 0 : endAtom.fragment) !== (atom === null || atom === void 0 ? void 0 : atom.fragment);
      });
      return attachmentAtomExternalConnection;
    }
  }, {
    key: "isHiddenLeavingGroupAtom",
    value: function isHiddenLeavingGroupAtom(struct, atomId) {
      var searchBySgroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var includeAtomsInCollapsedSgroups = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var atom = struct.atoms.get(atomId);
      if (atom && !includeAtomsInCollapsedSgroups && FunctionalGroup.isAtomInContractedFunctionalGroup(atom, struct.sgroups, struct.functionalGroups)) {
        return false;
      }
      var attachmentAtomExternalConnections = Atom.getAttachmentAtomExternalConnections(struct, undefined, atomId, searchBySgroups);
      var attachmentPoint = Atom.getSuperAtomAttachmentPointByLeavingGroup(struct, atomId);
      var sGroup = searchBySgroups ? struct.getGroupFromAtomIdBySgroups(atomId) : struct.getGroupFromAtomId(atomId);
      var isMonomer = sGroup === null || sGroup === void 0 ? void 0 : sGroup.isMonomer;
      if (!sGroup || !isMonomer && !(sGroup !== null && sGroup !== void 0 && sGroup.isSuperatomWithoutLabel)) {
        return false;
      }
      return Boolean(Atom.isSuperatomLeavingGroupAtom(struct, atomId, searchBySgroups) && (attachmentAtomExternalConnections === null || attachmentAtomExternalConnections === void 0 ? void 0 : attachmentAtomExternalConnections.find(function (_, bond) {
        return bond.begin === (attachmentPoint === null || attachmentPoint === void 0 ? void 0 : attachmentPoint.atomId) ? bond.beginSuperatomAttachmentPointNumber === (attachmentPoint === null || attachmentPoint === void 0 ? void 0 : attachmentPoint.attachmentPointNumber) : bond.endSuperatomAttachmentPointNumber === (attachmentPoint === null || attachmentPoint === void 0 ? void 0 : attachmentPoint.attachmentPointNumber);
      })) !== null);
    }
  }, {
    key: "isSGroup",
    value: function isSGroup(structOrSgroup) {
      return structOrSgroup instanceof SGroup;
    }
  }]);
  return Atom;
}(BaseMicromoleculeEntity);
_defineProperty(Atom, "PATTERN", {
  RADICAL: {
    NONE: 0,
    SINGLET: 1,
    DOUPLET: 2,
    TRIPLET: 3
  },
  STEREO_PARITY: {
    NONE: 0,
    ODD: 1,
    EVEN: 2,
    EITHER: 3
  }
});
_defineProperty(Atom, "attrlist", {
  alias: null,
  label: 'C',
  isotope: null,
  radical: 0,
  cip: null,
  charge: null,
  explicitValence: -1,
  ringBondCount: 0,
  substitutionCount: 0,
  unsaturatedAtom: 0,
  hCount: 0,
  queryProperties: {
    aromaticity: null,
    ringMembership: null,
    ringSize: null,
    connectivity: null,
    chirality: null,
    customQuery: null
  },
  atomList: null,
  invRet: 0,
  exactChangeFlag: 0,
  rglabel: null,
  attachmentPoints: null,
  aam: 0,
  isPreview: false,
  stereoLabel: null,
  stereoParity: 0,
  implicitHCount: null
});
function radicalElectrons(radical) {
  var normalizedRadical = Number(radical);
  if (normalizedRadical === Atom.PATTERN.RADICAL.DOUPLET) return 1;else if (normalizedRadical === Atom.PATTERN.RADICAL.SINGLET || normalizedRadical === Atom.PATTERN.RADICAL.TRIPLET) {
    return 2;
  } else {
    return 0;
  }
}
function getValueOrDefault(value, defaultValue) {
  return typeof value !== 'undefined' ? value : defaultValue;
}
function isCorrectPseudo(label) {
  return !Elements.get(label) && label !== 'L' && label !== 'L#' && label !== 'R#';
}
function getPseudo(label) {
  return isCorrectPseudo(label) ? label : '';
}

export { Atom, AttachmentPoints, StereoLabel, radicalElectrons };
//# sourceMappingURL=atom.modern.js.map
