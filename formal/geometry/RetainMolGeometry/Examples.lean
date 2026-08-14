import RetainMolGeometry

open RetainMol.Geometry

private def referenceCore : MoleculeSnapshot := {
  atoms := [
    { atomId := "B:core", symbol := "B", position := { x := 0, y := 0, z := 0 } },
    { atomId := "N:left", symbol := "N", position := { x := -1400, y := 0, z := 300 } },
    { atomId := "N:right", symbol := "N", position := { x := 1400, y := 0, z := 300 } },
    { atomId := "C:center", symbol := "C", position := { x := 0, y := 1200, z := -300 } }
  ]
  bonds := [
    { bondId := "B-N:left", atomId1 := "B:core", atomId2 := "N:left",
      order := .single },
    { bondId := "B-N:right", atomId1 := "B:core", atomId2 := "N:right",
      order := .single },
    { bondId := "B-C:center", atomId1 := "B:core", atomId2 := "C:center",
      order := .single }
  ]
}

private def validCandidate : MoleculeSnapshot := {
  atoms := referenceCore.atoms ++ [
    { atomId := "C:tail", symbol := "C", position := { x := 0, y := 2600, z := -600 } }
  ]
  bonds := referenceCore.bonds ++ [
    { bondId := "C:center-C:tail", atomId1 := "C:center", atomId2 := "C:tail",
      order := .single }
  ]
}

private def corePolicy : GeometryPolicy := {
  policyId := "anchored-core-v2"
  fixedAtomIds := ["B:core", "N:left", "N:right"]
  distanceBounds := [
    { atomId1 := "B:core", atomId2 := "N:left",
      minSquared := 1960000, maxSquared := 2131600 },
    { atomId1 := "B:core", atomId2 := "N:right",
      minSquared := 1960000, maxSquared := 2131600 },
    { atomId1 := "B:core", atomId2 := "C:center",
      minSquared := 1440000, maxSquared := 1638400 },
    { atomId1 := "C:center", atomId2 := "C:tail",
      minSquared := 2000000, maxSquared := 2300000 }
  ]
  orientationChecks := [
    { atomId1 := "B:core", atomId2 := "N:left", atomId3 := "N:right",
      atomId4 := "C:center", minAbsVolume6 := 100000000 }
  ]
  rigidAtomGroups := [
    { atomIds := ["B:core", "N:left", "N:right", "C:center"],
      maxSquaredDistanceDelta := 1000 }
  ]
}

example : validateGeometryPolicy validCandidate validCandidate corePolicy = true := by
  decide

private def movedAnchor : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "B:core" then
      { atom with position := { x := 1, y := 0, z := 0 } }
    else atom
}

example : validateGeometryPolicy validCandidate movedAnchor corePolicy = false := by
  decide

private def invertedCenter : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "C:center" then
      { atom with position := { x := 0, y := -1200, z := -300 } }
    else atom
}

example : validateGeometryPolicy validCandidate invertedCenter corePolicy = false := by
  decide

private def missingBond : MoleculeSnapshot := {
  validCandidate with
  bonds := validCandidate.bonds.filter fun bond => bond.bondId != "B-N:left"
}

example : validateGeometryPolicy validCandidate missingBond corePolicy = false := by
  decide

private def changedCharge : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "N:left" then { atom with formalCharge := 1 } else atom
}

example : validateGeometryPolicy validCandidate changedCharge corePolicy = false := by
  decide

private def parallelBond : MoleculeSnapshot := {
  validCandidate with
  bonds := validCandidate.bonds ++ [
    { bondId := "parallel", atomId1 := "N:left", atomId2 := "B:core", order := .double }
  ]
}

example : topologyIsWellFormed parallelBond = false := by
  decide

private def emptyPolicy : GeometryPolicy := {
  policyId := "empty"
}

example : validateGeometryPolicy validCandidate validCandidate emptyPolicy = false := by
  decide

private def missingBondCoveragePolicy : GeometryPolicy := {
  policyId := "missing-bond-distance-coverage"
  fixedAtomIds := ["B:core"]
}

example :
    validateGeometryPolicy validCandidate validCandidate missingBondCoveragePolicy = false := by
  decide

private def rigidOnlyPolicy : GeometryPolicy := {
  policyId := "rigid-only"
  requireAllBondDistances := false
  rigidAtomGroups := [
    { atomIds := ["B:core", "N:left", "N:right", "C:center"],
      maxSquaredDistanceDelta := 1000 }
  ]
}

private def distortedRigidGroup : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "C:center" then
      { atom with position := { x := 0, y := 1400, z := -300 } }
    else atom
}

example : validateGeometryPolicy validCandidate distortedRigidGroup rigidOnlyPolicy = false := by
  decide

private def reorderedCandidate : MoleculeSnapshot := {
  atoms := validCandidate.atoms.reverse
  bonds := validCandidate.bonds.reverse
}

example : validateGeometryPolicy validCandidate reorderedCandidate corePolicy = true := by
  decide

private def quantizedRigidReference : MoleculeSnapshot := {
  atoms := [
    { atomId := "A", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "B", symbol := "C", position := { x := 1000, y := 0, z := 0 } }
  ]
  bonds := []
}

private def quantizedRigidRotation : MoleculeSnapshot := {
  atoms := [
    { atomId := "A", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "B", symbol := "C", position := { x := 707, y := 707, z := 0 } }
  ]
  bonds := []
}

private def rotationTolerancePolicy : GeometryPolicy := {
  policyId := "rotation-with-quantization-tolerance"
  rigidAtomGroups := [
    { atomIds := ["A", "B"], maxSquaredDistanceDelta := 302 }
  ]
}

example :
    validateGeometryPolicy quantizedRigidReference quantizedRigidRotation
      rotationTolerancePolicy = true := by
  decide

private def insufficientRotationTolerancePolicy : GeometryPolicy := {
  policyId := "rotation-with-insufficient-tolerance"
  rigidAtomGroups := [
    { atomIds := ["A", "B"], maxSquaredDistanceDelta := 301 }
  ]
}

example :
    validateGeometryPolicy quantizedRigidReference quantizedRigidRotation
      insufficientRotationTolerancePolicy = false := by
  decide

private def nearPlanarCenter : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "C:center" then
      { atom with position := { x := 0, y := 1, z := 0 } }
    else atom
}

private def orientationOnlyPolicy : GeometryPolicy := {
  policyId := "orientation-margin"
  requireAllBondDistances := false
  orientationChecks := [
    { atomId1 := "B:core", atomId2 := "N:left", atomId3 := "N:right",
      atomId4 := "C:center", minAbsVolume6 := 100000000 }
  ]
}

example : validateGeometryPolicy validCandidate nearPlanarCenter orientationOnlyPolicy = false := by
  decide
