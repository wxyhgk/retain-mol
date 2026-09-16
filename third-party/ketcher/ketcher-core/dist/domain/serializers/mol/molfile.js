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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _typeof = require('@babel/runtime/helpers/typeof');
var fragment = require('../../entities/fragment.js');
var sgroup = require('../../entities/sgroup.js');
var monomerMicromolecule = require('../../entities/monomerMicromolecule.js');
var elements = require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');
var common = require('./common.js');
var utils = require('./utils.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var geometry = require('../../entities/geometry.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var END_V2000 = '2D 1   1.00000     0.00000     0';
function isErrorWithNumericId(error) {
  if (_typeof__default["default"](error) !== 'object' || error === null) {
    return false;
  }
  var id = error.id;
  return typeof id === 'number';
}
function isErrorWithMessage(error) {
  if (_typeof__default["default"](error) !== 'object' || error === null) {
    return false;
  }
  var message = error.message;
  return typeof message === 'string';
}
var Molfile = function () {
  function Molfile() {
    _classCallCheck__default["default"](this, Molfile);
    _defineProperty__default["default"](this, "molecule", void 0);
    _defineProperty__default["default"](this, "molfile", void 0);
    _defineProperty__default["default"](this, "reaction", void 0);
    _defineProperty__default["default"](this, "mapping", void 0);
    _defineProperty__default["default"](this, "bondMapping", void 0);
    this.molecule = null;
    this.molfile = null;
    this.reaction = false;
    this.mapping = {};
    this.bondMapping = {};
  }
  _createClass__default["default"](Molfile, [{
    key: "parseCTFile",
    value: function parseCTFile(props) {
      var molfileLines = props.molfileLines,
        shouldReactionRelayout = props.shouldReactionRelayout,
        ignoreChiralFlag = props.ignoreChiralFlag;
      var ret;
      if (molfileLines[0].search('\\$RXN') === 0) {
        ret = common["default"].parseRxn(molfileLines, shouldReactionRelayout, ignoreChiralFlag);
      } else {
        ret = common["default"].parseMol(molfileLines, ignoreChiralFlag);
      }
      ret.initHalfBonds();
      ret.initNeighbors();
      ret.bindSGroupsToFunctionalGroups();
      ret.markFragments();
      return ret;
    }
  }, {
    key: "prepareSGroups",
    value: function prepareSGroups(skipErrors, preserveIndigoDesc) {
      var mol = this.molecule;
      if (!mol) return;
      var toRemove = [];
      var errors = 0;
      mol.sGroupForest.getSGroupsBFS().reverse().forEach(function (id) {
        var sgroup = mol.sgroups.get(id);
        var errorIgnore = false;
        try {
          common["default"].prepareForSaving[sgroup.type](sgroup, mol);
        } catch (error) {
          KetcherLogger.KetcherLogger.error('molfile.ts::Molfile::prepareSGroups', error);
          if (!skipErrors || !isErrorWithNumericId(error)) {
            throw new Error("Error: ".concat(isErrorWithMessage(error) ? error.message : String(error)));
          }
          errorIgnore = true;
        }
        if (errorIgnore || !preserveIndigoDesc && /^INDIGO_.+_DESC$/i.test(sgroup.data.fieldName)) {
          errors += +errorIgnore;
          toRemove.push(sgroup.id);
        }
      }, this);
      if (errors) {
        throw new Error('Warning: ' + errors + ' invalid S-groups were detected. They will be omitted.');
      }
      for (var _i = 0, _toRemove = toRemove; _i < _toRemove.length; _i++) {
        var sgroupId = _toRemove[_i];
        mol === null || mol === void 0 || mol.sGroupDelete(sgroupId);
      }
    }
  }, {
    key: "getCTab",
    value: function getCTab(molecule, rgroups) {
      this.molecule = molecule.clone();
      this.centerMonomerMicromoleculeAtoms();
      this.prepareSGroups(false, false);
      this.molfile = '';
      this.writeCTab2000(rgroups);
      return this.molfile;
    }
  }, {
    key: "saveMolecule",
    value: function saveMolecule(molecule, skipSGroupErrors, norgroups, preserveIndigoDesc) {
      var _this = this;
      this.reaction = molecule.hasRxnArrow();
      this.molfile = '' + molecule.name;
      if (this.reaction) {
        if (molecule.rgroups.size > 0) {
          throw new Error('Reactions with r-groups are not supported at the moment');
        }
        var components = molecule.getComponents();
        var reactants = components.reactants;
        var products = components.products;
        var all = reactants.concat(products);
        this.molfile = '$RXN\n' + molecule.name + '\n\n\n' + utils["default"].paddedNum(reactants.length, 3) + utils["default"].paddedNum(products.length, 3) + utils["default"].paddedNum(0, 3) + '\n';
        var _iterator = _createForOfIteratorHelper(all),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var component = _step.value;
            var saver = new Molfile();
            var submol = molecule.clone(component, null, true);
            var molfile = saver.saveMolecule(submol, false, true);
            this.molfile += '$MOL\n' + molfile;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return this.molfile;
      }
      if (molecule.rgroups.size > 0) {
        if (norgroups) {
          molecule = molecule.getScaffold();
        } else {
          var scaffold = new Molfile().getCTab(molecule.getScaffold(), molecule.rgroups);
          this.molfile = '$MDL  REV  1\n$MOL\n$HDR\n' + molecule.name + '\n\n\n$END HDR\n';
          this.molfile += '$CTAB\n' + scaffold + '$END CTAB\n';
          molecule.rgroups.forEach(function (rg, rgid) {
            _this.molfile += '$RGP\n';
            _this.writePaddedNumber(rgid, 3);
            _this.molfile += '\n';
            rg.frags.forEach(function (fid) {
              var group = new Molfile().getCTab(molecule.getFragment(fid));
              _this.molfile += '$CTAB\n' + group + '$END CTAB\n';
            });
            _this.molfile += '$END RGP\n';
          });
          this.molfile += '$END MOL\n';
          return this.molfile;
        }
      }
      this.molecule = molecule.clone();
      this.centerMonomerMicromoleculeAtoms();
      this.prepareSGroups(skipSGroupErrors, preserveIndigoDesc);
      this.writeHeader();
      this.writeCTab2000();
      return this.molfile;
    }
  }, {
    key: "writeHeader",
    value: function writeHeader() {
      var date = new Date();
      this.writeCR();
      this.writeWhiteSpace(2);
      this.write('Ketcher');
      this.writeWhiteSpace();
      this.writeCR((date.getMonth() + 1 + '').padStart(2) + (date.getDate() + '').padStart(2) + (date.getFullYear() % 100 + '').padStart(2) + (date.getHours() + '').padStart(2) + (date.getMinutes() + '').padStart(2) + END_V2000);
      this.writeCR();
    }
  }, {
    key: "write",
    value: function write(str) {
      this.molfile += str;
    }
  }, {
    key: "writeCR",
    value: function writeCR(str) {
      if (arguments.length === 0) {
        str = '';
      }
      this.molfile += str + '\n';
    }
  }, {
    key: "writeWhiteSpace",
    value: function writeWhiteSpace() {
      var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      if (arguments.length === 0) {
        length = 1;
      }
      this.write(' '.repeat(Math.max(length, 0)));
    }
  }, {
    key: "writePadded",
    value: function writePadded(str, width) {
      this.write(str);
      this.writeWhiteSpace(width - str.length);
    }
  }, {
    key: "writePaddedNumber",
    value: function writePaddedNumber(number, width) {
      var str = (number - 0).toString();
      this.writeWhiteSpace(width - str.length);
      this.write(str);
    }
  }, {
    key: "writePaddedFloat",
    value: function writePaddedFloat(number, width, precision) {
      this.write(utils["default"].paddedNum(number, width, precision));
    }
  }, {
    key: "writeCTab2000Header",
    value: function writeCTab2000Header() {
      this.writePaddedNumber(this.molecule.atoms.size, 3);
      this.writePaddedNumber(this.molecule.bonds.size, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      var isAbsFlag = Array.from(this.molecule.frags.values()).some(function (fr) {
        return fr ? fr.enhancedStereoFlag === fragment.StereoFlag.Abs : false;
      });
      this.writePaddedNumber(isAbsFlag ? 1 : 0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(999, 3);
      this.writeCR(' V2000');
    }
  }, {
    key: "writeCTab2000",
    value: function writeCTab2000(rgroups) {
      var _this2 = this;
      var molecule = this.molecule;
      if (!molecule) return;
      this.writeCTab2000Header();
      this.mapping = {};
      var i = 1;
      var atomsIds = [];
      var atomsProps = [];
      molecule.atoms.forEach(function (atom, id) {
        var label = atom.label;
        if (atom.atomList != null) {
          label = 'L';
          atomsIds.push(id);
        } else if (atom.pseudo) {
          if (atom.pseudo.length > 3) {
            label = 'A';
            atomsProps.push({
              id: id,
              value: "'".concat(atom.pseudo, "'")
            });
          }
        } else if (atom.alias) {
          atomsProps.push({
            id: id,
            value: atom.alias
          });
        } else if (!elements.Elements.get(atom.label) && ['A', 'Q', 'X', '*', 'R#'].indexOf(atom.label) === -1) {
          label = 'C';
          atomsProps.push({
            id: id,
            value: atom.label
          });
        }
        _this2.writeAtom(atom, label);
        _this2.mapping[id] = i++;
      }, this);
      this.bondMapping = {};
      i = 1;
      molecule.bonds.forEach(function (bond, id) {
        _this2.bondMapping[id] = i++;
        _this2.writeBond(bond);
      }, this);
      while (atomsProps.length > 0) {
        this.writeAtomProps(atomsProps[0]);
        atomsProps.splice(0, 1);
      }
      var chargeList = [];
      var isotopeList = [];
      var radicalList = [];
      var rglabelList = [];
      var rglogicList = [];
      var aplabelList = [];
      var rbcountList = [];
      var unsaturatedList = [];
      var substcountList = [];
      molecule.atoms.forEach(function (atom, id) {
        if (atom.charge !== 0 && atom.charge !== null) {
          chargeList.push([id, atom.charge]);
        }
        if (atom.isotope !== 0 && atom.isotope !== null) {
          isotopeList.push([id, atom.isotope]);
        }
        if (atom.radical !== 0) {
          radicalList.push([id, atom.radical]);
        }
        if (atom.rglabel != null && atom.label === 'R#') {
          for (var rgi = 0; rgi < 32; rgi++) {
            if (atom.rglabel & 1 << rgi) {
              rglabelList.push([id, rgi + 1]);
            }
          }
        }
        if (atom.attachmentPoints != null) {
          aplabelList.push([id, atom.attachmentPoints]);
        }
        if (atom.ringBondCount !== 0) {
          rbcountList.push([id, atom.ringBondCount]);
        }
        if (atom.substitutionCount !== 0) {
          substcountList.push([id, atom.substitutionCount]);
        }
        if (atom.unsaturatedAtom !== 0) {
          unsaturatedList.push([id, atom.unsaturatedAtom]);
        }
      });
      if (rgroups) {
        rgroups.forEach(function (rg, rgid) {
          if (rg.resth || rg.ifthen > 0 || rg.range.length > 0) {
            var line = '  1 ' + utils["default"].paddedNum(rgid, 3) + ' ' + utils["default"].paddedNum(rg.ifthen, 3) + ' ' + utils["default"].paddedNum(rg.resth ? 1 : 0, 3) + '   ' + rg.range;
            rglogicList.push(line);
          }
        });
      }
      this.writeAtomPropList('M  CHG', chargeList);
      this.writeAtomPropList('M  ISO', isotopeList);
      this.writeAtomPropList('M  RAD', radicalList);
      this.writeAtomPropList('M  RGP', rglabelList);
      for (var _i2 = 0, _rglogicList = rglogicList; _i2 < _rglogicList.length; _i2++) {
        var logic = _rglogicList[_i2];
        this.write('M  LOG' + logic + '\n');
      }
      this.writeAtomPropList('M  APO', aplabelList);
      this.writeAtomPropList('M  RBC', rbcountList);
      this.writeAtomPropList('M  SUB', substcountList);
      this.writeAtomPropList('M  UNS', unsaturatedList);
      if (atomsIds.length > 0) {
        var _iterator2 = _createForOfIteratorHelper(atomsIds),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var atomId = _step2.value;
            var atomList = molecule.atoms.get(atomId).atomList;
            this.write('M  ALS');
            this.writePaddedNumber(atomId + 1, 4);
            this.writePaddedNumber(atomList.ids.length, 3);
            this.writeWhiteSpace();
            this.write(atomList.notList ? 'T' : 'F');
            var labelList = atomList.labelList();
            var _iterator3 = _createForOfIteratorHelper(labelList),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var label = _step3.value;
                this.writeWhiteSpace();
                this.writePadded(label, 3);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            this.writeWhiteSpace();
            this.writeCR();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
      var sgmap = {};
      var cnt = 1;
      var sgmapback = {};
      var sgorder = molecule.sGroupForest.getSGroupsBFS();
      sgorder.forEach(function (id) {
        sgmapback[cnt] = id;
        sgmap[id] = cnt++;
      });
      var _loop = function _loop() {
        var sGroupIdInCTab = _Array$from[_i3];
        var id = sgmapback[sGroupIdInCTab];
        var sgroup$1 = molecule.sgroups.get(id);
        if (sgroup.SGroup.isQuerySGroup(sgroup$1)) {
          return 1;
        }
        _this2.write('M  STY');
        _this2.writePaddedNumber(1, 3);
        _this2.writeWhiteSpace(1);
        _this2.writePaddedNumber(sGroupIdInCTab, 3);
        _this2.writeWhiteSpace(1);
        _this2.writePadded(sgroup$1.type, 3);
        _this2.writeCR();
        if (sgroup$1.type === 'COP' && sgroup$1.data.subtype) {
          _this2.write('M  SST');
          _this2.writePaddedNumber(1, 3);
          _this2.writeWhiteSpace(1);
          _this2.writePaddedNumber(sGroupIdInCTab, 3);
          _this2.writeWhiteSpace(1);
          _this2.writePadded(sgroup$1.data.subtype.toUpperCase(), 3);
          _this2.writeCR();
        }
        _this2.write('M  SLB');
        _this2.writePaddedNumber(1, 3);
        _this2.writeWhiteSpace(1);
        _this2.writePaddedNumber(sGroupIdInCTab, 3);
        _this2.writeWhiteSpace(1);
        _this2.writePaddedNumber(sGroupIdInCTab, 3);
        _this2.writeCR();
        var parentId = molecule.sGroupForest.parent.get(id);
        if (parentId >= 0) {
          _this2.write('M  SPL');
          _this2.writePaddedNumber(1, 3);
          _this2.writeWhiteSpace(1);
          _this2.writePaddedNumber(sGroupIdInCTab, 3);
          _this2.writeWhiteSpace(1);
          _this2.writePaddedNumber(sgmap[parentId], 3);
          _this2.writeCR();
        }
        if (['SRU', 'COP'].includes(sgroup$1.type) && sgroup$1.data.connectivity) {
          var connectivity = " ".concat(sGroupIdInCTab.toString().padStart(3), " ").concat((sgroup$1.data.connectivity || '').padEnd(3));
          _this2.write('M  SCN');
          _this2.writePaddedNumber(1, 3);
          _this2.write(connectivity.toUpperCase());
          _this2.writeCR();
        }
        if (sgroup$1.type === 'SRU') {
          _this2.write('M  SMT ');
          _this2.writePaddedNumber(sGroupIdInCTab, 3);
          _this2.writeWhiteSpace();
          _this2.write(sgroup$1.data.subscript || 'n');
          _this2.writeCR();
        }
        sgroup$1.getAttachmentPoints().forEach(function (attachmentPoint) {
          _this2.writeSGroupAttachmentPointLine(sGroupIdInCTab, attachmentPoint);
        });
        _this2.writeCR(common["default"].saveToMolfile[sgroup$1.type](sgroup$1, molecule, sgmap, _this2.mapping, _this2.bondMapping));
      };
      for (var _i3 = 0, _Array$from = Array.from({
          length: cnt - 1
        }, function (_, index) {
          return index + 1;
        }); _i3 < _Array$from.length; _i3++) {
        if (_loop()) continue;
      }
      var expandedGroups = [];
      molecule.sgroups.forEach(function (sg) {
        if (sg.isExpanded() && !sgroup.SGroup.isQuerySGroup(sg)) expandedGroups.push(sg.id + 1);
      });
      if (expandedGroups.length) {
        var expandedGroupsLine = "M  SDS EXP  ".concat(expandedGroups.length, "   ").concat(expandedGroups.join('   '));
        this.writeCR(expandedGroupsLine);
      }
      this.writeCR('M  END');
    }
  }, {
    key: "centerMonomerMicromoleculeAtoms",
    value: function centerMonomerMicromoleculeAtoms() {
      if (!this.molecule) {
        return;
      }
      var mol = this.molecule;
      mol.sgroups.forEach(function (sgroup) {
        if (!(sgroup instanceof monomerMicromolecule.MonomerMicromolecule) || !sgroup.pp) {
          return;
        }
        var positions = geometry.getAtomPositions(sgroup.atoms, mol.atoms);
        if (!positions.length) {
          return;
        }
        var offset = sgroup.pp.sub(geometry.geometricCenter(positions));
        if (offset.x === 0 && offset.y === 0) {
          return;
        }
        sgroup.atoms.forEach(function (atomId) {
          var atom = mol.atoms.get(atomId);
          if (atom) atom.pp = atom.pp.add(offset);
        });
      });
    }
  }, {
    key: "writeAtom",
    value: function writeAtom(atom, atomLabel) {
      this.writePaddedFloat(atom.pp.x, 10, 4);
      this.writePaddedFloat(-atom.pp.y, 10, 4);
      this.writePaddedFloat(atom.pp.z, 10, 4);
      this.writeWhiteSpace();
      this.writePadded(atomLabel, 3);
      this.writePaddedNumber(0, 2);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      if (typeof atom.hCount === 'undefined') {
        atom.hCount = 0;
      }
      this.writePaddedNumber(atom.hCount, 3);
      if (typeof atom.stereoCare === 'undefined') {
        atom.stereoCare = 0;
      }
      this.writePaddedNumber(atom.stereoCare, 3);
      var number;
      if (atom.explicitValence < 0) {
        number = 0;
      } else if (atom.explicitValence === 0) {
        number = 15;
      } else {
        number = atom.explicitValence;
      }
      this.writePaddedNumber(number, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      this.writePaddedNumber(0, 3);
      if (typeof atom.aam === 'undefined') {
        atom.aam = 0;
      }
      this.writePaddedNumber(atom.aam, 3);
      if (typeof atom.invRet === 'undefined') {
        atom.invRet = 0;
      }
      this.writePaddedNumber(atom.invRet, 3);
      if (typeof atom.exactChangeFlag === 'undefined') {
        atom.exactChangeFlag = 0;
      }
      this.writePaddedNumber(atom.exactChangeFlag, 3);
      this.writeCR();
    }
  }, {
    key: "writeBond",
    value: function writeBond(bond) {
      this.writePaddedNumber(this.mapping[bond.begin], 3);
      this.writePaddedNumber(this.mapping[bond.end], 3);
      this.writePaddedNumber(bond.type, 3);
      if (typeof bond.stereo === 'undefined') {
        bond.stereo = 0;
      }
      this.writePaddedNumber(bond.stereo, 3);
      this.writePadded(bond.xxx, 3);
      if (typeof bond.topology === 'undefined') {
        bond.topology = 0;
      }
      this.writePaddedNumber(bond.topology, 3);
      if (typeof bond.reactingCenterStatus === 'undefined') {
        bond.reactingCenterStatus = 0;
      }
      this.writePaddedNumber(bond.reactingCenterStatus, 3);
      this.writeCR();
    }
  }, {
    key: "writeAtomProps",
    value: function writeAtomProps(props) {
      this.write('A  ');
      this.writePaddedNumber(props.id + 1, 3);
      this.writeCR();
      this.writeCR(props.value);
    }
  }, {
    key: "writeAtomPropList",
    value: function writeAtomPropList(propId, values) {
      var _this3 = this;
      while (values.length > 0) {
        var part = [];
        while (values.length > 0 && part.length < 8) {
          part.push(values[0]);
          values.splice(0, 1);
        }
        this.write(propId);
        this.writePaddedNumber(part.length, 3);
        part.forEach(function (value) {
          _this3.writeWhiteSpace();
          _this3.writePaddedNumber(_this3.mapping[value[0]], 3);
          _this3.writeWhiteSpace();
          _this3.writePaddedNumber(value[1], 3);
        });
        this.writeCR();
      }
    }
  }, {
    key: "writeSGroupAttachmentPointLine",
    value: function writeSGroupAttachmentPointLine(sgroupId, attachmentPoint) {
      var _this$mapping$attachm;
      this.write("M  SAP");
      this.writeWhiteSpace(1);
      this.writePaddedNumber(sgroupId, 3);
      this.writePaddedNumber(1, 3);
      this.writeWhiteSpace(1);
      var atomId = this.mapping[attachmentPoint.atomId];
      this.writePaddedNumber(atomId, 3);
      this.writeWhiteSpace(1);
      var leaveAtomId = (_this$mapping$attachm = this.mapping[attachmentPoint.leaveAtomId]) !== null && _this$mapping$attachm !== void 0 ? _this$mapping$attachm : 0;
      this.writePaddedNumber(leaveAtomId, 3);
      this.writeWhiteSpace(1);
      var attachmentId = attachmentPoint.attachmentId ? attachmentPoint.attachmentId.slice(0, 2) : '  ';
      this.writePadded(attachmentId, 2);
      this.writeCR();
    }
  }]);
  return Molfile;
}();

exports.Molfile = Molfile;
//# sourceMappingURL=molfile.js.map
