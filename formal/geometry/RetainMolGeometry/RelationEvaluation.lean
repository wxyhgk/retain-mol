import RetainMolGeometry.SpatialRelation

namespace RetainMol.Geometry

inductive RelationEvaluationStatus where
  | pass
  | reject
  | indeterminate
deriving Repr, DecidableEq, BEq

inductive RelationIssueClass where
  | contradiction
  | numericMargin
deriving Repr, DecidableEq, BEq

inductive RelationIssueCode where
  | referenceTopologyInvalid
  | candidateTopologyInvalid
  | molecularGraphChanged
  | relationDefinitionInvalid
  | referenceEvidenceInsufficient
  | relationNotSatisfied
deriving Repr, DecidableEq, BEq

structure RelationIssue where
  relationIndex : Option Nat
  issueClass : RelationIssueClass
  code : RelationIssueCode
deriving Repr, DecidableEq, BEq

structure RelationEvaluation where
  status : RelationEvaluationStatus
  issues : List RelationIssue := []
deriving Repr, DecidableEq, BEq

private def rejectIssue
    (relationIndex : Option Nat)
    (code : RelationIssueCode) : RelationEvaluation := {
  status := .reject
  issues := [{ relationIndex, issueClass := .contradiction, code }]
}

private def indeterminateIssue
    (relationIndex : Option Nat)
    (code : RelationIssueCode) : RelationEvaluation := {
  status := .indeterminate
  issues := [{ relationIndex, issueClass := .numericMargin, code }]
}

private def atomExists (molecule : MoleculeSnapshot) (atomId : AtomId) : Bool :=
  (findAtom molecule atomId).isSome

/-- Contract checks contain no coordinate-margin decisions. -/
private def portFrameContractIsWellFormed
    (molecule : MoleculeSnapshot)
    (frame : PortFrameRef) : Bool :=
  allUnique [frame.originAtomId, frame.axisAtomId, frame.radialAtomId] &&
    decide (0 < frame.minAxisSquared) &&
    decide (0 < frame.minAreaSquared) &&
    atomExists molecule frame.originAtomId &&
    atomExists molecule frame.axisAtomId &&
    atomExists molecule frame.radialAtomId

private def properRigidRegionContractIsWellFormed
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
    portFrameContractIsWellFormed reference region.frame &&
    atomExists reference region.handednessAtomId &&
    decide (0 < region.minAbsVolume6)

private def rotatableJointContractIsWellFormed
    (reference : MoleculeSnapshot)
    (joint : RotatableJoint) : Bool :=
  !joint.commandId.isEmpty &&
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
    properRigidRegionContractIsWellFormed reference joint.region &&
    turnBandIsWellFormed joint.turn

private def spatialRelationContractIsWellFormed
    (reference : MoleculeSnapshot) : SpatialRelation → Bool
  | .portFrame frame => portFrameContractIsWellFormed reference frame
  | .properRigid region => properRigidRegionContractIsWellFormed reference region
  | .rotatableJoint joint => rotatableJointContractIsWellFormed reference joint

/--
Only reference-side margins can make an otherwise valid request indeterminate.
Once the reference is observable, a collapsed or distorted candidate is a
contradiction rather than an excuse to abstain.
-/
private def referenceEvidenceIsSufficient
    (reference : MoleculeSnapshot) : SpatialRelation → Bool
  | .portFrame frame => portFrameIsWellFormed reference frame
  | .properRigid region => properRigidRegionIsWellFormed reference region
  | .rotatableJoint joint => jointTopologyIsWellFormed reference joint

def evaluateSpatialRelation
    (reference candidate : MoleculeSnapshot)
    (relationIndex : Nat)
    (relation : SpatialRelation) : RelationEvaluation :=
  if !topologyIsWellFormed reference then
    rejectIssue none .referenceTopologyInvalid
  else if !topologyIsWellFormed candidate then
    rejectIssue none .candidateTopologyInvalid
  else if !molecularGraphIsPreserved reference candidate then
    rejectIssue none .molecularGraphChanged
  else if !spatialRelationContractIsWellFormed reference relation then
    rejectIssue (some relationIndex) .relationDefinitionInvalid
  else if !referenceEvidenceIsSufficient reference relation then
    indeterminateIssue (some relationIndex) .referenceEvidenceInsufficient
  else if spatialRelationIsSatisfied reference candidate relation then
    { status := .pass }
  else
    rejectIssue (some relationIndex) .relationNotSatisfied

theorem evaluateSpatialRelation_pass_sound
    (reference candidate : MoleculeSnapshot)
    (relationIndex : Nat)
    (relation : SpatialRelation)
    (h : (evaluateSpatialRelation reference candidate relationIndex relation).status =
      .pass) :
    SpatialRelationSemantics reference candidate relation := by
  unfold evaluateSpatialRelation at h
  simp only [rejectIssue, indeterminateIssue] at h
  split at h <;> simp_all
  split at h <;> simp_all
  split at h <;> simp_all
  split at h <;> simp_all
  split at h <;> simp_all
  split at h <;> simp_all
  exact spatialRelationIsSatisfied_sound reference candidate relation (by assumption)

def RelationEvaluation.merge
    (left right : RelationEvaluation) : RelationEvaluation :=
  let status :=
    if left.status == .reject || right.status == .reject then .reject
    else if left.status == .indeterminate || right.status == .indeterminate then
      .indeterminate
    else .pass
  { status, issues := left.issues ++ right.issues }

def evaluateSpatialRelations
    (reference candidate : MoleculeSnapshot)
    (relations : List SpatialRelation) : RelationEvaluation :=
  relations.zipIdx.foldl
    (fun evaluation indexed =>
      evaluation.merge
        (evaluateSpatialRelation reference candidate indexed.2 indexed.1))
    { status := .pass }

end RetainMol.Geometry
