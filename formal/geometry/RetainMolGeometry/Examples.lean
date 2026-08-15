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

private def overlappingChain : MoleculeSnapshot := {
  atoms := [
    { atomId := "A", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "B", symbol := "C", position := { x := 1500, y := 0, z := 0 } },
    { atomId := "C", symbol := "C", position := { x := 0, y := 0, z := 0 } }
  ]
  bonds := [
    { bondId := "AB", atomId1 := "A", atomId2 := "B", order := .single },
    { bondId := "BC", atomId1 := "B", atomId2 := "C", order := .single }
  ]
}

example : nonBondedCollisionFree overlappingChain = false := by
  decide

private def zeroLengthBond : MoleculeSnapshot := {
  atoms := [
    { atomId := "A", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "B", symbol := "C", position := { x := 0, y := 0, z := 0 } }
  ]
  bonds := [
    { bondId := "A-B", atomId1 := "A", atomId2 := "B", order := .single }
  ]
}

private def zeroLengthPolicy : GeometryPolicy := {
  policyId := "zero-length"
  distanceBounds := [
    { atomId1 := "A", atomId2 := "B", minSquared := 0, maxSquared := 0 }
  ]
}

example : geometryPolicyIsWellFormed zeroLengthBond zeroLengthPolicy = false := by
  decide

example : validateGeometryPolicy zeroLengthBond zeroLengthBond zeroLengthPolicy = false := by
  decide

private def commandBase : MoleculeSnapshot := {
  atoms := [
    { atomId := "A", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "B", symbol := "C", position := { x := 1500, y := 0, z := 0 } }
  ]
  bonds := [
    { bondId := "A-B", atomId1 := "A", atomId2 := "B", order := .single }
  ]
}

private def commandMoved : MoleculeSnapshot := {
  commandBase with
  atoms := commandBase.atoms.map fun atom =>
    if atom.atomId == "B" then
      { atom with position := { x := 1400, y := 100, z := 0 } }
    else atom
}

private def commandAdded : MoleculeSnapshot := {
  commandMoved with
  atoms := commandMoved.atoms ++ [
    { atomId := "H", symbol := "H", position := { x := 2300, y := 500, z := 0 } }
  ]
}

private def commandBonded : MoleculeSnapshot := {
  commandAdded with
  bonds := commandAdded.bonds ++ [
    { bondId := "B-H", atomId1 := "B", atomId2 := "H", order := .single }
  ]
}

private def validCommandTrace : List PrimitiveCommandStep := [
  { command := .atomMove "B" { x := 1400, y := 100, z := 0 }, after := commandMoved },
  { command := .atomAdd
      { atomId := "H", symbol := "H", position := { x := 2300, y := 500, z := 0 } },
    after := commandAdded },
  { command := .bondAdd
      { bondId := "B-H", atomId1 := "B", atomId2 := "H", order := .single },
    after := commandBonded }
]

example : primitiveCommandTraceIsValid commandBase validCommandTrace = true := by
  decide

example : PrimitiveCommandTraceSemantics commandBase validCommandTrace := by
  apply primitiveCommandTraceIsValid_sound
  decide

example : nonemptyPrimitiveCommandTraceIsValid commandBase validCommandTrace = true := by
  decide

example : NonemptyPrimitiveCommandTraceSemantics commandBase validCommandTrace := by
  apply nonemptyPrimitiveCommandTraceIsValid_sound
  decide

/-- An identity transition remains valid internally but cannot become a publication receipt. -/
example : primitiveCommandTraceIsValid commandBase [] = true := by
  decide

example : nonemptyPrimitiveCommandTraceIsValid commandBase [] = false := by
  decide

private def forgedMoved : MoleculeSnapshot := {
  commandMoved with bonds := []
}

example :
    primitiveCommandStepIsValid commandBase
      { command := .atomMove "B" { x := 1400, y := 100, z := 0 }, after := forgedMoved } = false := by
  decide

private def selfLoop : Bond := {
  bondId := "self"
  atomId1 := "A"
  atomId2 := "A"
  order := .single
}

example : applyPrimitiveCommand commandBase (.bondAdd selfLoop) = none := by
  decide

private def parallel : Bond := {
  bondId := "parallel"
  atomId1 := "B"
  atomId2 := "A"
  order := .double
}

example : applyPrimitiveCommand commandBase (.bondAdd parallel) = none := by
  decide

private def validGeometryIntent : GeometryIntent := {
  before := commandBase
  commands := [
    ⟨"move-b", .atomMove "B" { x := 1400, y := 100, z := 0 }⟩,
    ⟨"add-h", .atomAdd { atomId := "H", symbol := "H", position := { x := 2300, y := 500, z := 0 } }⟩,
    ⟨"bond-b-h", .bondAdd { bondId := "B-H", atomId1 := "B", atomId2 := "H", order := .single }⟩
  ]
  expected := commandBonded
  protectedAnchorIds := ["A"]
}

example : geometryIntentIsWellFormed validGeometryIntent = true := by
  decide

example : (compileGeometryPolicy validGeometryIntent).isSome = true := by
  decide

/-! ## Explicit graph rewrite and atom-port attachment -/

private def attachHost : MoleculeSnapshot := {
  atoms := [
    { atomId := "host:C", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "host:H:leave", symbol := "H", position := { x := 1000, y := 0, z := 0 } },
    { atomId := "host:H:stay", symbol := "H", position := { x := -1000, y := 0, z := 0 } }
  ]
  bonds := [
    { bondId := "host:C-H:leave", atomId1 := "host:C", atomId2 := "host:H:leave",
      order := .single },
    { bondId := "host:C-H:stay", atomId1 := "host:C", atomId2 := "host:H:stay",
      order := .single }
  ]
}

private def attachGuest : MoleculeSnapshot := {
  atoms := [
    { atomId := "cmd:atom:1", symbol := "C", position := { x := 1500, y := 0, z := 0 } },
    { atomId := "cmd:atom:2", symbol := "C", position := { x := 2500, y := 0, z := 0 } },
    { atomId := "cmd:atom:3", symbol := "C", position := { x := 1500, y := 1000, z := 0 } },
    { atomId := "cmd:atom:4", symbol := "H", position := { x := 1500, y := 0, z := 1000 } }
  ]
  bonds := [
    { bondId := "cmd:bond:1", atomId1 := "cmd:atom:1", atomId2 := "cmd:atom:2",
      order := .single },
    { bondId := "cmd:bond:2", atomId1 := "cmd:atom:1", atomId2 := "cmd:atom:3",
      order := .single },
    { bondId := "cmd:bond:3", atomId1 := "cmd:atom:1", atomId2 := "cmd:atom:4",
      order := .single }
  ]
}

private def attachRewrite : GraphRewrite := {
  removedAtomIds := ["host:H:leave"]
  removedBondIds := ["host:C-H:leave"]
  addedAtoms := attachGuest.atoms
  addedBonds := attachGuest.bonds ++ [
    { bondId := "cmd:bond:link", atomId1 := "host:C", atomId2 := "cmd:atom:1",
      order := .single }
  ]
}

private def attachCandidate : MoleculeSnapshot :=
  applyGraphRewrite attachHost attachRewrite

private def attachPolicy : AtomPortMatePolicy := {
  policyId := "registered-guest-v1"
  expectedCommandId := "attach-fragment-1"
  expectedLeavingHydrogenAtomId := "host:H:leave"
  expectedLeavingBondId := "host:C-H:leave"
  guestReference := attachGuest
  guestAttachAtomId := "cmd:atom:1"
  linkDistance := {
    atomId1 := "host:C"
    atomId2 := "cmd:atom:1"
    minSquared := 2200000
    maxSquared := 2300000
  }
  linkDirection := {
    referenceOriginAtomId := "host:C"
    referenceTipAtomId := "host:H:leave"
    candidateOriginAtomId := "host:C"
    candidateTipAtomId := "cmd:atom:1"
    cosineSign := .positive
    cosineSquared := {
      loNum := 99
      loDen := 100
      hiNum := 1
      hiDen := 1
    }
  }
  guestRegion := {
    atomIds := attachGuest.atoms.map (·.atomId)
    frame := {
      originAtomId := "cmd:atom:1"
      axisAtomId := "cmd:atom:2"
      radialAtomId := "cmd:atom:3"
      minAxisSquared := 1000000
      minAreaSquared := 1000000000000
    }
    handednessAtomId := "cmd:atom:4"
    maxSquaredDistanceDelta := 0
    minAbsVolume6 := 1000000000
  }
}

private def attachMate : AtomPortMate := {
  commandId := "attach-fragment-1"
  rewrite := attachRewrite
  hostAtomId := "host:C"
  leavingHydrogenAtomId := "host:H:leave"
  leavingBondId := "host:C-H:leave"
  linkBondId := "cmd:bond:link"
}

example : graphRewriteIsWellFormed attachHost attachRewrite = true := by decide
example : graphRewriteIsSatisfied attachHost attachCandidate attachRewrite = true := by decide
example : atomPortMateIsSatisfied attachHost attachCandidate attachPolicy attachMate = true := by decide

private def attachMissingAtom : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms.filter (fun atom => atom.atomId != "cmd:atom:4")
  bonds := attachCandidate.bonds.filter (fun bond => bond.bondId != "cmd:bond:3")
}

example : graphRewriteIsSatisfied attachHost attachMissingAtom attachRewrite = false := by decide

private def attachExtraAtom : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms ++ [
    { atomId := "forged", symbol := "H", position := { x := 5000, y := 0, z := 0 } }
  ]
}

example : graphRewriteIsSatisfied attachHost attachExtraAtom attachRewrite = false := by decide

private def attachWrongLinkOrder : MoleculeSnapshot := {
  attachCandidate with
  bonds := attachCandidate.bonds.map fun bond =>
    if bond.bondId == "cmd:bond:link" then { bond with order := .double } else bond
}

example : atomPortMateIsSatisfied attachHost attachWrongLinkOrder attachPolicy attachMate = false := by decide

private def attachMovedHost : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms.map fun atom =>
    if atom.atomId == "host:C" then
      { atom with position := { x := 1, y := 0, z := 0 } }
    else atom
}

example : atomPortMateIsSatisfied attachHost attachMovedHost attachPolicy attachMate = false := by decide

private def attachDistortedGuest : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms.map fun atom =>
    if atom.atomId == "cmd:atom:4" then
      { atom with position := { x := 1500, y := 0, z := 1200 } }
    else atom
}

example : atomPortMateIsSatisfied attachHost attachDistortedGuest attachPolicy attachMate = false := by decide

private def attachMirroredGuest : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms.map fun atom =>
    if atom.atomId == "cmd:atom:4" then
      { atom with position := { x := 1500, y := 0, z := -1000 } }
    else atom
}

example : atomPortMateIsSatisfied attachHost attachMirroredGuest attachPolicy attachMate = false := by decide

/--
The guest is moved by a proper quarter-turn. Its graph, internal distances,
handedness, and host-link distance all remain valid, but it no longer follows
the leaving-H direction.
-/
private def attachSidewaysGuest : MoleculeSnapshot := {
  attachCandidate with
  atoms := attachCandidate.atoms.map fun atom =>
    if atom.atomId == "cmd:atom:1" then
      { atom with position := { x := 0, y := 1500, z := 0 } }
    else if atom.atomId == "cmd:atom:2" then
      { atom with position := { x := 0, y := 2500, z := 0 } }
    else if atom.atomId == "cmd:atom:3" then
      { atom with position := { x := -1000, y := 1500, z := 0 } }
    else if atom.atomId == "cmd:atom:4" then
      { atom with position := { x := 0, y := 1500, z := 1000 } }
    else atom
}

example :
    properRigidRegionIsPreserved attachGuest attachSidewaysGuest attachPolicy.guestRegion =
      true := by decide

example : distanceBoundIsSatisfied attachSidewaysGuest attachPolicy.linkDistance = true := by
  decide

example : graphRewriteIsSatisfied attachHost attachSidewaysGuest attachRewrite = true := by
  decide

example : attachSidewaysGuest.bonds.all (bondIsSeparated attachSidewaysGuest) = true := by
  decide

example : nonBondedCollisionFree attachSidewaysGuest = true := by
  decide

example :
    directedSegmentAlignmentIsSatisfied attachHost attachCandidate attachPolicy.linkDirection =
      true := by decide

example :
    directedSegmentAlignmentIsSatisfied attachHost attachSidewaysGuest
      attachPolicy.linkDirection = false := by decide

example : atomPortMateIsSatisfied attachHost attachSidewaysGuest attachPolicy attachMate = false := by
  decide

private def undeclaredLeavingBondRewrite : GraphRewrite := {
  attachRewrite with removedBondIds := []
}

example : graphRewriteIsWellFormed attachHost undeclaredLeavingBondRewrite = false := by decide

private def collidingAddedIdRewrite : GraphRewrite := {
  attachRewrite with
  addedAtoms := attachRewrite.addedAtoms ++ [
    { atomId := "host:C", symbol := "C", position := { x := 0, y := 0, z := 0 } }
  ]
}

example : graphRewriteIsWellFormed attachHost collidingAddedIdRewrite = false := by decide

private def noLeavingRewrite : GraphRewrite := {
  attachRewrite with
  removedAtomIds := []
  removedBondIds := []
}

private def noLeavingMate : AtomPortMate := {
  attachMate with rewrite := noLeavingRewrite
}

example : atomPortMateIsWellFormed attachHost attachPolicy noLeavingMate = false := by decide

private def zeroLengthLinkPolicy : AtomPortMatePolicy := {
  attachPolicy with
  linkDistance := {
    atomId1 := "host:C"
    atomId2 := "cmd:atom:1"
    minSquared := 0
    maxSquared := 0
  }
}

example : atomPortMatePolicyIsWellFormed zeroLengthLinkPolicy = false := by decide

private def doubleLinkPolicy : AtomPortMatePolicy := {
  attachPolicy with linkBondOrder := .double
}

example : atomPortMatePolicyIsWellFormed doubleLinkPolicy = false := by decide

private def wrongCommandMate : AtomPortMate := {
  attachMate with commandId := "forged-command"
}

example : atomPortMateIsWellFormed attachHost attachPolicy wrongCommandMate = false := by decide

private def siblingHost : MoleculeSnapshot := attachHost

private def wrongSiblingRewrite : GraphRewrite := {
  attachRewrite with
  removedAtomIds := ["host:H:stay"]
  removedBondIds := ["host:C-H:stay"]
}

private def wrongSiblingMate : AtomPortMate := {
  attachMate with
  rewrite := wrongSiblingRewrite
  leavingHydrogenAtomId := "host:H:stay"
  leavingBondId := "host:C-H:stay"
}

example : atomPortMateIsWellFormed siblingHost attachPolicy wrongSiblingMate = false := by decide

private def hydrogenGuestAttachPolicy : AtomPortMatePolicy := {
  attachPolicy with
  guestAttachAtomId := "cmd:atom:4"
  linkDistance := {
    atomId1 := "host:C"
    atomId2 := "cmd:atom:4"
    minSquared := 2200000
    maxSquared := 2300000
  }
}

example : atomPortMatePolicyIsWellFormed hydrogenGuestAttachPolicy = false := by decide

private def forgedGeometryIntent : GeometryIntent := {
  validGeometryIntent with
  expected := { commandBonded with bonds := [] }
}

example : compileGeometryPolicy forgedGeometryIntent = none := by
  decide

private def anchorRoundTripIntent : GeometryIntent := {
  before := commandBase
  commands := [
    ⟨"move-a-away", .atomMove "A" { x := 50, y := 0, z := 0 }⟩,
    ⟨"move-a-back", .atomMove "A" { x := 0, y := 0, z := 0 }⟩
  ]
  expected := commandBase
  protectedAnchorIds := ["A"]
}

example : applyPrimitiveCommands anchorRoundTripIntent.before
    (anchorRoundTripIntent.commands.map (fun command => command.command)) =
      some anchorRoundTripIntent.expected := by
  decide

example : compileGeometryPolicy anchorRoundTripIntent = none := by
  decide

private def duplicateCommandIdIntent : GeometryIntent := {
  validGeometryIntent with
  commands := validGeometryIntent.commands.map fun command =>
    { command with commandId := "duplicate" }
}

example : compileGeometryPolicy duplicateCommandIdIntent = none := by
  decide

private def isolatedAtom : MoleculeSnapshot := {
  atoms := [
    { atomId := "He", symbol := "He", position := { x := 0, y := 0, z := 0 } }
  ]
  bonds := []
}

private def isolatedAtomIntent : GeometryIntent := {
  before := isolatedAtom
  commands := []
  expected := isolatedAtom
}

example : compileGeometryPolicy isolatedAtomIntent = none := by
  decide

/-! Spatial relation V1: an exact quarter-turn around a graph-cut single bond. -/

private def jointReference : MoleculeSnapshot := {
  atoms := [
    { atomId := "F", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "M", symbol := "C", position := { x := 1000, y := 0, z := 0 } },
    { atomId := "R", symbol := "H", position := { x := 1000, y := 1000, z := 0 } },
    { atomId := "H", symbol := "H", position := { x := 1000, y := 0, z := 1000 } }
  ]
  bonds := [
    { bondId := "axis", atomId1 := "F", atomId2 := "M", order := .single },
    { bondId := "M-R", atomId1 := "M", atomId2 := "R", order := .single },
    { bondId := "M-H", atomId1 := "M", atomId2 := "H", order := .single }
  ]
}

private def jointQuarterTurn : MoleculeSnapshot := {
  jointReference with
  atoms := [
    { atomId := "F", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "M", symbol := "C", position := { x := 1000, y := 0, z := 0 } },
    { atomId := "R", symbol := "H", position := { x := 1000, y := 0, z := 1000 } },
    { atomId := "H", symbol := "H", position := { x := 1000, y := -1000, z := 0 } }
  ]
}

private def exactZeroRatio : RatioBand := {
  loNum := 0, loDen := 1, hiNum := 0, hiDen := 1
}

private def exactOneRatio : RatioBand := {
  loNum := 1, loDen := 1, hiNum := 1, hiDen := 1
}

private def quarterTurnJoint : RotatableJoint := {
  commandId := "rotate-quarter-turn"
  axisBondId := "axis"
  fixedAxisAtomId := "F"
  movingAxisAtomId := "M"
  movingAtomIds := ["M", "R", "H"]
  region := {
    atomIds := ["F", "M", "R", "H"]
    frame := {
      originAtomId := "F"
      axisAtomId := "M"
      radialAtomId := "R"
    }
    handednessAtomId := "H"
    maxSquaredDistanceDelta := 0
  }
  turn := {
    cosineSign := .nearZero
    sineSign := .positive
    cosineSquared := exactZeroRatio
    sineSquared := exactOneRatio
  }
}

example : jointTopologyIsWellFormed jointReference quarterTurnJoint = true := by
  decide

example : rotatableJointIsSatisfied jointReference jointQuarterTurn quarterTurnJoint = true := by
  decide

example : RotatableJointSemantics jointReference jointQuarterTurn quarterTurnJoint := by
  apply rotatableJointIsSatisfied_sound
  decide

example :
    (evaluateSpatialRelation jointReference jointQuarterTurn 0
      (.rotatableJoint quarterTurnJoint)).status = .pass := by
  decide

private def mirroredQuarterTurn : MoleculeSnapshot := {
  jointQuarterTurn with
  atoms := jointQuarterTurn.atoms.map fun atom =>
    if atom.atomId == "H" then
      { atom with position := { x := 1000, y := 1000, z := 0 } }
    else atom
}

/-- Same pair distances and turn reference, but the handedness witness flips. -/
example :
    rigidAtomGroupIsPreserved jointReference mirroredQuarterTurn
      (properRigidGroup quarterTurnJoint.region) = true := by
  decide

example :
    orientationIsPreserved jointReference mirroredQuarterTurn
      (properRigidOrientation quarterTurnJoint.region) = false := by
  decide

example :
    rotatableJointIsSatisfied jointReference mirroredQuarterTurn quarterTurnJoint = false := by
  decide

example :
    (evaluateSpatialRelation jointReference mirroredQuarterTurn 0
      (.rotatableJoint quarterTurnJoint)).status = .reject := by
  decide

/-- A rigid no-op cannot satisfy a requested positive quarter-turn. -/
example : rotatableJointIsSatisfied jointReference jointReference quarterTurnJoint = false := by
  decide

private def incompleteMovingSide : RotatableJoint := {
  quarterTurnJoint with movingAtomIds := ["M", "R"]
}

example : jointTopologyIsWellFormed jointReference incompleteMovingSide = false := by
  decide

private def ringAxisReference : MoleculeSnapshot := {
  jointReference with
  bonds := jointReference.bonds ++ [
    { bondId := "H-F", atomId1 := "H", atomId2 := "F", order := .single }
  ]
}

/-- Removing an in-ring axis does not isolate the declared moving side. -/
example : jointTopologyIsWellFormed ringAxisReference quarterTurnJoint = false := by
  decide

private def degenerateFrameJoint : RotatableJoint := {
  quarterTurnJoint with
  region := {
    quarterTurnJoint.region with
    frame := { quarterTurnJoint.region.frame with radialAtomId := "M" }
  }
}

example : jointTopologyIsWellFormed jointReference degenerateFrameJoint = false := by
  decide

private def detachedAngleFrameJoint : RotatableJoint := {
  quarterTurnJoint with
  region := {
    quarterTurnJoint.region with
    frame := {
      originAtomId := "M"
      axisAtomId := "R"
      radialAtomId := "F"
    }
    handednessAtomId := "H"
  }
}

/-- The turn frame must be the ordered axis bond, not another valid local frame. -/
example : jointTopologyIsWellFormed jointReference detachedAngleFrameJoint = false := by
  decide

example :
    (evaluateSpatialRelation jointReference jointQuarterTurn 0
      (.rotatableJoint detachedAngleFrameJoint)).status = .reject := by
  decide

private def lowMarginJoint : RotatableJoint := {
  quarterTurnJoint with
  region := {
    quarterTurnJoint.region with
    frame := {
      quarterTurnJoint.region.frame with
      minAxisSquared := 2000000
    }
  }
}

/-- A valid contract with weak reference evidence abstains instead of rejecting. -/
example :
    (evaluateSpatialRelation jointReference jointQuarterTurn 0
      (.rotatableJoint lowMarginJoint)).status = .indeterminate := by
  decide

/-- A contradiction dominates an independent numeric uncertainty. -/
example :
    (evaluateSpatialRelations jointReference jointQuarterTurn [
      .rotatableJoint lowMarginJoint,
      .rotatableJoint detachedAngleFrameJoint,
    ]).status = .reject := by
  decide

/-- Without a contradiction, one uncertain relation makes the document uncertain. -/
example :
    (evaluateSpatialRelations jointReference jointQuarterTurn [
      .rotatableJoint quarterTurnJoint,
      .rotatableJoint lowMarginJoint,
    ]).status = .indeterminate := by
  decide

/-- The formal core fails closed even if an outer projector forgets the guard. -/
example :
    evaluateSpatialRelations jointReference jointQuarterTurn [] = {
      status := .reject
      issues := [{
        relationIndex := none
        issueClass := .contradiction
        code := .noRelationsProvided
      }]
    } := by
  decide

private def truncatedFrameCandidate : MoleculeSnapshot := {
  atoms := jointReference.atoms.take 3
  bonds := []
}

/-- A local frame cannot certify an incomplete candidate graph. -/
example :
    spatialRelationIsSatisfied jointReference truncatedFrameCandidate
      (.portFrame quarterTurnJoint.region.frame) = false := by
  decide

/-! A relation receipt trace binds command order, complete snapshots, and geometry. -/

private def quarterTurnReceipt : RelationCommandReceipt := {
  commandId := quarterTurnJoint.commandId
  commandKind := "geometry.rotateGroup"
  preDigest := "canonical-v2-sha256-reference"
  postDigest := "canonical-v2-sha256-quarter-turn"
}

private def quarterTurnTraceIdentity : RelationTraceIdentity := {
  projectionVersion := "relation-trace-v1"
  planId := "plan-quarter-turn"
  enforcedPlanSha256 := "plan-sha256-quarter-turn"
  baseDigest := quarterTurnReceipt.preDigest
  finalDigest := quarterTurnReceipt.postDigest
}

private def quarterTurnTrace : RelationTrace := {
  identity := quarterTurnTraceIdentity
  base := jointReference
  final := jointQuarterTurn
  steps := [{
    receipt := quarterTurnReceipt
    before := jointReference
    after := jointQuarterTurn
    witness := .rotateGroup quarterTurnJoint
  }]
}

example :
    relationTraceIsSatisfied quarterTurnTraceIdentity [quarterTurnReceipt]
      quarterTurnTrace = true := by
  decide

example :
    RelationTraceSemantics quarterTurnTraceIdentity [quarterTurnReceipt]
      quarterTurnTrace := by
  apply relationTraceIsSatisfied_sound
  decide

/-- A trusted expected command cannot be satisfied by an empty or truncated trace. -/
example :
    relationTraceIsSatisfied quarterTurnTraceIdentity [quarterTurnReceipt]
      { quarterTurnTrace with steps := [] } = false := by
  decide

/-- Matching digest text cannot hide that the complete pre-state is disconnected. -/
example :
    relationTraceIsSatisfied quarterTurnTraceIdentity [quarterTurnReceipt]
      { quarterTurnTrace with base := jointQuarterTurn } = false := by
  decide

/-- Digest echo cannot turn a geometrically invalid no-op into a quarter-turn. -/
private def echoedQuarterTurnReceipt : RelationCommandReceipt := {
  quarterTurnReceipt with
  preDigest := "x"
  postDigest := "x"
}

private def echoedQuarterTurnIdentity : RelationTraceIdentity := {
  quarterTurnTraceIdentity with
  baseDigest := "x"
  finalDigest := "x"
}

private def echoedInvalidTrace : RelationTrace := {
  identity := echoedQuarterTurnIdentity
  base := jointReference
  final := jointReference
  steps := [{
    receipt := echoedQuarterTurnReceipt
    before := jointReference
    after := jointReference
    witness := .rotateGroup quarterTurnJoint
  }]
}

example :
    relationTraceIsSatisfied echoedQuarterTurnIdentity [echoedQuarterTurnReceipt]
      echoedInvalidTrace = false := by
  decide

/-- Receipt identity cannot be rebound to a different witness command. -/
private def reboundQuarterTurnReceipt : RelationCommandReceipt := {
  quarterTurnReceipt with commandId := "another-command"
}

example :
    relationTraceIsSatisfied quarterTurnTraceIdentity [reboundQuarterTurnReceipt]
      { quarterTurnTrace with
        steps := [{
          receipt := reboundQuarterTurnReceipt
          before := jointReference
          after := jointQuarterTurn
          witness := .rotateGroup quarterTurnJoint
        }] } = false := by
  decide
