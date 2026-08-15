import RetainMolGeometry.FragmentAttach

namespace RetainMol.Geometry

/-- The two high-level geometry witnesses currently admitted by the formal gate. -/
inductive RelationWitness where
  | rotateGroup (joint : RotatableJoint)
  | fragmentAttach (witness : FragmentAttachWitness)
deriving Repr, DecidableEq, BEq

def RelationWitness.commandId : RelationWitness → String
  | .rotateGroup joint => joint.commandId
  | .fragmentAttach witness => witness.mate.commandId

def RelationWitness.commandKind : RelationWitness → String
  | .rotateGroup _ => "geometry.rotateGroup"
  | .fragmentAttach _ => "fragment.attach"

def relationWitnessIsSatisfied
    (before after : MoleculeSnapshot) : RelationWitness → Bool
  | .rotateGroup joint => rotatableJointIsSatisfied before after joint
  | .fragmentAttach witness =>
      fragmentAttachWitnessIsSatisfied before after witness

def RelationWitnessSemantics
    (before after : MoleculeSnapshot) : RelationWitness → Prop
  | .rotateGroup joint => RotatableJointSemantics before after joint
  | .fragmentAttach witness =>
      FragmentAttachWitnessSemantics before after witness

theorem relationWitnessIsSatisfied_sound
    (before after : MoleculeSnapshot)
    (witness : RelationWitness)
    (h : relationWitnessIsSatisfied before after witness = true) :
    RelationWitnessSemantics before after witness := by
  cases witness with
  | rotateGroup joint => exact rotatableJointIsSatisfied_sound before after joint h
  | fragmentAttach witness =>
      exact fragmentAttachWitnessIsSatisfied_sound before after witness h

/-- Runtime receipt identity independently frozen by the trusted projector. -/
structure RelationCommandReceipt where
  commandId : String
  commandKind : String
  preDigest : String
  postDigest : String
deriving Repr, DecidableEq, BEq

def relationCommandReceiptIsWellFormed (receipt : RelationCommandReceipt) : Bool :=
  !receipt.commandId.isEmpty &&
    !receipt.commandKind.isEmpty &&
    !receipt.preDigest.isEmpty &&
    !receipt.postDigest.isEmpty

structure RelationTraceIdentity where
  projectionVersion : String
  planId : String
  enforcedPlanSha256 : String
  baseDigest : String
  finalDigest : String
deriving Repr, DecidableEq, BEq

def relationTraceIdentityIsWellFormed (identity : RelationTraceIdentity) : Bool :=
  !identity.projectionVersion.isEmpty &&
    !identity.planId.isEmpty &&
    !identity.enforcedPlanSha256.isEmpty &&
    !identity.baseDigest.isEmpty &&
    !identity.finalDigest.isEmpty

/-- One receipt step carries both complete snapshots; digests alone never establish continuity. -/
structure RelationTraceStep where
  receipt : RelationCommandReceipt
  before : MoleculeSnapshot
  after : MoleculeSnapshot
  witness : RelationWitness
deriving Repr, DecidableEq, BEq

structure RelationTrace where
  identity : RelationTraceIdentity
  base : MoleculeSnapshot
  final : MoleculeSnapshot
  steps : List RelationTraceStep
deriving Repr, DecidableEq, BEq

def relationTraceStepIsSatisfied
    (currentDigest : String)
    (current : MoleculeSnapshot)
    (step : RelationTraceStep) : Bool :=
  step.receipt.preDigest == currentDigest &&
    decide (step.before = current) &&
    step.receipt.commandId == step.witness.commandId &&
    step.receipt.commandKind == step.witness.commandKind &&
    relationWitnessIsSatisfied step.before step.after step.witness

def RelationTraceStepSemantics
    (currentDigest : String)
    (current : MoleculeSnapshot)
    (step : RelationTraceStep) : Prop :=
  step.receipt.preDigest = currentDigest ∧
    step.before = current ∧
    step.receipt.commandId = step.witness.commandId ∧
    step.receipt.commandKind = step.witness.commandKind ∧
    RelationWitnessSemantics step.before step.after step.witness

theorem relationTraceStepIsSatisfied_sound
    (currentDigest : String)
    (current : MoleculeSnapshot)
    (step : RelationTraceStep)
    (h : relationTraceStepIsSatisfied currentDigest current step = true) :
    RelationTraceStepSemantics currentDigest current step := by
  simp only [relationTraceStepIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨⟨hPre, hBefore⟩, hCommandId⟩, hCommandKind⟩, hWitness⟩
  exact ⟨of_decide_eq_true hPre, of_decide_eq_true hBefore,
    of_decide_eq_true hCommandId, of_decide_eq_true hCommandKind,
    relationWitnessIsSatisfied_sound _ _ _ hWitness⟩

def relationTraceChainIsSatisfied :
    String → MoleculeSnapshot → List RelationTraceStep →
      String → MoleculeSnapshot → Bool
  | currentDigest, current, [], finalDigest, final =>
      decide (currentDigest = finalDigest) && decide (current = final)
  | currentDigest, current, step :: rest, finalDigest, final =>
      relationTraceStepIsSatisfied currentDigest current step &&
        relationTraceChainIsSatisfied step.receipt.postDigest step.after
          rest finalDigest final

inductive RelationTraceChainSemantics :
    String → MoleculeSnapshot → List RelationTraceStep →
      String → MoleculeSnapshot → Prop where
  | nil
      (currentDigest finalDigest : String)
      (current final : MoleculeSnapshot)
      (digestExact : currentDigest = finalDigest)
      (snapshotExact : current = final) :
      RelationTraceChainSemantics currentDigest current [] finalDigest final
  | cons
      (currentDigest finalDigest : String)
      (current final : MoleculeSnapshot)
      (step : RelationTraceStep)
      (rest : List RelationTraceStep)
      (stepExact : RelationTraceStepSemantics currentDigest current step)
      (tailExact : RelationTraceChainSemantics step.receipt.postDigest step.after
        rest finalDigest final) :
      RelationTraceChainSemantics currentDigest current (step :: rest) finalDigest final

theorem relationTraceChainIsSatisfied_sound
    (currentDigest finalDigest : String)
    (current final : MoleculeSnapshot)
    (steps : List RelationTraceStep)
    (h : relationTraceChainIsSatisfied currentDigest current steps finalDigest final = true) :
    RelationTraceChainSemantics currentDigest current steps finalDigest final := by
  induction steps generalizing currentDigest current with
  | nil =>
      simp only [relationTraceChainIsSatisfied, Bool.and_eq_true] at h
      exact .nil currentDigest finalDigest current final
        (of_decide_eq_true h.1) (of_decide_eq_true h.2)
  | cons step rest inductionHypothesis =>
      simp only [relationTraceChainIsSatisfied, Bool.and_eq_true] at h
      exact .cons currentDigest finalDigest current final step rest
        (relationTraceStepIsSatisfied_sound _ _ _ h.1)
        (inductionHypothesis step.receipt.postDigest step.after h.2)

def relationTraceHeaderIsSatisfied
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace) : Bool :=
  relationTraceIdentityIsWellFormed expectedIdentity &&
    !expectedReceipts.isEmpty &&
    allUnique (expectedReceipts.map (·.commandId)) &&
    expectedReceipts.all relationCommandReceiptIsWellFormed &&
    decide (trace.identity = expectedIdentity) &&
    decide (trace.steps.map (·.receipt) = expectedReceipts)

def RelationTraceHeaderSemantics
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace) : Prop :=
  relationTraceIdentityIsWellFormed expectedIdentity = true ∧
    expectedReceipts ≠ [] ∧
    allUnique (expectedReceipts.map (·.commandId)) = true ∧
    expectedReceipts.all relationCommandReceiptIsWellFormed = true ∧
    trace.identity = expectedIdentity ∧
    trace.steps.map (·.receipt) = expectedReceipts

theorem relationTraceHeaderIsSatisfied_sound
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace)
    (h : relationTraceHeaderIsSatisfied expectedIdentity expectedReceipts trace = true) :
    RelationTraceHeaderSemantics expectedIdentity expectedReceipts trace := by
  simp only [relationTraceHeaderIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨⟨⟨hIdentity, hNonempty⟩, hUnique⟩, hReceipts⟩,
    hTraceIdentity⟩, hTraceReceipts⟩
  refine ⟨hIdentity, ?_, hUnique, hReceipts,
    of_decide_eq_true hTraceIdentity, of_decide_eq_true hTraceReceipts⟩
  intro isEmpty
  subst expectedReceipts
  simp at hNonempty

def relationTraceIsSatisfied
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace) : Bool :=
  relationTraceHeaderIsSatisfied expectedIdentity expectedReceipts trace &&
    relationTraceChainIsSatisfied expectedIdentity.baseDigest trace.base trace.steps
      expectedIdentity.finalDigest trace.final

def RelationTraceSemantics
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace) : Prop :=
  RelationTraceHeaderSemantics expectedIdentity expectedReceipts trace ∧
    RelationTraceChainSemantics expectedIdentity.baseDigest trace.base trace.steps
      expectedIdentity.finalDigest trace.final

theorem relationTraceIsSatisfied_sound
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (trace : RelationTrace)
    (h : relationTraceIsSatisfied expectedIdentity expectedReceipts trace = true) :
    RelationTraceSemantics expectedIdentity expectedReceipts trace := by
  simp only [relationTraceIsSatisfied, Bool.and_eq_true] at h
  exact ⟨relationTraceHeaderIsSatisfied_sound _ _ _ h.1,
    relationTraceChainIsSatisfied_sound _ _ _ _ _ h.2⟩

/-- Raw-byte provenance carried by a formal certificate.

The external publication gate remains responsible for recomputing both SHA-256
values from the immutable request and trace bytes. Lean proves that the checked
trace is the one carried by the certificate identity supplied to this theorem.
-/
structure RelationTraceCertificateIdentity where
  requestId : String
  requestSha256 : String
  traceSha256 : String
deriving Repr, DecidableEq, BEq

def relationTraceCertificateIdentityIsWellFormed
    (identity : RelationTraceCertificateIdentity) : Bool :=
  !identity.requestId.isEmpty &&
    decide (identity.requestSha256.length = 64) &&
    decide (identity.traceSha256.length = 64)

structure RelationTraceCertificate where
  certificateIdentity : RelationTraceCertificateIdentity
  expectedIdentity : RelationTraceIdentity
  expectedReceipts : List RelationCommandReceipt
  trace : RelationTrace
deriving Repr, DecidableEq, BEq

def relationTraceCertificateIsSatisfied
    (externallyExpectedIdentity : RelationTraceCertificateIdentity)
    (certificate : RelationTraceCertificate) : Bool :=
  relationTraceCertificateIdentityIsWellFormed externallyExpectedIdentity &&
    decide (certificate.certificateIdentity = externallyExpectedIdentity) &&
    relationTraceIsSatisfied certificate.expectedIdentity
      certificate.expectedReceipts certificate.trace

def RelationTraceCertificateSemantics
    (externallyExpectedIdentity : RelationTraceCertificateIdentity)
    (certificate : RelationTraceCertificate) : Prop :=
  relationTraceCertificateIdentityIsWellFormed externallyExpectedIdentity = true ∧
    certificate.certificateIdentity = externallyExpectedIdentity ∧
    RelationTraceSemantics certificate.expectedIdentity
      certificate.expectedReceipts certificate.trace

theorem relationTraceCertificateIsSatisfied_sound
    (externallyExpectedIdentity : RelationTraceCertificateIdentity)
    (certificate : RelationTraceCertificate)
    (h : relationTraceCertificateIsSatisfied externallyExpectedIdentity certificate = true) :
    RelationTraceCertificateSemantics externallyExpectedIdentity certificate := by
  simp only [relationTraceCertificateIsSatisfied, Bool.and_eq_true] at h
  exact ⟨h.1.1, of_decide_eq_true h.1.2,
    relationTraceIsSatisfied_sound _ _ _ h.2⟩

end RetainMol.Geometry
