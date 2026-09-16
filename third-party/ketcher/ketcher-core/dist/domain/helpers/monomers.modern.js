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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { HydrogenBond } from '../entities/HydrogenBond.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { PolymerBond } from '../entities/PolymerBond.modern.js';
import '../../application/formatters/types/ket.modern.js';
import { MonomerToAtomBond } from '../entities/MonomerToAtomBond.modern.js';
import { KetMonomerClass } from '../constants/monomers.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var isAmbiguousMonomerEntity = function isAmbiguousMonomerEntity(monomer) {
  var _ambiguousMonomer$mon;
  var ambiguousMonomer = monomer;
  return Boolean((ambiguousMonomer === null || ambiguousMonomer === void 0 || (_ambiguousMonomer$mon = ambiguousMonomer.monomerItem) === null || _ambiguousMonomer$mon === void 0 ? void 0 : _ambiguousMonomer$mon.isAmbiguous) && (ambiguousMonomer === null || ambiguousMonomer === void 0 ? void 0 : ambiguousMonomer.monomerClass));
};
var getMonomerClass = function getMonomerClass(monomer) {
  var _monomerLike$monomerI, _monomerLike$monomerI2;
  var monomerLike = monomer;
  return (_monomerLike$monomerI = monomerLike === null || monomerLike === void 0 || (_monomerLike$monomerI2 = monomerLike.monomerItem) === null || _monomerLike$monomerI2 === void 0 || (_monomerLike$monomerI2 = _monomerLike$monomerI2.props) === null || _monomerLike$monomerI2 === void 0 ? void 0 : _monomerLike$monomerI2.MonomerClass) !== null && _monomerLike$monomerI !== void 0 ? _monomerLike$monomerI : monomerLike === null || monomerLike === void 0 ? void 0 : monomerLike.monomerClass;
};
var isMonomerOfClass = function isMonomerOfClass(monomer, monomerClass) {
  if (getMonomerClass(monomer) === monomerClass) return true;
  if (monomerClass === KetMonomerClass.Sugar) return Boolean(monomer === null || monomer === void 0 ? void 0 : monomer.isSugar);
  if (monomerClass === KetMonomerClass.Phosphate) return Boolean(monomer === null || monomer === void 0 ? void 0 : monomer.isPhosphate);
  return false;
};
var CHAIN_MONOMER_TYPE_TO_CLASS = {
  Peptide: KetMonomerClass.AminoAcid,
  Phosphate: KetMonomerClass.Phosphate,
  Sugar: KetMonomerClass.Sugar,
  UnsplitNucleotide: KetMonomerClass.RNA
};
var isMonomerClassCompatible = function isMonomerClassCompatible(monomer, monomerType) {
  switch (monomerType) {
    case 'Peptide':
      return monomer.monomerClass === KetMonomerClass.AminoAcid;
    case 'Phosphate':
      return monomer.monomerClass === KetMonomerClass.Phosphate;
    case 'Sugar':
      return monomer.monomerClass === KetMonomerClass.Sugar;
    case 'UnsplitNucleotide':
      return monomer.monomerClass === KetMonomerClass.RNA;
    default:
      return false;
  }
};
function getMonomerUniqueKey(monomer) {
  return "".concat(monomer.props.MonomerName, "___").concat(monomer.props.Name);
}
function checkIsR2R1Connection(monomer, nextMonomer) {
  var r1PolymerBond = nextMonomer.attachmentPointsToBonds.R1;
  return r1PolymerBond instanceof PolymerBond && (r1PolymerBond === null || r1PolymerBond === void 0 ? void 0 : r1PolymerBond.getAnotherMonomer(nextMonomer)) === monomer;
}
function isR2R1ConnectionFromRnaBase(polymerBond) {
  var _polymerBond$secondMo;
  var firstMonomerAttachmentPoint = polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
  var secondMonomerAttachmentPoint = (_polymerBond$secondMo = polymerBond.secondMonomer) === null || _polymerBond$secondMo === void 0 ? void 0 : _polymerBond$secondMo.getAttachmentPointByBond(polymerBond);
  return isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) && firstMonomerAttachmentPoint === AttachmentPointName.R2 && secondMonomerAttachmentPoint === AttachmentPointName.R1 || isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer) && secondMonomerAttachmentPoint === AttachmentPointName.R2 && firstMonomerAttachmentPoint === AttachmentPointName.R1;
}
function isMonomerConnectedToR2RnaBase(monomer) {
  if (!monomer) {
    return false;
  }
  var R1PolymerBond = monomer.attachmentPointsToBonds.R1;
  if (R1PolymerBond instanceof MonomerToAtomBond) {
    return false;
  }
  var R1ConnectedMonomer = R1PolymerBond === null || R1PolymerBond === void 0 ? void 0 : R1PolymerBond.getAnotherMonomer(monomer);
  var r2PolymerBond = R1ConnectedMonomer === null || R1ConnectedMonomer === void 0 ? void 0 : R1ConnectedMonomer.attachmentPointsToBonds.R2;
  return isRnaBaseOrAmbiguousRnaBase(R1ConnectedMonomer) && getSugarFromRnaBase(R1ConnectedMonomer) && r2PolymerBond instanceof PolymerBond && (r2PolymerBond === null || r2PolymerBond === void 0 ? void 0 : r2PolymerBond.getAnotherMonomer(R1ConnectedMonomer)) === monomer;
}
function isChemMonomer(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.CHEM);
}
function isLinearChem(monomer) {
  if (!monomer) {
    return false;
  }
  return isChemMonomer(monomer) && monomer.usedAttachmentPointsNamesList.length <= 2;
}
function getOrientedChemNeighbors(chem) {
  var previous;
  var next;
  var nextViaChemBackbone = false;
  var previousViaChemBackbone = false;
  chem.usedAttachmentPointsNamesList.forEach(function (attachmentPointName) {
    var bond = chem.attachmentPointsToBonds[attachmentPointName];
    if (!(bond instanceof PolymerBond)) {
      return;
    }
    var neighbor = bond.getAnotherMonomer(chem);
    if (!neighbor) {
      return;
    }
    var neighborAttachmentPoint = neighbor.getAttachmentPointByBond(bond);
    var isChemBackboneR1 = attachmentPointName === AttachmentPointName.R1;
    var isChemBackboneR2 = attachmentPointName === AttachmentPointName.R2;
    if (neighborAttachmentPoint === AttachmentPointName.R1) {
      if (!next || isChemBackboneR2 && !nextViaChemBackbone) {
        next = neighbor;
        nextViaChemBackbone = isChemBackboneR2;
      }
    } else if (neighborAttachmentPoint === AttachmentPointName.R2) {
      if (!previous || isChemBackboneR1 && !previousViaChemBackbone) {
        previous = neighbor;
        previousViaChemBackbone = isChemBackboneR1;
      }
    }
  });
  return {
    previous: previous,
    next: next
  };
}
function getPreviousMonomerInChain(monomer) {
  if (isLinearChem(monomer)) {
    return getOrientedChemNeighbors(monomer).previous;
  }
  var r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  var previousMonomer = r1PolymerBond instanceof PolymerBond ? r1PolymerBond === null || r1PolymerBond === void 0 ? void 0 : r1PolymerBond.getAnotherMonomer(monomer) : undefined;
  if (!previousMonomer || !(r1PolymerBond instanceof PolymerBond)) {
    return;
  }
  if (isLinearChem(previousMonomer) && getOrientedChemNeighbors(previousMonomer).next === monomer) {
    return previousMonomer;
  }
  return previousMonomer && previousMonomer.getAttachmentPointByBond(r1PolymerBond) === AttachmentPointName.R2 ? previousMonomer : undefined;
}
function getNextMonomerInChain(monomer, firstMonomer) {
  var _r2PolymerBond$getAno;
  if (!monomer) return;
  if (isLinearChem(monomer)) {
    var _nextMonomer = getOrientedChemNeighbors(monomer).next;
    if (!_nextMonomer || _nextMonomer === firstMonomer || isMonomerConnectedToR2RnaBase(_nextMonomer)) {
      return;
    }
    return _nextMonomer;
  }
  var r2PolymerBond = monomer.attachmentPointsToBonds.R2;
  var nextMonomer = r2PolymerBond instanceof PolymerBond ? r2PolymerBond === null || r2PolymerBond === void 0 || (_r2PolymerBond$getAno = r2PolymerBond.getAnotherMonomer) === null || _r2PolymerBond$getAno === void 0 ? void 0 : _r2PolymerBond$getAno.call(r2PolymerBond, monomer) : undefined;
  if (!nextMonomer || nextMonomer === firstMonomer && r2PolymerBond || isMonomerConnectedToR2RnaBase(nextMonomer)) return;
  if (isLinearChem(nextMonomer) && getOrientedChemNeighbors(nextMonomer).previous === monomer) {
    return nextMonomer;
  }
  return r2PolymerBond && (nextMonomer === null || nextMonomer === void 0 ? void 0 : nextMonomer.getAttachmentPointByBond(r2PolymerBond)) === AttachmentPointName.R1 ? nextMonomer : undefined;
}
function isValidRnaEnumerationStartMonomer(monomer) {
  return !!monomer && !getPreviousMonomerInChain(monomer);
}
function getRnaBaseFromSugar(monomer) {
  if (!monomer || !isMonomerOfClass(monomer, KetMonomerClass.Sugar)) return;
  var r3PolymerBond = monomer.attachmentPointsToBonds.R3;
  var r3ConnectedMonomer = r3PolymerBond instanceof PolymerBond ? r3PolymerBond === null || r3PolymerBond === void 0 ? void 0 : r3PolymerBond.getAnotherMonomer(monomer) : undefined;
  if (!r3ConnectedMonomer) {
    return;
  }
  var r1PolymerBondOfConnectedMonomer = r3ConnectedMonomer === null || r3ConnectedMonomer === void 0 ? void 0 : r3ConnectedMonomer.attachmentPointsToBonds.R1;
  var r1ConnectedMonomer = r1PolymerBondOfConnectedMonomer instanceof PolymerBond ? r1PolymerBondOfConnectedMonomer === null || r1PolymerBondOfConnectedMonomer === void 0 ? void 0 : r1PolymerBondOfConnectedMonomer.getAnotherMonomer(r3ConnectedMonomer) : undefined;
  return isRnaBaseOrAmbiguousRnaBase(r3ConnectedMonomer) && r1ConnectedMonomer === monomer ? r3ConnectedMonomer : undefined;
}
function getSugarFromRnaBase(monomer) {
  if (!monomer || !isRnaBaseOrAmbiguousRnaBase(monomer)) return;
  var r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  var r1ConnectedMonomer = r1PolymerBond instanceof PolymerBond ? r1PolymerBond === null || r1PolymerBond === void 0 ? void 0 : r1PolymerBond.getAnotherMonomer(monomer) : undefined;
  if (!r1ConnectedMonomer) {
    return;
  }
  var r3PolymerBondOfConnectedMonomer = r1ConnectedMonomer === null || r1ConnectedMonomer === void 0 ? void 0 : r1ConnectedMonomer.attachmentPointsToBonds.R3;
  var r3ConnectedMonomer = r3PolymerBondOfConnectedMonomer instanceof PolymerBond ? r3PolymerBondOfConnectedMonomer === null || r3PolymerBondOfConnectedMonomer === void 0 ? void 0 : r3PolymerBondOfConnectedMonomer.getAnotherMonomer(r1ConnectedMonomer) : undefined;
  return isMonomerOfClass(r1ConnectedMonomer, KetMonomerClass.Sugar) && r3ConnectedMonomer === monomer ? r1ConnectedMonomer : undefined;
}
function isBondBetweenSugarAndBaseOfRna(polymerBond) {
  return polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R1 && isRnaBaseOrAmbiguousRnaBase(polymerBond.firstMonomer) && polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R3 && isMonomerOfClass(polymerBond.secondMonomer, KetMonomerClass.Sugar) || polymerBond.firstMonomerAttachmentPoint === AttachmentPointName.R3 && isMonomerOfClass(polymerBond.firstMonomer, KetMonomerClass.Sugar) && polymerBond.secondMonomerAttachmentPoint === AttachmentPointName.R1 && isRnaBaseOrAmbiguousRnaBase(polymerBond.secondMonomer);
}
function getPhosphateFromSugar(monomer) {
  if (!monomer) return;
  var nextMonomerInChain = getNextMonomerInChain(monomer);
  return isMonomerOfClass(nextMonomerInChain, KetMonomerClass.Phosphate) ? nextMonomerInChain : undefined;
}
function isMonomerBeginningOfChain(monomer, MonomerTypes) {
  var r1PolymerBond = monomer.attachmentPointsToBonds.R1;
  if (r1PolymerBond instanceof MonomerToAtomBond) {
    return true;
  }
  var previousMonomer = r1PolymerBond === null || r1PolymerBond === void 0 ? void 0 : r1PolymerBond.getAnotherMonomer(monomer);
  var isPreviousMonomerPartOfChain = previousMonomer && !MonomerTypes.some(function (MonomerType) {
    return isMonomerOfClass(previousMonomer, CHAIN_MONOMER_TYPE_TO_CLASS[MonomerType]) || isAmbiguousMonomerEntity(previousMonomer) && isMonomerClassCompatible(previousMonomer, MonomerType);
  });
  var previousConnectionNotR2 = r1PolymerBond && (previousMonomer === null || previousMonomer === void 0 ? void 0 : previousMonomer.getAttachmentPointByBond(r1PolymerBond)) !== 'R2';
  return (monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) || !monomer.hasAttachmentPoint(AttachmentPointName.R1)) && (monomer.hasBonds || isMonomerOfClass(monomer, KetMonomerClass.RNA)) || previousConnectionNotR2 || isPreviousMonomerPartOfChain;
}
function isValidNucleotide(sugar, firstMonomerInCyclicChain) {
  if (!getRnaBaseFromSugar(sugar)) {
    return false;
  }
  var phosphate = getPhosphateFromSugar(sugar);
  if (!phosphate || phosphate === firstMonomerInCyclicChain) {
    return false;
  }
  var nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);
  return !!nextMonomerAfterPhosphate;
}
function isValidNucleoside(sugar, firstMonomerInCyclicChain) {
  if (!getRnaBaseFromSugar(sugar)) {
    return false;
  }
  var phosphate = getPhosphateFromSugar(sugar);
  if (!phosphate || phosphate === firstMonomerInCyclicChain) {
    return true;
  }
  var nextMonomerAfterPhosphate = getNextMonomerInChain(phosphate);
  return !nextMonomerAfterPhosphate;
}
var isRnaBaseVariantMonomer = function isRnaBaseVariantMonomer(monomer) {
  return monomer.monomerClass === KetMonomerClass.Base;
};
function isAmbiguousMonomerLibraryItem(monomer) {
  return Boolean(monomer && monomer.isAmbiguous);
}
var isLibraryItemRnaPreset = function isLibraryItemRnaPreset(item) {
  return 'sugar' in item;
};
var libraryItemHasR1AttachmentPoint = function libraryItemHasR1AttachmentPoint(libraryItem) {
  var attachmentPointName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : AttachmentPointName.R1;
  if (isLibraryItemRnaPreset(libraryItem)) {
    var _libraryItem$sugar;
    return Boolean((_libraryItem$sugar = libraryItem.sugar) === null || _libraryItem$sugar === void 0 || (_libraryItem$sugar = _libraryItem$sugar.props) === null || _libraryItem$sugar === void 0 || (_libraryItem$sugar = _libraryItem$sugar.MonomerCaps) === null || _libraryItem$sugar === void 0 ? void 0 : _libraryItem$sugar[attachmentPointName]);
  } else if (isAmbiguousMonomerLibraryItem(libraryItem)) {
    return libraryItem.monomers.every(function (monomer) {
      return monomer.isAttachmentPointExistAndFree(AttachmentPointName[attachmentPointName]);
    });
  } else {
    var _libraryItem$props$Mo;
    return (_libraryItem$props$Mo = libraryItem.props.MonomerCaps) === null || _libraryItem$props$Mo === void 0 ? void 0 : _libraryItem$props$Mo[attachmentPointName];
  }
};
function isPeptideOrAmbiguousPeptide(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.AminoAcid) || isAmbiguousMonomerEntity(monomer) && monomer.monomerClass === KetMonomerClass.AminoAcid;
}
function isRnaBaseOrAmbiguousRnaBase(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.Base) || isAmbiguousMonomerEntity(monomer) && monomer.monomerClass === KetMonomerClass.Base;
}
function isPhosphateOrAmbiguousPhosphate(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.Phosphate) || isAmbiguousMonomerEntity(monomer) && monomer.monomerClass === KetMonomerClass.Phosphate;
}
function isSugarOrAmbiguousSugar(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.Sugar) || isAmbiguousMonomerEntity(monomer) && monomer.monomerClass === KetMonomerClass.Sugar;
}
function isRnaBaseApplicableForAntisense(monomer) {
  return isMonomerOfClass(monomer, KetMonomerClass.RNA) || isMonomerOfClass(monomer, KetMonomerClass.DNA) || isRnaBaseOrAmbiguousRnaBase(monomer) && Boolean(getSugarFromRnaBase(monomer));
}
function getAllConnectedMonomersRecursively(monomer) {
  var stack = [monomer];
  var visited = new Set();
  var connectedMonomers = [];
  var _loop = function _loop() {
    var currentMonomer = stack.pop();
    if (!currentMonomer || visited.has(currentMonomer)) {
      return 1;
    }
    visited.add(currentMonomer);
    connectedMonomers.push(currentMonomer);
    currentMonomer.forEachBond(function (bond) {
      if (bond instanceof PolymerBond || bond instanceof HydrogenBond) {
        var anotherMonomer = bond.getAnotherMonomer(currentMonomer);
        if (anotherMonomer && !visited.has(anotherMonomer)) {
          stack.push(anotherMonomer);
        }
      }
    });
  };
  while (stack.length > 0) {
    if (_loop()) continue;
  }
  return connectedMonomers;
}
var canModifyAminoAcid = function canModifyAminoAcid(monomer, modificationMonomerLibraryItem) {
  var _modificationMonomerL, _modificationMonomerL2;
  return (monomer.isAttachmentPointExistAndFree(AttachmentPointName.R1) || ((_modificationMonomerL = modificationMonomerLibraryItem.props.MonomerCaps) === null || _modificationMonomerL === void 0 ? void 0 : _modificationMonomerL.R1)) && (monomer.isAttachmentPointExistAndFree(AttachmentPointName.R2) || ((_modificationMonomerL2 = modificationMonomerLibraryItem.props.MonomerCaps) === null || _modificationMonomerL2 === void 0 ? void 0 : _modificationMonomerL2.R2));
};
var getAminoAcidsToModify = function getAminoAcidsToModify(monomers, modificationType, monomersLibrary) {
  var naturalAnalogueToModifiedMonomerItem = new Map();
  var aminoAcidsToModify = new Map();
  monomersLibrary.forEach(function (libraryItem) {
    var _libraryItem$props;
    if (!((_libraryItem$props = libraryItem.props) !== null && _libraryItem$props !== void 0 && (_libraryItem$props = _libraryItem$props.modificationTypes) !== null && _libraryItem$props !== void 0 && _libraryItem$props.includes(modificationType))) {
      return;
    }
    var monomerNaturalAnalogCode = libraryItem.props.MonomerNaturalAnalogCode;
    if (monomerNaturalAnalogCode) {
      naturalAnalogueToModifiedMonomerItem.set(monomerNaturalAnalogCode, libraryItem);
    }
  });
  monomers.forEach(function (monomer) {
    var monomerNaturalAnalogCode = monomer.monomerItem.props.MonomerNaturalAnalogCode;
    var modifiedMonomerItem = naturalAnalogueToModifiedMonomerItem.get(monomerNaturalAnalogCode);
    if (modifiedMonomerItem && monomer.label !== modifiedMonomerItem.label && canModifyAminoAcid(monomer, modifiedMonomerItem)) {
      aminoAcidsToModify.set(monomer, modifiedMonomerItem);
    }
  });
  return aminoAcidsToModify;
};
var isHelmCompatible = function isHelmCompatible(monomers, monomersLibrary) {
  return monomers.map(function (monomer) {
    return monomersLibrary.find(function (libraryMonomer) {
      var _libraryMonomer$props;
      return isAmbiguousMonomerLibraryItem(libraryMonomer) ? libraryMonomer.id === monomer.monomerItem.props.id : ((_libraryMonomer$props = libraryMonomer.props) === null || _libraryMonomer$props === void 0 ? void 0 : _libraryMonomer$props.id) === monomer.monomerItem.props.id;
    });
  }).every(function (monomer) {
    return Boolean(monomer === null || monomer === void 0 ? void 0 : monomer.props.aliasHELM);
  });
};
var normalizeMonomerAtomsPositions = function normalizeMonomerAtomsPositions(atoms) {
  var bbox = {
    x: 99999,
    y: -99999,
    x2: -9999,
    y2: 9999
  };
  atoms.forEach(function (atom) {
    if (atom.location[0] < bbox.x) {
      bbox.x = atom.location[0];
    }
    if (atom.location[0] > bbox.x2) {
      bbox.x2 = atom.location[0];
    }
    if (atom.location[1] > bbox.y) {
      bbox.y = atom.location[1];
    }
    if (atom.location[1] < bbox.y2) {
      bbox.y2 = atom.location[1];
    }
  });
  var center = {
    x: (bbox.x2 - bbox.x) / 2,
    y: (bbox.y2 - bbox.y) / 2
  };
  return atoms.map(function (atom) {
    return _objectSpread(_objectSpread({}, atom), {}, {
      location: [Number((atom.location[0] - bbox.x - center.x).toFixed(3)), Number((atom.location[1] - bbox.y - center.y).toFixed(3)), atom.location[2]]
    });
  });
};

export { canModifyAminoAcid, checkIsR2R1Connection, getAllConnectedMonomersRecursively, getAminoAcidsToModify, getMonomerUniqueKey, getNextMonomerInChain, getPhosphateFromSugar, getPreviousMonomerInChain, getRnaBaseFromSugar, getSugarFromRnaBase, isAmbiguousMonomerLibraryItem, isBondBetweenSugarAndBaseOfRna, isChemMonomer, isHelmCompatible, isLibraryItemRnaPreset, isLinearChem, isMonomerBeginningOfChain, isMonomerConnectedToR2RnaBase, isPeptideOrAmbiguousPeptide, isPhosphateOrAmbiguousPhosphate, isR2R1ConnectionFromRnaBase, isRnaBaseApplicableForAntisense, isRnaBaseOrAmbiguousRnaBase, isRnaBaseVariantMonomer, isSugarOrAmbiguousSugar, isValidNucleoside, isValidNucleotide, isValidRnaEnumerationStartMonomer, libraryItemHasR1AttachmentPoint, normalizeMonomerAtomsPositions };
//# sourceMappingURL=monomers.modern.js.map
