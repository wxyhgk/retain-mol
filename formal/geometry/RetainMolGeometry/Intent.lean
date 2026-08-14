import RetainMolGeometry.Command
import RetainMolGeometry.Certificate

namespace RetainMol.Geometry

/--
GeometryIntent V1 is the smallest trusted spatial request: an exact primitive
command sequence plus the complete expected post-state and any atoms that must
remain fixed. The AI does not provide a GeometryPolicy; the compiler below owns
that policy.
-/
structure GeometryIntent where
  before : MoleculeSnapshot
  commands : List PrimitiveCommand
  expected : MoleculeSnapshot
  protectedAnchorIds : List AtomId := []
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
  intent.commands.all (primitiveCommandAvoidsProtectedAnchors intent.protectedAnchorIds)

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
  orientationChecks := []
  rigidAtomGroups := []
}

def geometryIntentIsWellFormed (intent : GeometryIntent) : Bool :=
  topologyIsWellFormed intent.before &&
    allUnique intent.protectedAnchorIds &&
    intent.protectedAnchorIds.all (fun atomId => (findAtom intent.before atomId).isSome) &&
    protectedAnchorsAreUntouchedByCommands intent &&
    protectedAnchorsArePreserved intent &&
    decide (applyPrimitiveCommands intent.before intent.commands = some intent.expected) &&
    geometryPolicyIsWellFormed intent.expected (compiledGeometryPolicy intent) &&
    validateGeometryPolicy intent.expected intent.expected (compiledGeometryPolicy intent)

/-- Fail-closed compiler entry point used by future external bridges. -/
def compileGeometryPolicy (intent : GeometryIntent) : Option GeometryPolicy :=
  if geometryIntentIsWellFormed intent then
    some (compiledGeometryPolicy intent)
  else
    none

/--
A successful compilation proves that the expected molecule is the exact result
of the command sequence, protected anchors were preserved, and the generated
policy is both well formed and self-validating.
-/
theorem compileGeometryPolicy_self_check_sound
    (intent : GeometryIntent)
    (policy : GeometryPolicy)
    (compiled : compileGeometryPolicy intent = some policy) :
    applyPrimitiveCommands intent.before intent.commands = some intent.expected ∧
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
  have parts := valid
  simp only [geometryIntentIsWellFormed, Bool.and_eq_true] at parts
  subst policy
  exact ⟨of_decide_eq_true parts.1.1.2, parts.1.1.1.1.2,
    parts.1.1.1.2, rfl, parts.1.2, parts.2⟩

end RetainMol.Geometry
