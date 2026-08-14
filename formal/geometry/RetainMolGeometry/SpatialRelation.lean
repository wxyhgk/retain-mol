import RetainMolGeometry.Certificate

namespace RetainMol.Geometry

/-- Three stable atom references define a raw, unnormalised right-handed frame. -/
structure PortFrameRef where
  originAtomId : AtomId
  axisAtomId : AtomId
  radialAtomId : AtomId
  minAxisSquared : Nat := 1
  minAreaSquared : Nat := 1
deriving Repr, DecidableEq, BEq

structure ResolvedPortFrame where
  origin : Vec3
  axis : Vec3
  radial : Vec3
  normal : Vec3
deriving Repr, DecidableEq, BEq

def resolvePortFrame
    (molecule : MoleculeSnapshot)
    (frame : PortFrameRef) : Option ResolvedPortFrame := do
  let originAtom ← findAtom molecule frame.originAtomId
  let axisAtom ← findAtom molecule frame.axisAtomId
  let radialAtom ← findAtom molecule frame.radialAtomId
  let axis := Vec3.sub axisAtom.position originAtom.position
  let radial := Vec3.sub radialAtom.position originAtom.position
  pure {
    origin := originAtom.position
    axis := axis
    radial := radial
    normal := Vec3.cross axis radial
  }

def portFrameIsWellFormed
    (molecule : MoleculeSnapshot)
    (frame : PortFrameRef) : Bool :=
  let atomIds := [frame.originAtomId, frame.axisAtomId, frame.radialAtomId]
  allUnique atomIds &&
    decide (0 < frame.minAxisSquared) &&
    decide (0 < frame.minAreaSquared) &&
    match resolvePortFrame molecule frame with
    | some resolved =>
        decide (frame.minAxisSquared ≤ Vec3.squaredNorm resolved.axis) &&
          decide (frame.minAreaSquared ≤ Vec3.squaredNorm resolved.normal)
    | none => false

def PortFrameSemantics
    (molecule : MoleculeSnapshot)
    (frame : PortFrameRef) : Prop :=
  allUnique [frame.originAtomId, frame.axisAtomId, frame.radialAtomId] = true ∧
    0 < frame.minAxisSquared ∧
    0 < frame.minAreaSquared ∧
    ∃ resolved, resolvePortFrame molecule frame = some resolved ∧
      frame.minAxisSquared ≤ Vec3.squaredNorm resolved.axis ∧
      frame.minAreaSquared ≤ Vec3.squaredNorm resolved.normal

theorem portFrameIsWellFormed_sound
    (molecule : MoleculeSnapshot)
    (frame : PortFrameRef)
    (h : portFrameIsWellFormed molecule frame = true) :
    PortFrameSemantics molecule frame := by
  unfold portFrameIsWellFormed at h
  simp only [Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨hUnique, hAxisMargin⟩, hAreaMargin⟩, hResolved⟩
  cases hResolve : resolvePortFrame molecule frame with
  | none => simp [hResolve] at hResolved
  | some resolved =>
      simp only [hResolve, Bool.and_eq_true] at hResolved
      exact ⟨hUnique, of_decide_eq_true hAxisMargin,
        of_decide_eq_true hAreaMargin, resolved, hResolve,
        of_decide_eq_true hResolved.1, of_decide_eq_true hResolved.2⟩

/--
A finite rigid-region certificate. Pairwise distances rule out distortion; the
fourth stable atom supplies an orientation witness that rules out reflection.
The margins and tolerance are trusted-policy values, not planner inputs.
-/
structure ProperRigidRegion where
  atomIds : List AtomId
  frame : PortFrameRef
  handednessAtomId : AtomId
  maxSquaredDistanceDelta : Nat
  minAbsVolume6 : Nat := 1
deriving Repr, DecidableEq, BEq

def properRigidGroup (region : ProperRigidRegion) : RigidAtomGroup := {
  atomIds := region.atomIds
  maxSquaredDistanceDelta := region.maxSquaredDistanceDelta
}

def properRigidOrientation (region : ProperRigidRegion) : OrientationCheck := {
  atomId1 := region.frame.originAtomId
  atomId2 := region.frame.axisAtomId
  atomId3 := region.frame.radialAtomId
  atomId4 := region.handednessAtomId
  minAbsVolume6 := region.minAbsVolume6
}

def properRigidRegionIsWellFormed
    (reference : MoleculeSnapshot)
    (region : ProperRigidRegion) : Bool :=
  let witnessIds := [
    region.frame.originAtomId,
    region.frame.axisAtomId,
    region.frame.radialAtomId,
    region.handednessAtomId,
  ]
  decide (4 ≤ region.atomIds.length) &&
    allUnique region.atomIds &&
    witnessIds.all region.atomIds.contains &&
    portFrameIsWellFormed reference region.frame &&
    orientationIsPreserved reference reference (properRigidOrientation region)

def properRigidRegionIsPreserved
    (reference candidate : MoleculeSnapshot)
    (region : ProperRigidRegion) : Bool :=
  properRigidRegionIsWellFormed reference region &&
    portFrameIsWellFormed candidate region.frame &&
    rigidAtomGroupIsPreserved reference candidate (properRigidGroup region) &&
    orientationIsPreserved reference candidate (properRigidOrientation region)

def ProperRigidRegionSemantics
    (reference candidate : MoleculeSnapshot)
    (region : ProperRigidRegion) : Prop :=
  properRigidRegionIsWellFormed reference region = true ∧
    portFrameIsWellFormed candidate region.frame = true ∧
    rigidAtomGroupIsPreserved reference candidate (properRigidGroup region) = true ∧
    orientationIsPreserved reference candidate (properRigidOrientation region) = true

theorem properRigidRegionIsPreserved_sound
    (reference candidate : MoleculeSnapshot)
    (region : ProperRigidRegion)
    (h : properRigidRegionIsPreserved reference candidate region = true) :
    ProperRigidRegionSemantics reference candidate region := by
  simp only [properRigidRegionIsPreserved, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨hWellFormed, hFrame⟩, hRigid⟩, hOrientation⟩
  exact ⟨hWellFormed, hFrame, hRigid, hOrientation⟩

inductive SignClass where
  | negative
  | nearZero
  | positive
deriving Repr, DecidableEq, BEq

/-- A closed rational interval `[loNum/loDen, hiNum/hiDen]` in `[0,1]`. -/
structure RatioBand where
  loNum : Int
  loDen : Int
  hiNum : Int
  hiDen : Int
deriving Repr, DecidableEq, BEq

def ratioBandIsWellFormed (band : RatioBand) : Bool :=
  decide (0 ≤ band.loNum) &&
    decide (0 < band.loDen) &&
    decide (0 ≤ band.hiNum) &&
    decide (0 < band.hiDen) &&
    decide (band.loNum ≤ band.loDen) &&
    decide (band.hiNum ≤ band.hiDen) &&
    decide (band.loNum * band.hiDen ≤ band.hiNum * band.loDen)

def squaredRatioInBand
    (value denominator : Int)
    (band : RatioBand) : Bool :=
  ratioBandIsWellFormed band &&
    decide (0 < denominator) &&
    decide (band.loNum * denominator ≤ band.loDen * value * value) &&
    decide (band.hiDen * value * value ≤ band.hiNum * denominator)

def signClassMatches (margin : Nat) (expected : SignClass) (value : Int) : Bool :=
  match expected with
  | .negative => decide (value < -Int.ofNat margin)
  | .nearZero => decide (value.natAbs ≤ margin)
  | .positive => decide (Int.ofNat margin < value)

/--
The requested signed angle as rational bands for squared sine/cosine plus their
signs. This turns the angle check into integer polynomial inequalities.
-/
structure TurnBand where
  cosineSign : SignClass
  sineSign : SignClass
  signMargin : Nat := 0
  cosineSquared : RatioBand
  sineSquared : RatioBand
deriving Repr, DecidableEq, BEq

def turnBandIsWellFormed (turn : TurnBand) : Bool :=
  ratioBandIsWellFormed turn.cosineSquared &&
    ratioBandIsWellFormed turn.sineSquared

structure TurnComponents where
  cosineNumerator : Int
  sineNumerator : Int
  cosineDenominator : Int
  sineDenominator : Int
deriving Repr, DecidableEq, BEq

def resolveTurnComponents
    (reference candidate : MoleculeSnapshot)
    (frame : PortFrameRef) : Option TurnComponents := do
  let beforeFrame ← resolvePortFrame reference frame
  let afterFrame ← resolvePortFrame candidate frame
  let beforeRadial := Vec3.radialNumerator beforeFrame.axis beforeFrame.radial
  let afterRadial := Vec3.radialNumerator beforeFrame.axis afterFrame.radial
  let radialDenominator :=
    Vec3.squaredNorm beforeRadial * Vec3.squaredNorm afterRadial
  pure {
    cosineNumerator := Vec3.dot beforeRadial afterRadial
    sineNumerator := Vec3.dot beforeFrame.axis (Vec3.cross beforeRadial afterRadial)
    cosineDenominator := radialDenominator
    sineDenominator := Vec3.squaredNorm beforeFrame.axis * radialDenominator
  }

def turnBandIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (frame : PortFrameRef)
    (turn : TurnBand) : Bool :=
  turnBandIsWellFormed turn &&
    match resolveTurnComponents reference candidate frame with
    | none => false
    | some components =>
        signClassMatches turn.signMargin turn.cosineSign components.cosineNumerator &&
          signClassMatches turn.signMargin turn.sineSign components.sineNumerator &&
          squaredRatioInBand components.cosineNumerator
            components.cosineDenominator turn.cosineSquared &&
          squaredRatioInBand components.sineNumerator
            components.sineDenominator turn.sineSquared

def TurnBandSemantics
    (reference candidate : MoleculeSnapshot)
    (frame : PortFrameRef)
    (turn : TurnBand) : Prop :=
  turnBandIsWellFormed turn = true ∧
    ∃ components, resolveTurnComponents reference candidate frame = some components ∧
      signClassMatches turn.signMargin turn.cosineSign components.cosineNumerator = true ∧
      signClassMatches turn.signMargin turn.sineSign components.sineNumerator = true ∧
      squaredRatioInBand components.cosineNumerator
        components.cosineDenominator turn.cosineSquared = true ∧
      squaredRatioInBand components.sineNumerator
        components.sineDenominator turn.sineSquared = true

theorem turnBandIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (frame : PortFrameRef)
    (turn : TurnBand)
    (h : turnBandIsSatisfied reference candidate frame turn = true) :
    TurnBandSemantics reference candidate frame turn := by
  unfold turnBandIsSatisfied at h
  simp only [Bool.and_eq_true] at h
  rcases h with ⟨hBand, hComponents⟩
  cases hResolve : resolveTurnComponents reference candidate frame with
  | none => simp [hResolve] at hComponents
  | some components =>
      simp only [hResolve, Bool.and_eq_true] at hComponents
      rcases hComponents with ⟨⟨⟨hCosSign, hSinSign⟩, hCosRatio⟩, hSinRatio⟩
      exact ⟨hBand, components, hResolve, hCosSign, hSinSign,
        hCosRatio, hSinRatio⟩

def sameAtomIdSet (left right : List AtomId) : Bool :=
  allUnique left && allUnique right &&
    decide (left.length = right.length) &&
    left.all right.contains

def bondOtherEndpoint (bond : Bond) (atomId : AtomId) : Option AtomId :=
  if bond.atomId1 == atomId then some bond.atomId2
  else if bond.atomId2 == atomId then some bond.atomId1
  else none

def neighborAtomIdsExceptBond
    (molecule : MoleculeSnapshot)
    (excludedBondId : BondId)
    (atomId : AtomId) : List AtomId :=
  molecule.bonds.filterMap fun bond =>
    if bond.bondId == excludedBondId then none else bondOtherEndpoint bond atomId

def expandReachable
    (molecule : MoleculeSnapshot)
    (excludedBondId : BondId)
    (visited : List AtomId) : List AtomId :=
  (visited ++ visited.flatMap (neighborAtomIdsExceptBond molecule excludedBondId)).eraseDups

def expandReachableN
    (molecule : MoleculeSnapshot)
    (excludedBondId : BondId) : Nat → List AtomId → List AtomId
  | 0, visited => visited
  | steps + 1, visited =>
      expandReachableN molecule excludedBondId steps
        (expandReachable molecule excludedBondId visited)

def componentWithoutBond
    (molecule : MoleculeSnapshot)
    (excludedBondId : BondId)
    (seed : AtomId) : List AtomId :=
  expandReachableN molecule excludedBondId molecule.atoms.length [seed]

def axisBondMatches
    (molecule : MoleculeSnapshot)
    (axisBondId : BondId)
    (fixedAxisAtomId movingAxisAtomId : AtomId) : Bool :=
  match findBond molecule axisBondId with
  | none => false
  | some bond =>
      bond.order == .single &&
        ((bond.atomId1 == fixedAxisAtomId && bond.atomId2 == movingAxisAtomId) ||
          (bond.atomId1 == movingAxisAtomId && bond.atomId2 == fixedAxisAtomId))

structure RotatableJoint where
  commandId : String
  axisBondId : BondId
  fixedAxisAtomId : AtomId
  movingAxisAtomId : AtomId
  movingAtomIds : List AtomId
  region : ProperRigidRegion
  turn : TurnBand
deriving Repr, DecidableEq, BEq

def jointTopologyIsWellFormed
    (reference : MoleculeSnapshot)
    (joint : RotatableJoint) : Bool :=
  !joint.commandId.isEmpty &&
    topologyIsWellFormed reference &&
    axisBondMatches reference joint.axisBondId
      joint.fixedAxisAtomId joint.movingAxisAtomId &&
    sameAtomIdSet joint.movingAtomIds
      (componentWithoutBond reference joint.axisBondId joint.movingAxisAtomId) &&
    !joint.movingAtomIds.contains joint.fixedAxisAtomId &&
    joint.movingAtomIds.contains joint.movingAxisAtomId &&
    sameAtomIdSet joint.region.atomIds
      (joint.fixedAxisAtomId :: joint.movingAtomIds) &&
    joint.region.frame.originAtomId == joint.fixedAxisAtomId &&
    joint.region.frame.axisAtomId == joint.movingAxisAtomId &&
    properRigidRegionIsWellFormed reference joint.region &&
    turnBandIsWellFormed joint.turn

def stationaryAtomsArePreserved
    (reference candidate : MoleculeSnapshot)
    (movingAtomIds : List AtomId) : Bool :=
  reference.atoms.all fun atom =>
    movingAtomIds.contains atom.atomId ||
      fixedAtomIsPreserved reference candidate atom.atomId

def rotatableJointIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (joint : RotatableJoint) : Bool :=
  jointTopologyIsWellFormed reference joint &&
    topologyIsWellFormed candidate &&
    molecularGraphIsPreserved reference candidate &&
    stationaryAtomsArePreserved reference candidate joint.movingAtomIds &&
    fixedAtomIsPreserved reference candidate joint.movingAxisAtomId &&
    properRigidRegionIsPreserved reference candidate joint.region &&
    turnBandIsSatisfied reference candidate joint.region.frame joint.turn

def RotatableJointSemantics
    (reference candidate : MoleculeSnapshot)
    (joint : RotatableJoint) : Prop :=
  jointTopologyIsWellFormed reference joint = true ∧
    topologyIsWellFormed candidate = true ∧
    molecularGraphIsPreserved reference candidate = true ∧
    stationaryAtomsArePreserved reference candidate joint.movingAtomIds = true ∧
    fixedAtomIsPreserved reference candidate joint.movingAxisAtomId = true ∧
    ProperRigidRegionSemantics reference candidate joint.region ∧
    TurnBandSemantics reference candidate joint.region.frame joint.turn

theorem rotatableJointIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (joint : RotatableJoint)
    (h : rotatableJointIsSatisfied reference candidate joint = true) :
    RotatableJointSemantics reference candidate joint := by
  simp only [rotatableJointIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨⟨⟨⟨hTopology, hCandidate⟩, hGraph⟩,
    hStationary⟩, hMovingAxis⟩, hRigid⟩, hTurn⟩
  exact ⟨hTopology, hCandidate, hGraph, hStationary, hMovingAxis,
    properRigidRegionIsPreserved_sound _ _ _ hRigid,
    turnBandIsSatisfied_sound _ _ _ _ hTurn⟩

inductive SpatialRelation where
  | portFrame (frame : PortFrameRef)
  | properRigid (region : ProperRigidRegion)
  | rotatableJoint (joint : RotatableJoint)
deriving Repr, DecidableEq, BEq

private def spatialRelationLocalIsSatisfied
    (reference candidate : MoleculeSnapshot) : SpatialRelation → Bool
  | .portFrame frame =>
      portFrameIsWellFormed reference frame && portFrameIsWellFormed candidate frame
  | .properRigid region => properRigidRegionIsPreserved reference candidate region
  | .rotatableJoint joint => rotatableJointIsSatisfied reference candidate joint

private def SpatialRelationLocalSemantics
    (reference candidate : MoleculeSnapshot) : SpatialRelation → Prop
  | .portFrame frame =>
      PortFrameSemantics reference frame ∧ PortFrameSemantics candidate frame
  | .properRigid region => ProperRigidRegionSemantics reference candidate region
  | .rotatableJoint joint => RotatableJointSemantics reference candidate joint

/--
SpatialRelation documents are complete graph-preserving postconditions. A local
frame or rigid-region relation cannot turn a truncated candidate into a pass.
-/
def spatialRelationIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (relation : SpatialRelation) : Bool :=
  topologyIsWellFormed reference &&
    topologyIsWellFormed candidate &&
    molecularGraphIsPreserved reference candidate &&
    spatialRelationLocalIsSatisfied reference candidate relation

/-- Exact finite semantics of the checker; this does not claim real-number completeness. -/
def SpatialRelationSemantics
    (reference candidate : MoleculeSnapshot)
    (relation : SpatialRelation) : Prop :=
  topologyIsWellFormed reference = true ∧
    topologyIsWellFormed candidate = true ∧
    molecularGraphIsPreserved reference candidate = true ∧
    SpatialRelationLocalSemantics reference candidate relation

theorem spatialRelationIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (relation : SpatialRelation)
    (h : spatialRelationIsSatisfied reference candidate relation = true) :
    SpatialRelationSemantics reference candidate relation := by
  unfold spatialRelationIsSatisfied at h
  simp only [Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨hReference, hCandidate⟩, hGraph⟩, hLocal⟩
  refine ⟨hReference, hCandidate, hGraph, ?_⟩
  cases relation with
  | portFrame frame =>
      simp only [spatialRelationLocalIsSatisfied, Bool.and_eq_true] at hLocal
      exact ⟨portFrameIsWellFormed_sound _ _ hLocal.1,
        portFrameIsWellFormed_sound _ _ hLocal.2⟩
  | properRigid region => exact properRigidRegionIsPreserved_sound _ _ _ hLocal
  | rotatableJoint joint => exact rotatableJointIsSatisfied_sound _ _ _ hLocal

end RetainMol.Geometry
