import RetainMolGeometry.Molecule

namespace RetainMol.Geometry

/--
The primitive command subset shared with ExpectedEffect V1. Higher-level
fragment and geometry commands must be lowered to an independently checked
primitive trace before they can enter this formal boundary.
-/
inductive PrimitiveCommand where
  | atomAdd (atom : Atom)
  | atomReplace (atomId : AtomId) (symbol : String)
  | atomRemove (atomId : AtomId)
  | atomMove (atomId : AtomId) (position : Vec3)
  | bondAdd (bond : Bond)
  | bondRemove (bondId : BondId)
  | bondSetOrder (bondId : BondId) (order : BondOrder)
deriving Repr, DecidableEq, BEq

private def replaceAtomElement
    (targetId : AtomId)
    (symbol : String)
    (atom : Atom) : Atom :=
  if atom.atomId == targetId then { atom with symbol := symbol } else atom

private def moveAtom
    (targetId : AtomId)
    (position : Vec3)
    (atom : Atom) : Atom :=
  if atom.atomId == targetId then { atom with position := position } else atom

private def setBondOrder
    (targetId : BondId)
    (order : BondOrder)
    (bond : Bond) : Bond :=
  if bond.bondId == targetId then { bond with order := order } else bond

/-- Construct the exact candidate prescribed by one primitive command. -/
def primitiveCommandCandidate
    (before : MoleculeSnapshot) : PrimitiveCommand → Option MoleculeSnapshot
  | .atomAdd atom =>
      if (findAtom before atom.atomId).isNone then
        some { before with atoms := before.atoms ++ [atom] }
      else none
  | .atomReplace atomId symbol =>
      if (findAtom before atomId).isSome && !symbol.isEmpty then
        some { before with atoms := before.atoms.map (replaceAtomElement atomId symbol) }
      else none
  | .atomRemove atomId =>
      if (findAtom before atomId).isSome then
        some {
          atoms := before.atoms.filter fun atom => atom.atomId != atomId
          bonds := before.bonds.filter fun bond =>
            bond.atomId1 != atomId && bond.atomId2 != atomId
        }
      else none
  | .atomMove atomId position =>
      if (findAtom before atomId).isSome then
        some { before with atoms := before.atoms.map (moveAtom atomId position) }
      else none
  | .bondAdd bond =>
      if (findBond before bond.bondId).isNone then
        some { before with bonds := before.bonds ++ [bond] }
      else none
  | .bondRemove bondId =>
      if (findBond before bondId).isSome then
        some { before with bonds := before.bonds.filter fun bond => bond.bondId != bondId }
      else none
  | .bondSetOrder bondId order =>
      if (findBond before bondId).isSome then
        some { before with bonds := before.bonds.map (setBondOrder bondId order) }
      else none

private def acceptWellFormed (candidate : MoleculeSnapshot) : Option MoleculeSnapshot :=
  if topologyIsWellFormed candidate then some candidate else none

/--
Execute one primitive command and fail closed when its exact result violates a
universal graph invariant. Chemical valence remains a production-builder
precondition and is not inferred here.
-/
def applyPrimitiveCommand
    (before : MoleculeSnapshot)
    (command : PrimitiveCommand) : Option MoleculeSnapshot := do
  let candidate ← primitiveCommandCandidate before command
  acceptWellFormed candidate

def applyPrimitiveCommands :
    MoleculeSnapshot → List PrimitiveCommand → Option MoleculeSnapshot
  | molecule, [] =>
      if topologyIsWellFormed molecule then some molecule else none
  | molecule, command :: rest => do
      let next ← applyPrimitiveCommand molecule command
      applyPrimitiveCommands next rest

/-- A receipt step binds a command to the complete claimed post-state. -/
structure PrimitiveCommandStep where
  command : PrimitiveCommand
  after : MoleculeSnapshot
deriving Repr, DecidableEq, BEq

def primitiveCommandStepIsValid
    (before : MoleculeSnapshot)
    (step : PrimitiveCommandStep) : Bool :=
  decide (applyPrimitiveCommand before step.command = some step.after)

def primitiveCommandTraceIsValid :
    MoleculeSnapshot → List PrimitiveCommandStep → Bool
  | molecule, [] => topologyIsWellFormed molecule
  | molecule, step :: rest =>
      primitiveCommandStepIsValid molecule step &&
        primitiveCommandTraceIsValid step.after rest

/-- Prop-level meaning of a complete primitive-command receipt trace. -/
inductive PrimitiveCommandTraceSemantics :
    MoleculeSnapshot → List PrimitiveCommandStep → Prop where
  | nil
      (molecule : MoleculeSnapshot)
      (wellFormed : topologyIsWellFormed molecule = true) :
      PrimitiveCommandTraceSemantics molecule []
  | cons
      (before : MoleculeSnapshot)
      (step : PrimitiveCommandStep)
      (rest : List PrimitiveCommandStep)
      (stepExact : applyPrimitiveCommand before step.command = some step.after)
      (tailExact : PrimitiveCommandTraceSemantics step.after rest) :
      PrimitiveCommandTraceSemantics before (step :: rest)

theorem acceptWellFormed_sound
    (candidate accepted : MoleculeSnapshot)
    (acceptedResult : acceptWellFormed candidate = some accepted) :
    topologyIsWellFormed accepted = true := by
  cases wellFormed : topologyIsWellFormed candidate with
  | false => simp [acceptWellFormed, wellFormed] at acceptedResult
  | true =>
      simp [acceptWellFormed, wellFormed] at acceptedResult
      subst accepted
      exact wellFormed

/-- Every accepted primitive transition ends in a universally well-formed graph. -/
theorem applyPrimitiveCommand_sound
    (before after : MoleculeSnapshot)
    (command : PrimitiveCommand)
    (applied : applyPrimitiveCommand before command = some after) :
    topologyIsWellFormed after = true := by
  cases candidateResult : primitiveCommandCandidate before command with
  | none => simp [applyPrimitiveCommand, candidateResult] at applied
  | some candidate =>
      simp [applyPrimitiveCommand, candidateResult] at applied
      exact acceptWellFormed_sound candidate after applied

/-- A valid receipt cannot claim a post-state different from command semantics. -/
theorem primitiveCommandStepIsValid_sound
    (before : MoleculeSnapshot)
    (step : PrimitiveCommandStep)
    (valid : primitiveCommandStepIsValid before step = true) :
    applyPrimitiveCommand before step.command = some step.after := by
  exact of_decide_eq_true valid

/-- The head of every accepted trace is an exact accepted primitive step. -/
theorem primitiveCommandTrace_head_sound
    (before : MoleculeSnapshot)
    (step : PrimitiveCommandStep)
    (rest : List PrimitiveCommandStep)
    (valid : primitiveCommandTraceIsValid before (step :: rest) = true) :
    applyPrimitiveCommand before step.command = some step.after := by
  have both :
      primitiveCommandStepIsValid before step = true ∧
        primitiveCommandTraceIsValid step.after rest = true := by
    simpa [primitiveCommandTraceIsValid, Bool.and_eq_true] using valid
  have headValid := both.1
  exact primitiveCommandStepIsValid_sound before step headValid

/-- Executable trace validation is sound for the Prop-level command semantics. -/
theorem primitiveCommandTraceIsValid_sound
    (before : MoleculeSnapshot)
    (steps : List PrimitiveCommandStep)
    (valid : primitiveCommandTraceIsValid before steps = true) :
    PrimitiveCommandTraceSemantics before steps := by
  induction steps generalizing before with
  | nil =>
      simp [primitiveCommandTraceIsValid] at valid
      exact .nil before valid
  | cons step rest inductionHypothesis =>
      have both :
          primitiveCommandStepIsValid before step = true ∧
            primitiveCommandTraceIsValid step.after rest = true := by
        simpa [primitiveCommandTraceIsValid, Bool.and_eq_true] using valid
      exact .cons before step rest
        (primitiveCommandStepIsValid_sound before step both.1)
        (inductionHypothesis step.after both.2)

/-- Successful command sequences always finish with a well-formed graph. -/
theorem applyPrimitiveCommands_sound
    (before after : MoleculeSnapshot)
    (commands : List PrimitiveCommand)
    (applied : applyPrimitiveCommands before commands = some after) :
    topologyIsWellFormed after = true := by
  induction commands generalizing before with
  | nil =>
      cases wellFormed : topologyIsWellFormed before with
      | false => simp [applyPrimitiveCommands, wellFormed] at applied
      | true =>
          simp [applyPrimitiveCommands, wellFormed] at applied
          subst after
          exact wellFormed
  | cons command rest inductionHypothesis =>
      cases nextResult : applyPrimitiveCommand before command with
      | none => simp [applyPrimitiveCommands, nextResult] at applied
      | some next =>
          simp [applyPrimitiveCommands, nextResult] at applied
          exact inductionHypothesis next applied

/-- Moving an atom cannot mutate the bond list. -/
theorem atomMove_candidate_preserves_bonds
    (before after : MoleculeSnapshot)
    (atomId : AtomId)
    (position : Vec3)
    (candidate :
      primitiveCommandCandidate before (.atomMove atomId position) = some after) :
    after.bonds = before.bonds := by
  simp [primitiveCommandCandidate] at candidate
  rw [← candidate.2]

/-- Adding a bond cannot mutate the atom list. -/
theorem bondAdd_candidate_preserves_atoms
    (before after : MoleculeSnapshot)
    (bond : Bond)
    (candidate : primitiveCommandCandidate before (.bondAdd bond) = some after) :
    after.atoms = before.atoms := by
  simp [primitiveCommandCandidate] at candidate
  rw [← candidate.2]

end RetainMol.Geometry
