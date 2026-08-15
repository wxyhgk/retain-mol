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
  | noRelationsProvided
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

private def mergeRelationEvaluationStatus :
    RelationEvaluationStatus → RelationEvaluationStatus → RelationEvaluationStatus
  | .reject, _ | _, .reject => .reject
  | .indeterminate, _ | _, .indeterminate => .indeterminate
  | .pass, .pass => .pass

def RelationEvaluation.merge
    (left right : RelationEvaluation) : RelationEvaluation := {
  status := mergeRelationEvaluationStatus left.status right.status
  issues := left.issues ++ right.issues
}

theorem RelationEvaluation.merge_pass_iff
    (left right : RelationEvaluation) :
    (left.merge right).status = .pass ↔
      left.status = .pass ∧ right.status = .pass := by
  cases hLeft : left.status <;> cases hRight : right.status <;>
    simp [RelationEvaluation.merge, mergeRelationEvaluationStatus, hLeft, hRight]

private def evaluateSpatialRelationsFrom
    (reference candidate : MoleculeSnapshot) :
    Nat → List SpatialRelation → RelationEvaluation
  | _, [] => { status := .pass }
  | relationIndex, relation :: rest =>
      (evaluateSpatialRelation reference candidate relationIndex relation).merge
        (evaluateSpatialRelationsFrom reference candidate (relationIndex + 1) rest)

def SpatialRelationsSemantics
    (reference candidate : MoleculeSnapshot)
    (relations : List SpatialRelation) : Prop :=
  relations ≠ [] ∧
    ∀ relation, relation ∈ relations →
      SpatialRelationSemantics reference candidate relation

private theorem evaluateSpatialRelationsFrom_pass_sound
    (reference candidate : MoleculeSnapshot)
    (relationIndex : Nat)
    (relations : List SpatialRelation)
    (h : (evaluateSpatialRelationsFrom reference candidate relationIndex relations).status =
      .pass) :
    ∀ relation, relation ∈ relations →
      SpatialRelationSemantics reference candidate relation := by
  induction relations generalizing relationIndex with
  | nil => simp
  | cons head tail inductionHypothesis =>
      simp only [evaluateSpatialRelationsFrom] at h
      have both := (RelationEvaluation.merge_pass_iff _ _).mp h
      intro relation member
      simp only [List.mem_cons] at member
      cases member with
      | inl isHead =>
          subst relation
          exact evaluateSpatialRelation_pass_sound reference candidate relationIndex head both.1
      | inr inTail =>
          exact inductionHypothesis (relationIndex + 1) both.2 relation inTail

def evaluateSpatialRelations
    (reference candidate : MoleculeSnapshot)
    (relations : List SpatialRelation) : RelationEvaluation :=
  if relations.isEmpty then
    rejectIssue none .noRelationsProvided
  else
    evaluateSpatialRelationsFrom reference candidate 0 relations

theorem evaluateSpatialRelations_pass_sound
    (reference candidate : MoleculeSnapshot)
    (relations : List SpatialRelation)
    (h : (evaluateSpatialRelations reference candidate relations).status = .pass) :
    SpatialRelationsSemantics reference candidate relations := by
  unfold evaluateSpatialRelations at h
  cases relations with
  | nil => simp [rejectIssue] at h
  | cons head tail =>
      refine ⟨by simp, ?_⟩
      exact evaluateSpatialRelationsFrom_pass_sound reference candidate 0
        (head :: tail) h

end RetainMol.Geometry
