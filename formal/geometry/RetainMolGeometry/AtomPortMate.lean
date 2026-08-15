import RetainMolGeometry.GraphRewrite
import RetainMolGeometry.SpatialRelation

namespace RetainMol.Geometry

/--
System-owned policy for one registered, ID-mapped guest template. The planner
does not supply this value; a trusted compiler binds it to a command ID,
template graph, single-link policy, distance interval, and orientation witness.
-/
structure AtomPortMatePolicy where
  policyId : String
  expectedCommandId : String
  expectedLeavingHydrogenAtomId : AtomId
  expectedLeavingBondId : BondId
  guestReference : MoleculeSnapshot
  guestAttachAtomId : AtomId
  linkBondOrder : BondOrder := .single
  linkDistance : DistanceBound
  linkDirection : DirectedSegmentAlignment
  guestRegion : ProperRigidRegion
deriving Repr, DecidableEq, BEq

/--
Evidence emitted by the builder command. This first relation intentionally
supports exactly one operation: replace one terminal host H by one mapped guest
and one single link bond. Ring fusion and atom coalescing are different types.
-/
structure AtomPortMate where
  commandId : String
  rewrite : GraphRewrite
  hostAtomId : AtomId
  leavingHydrogenAtomId : AtomId
  leavingBondId : BondId
  linkBondId : BondId
deriving Repr, DecidableEq, BEq

private def sameBondIdSet (left right : List BondId) : Bool :=
  allUnique left && allUnique right &&
    decide (left.length = right.length) &&
    left.all right.contains

private def retainedHostAtomsArePreserved
    (reference candidate : MoleculeSnapshot)
    (rewrite : GraphRewrite) : Bool :=
  reference.atoms.all fun atom =>
    rewrite.removedAtomIds.contains atom.atomId ||
      fixedAtomIsPreserved reference candidate atom.atomId

private def addedInternalBonds
    (mate : AtomPortMate) : List Bond :=
  mate.rewrite.addedBonds.filter (fun bond => bond.bondId != mate.linkBondId)

private def expectedGuestSnapshot
    (mate : AtomPortMate) : MoleculeSnapshot := {
  atoms := mate.rewrite.addedAtoms
  bonds := addedInternalBonds mate
}

private def leavingHydrogenMatches
    (reference : MoleculeSnapshot)
    (mate : AtomPortMate) : Bool :=
  match findAtom reference mate.hostAtomId,
      findAtom reference mate.leavingHydrogenAtomId,
      findBond reference mate.leavingBondId with
  | some host, some atom, some bond =>
      host.symbol != "H" &&
        atom.symbol == "H" &&
        bond.order == .single &&
        ((bond.atomId1 == mate.hostAtomId &&
            bond.atomId2 == mate.leavingHydrogenAtomId) ||
          (bond.atomId2 == mate.hostAtomId &&
            bond.atomId1 == mate.leavingHydrogenAtomId))
  | _, _, _ => false

private def linkBondMatches
    (policy : AtomPortMatePolicy)
    (mate : AtomPortMate) : Bool :=
  match mate.rewrite.addedBonds.find? (fun bond => bond.bondId == mate.linkBondId) with
  | none => false
  | some bond =>
      bond.order == policy.linkBondOrder &&
        ((bond.atomId1 == mate.hostAtomId &&
            bond.atomId2 == policy.guestAttachAtomId) ||
          (bond.atomId2 == mate.hostAtomId &&
            bond.atomId1 == policy.guestAttachAtomId))

def atomPortMatePolicyIsWellFormed (policy : AtomPortMatePolicy) : Bool :=
  !policy.policyId.isEmpty &&
    !policy.expectedCommandId.isEmpty &&
    !policy.expectedLeavingHydrogenAtomId.isEmpty &&
    !policy.expectedLeavingBondId.isEmpty &&
    topologyIsWellFormed policy.guestReference &&
    policy.linkBondOrder == .single &&
    (match findAtom policy.guestReference policy.guestAttachAtomId with
      | some atom => atom.symbol != "H"
      | none => false) &&
    policy.linkDistance.atomId2 == policy.guestAttachAtomId &&
    policy.linkDirection.referenceOriginAtomId == policy.linkDistance.atomId1 &&
    policy.linkDirection.referenceTipAtomId == policy.expectedLeavingHydrogenAtomId &&
    policy.linkDirection.candidateOriginAtomId == policy.linkDistance.atomId1 &&
    policy.linkDirection.candidateTipAtomId == policy.guestAttachAtomId &&
    directedSegmentAlignmentPolicyIsWellFormed policy.linkDirection &&
    decide (minimumBondSquared ≤ policy.linkDistance.minSquared ∧
      policy.linkDistance.minSquared ≤ policy.linkDistance.maxSquared) &&
    sameAtomIdSet policy.guestRegion.atomIds
      (policy.guestReference.atoms.map (·.atomId)) &&
    properRigidRegionIsWellFormed policy.guestReference policy.guestRegion

def atomPortMateIsWellFormed
    (reference : MoleculeSnapshot)
    (policy : AtomPortMatePolicy)
    (mate : AtomPortMate) : Bool :=
    atomPortMatePolicyIsWellFormed policy &&
    mate.commandId == policy.expectedCommandId &&
    mate.leavingHydrogenAtomId == policy.expectedLeavingHydrogenAtomId &&
    mate.leavingBondId == policy.expectedLeavingBondId &&
    graphRewriteIsWellFormed reference mate.rewrite &&
    mate.rewrite.removedAtomIds == [mate.leavingHydrogenAtomId] &&
    mate.rewrite.removedBondIds == [mate.leavingBondId] &&
    leavingHydrogenMatches reference mate &&
    sameAtomIdSet (policy.guestReference.atoms.map (·.atomId))
      (mate.rewrite.addedAtoms.map (·.atomId)) &&
    sameBondIdSet (policy.guestReference.bonds.map (·.bondId))
      ((addedInternalBonds mate).map (·.bondId)) &&
    molecularGraphIsPreserved policy.guestReference
      (expectedGuestSnapshot mate) &&
    (findAtom reference mate.hostAtomId).isSome &&
    (findAtom policy.guestReference policy.guestAttachAtomId).isSome &&
    linkBondMatches policy mate &&
    policy.linkDistance.atomId1 == mate.hostAtomId

def atomPortMateIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : AtomPortMatePolicy)
    (mate : AtomPortMate) : Bool :=
  atomPortMateIsWellFormed reference policy mate &&
    graphRewriteIsSatisfied reference candidate mate.rewrite &&
    retainedHostAtomsArePreserved reference candidate mate.rewrite &&
    properRigidRegionIsPreserved policy.guestReference candidate policy.guestRegion &&
    distanceBoundIsSatisfied candidate policy.linkDistance &&
    directedSegmentAlignmentIsSatisfied reference candidate policy.linkDirection &&
    candidate.bonds.all (bondIsSeparated candidate) &&
    nonBondedCollisionFree candidate

/-- Exact finite semantics of the checker, not a proof of chemical completeness. -/
def AtomPortMateSemantics
    (reference candidate : MoleculeSnapshot)
    (policy : AtomPortMatePolicy)
    (mate : AtomPortMate) : Prop :=
  atomPortMateIsWellFormed reference policy mate = true ∧
    GraphRewriteSemantics reference candidate mate.rewrite ∧
    retainedHostAtomsArePreserved reference candidate mate.rewrite = true ∧
    ProperRigidRegionSemantics policy.guestReference candidate policy.guestRegion ∧
    distanceBoundIsSatisfied candidate policy.linkDistance = true ∧
    DirectedSegmentAlignmentSemantics reference candidate policy.linkDirection ∧
    candidate.bonds.all (bondIsSeparated candidate) = true ∧
    nonBondedCollisionFree candidate = true

theorem atomPortMateIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (policy : AtomPortMatePolicy)
    (mate : AtomPortMate)
    (h : atomPortMateIsSatisfied reference candidate policy mate = true) :
    AtomPortMateSemantics reference candidate policy mate := by
  simp only [atomPortMateIsSatisfied, Bool.and_eq_true] at h
  rcases h with
    ⟨⟨⟨⟨⟨⟨⟨hWellFormed, hRewrite⟩, hHost⟩, hGuest⟩, hDistance⟩,
      hDirection⟩, hBonds⟩, hCollision⟩
  exact ⟨hWellFormed,
    graphRewriteIsSatisfied_sound _ _ _ hRewrite,
    hHost,
    properRigidRegionIsPreserved_sound _ _ _ hGuest,
    hDistance,
    directedSegmentAlignmentIsSatisfied_sound _ _ _ hDirection,
    hBonds,
    hCollision⟩

end RetainMol.Geometry
