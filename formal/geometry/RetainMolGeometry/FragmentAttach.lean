import RetainMolGeometry.AtomPortMate
import RetainMolGeometry.PortTorsion

namespace RetainMol.Geometry

/--
Trusted fragment-attachment intent. The host radial reference and requested
turn belong to policy input rather than to the candidate-supplied witness.
-/
structure FragmentAttachPolicy where
  atomPortMate : AtomPortMatePolicy
  expectedHostFrame : PortFrameRef
  expectedGuestFrame : PortFrameRef
  guestPortAlignment : DirectedSegmentAlignment
  expectedTurn : TurnBand
deriving Repr, DecidableEq, BEq

def fragmentAttachPolicyIsWellFormed
    (policy : FragmentAttachPolicy) : Bool :=
  atomPortMatePolicyIsWellFormed policy.atomPortMate &&
    policy.expectedHostFrame.originAtomId ==
      policy.atomPortMate.linkDistance.atomId1 &&
    policy.expectedHostFrame.axisAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    policy.expectedGuestFrame.originAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    policy.expectedGuestFrame.axisAtomId ==
      policy.atomPortMate.linkDistance.atomId1 &&
    policy.expectedGuestFrame.radialAtomId ==
      policy.atomPortMate.guestRegion.frame.radialAtomId &&
    policy.guestPortAlignment.referenceOriginAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    policy.guestPortAlignment.referenceTipAtomId ==
      policy.atomPortMate.guestRegion.frame.axisAtomId &&
    policy.guestPortAlignment.candidateOriginAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    policy.guestPortAlignment.candidateTipAtomId ==
      policy.atomPortMate.linkDistance.atomId1 &&
    directedSegmentAlignmentPolicyIsWellFormed policy.guestPortAlignment &&
    turnBandIsWellFormed policy.expectedTurn

/--
One bound fragment-attachment witness. The graph rewrite and the oriented port
torsion cannot be supplied independently: their host, guest and radial
witnesses must belong to the same retained host and added guest region, and the
candidate must echo the trusted host radial and requested turn.
-/
structure FragmentAttachWitness where
  mate : AtomPortMate
  torsion : PortTorsion
deriving Repr, DecidableEq, BEq

def fragmentAttachCrossBindingIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness) : Bool :=
  fragmentAttachPolicyIsWellFormed policy &&
    witness.torsion.hostAtomId == witness.mate.hostAtomId &&
    witness.torsion.guestAtomId == policy.atomPortMate.guestAttachAtomId &&
    witness.torsion.hostFrame == policy.expectedHostFrame &&
    witness.torsion.guestFrame == policy.expectedGuestFrame &&
    witness.torsion.turn == policy.expectedTurn &&
    policy.atomPortMate.guestRegion.frame.originAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    witness.torsion.guestFrame.radialAtomId ==
      policy.atomPortMate.guestRegion.frame.radialAtomId &&
    (findAtom reference witness.torsion.hostFrame.radialAtomId).isSome &&
    !witness.mate.rewrite.removedAtomIds.contains
      witness.torsion.hostFrame.radialAtomId &&
    (componentWithoutBond reference witness.mate.leavingBondId
      witness.mate.hostAtomId).contains witness.torsion.hostFrame.radialAtomId &&
    policy.atomPortMate.guestRegion.atomIds.contains
      witness.torsion.guestFrame.radialAtomId &&
    (witness.mate.rewrite.addedAtoms.any fun atom =>
      atom.atomId == witness.torsion.guestFrame.radialAtomId) &&
    directedSegmentAlignmentIsSatisfied candidate candidate
      policy.guestPortAlignment

def fragmentAttachWitnessIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness) : Bool :=
  fragmentAttachCrossBindingIsSatisfied reference candidate policy witness &&
    atomPortMateIsSatisfied reference candidate policy.atomPortMate witness.mate &&
    portTorsionIsSatisfied candidate witness.torsion

def FragmentAttachWitnessSemantics
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness) : Prop :=
  fragmentAttachCrossBindingIsSatisfied reference candidate policy witness = true ∧
    AtomPortMateSemantics reference candidate policy.atomPortMate witness.mate ∧
    PortTorsionSemantics candidate witness.torsion

theorem fragmentAttachWitnessIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness)
    (h : fragmentAttachWitnessIsSatisfied reference candidate policy witness = true) :
    FragmentAttachWitnessSemantics reference candidate policy witness := by
  simp only [fragmentAttachWitnessIsSatisfied, Bool.and_eq_true] at h
  exact ⟨h.1.1,
    atomPortMateIsSatisfied_sound reference candidate policy.atomPortMate witness.mate h.1.2,
    portTorsionIsSatisfied_sound candidate witness.torsion h.2⟩

end RetainMol.Geometry
