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
import { AmbiguousMonomer } from '../../domain/entities/AmbiguousMonomer.modern.js';
import { Bond } from '../../domain/entities/bond.modern.js';
import { FunctionalGroup } from '../../domain/entities/functionalGroup.modern.js';
import { Pile } from '../../domain/entities/pile.modern.js';
import { RxnArrow } from '../../domain/entities/rxnArrow.modern.js';
import { MultitailArrow } from '../../domain/entities/multitailArrow.modern.js';
import { RxnPlus } from '../../domain/entities/rxnPlus.modern.js';
import { SGroup } from '../../domain/entities/sgroup.modern.js';
import { Fragment } from '../../domain/entities/fragment.modern.js';
import { SGroupAttachmentPoint } from '../../domain/entities/sGroupAttachmentPoint.modern.js';
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import '../render/restruct/reobject.modern.js';
import ReAtom from '../render/restruct/reatom.modern.js';
import ReBond from '../render/restruct/rebond.modern.js';
import '../render/restruct/reenhancedFlag.modern.js';
import '../render/restruct/refrag.modern.js';
import '../render/restruct/rergroup.modern.js';
import ReRxnArrow from '../render/restruct/rerxnarrow.modern.js';
import ReRxnPlus from '../render/restruct/rerxnplus.modern.js';
import ReSGroup from '../render/restruct/resgroup.modern.js';
import '../render/restruct/resimpleObject.modern.js';
import '../render/restruct/restruct.modern.js';
import '../render/restruct/retext.modern.js';
import '../render/restruct/visel.modern.js';
import '../render/restruct/generalEnumTypes.modern.js';
import '../render/restruct/showHydrogenLabels.modern.js';
import '../render/restruct/rergroupAttachmentPoint.modern.js';
import '../render/restruct/reImage.modern.js';
import { ReMultitailArrow } from '../render/restruct/remultitailArrow.modern.js';
import { MonomerMicromolecule } from '../../domain/entities/monomerMicromolecule.modern.js';
import { Command } from '../../domain/entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { isMonomerSgroupWithAttachmentPoints } from '../../utilities/monomers.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { getAttachmentPointNumberFromLabel, getAttachmentPointLabel } from '../../domain/helpers/attachmentPointCalculations.modern.js';
import { isNumber, invert } from 'lodash';
import { HydrogenBond } from '../../domain/entities/HydrogenBond.modern.js';
import { MONOMER_CONST } from '../../domain/constants/monomers.modern.js';
import { MACROMOLECULES_BOND_TYPES } from './tools/types.modern.js';

var MacromoleculesConverter = function () {
  function MacromoleculesConverter() {
    _classCallCheck(this, MacromoleculesConverter);
  }
  _createClass(MacromoleculesConverter, null, [{
    key: "convertMonomerToMonomerMicromolecule",
    value: function convertMonomerToMonomerMicromolecule(monomer, struct) {
      var monomerMicromolecule = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
      var sgroupId = struct.sgroups.add(monomerMicromolecule);
      monomerMicromolecule.data.name = monomer.monomerItem.label;
      monomerMicromolecule.data.expanded = Boolean(monomer.monomerItem.expanded);
      monomerMicromolecule.id = sgroupId;
      monomerMicromolecule.pp = monomer.position;
      return monomerMicromolecule;
    }
  }, {
    key: "addMonomerAtomToStruct",
    value: function addMonomerAtomToStruct(atom, monomer, monomerMicromolecule, struct) {
      var atomClone = atom.clone();
      atomClone.pp = monomer.position.add(atom.pp);
      atomClone.sgs = new Pile([monomerMicromolecule.id]);
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
      var attachmentPointAtomId = monomer instanceof AmbiguousMonomer ? 0 : attachmentPoint === null || attachmentPoint === void 0 ? void 0 : attachmentPoint.attachmentAtom;
      return {
        globalAttachmentAtomId: isNumber(attachmentPointAtomId) && (atomIdMap === null || atomIdMap === void 0 ? void 0 : atomIdMap.get(attachmentPointAtomId)),
        attachmentAtomId: isNumber(attachmentPointAtomId) && attachmentPointAtomId,
        attachmentPointNumber: attachmentPointNumber
      };
    }
  }, {
    key: "convertMonomerAttachmentPointsToSGroupAttachmentPoints",
    value: function convertMonomerAttachmentPointsToSGroupAttachmentPoints(monomer, atomIdsMap) {
      return monomer.listOfAttachmentPoints.map(function (attachmentPointName, attachmentPointIndex) {
        var _monomer$monomerItem$2, _attachmentPoint$leav, _attachmentPoint$leav2;
        var attachmentPointNumber = getAttachmentPointNumberFromLabel(attachmentPointName);
        var attachmentPoint = (_monomer$monomerItem$2 = monomer.monomerItem.attachmentPoints) === null || _monomer$monomerItem$2 === void 0 ? void 0 : _monomer$monomerItem$2[attachmentPointIndex];
        return new SGroupAttachmentPoint(atomIdsMap ? atomIdsMap.get(attachmentPoint.attachmentAtom) : attachmentPoint.attachmentAtom, atomIdsMap ? atomIdsMap.get((_attachmentPoint$leav = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav === void 0 ? void 0 : _attachmentPoint$leav.atoms[0]) : (_attachmentPoint$leav2 = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav2 === void 0 ? void 0 : _attachmentPoint$leav2.atoms[0], undefined, attachmentPointNumber);
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
              fragment.stereoFlagPosition = new Vec2(stereoFlag.position);
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
          reStruct === null || reStruct === void 0 || reStruct.sgroups.set(monomerMicromolecule.id, new ReSGroup(monomerMicromolecule));
          var monomerAtoms = monomer instanceof AmbiguousMonomer ? monomer.monomers[0].monomerItem.struct.atoms : monomer.monomerItem.struct.atoms;
          var monomerBonds = monomer instanceof AmbiguousMonomer ? monomer.monomers[0].monomerItem.struct.bonds : monomer.monomerItem.struct.bonds;
          monomerAtoms.forEach(function (oldAtom, oldAtomId) {
            var _this$addMonomerAtomT = _this.addMonomerAtomToStruct(oldAtom, monomer, monomerMicromolecule, struct),
              atom = _this$addMonomerAtomT.atom,
              atomId = _this$addMonomerAtomT.atomId;
            atomIdsMap.set(oldAtomId, atomId);
            monomerToAtomIdMap.set(monomer, atomIdsMap);
            reStruct === null || reStruct === void 0 || reStruct.atoms.set(atomId, new ReAtom(atom));
          });
          monomerMicromolecule.addAttachmentPoints(MacromoleculesConverter.convertMonomerAttachmentPointsToSGroupAttachmentPoints(monomer, atomIdsMap) || [], false);
          struct.sGroupForest.insert(monomerMicromolecule);
          monomerBonds.forEach(function (bond) {
            var bondClone = bond.clone();
            bondClone.begin = atomIdsMap.get(bondClone.begin);
            bondClone.end = atomIdsMap.get(bondClone.end);
            var bondId = struct.bonds.add(bondClone);
            reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new ReBond(bondClone));
          });
          struct.functionalGroups.add(new FunctionalGroup(monomerMicromolecule));
        }
      });
      var conversionErrorMessage = '';
      drawingEntitiesManager.polymerBonds.forEach(function (polymerBond) {
        assert(polymerBond.secondMonomer);
        if (polymerBond instanceof HydrogenBond) {
          var _monomerToAtomIdMap$g, _monomerToAtomIdMap$g2;
          var _beginAtom = (_monomerToAtomIdMap$g = monomerToAtomIdMap.get(polymerBond.firstMonomer)) === null || _monomerToAtomIdMap$g === void 0 ? void 0 : _monomerToAtomIdMap$g.values().next().value;
          var _endAtom = (_monomerToAtomIdMap$g2 = monomerToAtomIdMap.get(polymerBond.secondMonomer)) === null || _monomerToAtomIdMap$g2 === void 0 ? void 0 : _monomerToAtomIdMap$g2.values().next().value;
          if (!isNumber(_beginAtom) || !isNumber(_endAtom)) {
            conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
            return;
          }
          var _bond = new Bond({
            type: Bond.PATTERN.TYPE.HYDROGEN,
            begin: _beginAtom,
            end: _endAtom
          });
          var _bondId = struct.bonds.add(_bond);
          reStruct === null || reStruct === void 0 || reStruct.bonds.set(_bondId, new ReBond(_bond));
          return;
        }
        var _this$findAttachmentP = _this.findAttachmentPointAtom(polymerBond, polymerBond.firstMonomer, monomerToAtomIdMap),
          beginAtom = _this$findAttachmentP.globalAttachmentAtomId,
          beginSuperatomAttachmentPointNumber = _this$findAttachmentP.attachmentPointNumber;
        var _this$findAttachmentP2 = _this.findAttachmentPointAtom(polymerBond, polymerBond.secondMonomer, monomerToAtomIdMap),
          endAtom = _this$findAttachmentP2.globalAttachmentAtomId,
          endSuperatomAttachmentPointNumber = _this$findAttachmentP2.attachmentPointNumber;
        if (!isNumber(beginAtom) || !isNumber(endAtom)) {
          conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
          return;
        }
        var bond = new Bond({
          type: polymerBond instanceof HydrogenBond ? Bond.PATTERN.TYPE.HYDROGEN : Bond.PATTERN.TYPE.SINGLE,
          begin: beginAtom,
          end: endAtom,
          beginSuperatomAttachmentPointNumber: beginSuperatomAttachmentPointNumber,
          endSuperatomAttachmentPointNumber: endSuperatomAttachmentPointNumber
        });
        var bondId = struct.bonds.add(bond);
        reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new ReBond(bond));
      });
      drawingEntitiesManager.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        var _monomerToAtomIdMap$g3;
        var _this$findAttachmentP3 = _this.findAttachmentPointAtom(monomerToAtomBond, monomerToAtomBond.monomer, monomerToAtomIdMap),
          beginAtom = _this$findAttachmentP3.globalAttachmentAtomId,
          beginSuperatomAttachmentPointNumber = _this$findAttachmentP3.attachmentPointNumber;
        var endAtom = monomerToAtomIdMap === null || monomerToAtomIdMap === void 0 || (_monomerToAtomIdMap$g3 = monomerToAtomIdMap.get(monomerToAtomBond.atom.monomer)) === null || _monomerToAtomIdMap$g3 === void 0 ? void 0 : _monomerToAtomIdMap$g3.get(monomerToAtomBond.atom.atomIdInMicroMode);
        if (!isNumber(beginAtom) || !isNumber(endAtom)) {
          conversionErrorMessage = 'There is no atom for provided attachment point. Bond between monomers was not created.';
          return;
        }
        var bond = new Bond({
          type: Bond.PATTERN.TYPE.SINGLE,
          begin: beginAtom,
          end: endAtom,
          beginSuperatomAttachmentPointNumber: beginSuperatomAttachmentPointNumber
        });
        var bondId = struct.bonds.add(bond);
        reStruct === null || reStruct === void 0 || reStruct.bonds.set(bondId, new ReBond(bond));
      });
      drawingEntitiesManager.rxnArrows.forEach(function (rxnArrow) {
        var micromoleculeRxnArrow = new RxnArrow({
          mode: rxnArrow.type,
          pos: [rxnArrow.startPosition, rxnArrow.endPosition],
          height: rxnArrow.height,
          initiallySelected: rxnArrow.initiallySelected,
          arrowId: rxnArrow.arrowId
        });
        var arrowId = struct.addRxnArrow(micromoleculeRxnArrow);
        reStruct === null || reStruct === void 0 || reStruct.rxnArrows.set(arrowId, new ReRxnArrow(micromoleculeRxnArrow));
      });
      drawingEntitiesManager.multitailArrows.forEach(function (multitailArrow) {
        var micromoleculeMultitailArrow = MultitailArrow.fromKetNode(multitailArrow.toKetNode());
        micromoleculeMultitailArrow.arrowId = multitailArrow.arrowId;
        var arrowId = struct.addMultitailArrow(micromoleculeMultitailArrow);
        reStruct === null || reStruct === void 0 || reStruct.multitailArrows.set(arrowId, new ReMultitailArrow(micromoleculeMultitailArrow));
      });
      drawingEntitiesManager.rxnPluses.forEach(function (rxnPlus) {
        var micromoleculeRxnPlus = new RxnPlus({
          pp: rxnPlus.position,
          initiallySelected: rxnPlus.initiallySelected
        });
        var rxnPlusId = struct.rxnPluses.add(micromoleculeRxnPlus);
        reStruct === null || reStruct === void 0 || reStruct.rxnPluses.set(rxnPlusId, new ReRxnPlus(micromoleculeRxnPlus));
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
      var command = new Command();
      var monomerAdditionCommand = monomerMicromolecule.monomer instanceof AmbiguousMonomer ? drawingEntitiesManager.addAmbiguousMonomer(monomerMicromolecule.monomer.variantMonomerItem, monomerMicromolecule.monomer.position) : drawingEntitiesManager.addMonomer(monomerMicromolecule.monomer.monomerItem, monomerMicromolecule.pp);
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
          MonomerType: MONOMER_CONST.CHEM,
          isMicromoleculeFragment: true
        }
      }, new Vec2(fragmentBbox.max.x - (fragmentBbox.max.x - fragmentBbox.min.x) / 2, fragmentBbox.max.y - (fragmentBbox.max.y - fragmentBbox.min.y) / 2));
    }
  }, {
    key: "getAttachmentPointLabel",
    value: function getAttachmentPointLabel(atom) {
      var attachmentPointLabel = '';
      var atomRglabel = Number(atom.rglabel);
      assert(Number.isInteger(atomRglabel));
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
            if (isNumber(atomFragmentId) && !groupedFragments[lastFragmentGroupIndex].includes(atomFragmentId)) {
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
        if (isNumber(fragmentId)) {
          attachmentPointFragmentIds.add(fragmentId);
        }
      });
      return attachmentPointFragmentIds.size > 1;
    }
  }, {
    key: "clonePartialSgroupsWithAttachmentPoints",
    value: function clonePartialSgroupsWithAttachmentPoints(struct, fragmentStruct, atomIdMap) {
      var _this3 = this;
      struct.sgroups.forEach(function (sgroup) {
        if (!_this3.shouldSplitSgroupIntoSeparateFragments(sgroup, struct) || sgroup.atoms.every(function (atomId) {
          return atomIdMap.has(atomId);
        })) {
          return;
        }
        var mappedAtomIds = sgroup.atoms.map(function (atomId) {
          return atomIdMap.get(atomId);
        }).filter(isNumber);
        if (mappedAtomIds.length === 0) {
          return;
        }
        var attachmentPoints = sgroup.getAttachmentPoints().map(function (attachmentPoint) {
          var atomId = atomIdMap.get(attachmentPoint.atomId);
          if (!isNumber(atomId)) {
            return undefined;
          }
          var leaveAtomId = isNumber(attachmentPoint.leaveAtomId) ? atomIdMap.get(attachmentPoint.leaveAtomId) : attachmentPoint.leaveAtomId;
          return new SGroupAttachmentPoint(atomId, leaveAtomId, attachmentPoint.attachmentId, attachmentPoint.attachmentPointNumber);
        }).filter(function (attachmentPoint) {
          return attachmentPoint !== undefined;
        });
        if (attachmentPoints.length === 0) {
          return;
        }
        var partialSgroup = new SGroup(sgroup.type);
        Object.keys(sgroup.data).forEach(function (field) {
          partialSgroup.data[field] = sgroup.data[field];
        });
        partialSgroup.pp = sgroup.pp ? new Vec2(sgroup.pp) : null;
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
      return _toConsumableArray(drawingEntitiesManager.atoms.values()).find(function (atom) {
        return atom.atomIdInMicroMode === atomId && (!monomer || monomer === atom.monomer);
      });
    }
  }, {
    key: "convertStructToDrawingEntities",
    value: function convertStructToDrawingEntities(struct, drawingEntitiesManager) {
      var _this4 = this;
      var sgroupToMonomer = new Map();
      var fragmentIdToMonomer = new Map();
      var command = new Command();
      struct.sgroups.forEach(function (sgroup) {
        if (sgroup instanceof MonomerMicromolecule) {
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
        var localAtomIdToGlobalAtomId = invert(atomIdMapObject);
        var atomsMap = new Map();
        _fragment.forEach(function (fragmentId) {
          fragmentIdToMonomer.set(fragmentId, monomer);
          fragmentIdToAtomIdMap.set(fragmentId, atomIdMap);
        });
        command.merge(monomerAddCommand);
        fragmentStruct.sgroups.forEach(function (sgroup, sgroupId) {
          command.merge(drawingEntitiesManager.addSGroup(sgroup, monomer, sgroupId));
        });
        if (monomer.monomerItem.props.isMicromoleculeFragment && !isMonomerSgroupWithAttachmentPoints(monomer)) {
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
          monomer.monomerItem.struct.frags.forEach(function (fragment) {
            if (fragment !== null && fragment !== void 0 && fragment.enhancedStereoFlag) {
              var stereoFlagPosition = fragment.stereoFlagPosition || Fragment.getDefaultStereoFlagPosition(monomer.monomerItem.struct, 0);
              if (stereoFlagPosition) {
                command.merge(drawingEntitiesManager.addStereoFlag(stereoFlagPosition, fragment.enhancedStereoFlag, monomer));
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
        var isConnectionBetweenMonomerAndMolecule = beginAtomSgroup instanceof MonomerMicromolecule && !(endAtomSgroup instanceof MonomerMicromolecule) && !(endAtomSgroup !== null && endAtomSgroup !== void 0 && endAtomSgroup.isSuperatomWithoutLabel) || endAtomSgroup instanceof MonomerMicromolecule && !(beginAtomSgroup instanceof MonomerMicromolecule) && !(beginAtomSgroup !== null && beginAtomSgroup !== void 0 && beginAtomSgroup.isSuperatomWithoutLabel);
        if (!isConnectionBetweenMonomerAndMolecule) {
          return;
        }
        var moleculeAtomId = beginAtomSgroup instanceof MonomerMicromolecule ? bond.end : bond.begin;
        var moleculeAtom = beginAtomSgroup instanceof MonomerMicromolecule ? endAtom : beginAtom;
        var monomerSgroup = beginAtomSgroup instanceof MonomerMicromolecule ? beginAtomSgroup : endAtomSgroup;
        if (!moleculeAtom || !monomerSgroup) {
          return;
        }
        var atomsMap = fragmentIdToAtomIdMap.get(moleculeAtom.fragment);
        var atomIdInMicromolecules = atomsMap === null || atomsMap === void 0 ? void 0 : atomsMap.get(moleculeAtomId);
        var monomer = sgroupToMonomer.get(monomerSgroup);
        if (!isNumber(atomIdInMicromolecules) || !monomer) {
          return;
        }
        var atomToConnect = MacromoleculesConverter.findAtomByMicromoleculeAtomId(drawingEntitiesManager, atomIdInMicromolecules, globalAtomIdToMonomerMap.get(moleculeAtomId));
        var attachmentPointNumber = (_bond$beginSuperatomA = bond.beginSuperatomAttachmentPointNumber) !== null && _bond$beginSuperatomA !== void 0 ? _bond$beginSuperatomA : bond.endSuperatomAttachmentPointNumber;
        if (!atomToConnect || !isNumber(attachmentPointNumber)) {
          return;
        }
        command.merge(drawingEntitiesManager.addMonomerToAtomBond(monomer, atomToConnect, getAttachmentPointLabel(attachmentPointNumber)));
      });
      struct.bonds.forEach(function (bond) {
        var beginAtom = struct.atoms.get(bond.begin);
        var endAtom = struct.atoms.get(bond.end);
        if (!beginAtom || !endAtom) {
          return;
        }
        var beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
        var beginAtomSgroupAttachmentPoints = beginAtomSgroup === null || beginAtomSgroup === void 0 ? void 0 : beginAtomSgroup.getAttachmentPoints();
        var endAtomSgroup = struct.getGroupFromAtomId(bond.end);
        var endAtomSgroupAttachmentPoints = endAtomSgroup === null || endAtomSgroup === void 0 ? void 0 : endAtomSgroup.getAttachmentPoints();
        var beginAtomAttachmentPointNumber = isNumber(bond.beginSuperatomAttachmentPointNumber) ? bond.beginSuperatomAttachmentPointNumber : beginAtomSgroupAttachmentPoints === null || beginAtomSgroupAttachmentPoints === void 0 ? void 0 : beginAtomSgroupAttachmentPoints.findIndex(function (sgroupAttachmentPoint) {
          return sgroupAttachmentPoint.atomId === bond.begin && !superatomAttachmentPointToBond.has(sgroupAttachmentPoint);
        });
        var beginAtomAttachmentPoint = isNumber(beginAtomAttachmentPointNumber) && (beginAtomSgroupAttachmentPoints === null || beginAtomSgroupAttachmentPoints === void 0 ? void 0 : beginAtomSgroupAttachmentPoints.find(function (attachmentPoint) {
          return attachmentPoint.attachmentPointNumber === beginAtomAttachmentPointNumber;
        }));
        var endAtomAttachmentPointNumber = isNumber(bond.endSuperatomAttachmentPointNumber) ? bond.endSuperatomAttachmentPointNumber : endAtomSgroupAttachmentPoints === null || endAtomSgroupAttachmentPoints === void 0 ? void 0 : endAtomSgroupAttachmentPoints.findIndex(function (sgroupAttachmentPoint) {
          return sgroupAttachmentPoint.atomId === bond.end && !superatomAttachmentPointToBond.has(sgroupAttachmentPoint);
        });
        var endAtomAttachmentPoint = isNumber(endAtomAttachmentPointNumber) && (endAtomSgroupAttachmentPoints === null || endAtomSgroupAttachmentPoints === void 0 ? void 0 : endAtomSgroupAttachmentPoints.find(function (attachmentPoint) {
          return attachmentPoint.attachmentPointNumber === endAtomAttachmentPointNumber;
        }));
        if (beginAtomAttachmentPoint) {
          superatomAttachmentPointToBond.set(beginAtomAttachmentPoint, bond);
        }
        if (endAtomAttachmentPoint) {
          superatomAttachmentPointToBond.set(endAtomAttachmentPoint, bond);
        }
        if (endAtomSgroup !== beginAtomSgroup && isNumber(beginAtomAttachmentPointNumber) && isNumber(endAtomAttachmentPointNumber) && beginAtomSgroup && endAtomSgroup && (beginAtomSgroup instanceof MonomerMicromolecule || beginAtomSgroup.isSuperatomWithoutLabel) && (endAtomSgroup instanceof MonomerMicromolecule || endAtomSgroup.isSuperatomWithoutLabel)) {
          var firstMonomer = beginAtomSgroup instanceof MonomerMicromolecule ? sgroupToMonomer.get(beginAtomSgroup) : fragmentIdToMonomer.get(beginAtom.fragment);
          var secondMonomer = endAtomSgroup instanceof MonomerMicromolecule ? sgroupToMonomer.get(endAtomSgroup) : fragmentIdToMonomer.get(endAtom.fragment);
          assert(firstMonomer);
          assert(secondMonomer);
          command.merge(drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, getAttachmentPointLabel(beginAtomAttachmentPointNumber), getAttachmentPointLabel(endAtomAttachmentPointNumber), bond.type === Bond.PATTERN.TYPE.HYDROGEN ? MACROMOLECULES_BOND_TYPES.HYDROGEN : MACROMOLECULES_BOND_TYPES.SINGLE));
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

export { MacromoleculesConverter };
//# sourceMappingURL=MacromoleculesConverter.modern.js.map
