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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { DrawingEntity } from './DrawingEntity.modern.js';
import { BondType } from './CoreBond.modern.js';
import { Elements } from '../constants/elements.modern.js';
import { AtomLabel } from '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import '../constants/monomers.modern.js';
import { isNumber } from 'lodash';
import { MonomerToAtomBond } from './MonomerToAtomBond.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var AtomRadical;
(function (AtomRadical) {
  AtomRadical[AtomRadical["None"] = 0] = "None";
  AtomRadical[AtomRadical["Single"] = 1] = "Single";
  AtomRadical[AtomRadical["Doublet"] = 2] = "Doublet";
  AtomRadical[AtomRadical["Triplet"] = 3] = "Triplet";
})(AtomRadical || (AtomRadical = {}));
var Atom = function (_DrawingEntity) {
  _inherits(Atom, _DrawingEntity);
  function Atom(position, monomer, atomIdInMicroMode, label) {
    var _this;
    var properties = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    _classCallCheck(this, Atom);
    _this = _callSuper(this, Atom, [position]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "atomIdInMicroMode", void 0);
    _defineProperty(_assertThisInitialized(_this), "label", void 0);
    _defineProperty(_assertThisInitialized(_this), "properties", void 0);
    _defineProperty(_assertThisInitialized(_this), "bonds", []);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _this.monomer = monomer;
    _this.atomIdInMicroMode = atomIdInMicroMode;
    _this.label = label;
    _this.properties = properties;
    return _this;
  }
  _createClass(Atom, [{
    key: "center",
    get: function get() {
      return this.position;
    }
  }, {
    key: "addBond",
    value: function addBond(bond) {
      if (!this.bonds.includes(bond)) {
        this.bonds.push(bond);
      }
    }
  }, {
    key: "deleteBond",
    value: function deleteBond(bondId) {
      this.bonds = this.bonds.filter(function (bond) {
        return bond.id !== bondId;
      });
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      this.renderer = renderer;
      _get(_getPrototypeOf(Atom.prototype), "setBaseRenderer", this).call(this, renderer);
    }
  }, {
    key: "isCarbon",
    get: function get() {
      return this.label === AtomLabel.C;
    }
  }, {
    key: "calculateConnections",
    value: function calculateConnections() {
      var connectionsAmount = 0;
      var _iterator = _createForOfIteratorHelper(this.bonds),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var bond = _step.value;
          if (bond instanceof MonomerToAtomBond) {
            connectionsAmount += 1;
          } else {
            switch (bond.type) {
              case BondType.Single:
                connectionsAmount += 1;
                break;
              case BondType.Double:
                connectionsAmount += 2;
                break;
              case BondType.Triple:
                connectionsAmount += 3;
                break;
              case BondType.Dative:
              case BondType.Hydrogen:
                break;
              case BondType.Aromatic:
                if (this.bonds.length === 1) {
                  return -1;
                }
                return this.bonds.length;
              default:
                return -1;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return connectionsAmount;
    }
  }, {
    key: "hasAlias",
    get: function get() {
      return Boolean(this.properties.alias);
    }
  }, {
    key: "hasRadical",
    get: function get() {
      return isNumber(this.properties.radical) && this.properties.radical !== 0;
    }
  }, {
    key: "hasCharge",
    get: function get() {
      return isNumber(this.properties.charge) && this.properties.charge !== 0;
    }
  }, {
    key: "hasExplicitValence",
    get: function get() {
      return isNumber(this.properties.explicitValence) && this.properties.explicitValence !== -1;
    }
  }, {
    key: "hasExplicitIsotope",
    get: function get() {
      return isNumber(this.properties.isotope) && this.properties.isotope >= 0;
    }
  }, {
    key: "hasBadValence",
    get: function get() {
      var _this$calculateValenc = this.calculateValence(),
        hydrogenAmount = _this$calculateValenc.hydrogenAmount;
      return hydrogenAmount < 0;
    }
  }, {
    key: "hasStereoLabel",
    get: function get() {
      return Boolean(this.properties.stereoLabel);
    }
  }, {
    key: "radicalAmount",
    get: function get() {
      switch (this.properties.radical) {
        case AtomRadical.Single:
        case AtomRadical.Triplet:
          return 2;
        case AtomRadical.Doublet:
          return 1;
        default:
          return 0;
      }
    }
  }, {
    key: "valenceWithoutHydrogen",
    get: function get() {
      var _this$properties$char;
      var charge = (_this$properties$char = this.properties.charge) !== null && _this$properties$char !== void 0 ? _this$properties$char : 0;
      var label = this.label;
      var element = Elements.get(this.label);
      var elementGroupNumber = element === null || element === void 0 ? void 0 : element.group;
      var radicalAmount = this.radicalAmount;
      var connectionAmount = this.calculateConnections();
      var absoluteCharge = Math.abs(charge);
      if (elementGroupNumber === 3) {
        if (label === AtomLabel.B || label === AtomLabel.Al || label === AtomLabel.Ga || label === AtomLabel.In) {
          if (charge === -1) {
            if (radicalAmount + connectionAmount <= 4) {
              return radicalAmount + connectionAmount;
            }
          }
        }
      } else if (elementGroupNumber === 5) {
        if (label === AtomLabel.N || label === AtomLabel.P || label === AtomLabel.Sb || label === AtomLabel.Bi || label === AtomLabel.As) {
          if (charge === 1 || charge === 2) {
            return radicalAmount + connectionAmount;
          }
        }
      } else if (elementGroupNumber === 6) {
        if (label === AtomLabel.O) {
          if (charge >= 1) {
            return radicalAmount + connectionAmount;
          }
        } else if (label === AtomLabel.S || label === AtomLabel.Se || label === AtomLabel.Po) {
          if (charge === 1) {
            return radicalAmount + connectionAmount;
          }
        }
      } else if (elementGroupNumber === 7) {
        if (label === AtomLabel.Cl || label === AtomLabel.Br || label === AtomLabel.I || label === AtomLabel.At) {
          if (charge === 1) {
            return radicalAmount + connectionAmount;
          }
        }
      }
      return radicalAmount + connectionAmount + absoluteCharge;
    }
  }, {
    key: "calculateValence",
    value: function calculateValence() {
      var _this$properties$char2;
      if (this.hasExplicitValence) {
        var _valence = this.properties.explicitValence;
        var _hydrogenAmount = _valence - this.valenceWithoutHydrogen;
        return {
          valence: _valence,
          hydrogenAmount: _hydrogenAmount
        };
      }
      var label = this.label;
      var element = Elements.get(label);
      var elementGroupNumber = element === null || element === void 0 ? void 0 : element.group;
      var connectionAmount = this.calculateConnections();
      var radicalAmount = this.radicalAmount;
      var charge = (_this$properties$char2 = this.properties.charge) !== null && _this$properties$char2 !== void 0 ? _this$properties$char2 : 0;
      var absCharge = Math.abs(charge);
      var valence = connectionAmount;
      var hydrogenAmount = 0;
      if (connectionAmount === -1) {
        return {
          valence: valence,
          hydrogenAmount: hydrogenAmount
        };
      }
      if (elementGroupNumber === undefined) {
        if (label === AtomLabel.D || label === AtomLabel.T) {
          valence = 1;
          hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (elementGroupNumber === 1) {
        if (label === AtomLabel.H || label === AtomLabel.Li || label === AtomLabel.Na || label === AtomLabel.K || label === AtomLabel.Rb || label === AtomLabel.Cs || label === AtomLabel.Fr) {
          valence = 1;
          hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
        }
      } else if (elementGroupNumber === 2) {
        if (connectionAmount + radicalAmount + absCharge === 2 || connectionAmount + radicalAmount + absCharge === 0) {
          valence = 2;
        } else hydrogenAmount = -1;
      } else if (elementGroupNumber === 3) {
        if (label === AtomLabel.B || label === AtomLabel.Al || label === AtomLabel.Ga || label === AtomLabel.In) {
          if (charge === -1) {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount;
          } else {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
          }
        } else if (label === AtomLabel.Tl) {
          if (charge === -1) {
            if (radicalAmount + connectionAmount <= 2) {
              valence = 2;
              hydrogenAmount = 2 - radicalAmount - connectionAmount;
            } else {
              valence = 4;
              hydrogenAmount = 4 - radicalAmount - connectionAmount;
            }
          } else if (charge === -2) {
            if (radicalAmount + connectionAmount <= 3) {
              valence = 3;
              hydrogenAmount = 3 - radicalAmount - connectionAmount;
            } else {
              valence = 5;
              hydrogenAmount = 5 - radicalAmount - connectionAmount;
            }
          } else if (radicalAmount + connectionAmount + absCharge <= 1) {
            valence = 1;
            hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
          } else {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
          }
        }
      } else if (elementGroupNumber === 4) {
        if (label === AtomLabel.C || label === AtomLabel.Si || label === AtomLabel.Ge) {
          valence = 4;
          hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
        } else if (label === AtomLabel.Sn || label === AtomLabel.Pb) {
          if (connectionAmount + radicalAmount + absCharge <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          } else {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
          }
        }
      } else if (elementGroupNumber === 5) {
        if (label === AtomLabel.N || label === AtomLabel.P) {
          if (charge === 1) {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount;
          } else if (charge === 2) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount;
          } else if (radicalAmount + connectionAmount + absCharge <= 3) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
          } else {
            valence = 5;
            hydrogenAmount = 5 - radicalAmount - connectionAmount - absCharge;
          }
        } else if (label === AtomLabel.Bi || label === AtomLabel.Sb || label === AtomLabel.As) {
          if (charge === 1) {
            if (radicalAmount + connectionAmount <= 2 && label !== AtomLabel.As) {
              valence = 2;
              hydrogenAmount = 2 - radicalAmount - connectionAmount;
            } else {
              valence = 4;
              hydrogenAmount = 4 - radicalAmount - connectionAmount;
            }
          } else if (charge === 2) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount;
          } else if (radicalAmount + connectionAmount <= 3) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount - absCharge;
          } else {
            valence = 5;
            hydrogenAmount = 5 - radicalAmount - connectionAmount - absCharge;
          }
        }
      } else if (elementGroupNumber === 6) {
        if (label === AtomLabel.O) {
          if (charge >= 1) {
            valence = 3;
            hydrogenAmount = 3 - radicalAmount - connectionAmount;
          } else {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          }
        } else if (label === AtomLabel.S || label === AtomLabel.Se || label === AtomLabel.Po) {
          if (charge === 1) {
            if (connectionAmount <= 3) {
              valence = 3;
              hydrogenAmount = 3 - radicalAmount - connectionAmount;
            } else {
              valence = 5;
              hydrogenAmount = 5 - radicalAmount - connectionAmount;
            }
          } else if (connectionAmount + radicalAmount + absCharge <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          } else if (connectionAmount + radicalAmount + absCharge <= 4) {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
          } else {
            valence = 6;
            hydrogenAmount = 6 - radicalAmount - connectionAmount - absCharge;
          }
        } else if (label === AtomLabel.Te) {
          if (charge === -1) {
            if (connectionAmount <= 2) {
              valence = 2;
              hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
            }
          } else if (charge === 0 || charge === 2) {
            if (connectionAmount <= 2) {
              valence = 2;
              hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
            } else if (connectionAmount <= 4) {
              valence = 4;
              hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
            } else if (charge === 0 && connectionAmount <= 6) {
              valence = 6;
              hydrogenAmount = 6 - radicalAmount - connectionAmount - absCharge;
            } else {
              hydrogenAmount = -1;
            }
          }
        }
      } else if (elementGroupNumber === 7) {
        if (label === AtomLabel.F) {
          valence = 1;
          hydrogenAmount = 1 - radicalAmount - connectionAmount - absCharge;
        } else if (label === AtomLabel.Cl || label === AtomLabel.Br || label === AtomLabel.I || label === AtomLabel.At) {
          if (charge === 1) {
            if (connectionAmount <= 2) {
              valence = 2;
              hydrogenAmount = 2 - radicalAmount - connectionAmount;
            } else if (connectionAmount === 3 || connectionAmount === 5 || connectionAmount >= 7) {
              hydrogenAmount = -1;
            }
          } else if (charge === 0) {
            if (connectionAmount <= 1) {
              valence = 1;
              hydrogenAmount = 1 - radicalAmount - connectionAmount;
            } else if (connectionAmount === 2 || connectionAmount === 4 || connectionAmount === 6) {
              if (radicalAmount === 1) {
                valence = connectionAmount;
              } else {
                hydrogenAmount = -1;
              }
            } else if (connectionAmount > 7) {
              hydrogenAmount = -1;
            }
          }
        }
      } else if (elementGroupNumber === 8) {
        if (label === AtomLabel.Pt) {
          if (connectionAmount + radicalAmount + absCharge <= 2) {
            valence = 2;
            hydrogenAmount = 2 - radicalAmount - connectionAmount - absCharge;
          } else if (connectionAmount + radicalAmount + absCharge <= 4) {
            valence = 4;
            hydrogenAmount = 4 - radicalAmount - connectionAmount - absCharge;
          } else {
            hydrogenAmount = -1;
          }
        } else if (connectionAmount + radicalAmount + absCharge === 0) {
          valence = 1;
        } else {
          hydrogenAmount = -1;
        }
      }
      return {
        valence: valence,
        hydrogenAmount: hydrogenAmount
      };
    }
  }]);
  return Atom;
}(DrawingEntity);

export { Atom, AtomRadical };
//# sourceMappingURL=CoreAtom.modern.js.map
