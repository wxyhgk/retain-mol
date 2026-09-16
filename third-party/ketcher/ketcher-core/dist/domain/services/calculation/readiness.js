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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var elements = require('../../constants/elements.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

var TWO_DIMENSIONAL_Z_TOLERANCE_ANGSTROM = 1e-8;
function atomicNumberFromElement(element) {
  var _Elements$get$number, _Elements$get;
  if (element === 'D' || element === 'T') {
    return 1;
  }
  return (_Elements$get$number = (_Elements$get = elements.Elements.get(element)) === null || _Elements$get === void 0 ? void 0 : _Elements$get.number) !== null && _Elements$get$number !== void 0 ? _Elements$get$number : null;
}
function atomReference(atom) {
  return atom.sourceAtomRef;
}
function uniqueAtomReferences(atoms) {
  return atoms.map(atomReference);
}
function inferFormalCharge(atoms) {
  var formalCharges = atoms.map(function (_ref) {
    var formalCharge = _ref.formalCharge;
    return formalCharge;
  });
  if (!formalCharges.every(Number.isFinite)) {
    return null;
  }
  var total = formalCharges.reduce(function (sum, charge) {
    return sum + charge;
  }, 0);
  return Number.isInteger(total) ? total : null;
}
function validateCalculationReadiness(snapshot) {
  var _snapshot$atoms, _snapshot$provenance, _snapshot$provenance2, _snapshot$fragments$l, _snapshot$fragments;
  var issues = [];
  var atoms = (_snapshot$atoms = snapshot.atoms) !== null && _snapshot$atoms !== void 0 ? _snapshot$atoms : [];
  if (atoms.length === 0) {
    issues.push({
      code: 'EMPTY_STRUCTURE',
      severity: 'error',
      message: 'The calculation snapshot contains no atoms.',
      atomRefs: []
    });
  }
  var missingCoordinateAtoms = [];
  var nonFiniteCoordinateAtoms = [];
  var finiteCoordinates = [];
  atoms.forEach(function (atom) {
    var coordinates = atom.coordinatesAngstrom;
    if (!coordinates || coordinates.length < 3 || coordinates.some(function (coordinate) {
      return coordinate === null || coordinate === undefined;
    })) {
      missingCoordinateAtoms.push(atom);
      return;
    }
    if (!coordinates.every(Number.isFinite)) {
      nonFiniteCoordinateAtoms.push(atom);
      return;
    }
    finiteCoordinates.push(coordinates);
  });
  if (missingCoordinateAtoms.length > 0) {
    issues.push({
      code: 'MISSING_COORDINATES',
      severity: 'error',
      message: 'Some atoms do not have complete x, y, and z coordinates.',
      atomRefs: uniqueAtomReferences(missingCoordinateAtoms)
    });
  }
  if (nonFiniteCoordinateAtoms.length > 0) {
    issues.push({
      code: 'NON_FINITE_COORDINATES',
      severity: 'error',
      message: 'Some atom coordinates contain NaN or an infinite value.',
      atomRefs: uniqueAtomReferences(nonFiniteCoordinateAtoms)
    });
  }
  if (atoms.length > 0 && finiteCoordinates.length === atoms.length && finiteCoordinates.every(function (_ref2) {
    var _ref3 = _slicedToArray__default["default"](_ref2, 3),
      z = _ref3[2];
    return Math.abs(z - finiteCoordinates[0][2]) <= TWO_DIMENSIONAL_Z_TOLERANCE_ANGSTROM;
  })) {
    issues.push({
      code: 'GEOMETRY_APPEARS_TWO_DIMENSIONAL',
      severity: 'warning',
      message: 'All atoms lie in one z-plane; confirm that the geometry is intentionally three-dimensional before calculation.',
      atomRefs: uniqueAtomReferences(atoms)
    });
  }
  var unknownAtomicNumberAtoms = [];
  var mismatchedAtomicNumberAtoms = [];
  var atomicNumbers = [];
  atoms.forEach(function (atom) {
    var tableAtomicNumber = atomicNumberFromElement(atom.element);
    var suppliedAtomicNumber = atom.atomicNumber;
    if (suppliedAtomicNumber === null) {
      if (tableAtomicNumber === null) {
        unknownAtomicNumberAtoms.push(atom);
      } else {
        atomicNumbers.push(tableAtomicNumber);
      }
      return;
    }
    if (!Number.isInteger(suppliedAtomicNumber) || suppliedAtomicNumber <= 0 || elements.Elements.get(suppliedAtomicNumber) === undefined) {
      unknownAtomicNumberAtoms.push(atom);
      return;
    }
    atomicNumbers.push(suppliedAtomicNumber);
    if (tableAtomicNumber !== null && tableAtomicNumber !== suppliedAtomicNumber) {
      mismatchedAtomicNumberAtoms.push(atom);
    }
  });
  if (unknownAtomicNumberAtoms.length > 0) {
    issues.push({
      code: 'UNKNOWN_ATOMIC_NUMBER',
      severity: 'error',
      message: 'The atomic number could not be determined for one or more atoms.',
      atomRefs: uniqueAtomReferences(unknownAtomicNumberAtoms)
    });
  }
  if (mismatchedAtomicNumberAtoms.length > 0) {
    issues.push({
      code: 'ATOMIC_NUMBER_MISMATCH',
      severity: 'error',
      message: 'The supplied atomic number does not match the element label for one or more atoms.',
      atomRefs: uniqueAtomReferences(mismatchedAtomicNumberAtoms)
    });
  }
  var declaredTotalCharge = snapshot.totalCharge;
  var effectiveTotalCharge = declaredTotalCharge !== null && declaredTotalCharge !== void 0 ? declaredTotalCharge : null;
  if (declaredTotalCharge === null || declaredTotalCharge === undefined) {
    effectiveTotalCharge = inferFormalCharge(atoms);
  }
  if (declaredTotalCharge === null || declaredTotalCharge === undefined || ((_snapshot$provenance = snapshot.provenance) === null || _snapshot$provenance === void 0 ? void 0 : _snapshot$provenance.totalChargeOrigin) === 'formal-charges') {
    issues.push({
      code: 'TOTAL_CHARGE_INFERRED',
      severity: 'warning',
      message: effectiveTotalCharge === null ? 'Total charge is unspecified and could not be inferred from atom formal charges.' : "Total charge is unspecified; ".concat(effectiveTotalCharge, " was inferred from atom formal charges."),
      atomRefs: uniqueAtomReferences(atoms)
    });
  }
  if (effectiveTotalCharge === null || !Number.isFinite(effectiveTotalCharge) || !Number.isInteger(effectiveTotalCharge)) {
    issues.push({
      code: 'INVALID_TOTAL_CHARGE',
      severity: 'error',
      message: 'Total charge must be a finite integer.',
      atomRefs: uniqueAtomReferences(atoms)
    });
    effectiveTotalCharge = null;
  }
  var suppliedMultiplicity = snapshot.multiplicity;
  var effectiveMultiplicity = suppliedMultiplicity;
  if (suppliedMultiplicity === null || suppliedMultiplicity === undefined) {
    effectiveMultiplicity = 1;
    issues.push({
      code: 'MULTIPLICITY_UNSPECIFIED',
      severity: 'warning',
      message: 'Spin multiplicity is unspecified; singlet multiplicity is assumed for readiness checks.',
      atomRefs: uniqueAtomReferences(atoms)
    });
  } else if (((_snapshot$provenance2 = snapshot.provenance) === null || _snapshot$provenance2 === void 0 ? void 0 : _snapshot$provenance2.multiplicityOrigin) === 'unspecified') {
    issues.push({
      code: 'MULTIPLICITY_UNSPECIFIED',
      severity: 'warning',
      message: 'Spin multiplicity was not explicitly set; the supplied singlet value is being treated as a default.',
      atomRefs: uniqueAtomReferences(atoms)
    });
  } else if (!Number.isFinite(suppliedMultiplicity) || !Number.isInteger(suppliedMultiplicity) || suppliedMultiplicity < 1) {
    issues.push({
      code: 'INVALID_MULTIPLICITY',
      severity: 'error',
      message: 'Spin multiplicity must be a positive integer.',
      atomRefs: uniqueAtomReferences(atoms)
    });
    effectiveMultiplicity = null;
  }
  var electronCount = null;
  if (atoms.length > 0 && atomicNumbers.length === atoms.length && effectiveTotalCharge !== null) {
    electronCount = atomicNumbers.reduce(function (sum, atomicNumber) {
      return sum + atomicNumber;
    }, 0) - effectiveTotalCharge;
    if (!Number.isInteger(electronCount) || electronCount < 0) {
      issues.push({
        code: 'INVALID_ELECTRON_COUNT',
        severity: 'error',
        message: 'The atom list and total charge produce an invalid electron count.',
        atomRefs: uniqueAtomReferences(atoms)
      });
      electronCount = null;
    }
  }
  if (electronCount !== null && effectiveMultiplicity !== null && electronCount % 2 === effectiveMultiplicity % 2) {
    issues.push({
      code: 'ELECTRON_MULTIPLICITY_MISMATCH',
      severity: 'error',
      message: "Electron count ".concat(electronCount, " is incompatible with spin multiplicity ").concat(effectiveMultiplicity, "."),
      atomRefs: uniqueAtomReferences(atoms)
    });
  }
  if (((_snapshot$fragments$l = (_snapshot$fragments = snapshot.fragments) === null || _snapshot$fragments === void 0 ? void 0 : _snapshot$fragments.length) !== null && _snapshot$fragments$l !== void 0 ? _snapshot$fragments$l : 0) > 1) {
    issues.push({
      code: 'MULTIPLE_FRAGMENTS',
      severity: 'warning',
      message: "The structure contains ".concat(snapshot.fragments.length, " disconnected fragments; confirm fragment charges and the intended calculation model."),
      atomRefs: uniqueAtomReferences(atoms)
    });
  }
  var atomsWithImplicitHydrogens = atoms.filter(function (_ref4) {
    var implicitHydrogenCount = _ref4.implicitHydrogenCount;
    return implicitHydrogenCount !== null && implicitHydrogenCount > 0;
  });
  if (atomsWithImplicitHydrogens.length > 0) {
    issues.push({
      code: 'IMPLICIT_HYDROGENS_PRESENT',
      severity: 'warning',
      message: 'Implicit hydrogens are present in the snapshot metadata but are not explicit calculation atoms.',
      atomRefs: uniqueAtomReferences(atomsWithImplicitHydrogens)
    });
  }
  return {
    ready: !issues.some(function (_ref5) {
      var severity = _ref5.severity;
      return severity === 'error';
    }),
    issues: issues,
    electronCount: electronCount,
    effectiveTotalCharge: effectiveTotalCharge,
    effectiveMultiplicity: effectiveMultiplicity
  };
}

exports.validateCalculationReadiness = validateCalculationReadiness;
//# sourceMappingURL=readiness.js.map
