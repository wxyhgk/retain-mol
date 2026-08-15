import RetainMolGeometry.Command
import RetainMolGeometry.FragmentAttach

namespace RetainMol.Geometry

/-- Evidence for one primitive or high-level geometry command in an ordered trace. -/
inductive RelationWitness where
  | primitive (commandId : String) (command : PrimitiveCommand)
  | rotateGroup (joint : RotatableJoint)
  | fragmentAttach (witness : FragmentAttachWitness)
deriving Repr, DecidableEq, BEq

/-- Trusted policy travels beside evidence and can never be supplied by it. -/
inductive RelationPolicy where
  | primitive (command : PrimitiveCommand)
  | rotateGroup
  | fragmentAttach (policy : FragmentAttachPolicy)
deriving Repr, DecidableEq, BEq

def PrimitiveCommand.commandKind : PrimitiveCommand → String
  | .atomAdd _ => "atom.add"
  | .atomReplace _ _ => "atom.replace"
  | .atomRemove _ => "atom.remove"
  | .atomMove _ _ => "atom.move"
  | .bondAdd _ => "bond.add"
  | .bondRemove _ => "bond.remove"
  | .bondSetOrder _ _ => "bond.setOrder"

def RelationWitness.commandId : RelationWitness → String
  | .primitive commandId _ => commandId
  | .rotateGroup joint => joint.commandId
  | .fragmentAttach witness => witness.mate.commandId

def RelationWitness.commandKind : RelationWitness → String
  | .primitive _ command => command.commandKind
  | .rotateGroup _ => "geometry.rotateGroup"
  | .fragmentAttach _ => "fragment.attach"

def relationWitnessIsSatisfied
    (before after : MoleculeSnapshot) : RelationPolicy → RelationWitness → Bool
  | .primitive policyCommand, .primitive _ witnessCommand =>
      decide (policyCommand = witnessCommand) &&
        decide (applyPrimitiveCommand before witnessCommand = some after)
  | .rotateGroup, .rotateGroup joint => rotatableJointIsSatisfied before after joint
  | .fragmentAttach policy, .fragmentAttach witness =>
      fragmentAttachWitnessIsSatisfied before after policy witness
  | _, _ => false

def RelationWitnessSemantics
    (before after : MoleculeSnapshot) : RelationPolicy → RelationWitness → Prop
  | .primitive policyCommand, .primitive _ witnessCommand =>
      policyCommand = witnessCommand ∧
        applyPrimitiveCommand before witnessCommand = some after
  | .rotateGroup, .rotateGroup joint => RotatableJointSemantics before after joint
  | .fragmentAttach policy, .fragmentAttach witness =>
      FragmentAttachWitnessSemantics before after policy witness
  | _, _ => False

theorem relationWitnessIsSatisfied_sound
    (before after : MoleculeSnapshot)
    (policy : RelationPolicy)
    (witness : RelationWitness)
    (h : relationWitnessIsSatisfied before after policy witness = true) :
    RelationWitnessSemantics before after policy witness := by
  cases policy with
  | primitive policyCommand =>
      cases witness with
      | primitive commandId witnessCommand =>
          simp only [relationWitnessIsSatisfied, Bool.and_eq_true] at h
          exact ⟨of_decide_eq_true h.1, of_decide_eq_true h.2⟩
      | rotateGroup _ => simp [relationWitnessIsSatisfied] at h
      | fragmentAttach _ => simp [relationWitnessIsSatisfied] at h
  | rotateGroup =>
      cases witness with
      | primitive _ _ => simp [relationWitnessIsSatisfied] at h
      | rotateGroup joint => exact rotatableJointIsSatisfied_sound before after joint h
      | fragmentAttach _ => simp [relationWitnessIsSatisfied] at h
  | fragmentAttach attachPolicy =>
      cases witness with
      | primitive _ _ => simp [relationWitnessIsSatisfied] at h
      | rotateGroup _ => simp [relationWitnessIsSatisfied] at h
      | fragmentAttach attachWitness =>
          exact fragmentAttachWitnessIsSatisfied_sound before after
            attachPolicy attachWitness h

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
    (policy : RelationPolicy)
    (step : RelationTraceStep) : Bool :=
  step.receipt.preDigest == currentDigest &&
    decide (step.before = current) &&
    step.receipt.commandId == step.witness.commandId &&
    step.receipt.commandKind == step.witness.commandKind &&
    relationWitnessIsSatisfied step.before step.after policy step.witness

def RelationTraceStepSemantics
    (currentDigest : String)
    (current : MoleculeSnapshot)
    (policy : RelationPolicy)
    (step : RelationTraceStep) : Prop :=
  step.receipt.preDigest = currentDigest ∧
    step.before = current ∧
    step.receipt.commandId = step.witness.commandId ∧
    step.receipt.commandKind = step.witness.commandKind ∧
    RelationWitnessSemantics step.before step.after policy step.witness

theorem relationTraceStepIsSatisfied_sound
    (currentDigest : String)
    (current : MoleculeSnapshot)
    (policy : RelationPolicy)
    (step : RelationTraceStep)
    (h : relationTraceStepIsSatisfied currentDigest current policy step = true) :
    RelationTraceStepSemantics currentDigest current policy step := by
  simp only [relationTraceStepIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨⟨hPre, hBefore⟩, hCommandId⟩, hCommandKind⟩, hWitness⟩
  exact ⟨of_decide_eq_true hPre, of_decide_eq_true hBefore,
    of_decide_eq_true hCommandId, of_decide_eq_true hCommandKind,
    relationWitnessIsSatisfied_sound _ _ _ _ hWitness⟩

def relationTraceChainIsSatisfied :
    String → MoleculeSnapshot → List RelationPolicy → List RelationTraceStep →
      String → MoleculeSnapshot → Bool
  | currentDigest, current, [], [], finalDigest, final =>
      decide (currentDigest = finalDigest) && decide (current = final)
  | currentDigest, current, policy :: policies, step :: rest, finalDigest, final =>
      relationTraceStepIsSatisfied currentDigest current policy step &&
        relationTraceChainIsSatisfied step.receipt.postDigest step.after
          policies rest finalDigest final
  | _, _, _, _, _, _ => false

inductive RelationTraceChainSemantics :
    String → MoleculeSnapshot → List RelationPolicy → List RelationTraceStep →
      String → MoleculeSnapshot → Prop where
  | nil
      (currentDigest finalDigest : String)
      (current final : MoleculeSnapshot)
      (digestExact : currentDigest = finalDigest)
      (snapshotExact : current = final) :
      RelationTraceChainSemantics currentDigest current [] [] finalDigest final
  | cons
      (currentDigest finalDigest : String)
      (current final : MoleculeSnapshot)
      (policy : RelationPolicy)
      (step : RelationTraceStep)
      (policies : List RelationPolicy)
      (rest : List RelationTraceStep)
      (stepExact : RelationTraceStepSemantics currentDigest current policy step)
      (tailExact : RelationTraceChainSemantics step.receipt.postDigest step.after
        policies rest finalDigest final) :
      RelationTraceChainSemantics currentDigest current (policy :: policies)
        (step :: rest) finalDigest final

theorem relationTraceChainIsSatisfied_sound
    (currentDigest finalDigest : String)
    (current final : MoleculeSnapshot)
    (policies : List RelationPolicy)
    (steps : List RelationTraceStep)
    (h : relationTraceChainIsSatisfied currentDigest current policies steps finalDigest final = true) :
    RelationTraceChainSemantics currentDigest current policies steps finalDigest final := by
  induction policies generalizing currentDigest current steps with
  | nil =>
      cases steps with
      | cons step rest => simp [relationTraceChainIsSatisfied] at h
      | nil =>
        simp only [relationTraceChainIsSatisfied, Bool.and_eq_true] at h
        exact .nil currentDigest finalDigest current final
          (of_decide_eq_true h.1) (of_decide_eq_true h.2)
  | cons policy policies inductionHypothesis =>
      cases steps with
      | nil => simp [relationTraceChainIsSatisfied] at h
      | cons step rest =>
        simp only [relationTraceChainIsSatisfied, Bool.and_eq_true] at h
        exact .cons currentDigest finalDigest current final policy step policies rest
          (relationTraceStepIsSatisfied_sound _ _ _ _ h.1)
          (inductionHypothesis step.receipt.postDigest step.after rest h.2)

def relationTraceHeaderIsSatisfied
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace) : Bool :=
  relationTraceIdentityIsWellFormed expectedIdentity &&
    !expectedReceipts.isEmpty &&
    allUnique (expectedReceipts.map (·.commandId)) &&
    expectedReceipts.all relationCommandReceiptIsWellFormed &&
    decide (expectedPolicies.length = expectedReceipts.length) &&
    decide (trace.identity = expectedIdentity) &&
    decide (trace.steps.map (·.receipt) = expectedReceipts)

def RelationTraceHeaderSemantics
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace) : Prop :=
  relationTraceIdentityIsWellFormed expectedIdentity = true ∧
    expectedReceipts ≠ [] ∧
    allUnique (expectedReceipts.map (·.commandId)) = true ∧
    expectedReceipts.all relationCommandReceiptIsWellFormed = true ∧
    expectedPolicies.length = expectedReceipts.length ∧
    trace.identity = expectedIdentity ∧
    trace.steps.map (·.receipt) = expectedReceipts

theorem relationTraceHeaderIsSatisfied_sound
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace)
    (h : relationTraceHeaderIsSatisfied expectedIdentity expectedReceipts expectedPolicies trace = true) :
    RelationTraceHeaderSemantics expectedIdentity expectedReceipts expectedPolicies trace := by
  simp only [relationTraceHeaderIsSatisfied, Bool.and_eq_true] at h
  rcases h with ⟨⟨⟨⟨⟨⟨hIdentity, hNonempty⟩, hUnique⟩, hReceipts⟩,
    hPolicyCount⟩, hTraceIdentity⟩, hTraceReceipts⟩
  refine ⟨hIdentity, ?_, hUnique, hReceipts, of_decide_eq_true hPolicyCount,
    of_decide_eq_true hTraceIdentity, of_decide_eq_true hTraceReceipts⟩
  intro isEmpty
  subst expectedReceipts
  simp at hNonempty

def relationTraceIsSatisfied
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace) : Bool :=
  relationTraceHeaderIsSatisfied expectedIdentity expectedReceipts expectedPolicies trace &&
    relationTraceChainIsSatisfied expectedIdentity.baseDigest trace.base expectedPolicies trace.steps
      expectedIdentity.finalDigest trace.final

def RelationTraceSemantics
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace) : Prop :=
  RelationTraceHeaderSemantics expectedIdentity expectedReceipts expectedPolicies trace ∧
    RelationTraceChainSemantics expectedIdentity.baseDigest trace.base expectedPolicies trace.steps
      expectedIdentity.finalDigest trace.final

theorem relationTraceIsSatisfied_sound
    (expectedIdentity : RelationTraceIdentity)
    (expectedReceipts : List RelationCommandReceipt)
    (expectedPolicies : List RelationPolicy)
    (trace : RelationTrace)
    (h : relationTraceIsSatisfied expectedIdentity expectedReceipts expectedPolicies trace = true) :
    RelationTraceSemantics expectedIdentity expectedReceipts expectedPolicies trace := by
  simp only [relationTraceIsSatisfied, Bool.and_eq_true] at h
  exact ⟨relationTraceHeaderIsSatisfied_sound _ _ _ _ h.1,
    relationTraceChainIsSatisfied_sound _ _ _ _ _ _ h.2⟩

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
    (externallyExpectedPolicies : List RelationPolicy)
    (certificate : RelationTraceCertificate) : Bool :=
  relationTraceCertificateIdentityIsWellFormed externallyExpectedIdentity &&
    decide (certificate.certificateIdentity = externallyExpectedIdentity) &&
    relationTraceIsSatisfied certificate.expectedIdentity
      certificate.expectedReceipts externallyExpectedPolicies certificate.trace

def RelationTraceCertificateSemantics
    (externallyExpectedIdentity : RelationTraceCertificateIdentity)
    (externallyExpectedPolicies : List RelationPolicy)
    (certificate : RelationTraceCertificate) : Prop :=
  relationTraceCertificateIdentityIsWellFormed externallyExpectedIdentity = true ∧
    certificate.certificateIdentity = externallyExpectedIdentity ∧
    RelationTraceSemantics certificate.expectedIdentity
      certificate.expectedReceipts externallyExpectedPolicies certificate.trace

theorem relationTraceCertificateIsSatisfied_sound
    (externallyExpectedIdentity : RelationTraceCertificateIdentity)
    (externallyExpectedPolicies : List RelationPolicy)
    (certificate : RelationTraceCertificate)
    (h : relationTraceCertificateIsSatisfied externallyExpectedIdentity externallyExpectedPolicies certificate = true) :
    RelationTraceCertificateSemantics externallyExpectedIdentity externallyExpectedPolicies certificate := by
  simp only [relationTraceCertificateIsSatisfied, Bool.and_eq_true] at h
  exact ⟨h.1.1, of_decide_eq_true h.1.2,
    relationTraceIsSatisfied_sound _ _ _ _ h.2⟩

end RetainMol.Geometry
