import RetainMolGeometry.SpatialRelation

namespace RetainMol.Geometry

/--
An oriented torsion constraint between host-side and guest-side port frames in
one candidate snapshot. The common orientation is always `hostAtomId` to
`guestAtomId`; the guest frame itself points back toward the host so that each
frame remains local to its own port.
-/
structure PortTorsion where
  hostAtomId : AtomId
  guestAtomId : AtomId
  hostFrame : PortFrameRef
  guestFrame : PortFrameRef
  turn : TurnBand
deriving Repr, DecidableEq, BEq

/--
The two local frames must name opposite views of the same host--guest axis.
Their radial witnesses are kept distinct and must both be non-degenerate in
the candidate snapshot.
-/
def portTorsionIsWellFormed
    (candidate : MoleculeSnapshot)
    (torsion : PortTorsion) : Bool :=
  topologyIsWellFormed candidate &&
    torsion.hostAtomId != torsion.guestAtomId &&
    torsion.hostFrame.originAtomId == torsion.hostAtomId &&
    torsion.hostFrame.axisAtomId == torsion.guestAtomId &&
    torsion.guestFrame.originAtomId == torsion.guestAtomId &&
    torsion.guestFrame.axisAtomId == torsion.hostAtomId &&
    torsion.hostFrame.radialAtomId != torsion.guestFrame.radialAtomId &&
    portFrameIsWellFormed candidate torsion.hostFrame &&
    portFrameIsWellFormed candidate torsion.guestFrame &&
    torsion.turn.signMargin == 0 &&
    turnBandIsWellFormed torsion.turn

/--
Resolve the signed turn from the host radial to the guest radial, looking along
the common `hostAtomId -> guestAtomId` axis.
-/
def resolvePortTorsionComponents
    (candidate : MoleculeSnapshot)
    (torsion : PortTorsion) : Option TurnComponents := do
  let hostFrame ← resolvePortFrame candidate torsion.hostFrame
  let guestFrame ← resolvePortFrame candidate torsion.guestFrame
  let axis := hostFrame.axis
  let hostRadial := Vec3.radialNumerator axis hostFrame.radial
  let guestRadial := Vec3.radialNumerator axis guestFrame.radial
  let radialDenominator :=
    Vec3.squaredNorm hostRadial * Vec3.squaredNorm guestRadial
  pure {
    cosineNumerator := Vec3.dot hostRadial guestRadial
    sineNumerator := Vec3.dot axis (Vec3.cross hostRadial guestRadial)
    cosineDenominator := radialDenominator
    sineDenominator := Vec3.squaredNorm axis * radialDenominator
  }

def portTorsionIsSatisfied
    (candidate : MoleculeSnapshot)
    (torsion : PortTorsion) : Bool :=
  portTorsionIsWellFormed candidate torsion &&
    match resolvePortTorsionComponents candidate torsion with
    | none => false
    | some components =>
        signClassMatches torsion.turn.signMargin torsion.turn.cosineSign
            components.cosineNumerator &&
          signClassMatches torsion.turn.signMargin torsion.turn.sineSign
            components.sineNumerator &&
          squaredRatioInBand components.cosineNumerator
            components.cosineDenominator torsion.turn.cosineSquared &&
          squaredRatioInBand components.sineNumerator
            components.sineDenominator torsion.turn.sineSquared

/--
Exact finite semantics of the integer-coordinate checker. It constrains one
oriented angular band and does not assert a unique continuous-real conformation.
-/
def PortTorsionSemantics
    (candidate : MoleculeSnapshot)
    (torsion : PortTorsion) : Prop :=
  portTorsionIsWellFormed candidate torsion = true ∧
    ∃ components,
      resolvePortTorsionComponents candidate torsion = some components ∧
        signClassMatches torsion.turn.signMargin torsion.turn.cosineSign
            components.cosineNumerator = true ∧
          signClassMatches torsion.turn.signMargin torsion.turn.sineSign
              components.sineNumerator = true ∧
            squaredRatioInBand components.cosineNumerator
                components.cosineDenominator torsion.turn.cosineSquared = true ∧
              squaredRatioInBand components.sineNumerator
                components.sineDenominator torsion.turn.sineSquared = true

theorem portTorsionIsSatisfied_sound
    (candidate : MoleculeSnapshot)
    (torsion : PortTorsion)
    (h : portTorsionIsSatisfied candidate torsion = true) :
    PortTorsionSemantics candidate torsion := by
  unfold portTorsionIsSatisfied at h
  simp only [Bool.and_eq_true] at h
  rcases h with ⟨hWellFormed, hComponents⟩
  cases hResolve : resolvePortTorsionComponents candidate torsion with
  | none => simp [hResolve] at hComponents
  | some components =>
      simp only [hResolve, Bool.and_eq_true] at hComponents
      rcases hComponents with ⟨⟨⟨hCosSign, hSinSign⟩, hCosRatio⟩, hSinRatio⟩
      exact ⟨hWellFormed, components, hResolve, hCosSign, hSinSign,
        hCosRatio, hSinRatio⟩

end RetainMol.Geometry
