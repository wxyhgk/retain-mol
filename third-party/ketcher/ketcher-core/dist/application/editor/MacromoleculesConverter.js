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
var AmbiguousMonomer = require('../../domain/entities/AmbiguousMonomer.js');
var bond = require('../../domain/entities/bond.js');
var functionalGroup = require('../../domain/entities/functionalGroup.js');
var pile = require('../../domain/entities/pile.js');
var rxnArrow = require('../../domain/entities/rxnArrow.js');
var multitailArrow = require('../../domain/entities/multitailArrow.js');
var rxnPlus = require('../../domain/entities/rxnPlus.js');
var sgroup = require('../../domain/entities/sgroup.js');
var fragment = require('../../domain/entities/fragment.js');
var sGroupAttachmentPoint = require('../../domain/entities/sGroupAttachmentPoint.js');
var vec2 = require('../../domain/entities/vec2.js');
require('../render/restruct/reobject.js');
var reatom = require('../render/restruct/reatom.js');
var rebond = require('../render/restruct/rebond.js');
require('../render/restruct/reenhancedFlag.js');
require('../render/restruct/refrag.js');
require('../render/restruct/rergroup.js');
var rerxnarrow = require('../render/restruct/rerxnarrow.js');
var rerxnplus = require('../render/restruct/rerxnplus.js');
var resgroup = require('../render/restruct/resgroup.js');
require('../render/restruct/resimpleObject.js');
require('../render/restruct/restruct.js');
require('../render/restruct/retext.js');
require('../render/restruct/visel.js');
require('../render/restruct/generalEnumTypes.js');
require('../render/restruct/showHydrogenLabels.js');
require('../render/restruct/rergroupAttachmentPoint.js');
require('../render/restruct/reImage.js');
var remultitailArrow = require('../render/restruct/remultitailArrow.js');
var monomerMicromolecule = require('../../domain/entities/monomerMicromolecule.js');
var Command = require('../../domain/entities/Command.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var monomers$1 = require('../../utilities/monomers.js');
var assert = require('../../utilities/assert.js');
var attachmentPointCalculations = require('../../domain/helpers/attachmentPointCalculations.js');
var _ = require('lodash');
var HydrogenBond = require('../../domain/entities/HydrogenBond.js');
var monomers = require('../../domain/constants/monomers.js');
var types = require('./tools/types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var MacromoleculesConverter = function () {
  function MacromoleculesConverter() {
    _classCallCheck__default["default"](this, MacromoleculesConverter);
  }
  _createClass__default["default"](MacromoleculesConverter, null, [{
    key: "convertMonomerToMonomerMicromolecule",
    value: function convertMonomerToMonomerMicromolecule(monomer, struct) {
      var monomerMicromolecule$1 = new monomerMicromolecule.MonomerMicromolecule(sgroup.SGroup.TYPES.SUP, monomer);
      var sgroupId = struct.sgroups.add(monomerMicromolecule$1);
      monomerMicromolecule$1.data.name = monomer.monomerItem.label;
      monomerMicromolecule$1.data.expanded = Boolean(monomer.monomerItem.expanded);
      monomerMicromolecule$1.id = sgroupId;
      monomerMicromolecule$1.pp = monomer.position;
      return monomerMicromolecule$1;
    }
  }, {
    key: "addMonomerAtomToStruct",
    value: function addMonomerAtomToStruct(atom, monomer, monomerMicromolecule, struct) {
      var atomClone = atom.clone();
      atomClone.pp = monomer.position.add(atom.pp);
      atomClone.sgs = new pile.Pile([monomerMicromolecule.id]);
      atomClone.fragment = -1;
      var atomId = struct.atoms.add(atomClone);
      monomerMicromolecule.atoms.push(atomId);
      return {
        atomId: atomId,
        atom: atomClone
      };
    }
  }, {
    key: "convertAttachmentPointNameToNumber",
    value: function convertAttachmentPointNameToNumber(attachmentPointName) {
      if (attachmentPointName === 'hydrogen') {
        return 0;
      }
      return Number(attachmentPointName === null || attachmentPointName === void 0 ? void 0 : attachmentPointName.replace('R', ''));
    }
  }, {
    key: "findAttachmentPointAtom",
    value: function findAttachmentPointAtom(polymerBond, monomer, monomerToAtomIdMap) {
      var _monomer$monomerItem$;
      var attachmentPointName = monomer.getAttachmentPointByBond(polymerBond);
      if (!attachmentPointName) {
        return {
          attachmentAtomId: undefined,
          attachmentPointNumber: undefined
        };
      }
      var attachmentPointNumber = MacromoleculesConverter.convertAttachmentPointNameToNumber(attachmentPointName);
      var attachmentPointIndex = attachmentPointName === 'hydrogen' ? 0 : monomer.listOfAttachmentPoints.indexOf(attachmentPointName);
      var attachmentPoint = (_monomer$monomerItem$ = monomer.monomerItem.attachmentPoints) === null || _monomer$monomerItem$ === void 0 ? void 0 : _monomer$monomerItem$[attachmentPointIndex];
      var atomIdMap = monomerToAtomIdMap.get(monomer);
      var attachmentPointAtomId = monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? 0 : attachmentPoint === null || attachmentPoint === void 0 ? void 0 : attachmentPoint.attachmentAtom;
      return {
        globalAttachmentAtomId: _.isNumber(attachmentPointAtomId) && (atomIdMap === null || atomIdMap === void 0 ? void 0 : atomIdMap.get(attachmentPointAtomId)),
        attachmentAtomId: _.isNumber(attachmentPointAtomId) && attachmentPointAtomId,
        attachmentPointNumber: attachmentPointNumber
      };
    }
  }, {
    key: "convertMonomerAttachmentPointsToSGroupAttachmentPoints",
    value: function convertMonomerAttachmentPointsToSGroupAttachmentPoints(monomer, atomIdsMap) {
      return monomer.listOfAttachmentPoints.map(function (attachmentPointName, attachmentPointIndex) {
        var _monomer$monomerItem$2, _attachmentPoint$leav, _attachmentPoint$leav2;
        var attachmentPointNumber = attachmentPointCalculations.getAttachmentPointNumberFromLabel(attachmentPointName);
        var attachmentPoint = (_monomer$monomerItem$2 = monomer.monomerItem.attachmentPoints) === null || _monomer$monomerItem$2 === void 0 ? void 0 : _monomer$monomerItem$2[attachmentPointIndex];
        return new sGroupAttachmentPoint.SGroupAttachmentPoint(atomIdsMap ? atomIdsMap.get(attachmentPoint.attachmentAtom) : attachmentPoint.attachmentAtom, atomIdsMap ? atomIdsMap.get((_attachmentPoint$leav = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav === void 0 ? void 0 : _attachmentPoint$leav.atoms[0]) : (_attachmentPoint$leav2 = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav2 === void 0 ? void 0 : _attachmentPoint$leav2.atoms[0], undefined, attachmentPointNumber);
      });
    }
  }, {
    key: "convertDrawingEntitiesToStruct",
    value: function convertDrawingEntitiesToStruct(drawingEntitiesManager, struct, reStruct) {
      var _this = this;
      var monomerToAtomIdMap = new Map();
      drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);
      drawingEntitiesManager.clearMicromoleculesHiddenEntities();
      drawingEntitiesManager.monomers.forEach(function (monomer) {
        var stereoFlag = drawingEntitiesManager.getStereoFlagForMonomer(monomer);
        if (stereoFlag) {
          monomer.monomerItem.struct.frags.forEach(function (fragment) {
            if (fragment !== null && fragment !== void 0 && fragment.enhancedStereoFlag) {
              fragment.stereoFlagPosition = new vec2.Vec2(stereoFlag.position);
            }
          });
        }
        if (monomer.monomerItem.props.isMicromoleculeFragment) {
          var atomIdMap = new Map();
          monomer.monomerItem.struct.mergeInto(struct, null, null, false, false, atomIdMap);
          monomerToAtomIdMap.set(monomer, atomIdMap);
        } else {
          var atomIdsMap = new Map();
          var monomerMicromolecule = _this.convertMonomerToMonomerMicromolecule(monomer, struct);
          reStruct === null || reStruct === void 0 || reStruct.sgroups.set(monomerMicromolecule.id, new resgroup["default"](monomerMicromolecule));
          var monomerAtoms = monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? monomer.monomers[0].monomerItem.struct.atoms : monomer.monomerItem.struct.atoms;
          var monomerBonds = monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? monomer.monomers[0].monomerItem.struct.bonds : monomer.monomerItem.struct.bonds;
          monomerAtoms.forEach(function (oldAtom, oldAtomId) {
            var _this$addMonomerAtomT = _this.addMonomerAtomToStruct(oldAtom, monomer, monomerMicromolecule, struct),
              atom = _this$addMonomerAtomT.atom,
              atomId = _this$addMonomerAtomT.atomId;
            atomIdsMap.set(oldAtomId, atomId);
            monomerToAtomIdMap.set(monomer, atomIdsMap);
            reStruct === null || reStruct === void 0 || reStruct.atoms.set(atomId, new reatom["default"](atom));
          });
          monomerMicromolecule.addAttachmentPoints(MacromoleculesConverter.convertMonomerAttachmentPointsToSGroupAttachmentPoints(monomer, atomIdsMap) || [], false);
          struct.sGroupForest.insert(monomerMicromolecule);
          monomerBonds.forEach(function (bond) {
            var bondClone = bond.clone();
            bondClone.begin = atomIdsMap.get(bondClone.begin);
            bondClone.end = atomIdsMap.get(bondClone.end);
            var bondId = struct.bonds.add(bondClone);
            reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new rebond["default"](bondClone));
          });
          struct.functionalGroups.add(new functionalGroup.FunctionalGroup(monomerMicromolecule));
        }
      });
      var conversionErrorMessage = '';
      drawingEntitiesManager.polymerBonds.forEach(function (polymerBond) {
        assert.assert(polymerBond.secondMonomer);
        if (polymerBond instanceof HydrogenBond.HydrogenBond) {
          var _monomerToAtomIdMap$g, _monomerToAtomIdMap$g2;
          var _beginAtom = (_monomerToAtomIdMap$g = monomerToAtomIdMap.get(polymerBond.firstMonomer)) === null || _monomerToAtomIdMap$g === void 0 ? void 0 : _monomerToAtomIdMap$g.values().next().value;
          var _endAtom = (_monomerToAtomIdMap$g2 = monomerToAtomIdMap.get(polymerBond.secondMonomer)) === null || _monomerToAtomIdMap$g2 === void 0 ? void 0 : _monomerToAtomIdMap$g2.values().next().value;
          if (!_.isNumber(_beginAtom) || !_.isNumber(_endAtom)) {
            conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
            return;
          }
          var _bond = new bond.Bond({
            type: bond.Bond.PATTERN.TYPE.HYDROGEN,
            begin: _beginAtom,
            end: _endAtom
          });
          var _bondId = struct.bonds.add(_bond);
          reStruct === null || reStruct === void 0 || reStruct.bonds.set(_bondId, new rebond["default"](_bond));
          return;
        }
        var _this$findAttachmentP = _this.findAttachmentPointAtom(polymerBond, polymerBond.firstMonomer, monomerToAtomIdMap),
          beginAtom = _this$findAttachmentP.globalAttachmentAtomId,
          beginSuperatomAttachmentPointNumber = _this$findAttachmentP.attachmentPointNumber;
        var _this$findAttachmentP2 = _this.findAttachmentPointAtom(polymerBond, polymerBond.secondMonomer, monomerToAtomIdMap),
          endAtom = _this$findAttachmentP2.globalAttachmentAtomId,
          endSuperatomAttachmentPointNumber = _this$findAttachmentP2.attachmentPointNumber;
        if (!_.isNumber(beginAtom) || !_.isNumber(endAtom)) {
          conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
          return;
        }
        var bond$1 = new bond.Bond({
          type: polymerBond instanceof HydrogenBond.HydrogenBond ? bond.Bond.PATTERN.TYPE.HYDROGEN : bond.Bond.PATTERN.TYPE.SINGLE,
          begin: beginAtom,
          end: endAtom,
          beginSuperatomAttachmentPointNumber: beginSuperatomAttachmentPointNumber,
          endSuperatomAttachmentPointNumber: endSuperatomAttachmentPointNumber
        });
        var bondId = struct.bonds.add(bond$1);
        reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new rebond["default"](bond$1));
      });
      drawingEntitiesManager.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        var _monomerToAtomIdMap$g3;
        var _this$findAttachmentP3 = _this.findAttachmentPointAtom(monomerToAtomBond, monomerToAtomBond.monomer, monomerToAtomIdMap),
          beginAtom = _this$findAttachmentP3.globalAttachmentAtomId,
          beginSuperatomAttachmentPointNumber = _this$findAttachmentP3.attachmentPointNumber;
        var endAtom = monomerToAtomIdMap === null || monomerToAtomIdMap === void 0 || (_monomerToAtomIdMap$g3 = monomerToAtomIdMap.get(monomerToAtomBond.atom.monomer)) === null || _monomerToAtomIdMap$g3 === void 0 ? void 0 : _monomerToAtomIdMap$g3.get(monomerToAtomBond.atom.atomIdInMicroMode);
        if (!_.isNumber(beginAtom) || !_.isNumber(endAtom)) {
          conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
          return;
        }
        var bond$1 = new bond.Bond({
          type: bond.Bond.PATTERN.TYPE.SINGLE,
          begin: beginAtom,
          end: endAtom,
          beginSuperatomAttachmentPointNumber: beginSuperatomAttachmentPointNumber
        });
        var bondId = struct.bonds.add(bond$1);
        reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new rebond["default"](bond$1));
      });
      drawingEntitiesManager.rxnArrows.forEach(function (rxnArrow$1) {
        var micromoleculeRxnArrow = new rxnArrow.RxnArrow({
          mode: rxnArrow$1.type,
          pos: [rxnArrow$1.startPosition, rxnArrow$1.endPosition],
          height: rxnArrow$1.height,
          initiallySelected: rxnArrow$1.initiallySelected,
          arrowId: rxnArrow$1.arrowId
        });
        var arrowId = struct.addRxnArrow(micromoleculeRxnArrow);
        reStruct === null || reStruct === void 0 || reStruct.rxnArrows.set(arrowId, new rerxnarrow["default"](micromoleculeRxnArrow));
      });
      drawingEntitiesManager.multitailArrows.forEach(function (multitailArrow$1) {
        var micromoleculeMultitailArrow = multitailArrow.MultitailArrow.fromKetNode(multitailArrow$1.toKetNode());
        micromoleculeMultitailArrow.arrowId = multitailArrow$1.arrowId;
        var arrowId = struct.addMultitailArrow(micromoleculeMultitailArrow);
        reStruct === null || reStruct === void 0 || reStruct.multitailArrows.set(arrowId, new remultitailArrow.ReMultitailArrow(micromoleculeMultitailArrow));
      });
      drawingEntitiesManager.rxnPluses.forEach(function (rxnPlus$1) {
        var micromoleculeRxnPlus = new rxnPlus.RxnPlus({
          pp: rxnPlus$1.position,
          initiallySelected: rxnPlus$1.initiallySelected
        });
        var rxnPlusId = struct.rxnPluses.add(micromoleculeRxnPlus);
        reStruct === null || reStruct === void 0 || reStruct.rxnPluses.set(rxnPlusId, new rerxnplus["default"](micromoleculeRxnPlus));
      });
      struct.findConnectedComponents();
      struct.setImplicitHydrogen();
      struct.setStereoLabelsToAtoms();
      struct.applyStereoBondsToExpandedMonomers();
      struct.markFragments();
      return {
        struct: struct,
        reStruct: reStruct,
        conversionErrorMessage: conversionErrorMessage
      };
    }
  }, {
    key: "convertMonomerMicromoleculeToMonomer",
    value: function convertMonomerMicromoleculeToMonomer(monomerMicromolecule, drawingEntitiesManager, sgroupToMonomer) {
      var command = new Command.Command();
      var monomerAdditionCommand = monomerMicromolecule.monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? drawingEntitiesManager.addAmbiguousMonomer(monomerMicromolecule.monomer.variantMonomerItem, monomerMicromolecule.monomer.position) : drawingEntitiesManager.addMonomer(monomerMicromolecule.monomer.monomerItem, monomerMicromolecule.pp);
      command.merge(monomerAdditionCommand);
      sgroupToMonomer.set(monomerMicromolecule, monomerAdditionCommand.operations[0].monomer);
      return command;
    }
  }, {
    key: "convertFragmentToChem",
    value: function convertFragmentToChem(fragmentNumber, fragmentStruct, drawingEntitiesManager) {
      var fragmentBbox = fragmentStruct.getCoordBoundingBox();
      return drawingEntitiesManager.addMonomer({
        struct: fragmentStruct,
        label: 'F' + fragmentNumber,
        colorScheme: undefined,
        favorite: false,
        props: {
          Name: 'F' + fragmentNumber,
          MonomerNaturalAnalogCode: '',
          MonomerName: 'F' + fragmentNumber,
          MonomerType: monomers.MONOMER_CONST.CHEM,
          isMicromoleculeFragment: true
        }
      }, new vec2.Vec2(fragmentBbox.max.x - (fragmentBbox.max.x - fragmentBbox.min.x) / 2, fragmentBbox.max.y - (fragmentBbox.max.y - fragmentBbox.min.y) / 2));
    }
  }, {
    key: "getAttachmentPointLabel",
    value: function getAttachmentPointLabel(atom) {
      var attachmentPointLabel = '';
      var atomRglabel = Number(atom.rglabel);
      assert.assert(Number.isInteger(atomRglabel));
      for (var rgi = 0; rgi < 32; rgi++) {
        if (atomRglabel & 1 << rgi) {
          attachmentPointLabel = 'R' + (rgi + 1).toString();
        }
      }
      return attachmentPointLabel;
    }
  }, {
    key: "getFragmentsGroupedBySgroup",
    value: function getFragmentsGroupedBySgroup(struct) {
      var _this2 = this;
      var groupedFragments = [];
      struct.frags.forEach(function (_fragment, fragmentId) {
        var isAlreadyGrouped = groupedFragments.find(function (fragmentsGroup) {
          return fragmentsGroup.includes(fragmentId);
        });
        if (isAlreadyGrouped) {
          return;
        }
        var fragmentSgroups = new Set();
        struct.atoms.forEach(function (atom, atomId) {
          if (atom.fragment !== fragmentId) return;
          var sgroup = struct.getGroupFromAtomId(atomId);
          if (sgroup && !_this2.shouldSplitSgroupIntoSeparateFragments(sgroup, struct)) {
            fragmentSgroups.add(sgroup);
          }
        });
        var lastFragmentGroupIndex = groupedFragments.push([fragmentId]) - 1;
        fragmentSgroups.forEach(function (sgroup) {
          sgroup.atoms.forEach(function (aid) {
            var _struct$atoms$get;
            var atomFragmentId = (_struct$atoms$get = struct.atoms.get(aid)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment;
            if (_.isNumber(atomFragmentId) && !groupedFragments[lastFragmentGroupIndex].includes(atomFragmentId)) {
              groupedFragments[lastFragmentGroupIndex].push(atomFragmentId);
            }
          });
        });
      });
      return groupedFragments;
    }
  }, {
    key: "shouldSplitSgroupIntoSeparateFragments",
    value: function shouldSplitSgroupIntoSeparateFragments(sgroup, struct) {
      var attachmentPointFragmentIds = new Set();
      sgroup.getAttachmentPoints().forEach(function (attachmentPoint) {
        var _struct$atoms$get2;
        var fragmentId = (_struct$atoms$get2 = struct.atoms.get(attachmentPoint.atomId)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment;
        if (_.isNumber(fragmentId)) {
          attachmentPointFragmentIds.add(fragmentId);
        }
      });
      return attachmentPointFragmentIds.size > 1;
    }
  }, {
    key: "clonePartialSgroupsWithAttachmentPoints",
    value: function clonePartialSgroupsWithAttachmentPoints(struct, fragmentStruct, atomIdMap) {
      var _this3 = this;
      struct.sgroups.forEach(function (sgroup$1) {
        if (!_this3.shouldSplitSgroupIntoSeparateFragments(sgroup$1, struct) || sgroup$1.atoms.every(function (atomId) {
          return atomIdMap.has(atomId);
        })) {
          return;
        }
        var mappedAtomIds = sgroup$1.atoms.map(function (atomId) {
          return atomIdMap.get(atomId);
        }).filter(_.isNumber);
        if (mappedAtomIds.length === 0) {
          return;
        }
        var attachmentPoints = sgroup$1.getAttachmentPoints().map(function (attachmentPoint) {
          var atomId = atomIdMap.get(attachmentPoint.atomId);
          if (!_.isNumber(atomId)) {
            return undefined;
          }
          var leaveAtomId = _.isNumber(attachmentPoint.leaveAtomId) ? atomIdMap.get(attachmentPoint.leaveAtomId) : attachmentPoint.leaveAtomId;
          return new sGroupAttachmentPoint.SGroupAttachmentPoint(atomId, leaveAtomId, attachmentPoint.attachmentId, attachmentPoint.attachmentPointNumber);
        }).filter(function (attachmentPoint) {
          return attachmentPoint !== undefined;
        });
        if (attachmentPoints.length === 0) {
          return;
        }
        var partialSgroup = new sgroup.SGroup(sgroup$1.type);
        Object.keys(sgroup$1.data).forEach(function (field) {
          partialSgroup.data[field] = sgroup$1.data[field];
        });
        partialSgroup.pp = sgroup$1.pp ? new vec2.Vec2(sgroup$1.pp) : null;
        var partialSgroupId = fragmentStruct.sgroups.add(partialSgroup);
        partialSgroup.id = partialSgroupId;
        mappedAtomIds.forEach(function (atomId) {
          fragmentStruct.atomAddToSGroup(partialSgroupId, atomId);
        });
        partialSgroup.addAttachmentPoints(attachmentPoints);
        fragmentStruct.sGroupForest.insert(partialSgroup);
      });
    }
  }, {
    key: "findAtomByMicromoleculeAtomId",
    value: function findAtomByMicromoleculeAtomId(drawingEntitiesManager, atomId, monomer) {
      return _toConsumableArray__default["default"](drawingEntitiesManager.atoms.values()).find(function (atom) {
        return atom.atomIdInMicroMode === atomId && (!monomer || monomer === atom.monomer);
      });
    }
  }, {
    key: "convertStructToDrawingEntities",
    value: function convertStructToDrawingEntities(struct, drawingEntitiesManager) {
      var _this4 = this;
      var sgroupToMonomer = new Map();
      var fragmentIdToMonomer = new Map();
      var command = new Command.Command();
      struct.sgroups.forEach(function (sgroup) {
        if (sgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
          command.merge(_this4.convertMonomerMicromoleculeToMonomer(sgroup, drawingEntitiesManager, sgroupToMonomer));
        }
      });
      var fragments = this.getFragmentsGroupedBySgroup(struct);
      var fragmentNumber = 1;
      var fragmentIdToAtomIdMap = new Map();
      var globalAtomIdToMonomerMap = new Map();
      fragments.forEach(function (_fragment) {
        var atomIdMap = new Map();
        var fragmentStruct = struct.getFragmentOnly(_fragment, atomIdMap);
        _this4.clonePartialSgroupsWithAttachmentPoints(struct, fragmentStruct, atomIdMap);
        var monomerAddCommand = _this4.convertFragmentToChem(fragmentNumber, fragmentStruct, drawingEntitiesManager);
        var monomer = monomerAddCommand.operations[0].monomer;
        var atomIdMapObject = Object.fromEntries(atomIdMap.entries());
        var localAtomIdToGlobalAtomId = _.invert(atomIdMapObject);
        var atomsMap = new Map();
        _fragment.forEach(function (fragmentId) {
          fragmentIdToMonomer.set(fragmentId, monomer);
          fragmentIdToAtomIdMap.set(fragmentId, atomIdMap);
        });
        command.merge(monomerAddCommand);
        fragmentStruct.sgroups.forEach(function (sgroup, sgroupId) {
          command.merge(drawingEntitiesManager.addSGroup(sgroup, monomer, sgroupId));
        });
        if (monomer.monomerItem.props.isMicromoleculeFragment && !monomers$1.isMonomerSgroupWithAttachmentPoints(monomer)) {
          monomer.monomerItem.struct.atoms.forEach(function (atom, atomId) {
            var atomAddCommand = drawingEntitiesManager.addAtom(atom.pp, monomer, atomId, atom.label, {
              charge: atom.charge,
              explicitValence: atom.explicitValence,
              isotope: atom.isotope,
              radical: atom.radical,
              alias: atom.alias,
              cip: atom.cip,
              stereoLabel: atom.stereoLabel,
              atomList: atom.atomList
            });
            command.merge(atomAddCommand);
            atomsMap.set(atomId, atomAddCommand.operations[0].atom);
            globalAtomIdToMonomerMap.set(Number(localAtomIdToGlobalAtomId[atomId]), monomer);
          });
          monomer.monomerItem.struct.bonds.forEach(function (bond, bondId) {
            var firstAtom = atomsMap.get(bond.begin);
            var secondAtom = atomsMap.get(bond.end);
            if (!firstAtom || !secondAtom) {
              return;
            }
            command.merge(drawingEntitiesManager.addBond(firstAtom, secondAtom, bond.type, bond.stereo, bondId, bond.cip));
          });
          monomer.monomerItem.struct.frags.forEach(function (fragment$1) {
            if (fragment$1 !== null && fragment$1 !== void 0 && fragment$1.enhancedStereoFlag) {
              var stereoFlagPosition = fragment$1.stereoFlagPosition || fragment.Fragment.getDefaultStereoFlagPosition(monomer.monomerItem.struct, 0);
              if (stereoFlagPosition) {
                command.merge(drawingEntitiesManager.addStereoFlag(stereoFlagPosition, fragment$1.enhancedStereoFlag, monomer));
              }
            }
          });
        }
        fragmentNumber++;
      });
      var superatomAttachmentPointToBond = new Map();
      struct.bonds.forEach(function (bond) {
        var _bond$beginSuperatomA;
        var beginAtom = struct.atoms.get(bond.begin);
        var endAtom = struct.atoms.get(bond.end);
        var beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
        beginAtomSgroup === null || beginAtomSgroup === void 0 || beginAtomSgroup.getAttachmentPoints();
        var endAtomSgroup = struct.getGroupFromAtomId(bond.end);
        var isConnectionBetweenMonomerAndMolecule = beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule && !(endAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule) && !(endAtomSgroup !== null && endAtomSgroup !== void 0 && endAtomSgroup.isSuperatomWithoutLabel) || endAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule && !(beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule) && !(beginAtomSgroup !== null && beginAtomSgroup !== void 0 && beginAtomSgroup.isSuperatomWithoutLabel);
        if (!isConnectionBetweenMonomerAndMolecule) {
          return;
        }
        var moleculeAtomId = beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule ? bond.end : bond.begin;
        var moleculeAtom = beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule ? endAtom : beginAtom;
        var monomerSgroup = beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule ? beginAtomSgroup : endAtomSgroup;
        if (!moleculeAtom || !monomerSgroup) {
          return;
        }
        var atomsMap = fragmentIdToAtomIdMap.get(moleculeAtom.fragment);
        var atomIdInMicromolecules = atomsMap === null || atomsMap === void 0 ? void 0 : atomsMap.get(moleculeAtomId);
        var monomer = sgroupToMonomer.get(monomerSgroup);
        if (!_.isNumber(atomIdInMicromolecules) || !monomer) {
          return;
        }
        var atomToConnect = MacromoleculesConverter.findAtomByMicromoleculeAtomId(drawingEntitiesManager, atomIdInMicromolecules, globalAtomIdToMonomerMap.get(moleculeAtomId));
        var attachmentPointNumber = (_bond$beginSuperatomA = bond.beginSuperatomAttachmentPointNumber) !== null && _bond$beginSuperatomA !== void 0 ? _bond$beginSuperatomA : bond.endSuperatomAttachmentPointNumber;
        if (!atomToConnect || !_.isNumber(attachmentPointNumber)) {
          return;
        }
        command.merge(drawingEntitiesManager.addMonomerToAtomBond(monomer, atomToConnect, attachmentPointCalculations.getAttachmentPointLabel(attachmentPointNumber)));
      });
      struct.bonds.forEach(function (bond$1) {
        var beginAtom = struct.atoms.get(bond$1.begin);
        var endAtom = struct.atoms.get(bond$1.end);
        if (!beginAtom || !endAtom) {
          return;
        }
        var beginAtomSgroup = struct.getGroupFromAtomId(bond$1.begin);
        var beginAtomSgroupAttachmentPoints = beginAtomSgroup === null || beginAtomSgroup === void 0 ? void 0 : beginAtomSgroup.getAttachmentPoints();
        var endAtomSgroup = struct.getGroupFromAtomId(bond$1.end);
        var endAtomSgroupAttachmentPoints = endAtomSgroup === null || endAtomSgroup === void 0 ? void 0 : endAtomSgroup.getAttachmentPoints();
        var beginAtomAttachmentPointNumber = _.isNumber(bond$1.beginSuperatomAttachmentPointNumber) ? bond$1.beginSuperatomAttachmentPointNumber : beginAtomSgroupAttachmentPoints === null || beginAtomSgroupAttachmentPoints === void 0 ? void 0 : beginAtomSgroupAttachmentPoints.findIndex(function (sgroupAttachmentPoint) {
          return sgroupAttachmentPoint.atomId === bond$1.begin && !superatomAttachmentPointToBond.has(sgroupAttachmentPoint);
        });
        var beginAtomAttachmentPoint = _.isNumber(beginAtomAttachmentPointNumber) && (beginAtomSgroupAttachmentPoints === null || beginAtomSgroupAttachmentPoints === void 0 ? void 0 : beginAtomSgroupAttachmentPoints.find(function (attachmentPoint) {
          return attachmentPoint.attachmentPointNumber === beginAtomAttachmentPointNumber;
        }));
        var endAtomAttachmentPointNumber = _.isNumber(bond$1.endSuperatomAttachmentPointNumber) ? bond$1.endSuperatomAttachmentPointNumber : endAtomSgroupAttachmentPoints === null || endAtomSgroupAttachmentPoints === void 0 ? void 0 : endAtomSgroupAttachmentPoints.findIndex(function (sgroupAttachmentPoint) {
          return sgroupAttachmentPoint.atomId === bond$1.end && !superatomAttachmentPointToBond.has(sgroupAttachmentPoint);
        });
        var endAtomAttachmentPoint = _.isNumber(endAtomAttachmentPointNumber) && (endAtomSgroupAttachmentPoints === null || endAtomSgroupAttachmentPoints === void 0 ? void 0 : endAtomSgroupAttachmentPoints.find(function (attachmentPoint) {
          return attachmentPoint.attachmentPointNumber === endAtomAttachmentPointNumber;
        }));
        if (beginAtomAttachmentPoint) {
          superatomAttachmentPointToBond.set(beginAtomAttachmentPoint, bond$1);
        }
        if (endAtomAttachmentPoint) {
          superatomAttachmentPointToBond.set(endAtomAttachmentPoint, bond$1);
        }
        if (endAtomSgroup !== beginAtomSgroup && _.isNumber(beginAtomAttachmentPointNumber) && _.isNumber(endAtomAttachmentPointNumber) && beginAtomSgroup && endAtomSgroup && (beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule || beginAtomSgroup.isSuperatomWithoutLabel) && (endAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule || endAtomSgroup.isSuperatomWithoutLabel)) {
          var firstMonomer = beginAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule ? sgroupToMonomer.get(beginAtomSgroup) : fragmentIdToMonomer.get(beginAtom.fragment);
          var secondMonomer = endAtomSgroup instanceof monomerMicromolecule.MonomerMicromolecule ? sgroupToMonomer.get(endAtomSgroup) : fragmentIdToMonomer.get(endAtom.fragment);
          assert.assert(firstMonomer);
          assert.assert(secondMonomer);
          command.merge(drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, attachmentPointCalculations.getAttachmentPointLabel(beginAtomAttachmentPointNumber), attachmentPointCalculations.getAttachmentPointLabel(endAtomAttachmentPointNumber), bond$1.type === bond.Bond.PATTERN.TYPE.HYDROGEN ? types.MACROMOLECULES_BOND_TYPES.HYDROGEN : types.MACROMOLECULES_BOND_TYPES.SINGLE));
        }
      });
      struct.rxnArrows.forEach(function (rxnArrow) {
        var arrowAddCommand = drawingEntitiesManager.addRxnArrow(rxnArrow.mode, rxnArrow.pos, rxnArrow.height, rxnArrow.initiallySelected, rxnArrow.arrowId);
        command.merge(arrowAddCommand);
      });
      struct.multitailArrows.forEach(function (multitailArrow) {
        var arrowAddCommand = drawingEntitiesManager.addMultitailArrow(multitailArrow.toKetNode(), multitailArrow.arrowId);
        command.merge(arrowAddCommand);
      });
      struct.rxnPluses.forEach(function (rxnPlus) {
        var rxnPlusAddCommand = drawingEntitiesManager.addRxnPlus(rxnPlus.pp, rxnPlus.initiallySelected);
        command.merge(rxnPlusAddCommand);
      });
      drawingEntitiesManager.setMicromoleculesHiddenEntities(struct);
      drawingEntitiesManager.detectBondsOverlappedByMonomers();
      return {
        drawingEntitiesManager: drawingEntitiesManager,
        modelChanges: command,
        fragmentIdToMonomer: fragmentIdToMonomer,
        fragmentIdToAtomIdMap: fragmentIdToAtomIdMap
      };
    }
  }]);
  return MacromoleculesConverter;
}();

exports.MacromoleculesConverter = MacromoleculesConverter;
//# sourceMappingURL=MacromoleculesConverter.js.map
