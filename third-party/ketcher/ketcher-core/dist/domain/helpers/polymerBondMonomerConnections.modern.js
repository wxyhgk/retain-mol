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
import _typeof from '@babel/runtime/helpers/typeof';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { MonomerToAtomBond } from '../entities/MonomerToAtomBond.modern.js';

var getMonomerClass = function getMonomerClass(monomer) {
  var _monomer$monomerItem$, _monomer$monomerItem;
  return (
    (_monomer$monomerItem$ = monomer === null || monomer === void 0 || (_monomer$monomerItem = monomer.monomerItem) === null || _monomer$monomerItem === void 0 || (_monomer$monomerItem = _monomer$monomerItem.props) === null || _monomer$monomerItem === void 0 ? void 0 : _monomer$monomerItem.MonomerClass) !== null && _monomer$monomerItem$ !== void 0 ? _monomer$monomerItem$ : monomer === null || monomer === void 0 ? void 0 : monomer.monomerClass
  );
};
var isPolymerBondLike = function isPolymerBondLike(bond) {
  return Boolean(bond && _typeof(bond) === 'object' && 'getAnotherMonomer' in bond && !(bond instanceof MonomerToAtomBond));
};
var isRnaBaseOrAmbiguousRnaBase = function isRnaBaseOrAmbiguousRnaBase(monomer) {
  return getMonomerClass(monomer) === 'Base';
};
var isSugarMonomer = function isSugarMonomer(monomer) {
  return getMonomerClass(monomer) === 'Sugar';
};
var getSugarFromRnaBase = function getSugarFromRnaBase(monomer) {
  if (!monomer || !isRnaBaseOrAmbiguousRnaBase(monomer)) {
    return undefined;
  }
  var r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  var r1ConnectedMonomer = isPolymerBondLike(r1PolymerBond) ? r1PolymerBond.getAnotherMonomer(monomer) : undefined;
  if (!r1ConnectedMonomer) {
    return undefined;
  }
  var r3PolymerBond = r1ConnectedMonomer.attachmentPointsToBonds.R3;
  var r3ConnectedMonomer = isPolymerBondLike(r3PolymerBond) ? r3PolymerBond.getAnotherMonomer(r1ConnectedMonomer) : undefined;
  return isSugarMonomer(r1ConnectedMonomer) && r3ConnectedMonomer === monomer ? r1ConnectedMonomer : undefined;
};
var isMonomerConnectedToR2RnaBase = function isMonomerConnectedToR2RnaBase(monomer) {
  if (!monomer) {
    return false;
  }
  var r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  if (r1PolymerBond instanceof MonomerToAtomBond) {
    return false;
  }
  var r1ConnectedMonomer = r1PolymerBond === null || r1PolymerBond === void 0 ? void 0 : r1PolymerBond.getAnotherMonomer(monomer);
  if (!r1ConnectedMonomer) {
    return false;
  }
  var r2PolymerBond = r1ConnectedMonomer.attachmentPointsToBonds.R2;
  return Boolean(isRnaBaseOrAmbiguousRnaBase(r1ConnectedMonomer) && getSugarFromRnaBase(r1ConnectedMonomer) && isPolymerBondLike(r2PolymerBond) && r2PolymerBond.getAnotherMonomer(r1ConnectedMonomer) === monomer);
};
var isBondBetweenSugarAndBaseOfRna = function isBondBetweenSugarAndBaseOfRna(polymerBond) {
  return polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R1 && isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) && polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R3 && isSugarMonomer(polymerBond.secondMonomer) || polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R3 && isSugarMonomer(polymerBond.firstMonomer) && polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R1 && isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer);
};

export { isBondBetweenSugarAndBaseOfRna, isMonomerConnectedToR2RnaBase, isRnaBaseOrAmbiguousRnaBase };
//# sourceMappingURL=polymerBondMonomerConnections.modern.js.map
