import RetainMolGeometry.Command
import RetainMolGeometry.Certificate

namespace RetainMol.Geometry

/-- A stable command id binds the formal trace to the production receipt. -/
structure IdentifiedPrimitiveCommand where
  commandId : String
  command : PrimitiveCommand
deriving Repr, DecidableEq, BEq

structure OrientationAtomGroup where
  atomId1 : AtomId
  atomId2 : AtomId
  atomId3 : AtomId
  atomId4 : AtomId
deriving Repr, DecidableEq, BEq

/--
GeometryIntent V1 is the smallest trusted spatial request: an exact identified
primitive command sequence, the complete expected post-state, and atom groups
that express system-owned constraints. Numeric safety tolerances are compiled
below and are never accepted from the caller.
-/
structure GeometryIntent where
  before : MoleculeSnapshot
  commands : List IdentifiedPrimitiveCommand
  expected : MoleculeSnapshot
  protectedAnchorIds : List AtomId := []
  orientationAtomGroups : List OrientationAtomGroup := []
  rigidAtomGroups : List (List AtomId) := []
deriving Repr, DecidableEq, BEq

def protectedAnchorsArePreserved (intent : GeometryIntent) : Bool :=
  intent.protectedAnchorIds.all fun atomId =>
    fixedAtomIsPreserved intent.before intent.expected atomId

/-- Atom mutations may not target a protected anchor; bond edits remain legal. -/
def primitiveCommandAvoidsProtectedAnchors
    (protectedAnchorIds : List AtomId) : PrimitiveCommand → Bool
  | .atomAdd atom => !protectedAnchorIds.contains atom.atomId
  | .atomReplace atomId _ => !protectedAnchorIds.contains atomId
  | .atomRemove atomId => !protectedAnchorIds.contains atomId
  | .atomMove atomId _ => !protectedAnchorIds.contains atomId
  | .bondAdd _ | .bondRemove _ | .bondSetOrder _ _ => true

def protectedAnchorsAreUntouchedByCommands (intent : GeometryIntent) : Bool :=
  intent.commands.all fun identified =>
    primitiveCommandAvoidsProtectedAnchors intent.protectedAnchorIds identified.command

def identifiedCommandIdsAreValid (intent : GeometryIntent) : Bool :=
  !intent.commands.any (fun command => command.commandId.isEmpty) &&
    allUnique (intent.commands.map (fun command => command.commandId))

private def trustedBondDistanceBound
    (expected : MoleculeSnapshot)
    (bond : Bond) : DistanceBound :=
  let squared :=
    match findAtom expected bond.atomId1, findAtom expected bond.atomId2 with
    | some atom1, some atom2 => Vec3.squaredDistance atom1.position atom2.position
    | _, _ => 0
  {
    atomId1 := bond.atomId1
    atomId2 := bond.atomId2
    -- Never permit a compiled bond shorter than 0.4 Angstrom.
    minSquared := max 160000 (squared / 2)
    maxSquared := squared * 2
  }

private def trustedOrientationCheck
    (expected : MoleculeSnapshot)
    (group : OrientationAtomGroup) : OrientationCheck :=
  let minimum :=
    match findAtom expected group.atomId1, findAtom expected group.atomId2,
        findAtom expected group.atomId3, findAtom expected group.atomId4 with
    | some atom1, some atom2, some atom3, some atom4 =>
        max 1 ((Vec3.signedVolume6 atom1.position atom2.position
          atom3.position atom4.position).natAbs / 2)
    | _, _, _, _ => 1
  {
    atomId1 := group.atomId1
    atomId2 := group.atomId2
    atomId3 := group.atomId3
    atomId4 := group.atomId4
    minAbsVolume6 := minimum
  }

/-- Fixed V1 profile: squared-distance drift may not exceed 0.25 Angstrom². -/
def trustedRigidSquaredDistanceTolerance : Nat := 250000

private def trustedRigidAtomGroup (atomIds : List AtomId) : RigidAtomGroup := {
  atomIds := atomIds
  maxSquaredDistanceDelta := trustedRigidSquaredDistanceTolerance
}

private def atomHasConstraintCoverage (intent : GeometryIntent) (atom : Atom) : Bool :=
  intent.protectedAnchorIds.contains atom.atomId ||
    intent.expected.bonds.any (fun bond =>
      bond.atomId1 == atom.atomId || bond.atomId2 == atom.atomId) ||
    intent.orientationAtomGroups.any (fun group =>
      [group.atomId1, group.atomId2, group.atomId3, group.atomId4].contains atom.atomId) ||
    intent.rigidAtomGroups.any (fun atomIds => atomIds.contains atom.atomId)

def geometryIntentHasConstraintCoverage (intent : GeometryIntent) : Bool :=
  intent.expected.atoms.all (atomHasConstraintCoverage intent)

/--
Compile an intent into a system-owned V1 policy. Every expected bond receives
a conservative distance interval; protected anchors are fixed exactly.
-/
def compiledGeometryPolicy (intent : GeometryIntent) : GeometryPolicy := {
  policyId := "retainmol-geometry-intent-v1"
  requireGeometryConstraints :=
    !intent.protectedAnchorIds.isEmpty || !intent.expected.bonds.isEmpty
  requireAllBondDistances := true
  fixedAtomIds := intent.protectedAnchorIds
  distanceBounds := intent.expected.bonds.map (trustedBondDistanceBound intent.expected)
  orientationChecks := intent.orientationAtomGroups.map
    (trustedOrientationCheck intent.expected)
  rigidAtomGroups := intent.rigidAtomGroups.map trustedRigidAtomGroup
}

def geometryIntentIsWellFormed (intent : GeometryIntent) : Bool :=
  topologyIsWellFormed intent.before &&
    identifiedCommandIdsAreValid intent &&
    allUnique intent.protectedAnchorIds &&
    intent.protectedAnchorIds.all (fun atomId => (findAtom intent.before atomId).isSome) &&
    protectedAnchorsAreUntouchedByCommands intent &&
    protectedAnchorsArePreserved intent &&
    geometryIntentHasConstraintCoverage intent &&
    decide (applyPrimitiveCommands intent.before
      (intent.commands.map (fun command => command.command)) = some intent.expected) &&
    geometryPolicyIsWellFormed intent.expected (compiledGeometryPolicy intent) &&
    validateGeometryPolicy intent.expected intent.expected (compiledGeometryPolicy intent)

/-- Fail-closed compiler entry point used by future external bridges. -/
def compileGeometryPolicy (intent : GeometryIntent) : Option GeometryPolicy :=
  if geometryIntentIsWellFormed intent then
    some (compiledGeometryPolicy intent)
  else
    none

/--
Validate a relaxed candidate only after the intent has compiled successfully.
`none` distinguishes an invalid trusted intent from a candidate rejected by a
successfully compiled policy.
-/
def geometryIntentCandidateIssues
    (intent : GeometryIntent)
    (candidate : MoleculeSnapshot) : Option (List ValidationIssue) := do
  let policy ← compileGeometryPolicy intent
  some (geometryValidationIssues intent.expected candidate policy)

def validateGeometryIntentCandidate
    (intent : GeometryIntent)
    (candidate : MoleculeSnapshot) : Bool :=
  match compileGeometryPolicy intent with
  | some policy => (geometryValidationIssues intent.expected candidate policy).isEmpty
  | none => false

/--
A successful compilation proves that the expected molecule is the exact result
of the command sequence, protected anchors were preserved, and the generated
policy is both well formed and self-validating.
-/
theorem compileGeometryPolicy_self_check_sound
    (intent : GeometryIntent)
    (policy : GeometryPolicy)
    (compiled : compileGeometryPolicy intent = some policy) :
    applyPrimitiveCommands intent.before
        (intent.commands.map (fun command => command.command)) = some intent.expected ∧
      identifiedCommandIdsAreValid intent = true ∧
      protectedAnchorsAreUntouchedByCommands intent = true ∧
      protectedAnchorsArePreserved intent = true ∧
      policy = compiledGeometryPolicy intent ∧
      geometryPolicyIsWellFormed intent.expected policy = true ∧
      validateGeometryPolicy intent.expected intent.expected policy = true := by
  have valid : geometryIntentIsWellFormed intent = true := by
    cases h : geometryIntentIsWellFormed intent with
    | false => simp [compileGeometryPolicy, h] at compiled
    | true => rfl
  have policyExact : policy = compiledGeometryPolicy intent := by
    simp [compileGeometryPolicy, valid] at compiled
    exact compiled.symm
  have splitAnd (left right : Bool) (proof : (left && right) = true) :
      left = true ∧ right = true := by
    simpa only [Bool.and_eq_true] using proof
  have validation := splitAnd _ _ valid
  have policyWellFormed := splitAnd _ _ validation.1
  have commandResult := splitAnd _ _ policyWellFormed.1
  have coverage := splitAnd _ _ commandResult.1
  have anchorsPreserved := splitAnd _ _ coverage.1
  have commandsSafe := splitAnd _ _ anchorsPreserved.1
  have anchorsExist := splitAnd _ _ commandsSafe.1
  have uniqueAnchors := splitAnd _ _ anchorsExist.1
  have commandIds := splitAnd _ _ uniqueAnchors.1
  subst policy
  exact ⟨of_decide_eq_true commandResult.2, commandIds.2,
    commandsSafe.2, anchorsPreserved.2, rfl,
    policyWellFormed.2, validation.2⟩

def GeometryIntentCandidateSemantics
    (intent : GeometryIntent)
    (candidate : MoleculeSnapshot) : Prop :=
  ∃ policy,
    compileGeometryPolicy intent = some policy ∧
      geometryValidationIssues intent.expected candidate policy = []

/-- A passing candidate always came from a successfully compiled intent. -/
theorem validateGeometryIntentCandidate_has_compiled_policy
    (intent : GeometryIntent)
    (candidate : MoleculeSnapshot)
    (valid : validateGeometryIntentCandidate intent candidate = true) :
    (compileGeometryPolicy intent).isSome = true := by
  cases compiled : compileGeometryPolicy intent with
  | none => simp [validateGeometryIntentCandidate, compiled] at valid
  | some policy => simp

/-- A Boolean PASS contains both the compiled policy and its complete empty issue list. -/
theorem validateGeometryIntentCandidate_sound
    (intent : GeometryIntent)
    (candidate : MoleculeSnapshot)
    (valid : validateGeometryIntentCandidate intent candidate = true) :
    GeometryIntentCandidateSemantics intent candidate := by
  cases compiled : compileGeometryPolicy intent with
  | none => simp [validateGeometryIntentCandidate, compiled] at valid
  | some policy =>
      refine ⟨policy, compiled, ?_⟩
      simpa [validateGeometryIntentCandidate, compiled] using valid

end RetainMol.Geometry
