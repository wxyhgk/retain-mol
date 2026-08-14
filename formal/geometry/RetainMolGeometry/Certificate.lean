import RetainMolGeometry.Molecule

namespace RetainMol.Geometry

structure DistanceBound where
  atomId1 : AtomId
  atomId2 : AtomId
  minSquared : Int
  maxSquared : Int
deriving Repr, DecidableEq, BEq

structure OrientationCheck where
  atomId1 : AtomId
  atomId2 : AtomId
  atomId3 : AtomId
  atomId4 : AtomId
  minAbsVolume6 : Nat := 1
deriving Repr, DecidableEq, BEq

structure RigidAtomGroup where
  atomIds : List AtomId
  /-- Tolerance for squared-distance drift caused by coordinate quantization. -/
  maxSquaredDistanceDelta : Nat
deriving Repr, DecidableEq, BEq

structure GeometryPolicy where
  policyId : String
  requireGeometryConstraints : Bool := true
  requireAllBondDistances : Bool := true
  fixedAtomIds : List AtomId := []
  distanceBounds : List DistanceBound := []
  orientationChecks : List OrientationCheck := []
  rigidAtomGroups : List RigidAtomGroup := []
deriving Repr, DecidableEq, BEq

/-- Compatibility name for callers created before the trusted-policy boundary. -/
abbrev GeometryCertificate := GeometryPolicy

inductive ValidationIssue where
  | expectedTopologyInvalid
  | candidateTopologyInvalid
  | molecularGraphChanged
  | policyInvalid
  | fixedAtomChanged (atomId : AtomId)
  | distanceOutOfRange (atomId1 atomId2 : AtomId)
  | orientationInvalid (index : Nat)
  | rigidGroupDistorted (index : Nat)
deriving Repr, DecidableEq, BEq

private def withTwoPositions
    (molecule : MoleculeSnapshot)
    (atomId1 atomId2 : AtomId)
    (check : Vec3 → Vec3 → Bool) : Bool :=
  match findAtom molecule atomId1, findAtom molecule atomId2 with
  | some atom1, some atom2 => check atom1.position atom2.position
  | _, _ => false

def fixedAtomIsPreserved
    (reference candidate : MoleculeSnapshot)
    (atomId : AtomId) : Bool :=
  match findAtom reference atomId, findAtom candidate atomId with
  | some expected, some actual => expected.symbol == actual.symbol &&
      expected.position == actual.position
  | _, _ => false

def distanceBoundIsSatisfied
    (candidate : MoleculeSnapshot)
    (bound : DistanceBound) : Bool :=
  withTwoPositions candidate bound.atomId1 bound.atomId2 fun position1 position2 =>
    let squared := Vec3.squaredDistance position1 position2
    decide (bound.minSquared ≤ squared ∧ squared ≤ bound.maxSquared)

private def orientationSignAgrees (expected actual : Int) : Bool :=
  decide ((expected > 0 ∧ actual > 0) ∨ (expected < 0 ∧ actual < 0))

def orientationIsPreserved
    (reference candidate : MoleculeSnapshot)
    (check : OrientationCheck) : Bool :=
  let positions (molecule : MoleculeSnapshot) : Option (Vec3 × Vec3 × Vec3 × Vec3) := do
    let atom1 ← findAtom molecule check.atomId1
    let atom2 ← findAtom molecule check.atomId2
    let atom3 ← findAtom molecule check.atomId3
    let atom4 ← findAtom molecule check.atomId4
    pure (atom1.position, atom2.position, atom3.position, atom4.position)
  match positions reference, positions candidate with
  | some (a, b, c, d), some (a', b', c', d') =>
      let expectedVolume := Vec3.signedVolume6 a b c d
      let actualVolume := Vec3.signedVolume6 a' b' c' d'
      decide (check.minAbsVolume6 ≤ expectedVolume.natAbs) &&
        decide (check.minAbsVolume6 ≤ actualVolume.natAbs) &&
        orientationSignAgrees expectedVolume actualVolume
  | _, _ => false

private def allPairs : List α → List (α × α)
  | [] => []
  | value :: rest => rest.map (fun other => (value, other)) ++ allPairs rest

private def pairDistanceIsPreserved
    (reference candidate : MoleculeSnapshot)
    (tolerance : Nat)
    (atomIds : AtomId × AtomId) : Bool :=
  match findAtom reference atomIds.1, findAtom reference atomIds.2,
      findAtom candidate atomIds.1, findAtom candidate atomIds.2 with
  | some expected1, some expected2, some actual1, some actual2 =>
      let expectedSquared := Vec3.squaredDistance expected1.position expected2.position
      let actualSquared := Vec3.squaredDistance actual1.position actual2.position
      decide ((expectedSquared - actualSquared).natAbs ≤ tolerance)
  | _, _, _, _ => false

def rigidAtomGroupIsPreserved
    (reference candidate : MoleculeSnapshot)
    (group : RigidAtomGroup) : Bool :=
  decide (2 ≤ group.atomIds.length) &&
    allUnique group.atomIds &&
    (allPairs group.atomIds).all
      (pairDistanceIsPreserved reference candidate group.maxSquaredDistanceDelta)

private def distanceBoundIsWellFormed
    (expected : MoleculeSnapshot)
    (bound : DistanceBound) : Bool :=
  bound.atomId1 != bound.atomId2 &&
    decide (0 ≤ bound.minSquared ∧ bound.minSquared ≤ bound.maxSquared) &&
    (findAtom expected bound.atomId1).isSome &&
    (findAtom expected bound.atomId2).isSome

private def sameDistancePair (left right : DistanceBound) : Bool :=
  (left.atomId1 == right.atomId1 && left.atomId2 == right.atomId2) ||
    (left.atomId1 == right.atomId2 && left.atomId2 == right.atomId1)

private def noDuplicateDistancePairs : List DistanceBound → Bool
  | [] => true
  | bound :: rest =>
      !rest.any (sameDistancePair bound) && noDuplicateDistancePairs rest

private def bondHasDistanceBound
    (bounds : List DistanceBound)
    (bond : Bond) : Bool :=
  bounds.any fun bound =>
    (bound.atomId1 == bond.atomId1 && bound.atomId2 == bond.atomId2) ||
      (bound.atomId1 == bond.atomId2 && bound.atomId2 == bond.atomId1)

private def orientationCheckIsWellFormed
    (expected : MoleculeSnapshot)
    (check : OrientationCheck) : Bool :=
  let atomIds := [check.atomId1, check.atomId2, check.atomId3, check.atomId4]
  let expectedHasMargin :=
    match findAtom expected check.atomId1, findAtom expected check.atomId2,
        findAtom expected check.atomId3, findAtom expected check.atomId4 with
    | some atom1, some atom2, some atom3, some atom4 =>
        decide (check.minAbsVolume6 ≤
          (Vec3.signedVolume6 atom1.position atom2.position atom3.position atom4.position).natAbs)
    | _, _, _, _ => false
  allUnique atomIds &&
    decide (0 < check.minAbsVolume6) &&
    atomIds.all (fun atomId => (findAtom expected atomId).isSome) &&
    expectedHasMargin

private def rigidAtomGroupIsWellFormed
    (expected : MoleculeSnapshot)
    (group : RigidAtomGroup) : Bool :=
  decide (2 ≤ group.atomIds.length) &&
    allUnique group.atomIds &&
    group.atomIds.all (fun atomId => (findAtom expected atomId).isSome)

def geometryPolicyIsWellFormed
    (expected : MoleculeSnapshot)
    (policy : GeometryPolicy) : Bool :=
  let hasGeometryConstraints :=
    !policy.fixedAtomIds.isEmpty ||
      !policy.distanceBounds.isEmpty ||
      !policy.orientationChecks.isEmpty ||
      !policy.rigidAtomGroups.isEmpty
  !policy.policyId.isEmpty &&
    (!policy.requireGeometryConstraints || hasGeometryConstraints) &&
    allUnique policy.fixedAtomIds &&
    policy.fixedAtomIds.all (fun atomId => (findAtom expected atomId).isSome) &&
    policy.distanceBounds.all (distanceBoundIsWellFormed expected) &&
    noDuplicateDistancePairs policy.distanceBounds &&
    (!policy.requireAllBondDistances ||
      expected.bonds.all (bondHasDistanceBound policy.distanceBounds)) &&
    policy.orientationChecks.all (orientationCheckIsWellFormed expected) &&
    policy.rigidAtomGroups.all (rigidAtomGroupIsWellFormed expected)

private def issueUnless (condition : Bool) (issue : ValidationIssue) : List ValidationIssue :=
  if condition then [] else [issue]

private def indexedIssues
    (values : List α)
    (check : α → Bool)
    (issue : Nat → ValidationIssue) : List ValidationIssue :=
  let rec visit (index : Nat) : List α → List ValidationIssue
    | [] => []
    | value :: rest =>
        issueUnless (check value) (issue index) ++ visit (index + 1) rest
  visit 0 values

def geometryValidationIssues
    (expected candidate : MoleculeSnapshot)
    (policy : GeometryPolicy) : List ValidationIssue :=
  issueUnless (topologyIsWellFormed expected) .expectedTopologyInvalid ++
    issueUnless (topologyIsWellFormed candidate) .candidateTopologyInvalid ++
    issueUnless (molecularGraphIsPreserved expected candidate) .molecularGraphChanged ++
    issueUnless (geometryPolicyIsWellFormed expected policy) .policyInvalid ++
    policy.fixedAtomIds.filterMap (fun atomId =>
      if fixedAtomIsPreserved expected candidate atomId then none
      else some (.fixedAtomChanged atomId)) ++
    policy.distanceBounds.filterMap (fun bound =>
      if distanceBoundIsSatisfied candidate bound then none
      else some (.distanceOutOfRange bound.atomId1 bound.atomId2)) ++
    indexedIssues policy.orientationChecks
      (orientationIsPreserved expected candidate) .orientationInvalid ++
    indexedIssues policy.rigidAtomGroups
      (rigidAtomGroupIsPreserved expected candidate) .rigidGroupDistorted

/--
The small trusted decision boundary used after an EditPlan dry-run. It checks
the builder-approved expected snapshot and final candidate against a trusted
geometry policy; it does not infer the intended molecule from the candidate.
-/
def validateGeometryPolicy
    (expected candidate : MoleculeSnapshot)
    (policy : GeometryPolicy) : Bool :=
  (geometryValidationIssues expected candidate policy).isEmpty

abbrev validateGeometryCertificate := validateGeometryPolicy

end RetainMol.Geometry
