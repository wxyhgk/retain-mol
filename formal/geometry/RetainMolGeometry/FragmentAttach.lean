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

/-- The torsion effect is constructed entirely from trusted policy fields. -/
def FragmentAttachPolicy.expectedTorsion
    (policy : FragmentAttachPolicy) : PortTorsion := {
  hostAtomId := policy.atomPortMate.linkDistance.atomId1
  guestAtomId := policy.atomPortMate.guestAttachAtomId
  hostFrame := policy.expectedHostFrame
  guestFrame := policy.expectedGuestFrame
  turn := policy.expectedTurn
}

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
One fragment-attachment evaluation witness. It supplies a concrete rewrite and
cached torsion value, but neither value defines the trusted attachment effect.
-/
structure FragmentAttachWitness where
  mate : AtomPortMate
  torsion : PortTorsion
deriving Repr, DecidableEq, BEq

def fragmentAttachPolicyEffectBindingIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (mate : AtomPortMate) : Bool :=
  fragmentAttachPolicyIsWellFormed policy &&
    mate.hostAtomId == policy.atomPortMate.linkDistance.atomId1 &&
    policy.atomPortMate.guestRegion.frame.originAtomId ==
      policy.atomPortMate.guestAttachAtomId &&
    policy.expectedGuestFrame.radialAtomId ==
      policy.atomPortMate.guestRegion.frame.radialAtomId &&
    (findAtom reference policy.expectedHostFrame.radialAtomId).isSome &&
    !mate.rewrite.removedAtomIds.contains
      policy.expectedHostFrame.radialAtomId &&
    (componentWithoutBond reference policy.atomPortMate.expectedLeavingBondId
      policy.atomPortMate.linkDistance.atomId1).contains
        policy.expectedHostFrame.radialAtomId &&
    policy.atomPortMate.guestRegion.atomIds.contains
      policy.expectedGuestFrame.radialAtomId &&
    (mate.rewrite.addedAtoms.any fun atom =>
      atom.atomId == policy.expectedGuestFrame.radialAtomId) &&
    directedSegmentAlignmentIsSatisfied candidate candidate
      policy.guestPortAlignment

def fragmentAttachCrossBindingIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness) : Bool :=
  decide (witness.torsion = policy.expectedTorsion) &&
    fragmentAttachPolicyEffectBindingIsSatisfied reference candidate policy
      witness.mate

def fragmentAttachWitnessIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness) : Bool :=
  fragmentAttachCrossBindingIsSatisfied reference candidate policy witness &&
    atomPortMateIsSatisfied reference candidate policy.atomPortMate witness.mate &&
    portTorsionIsSatisfied candidate witness.torsion

def FragmentAttachSemantics
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy) : Prop :=
  ∃ mate,
    fragmentAttachPolicyEffectBindingIsSatisfied reference candidate policy mate = true ∧
      AtomPortMateSemantics reference candidate policy.atomPortMate mate ∧
      PortTorsionSemantics candidate policy.expectedTorsion

theorem fragmentAttachWitnessIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (policy : FragmentAttachPolicy)
    (witness : FragmentAttachWitness)
    (h : fragmentAttachWitnessIsSatisfied reference candidate policy witness = true) :
    FragmentAttachSemantics reference candidate policy := by
  simp only [fragmentAttachWitnessIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨hBinding, hMate⟩, hTorsion⟩
  simp only [fragmentAttachCrossBindingIsSatisfied, Bool.and_eq_true] at hBinding
  have hTorsionExact : witness.torsion = policy.expectedTorsion :=
    of_decide_eq_true hBinding.1
  refine ⟨witness.mate, hBinding.2,
    atomPortMateIsSatisfied_sound reference candidate policy.atomPortMate
      witness.mate hMate, ?_⟩
  rw [← hTorsionExact]
  exact portTorsionIsSatisfied_sound candidate witness.torsion hTorsion

end RetainMol.Geometry
