import RetainMolGeometry.Molecule

namespace RetainMol.Geometry

/--
An explicit, finite chemical-graph rewrite. Coordinates on `addedAtoms` are
placement hints only; graph comparison deliberately ignores coordinates.
-/
structure GraphRewrite where
  removedAtomIds : List AtomId := []
  removedBondIds : List BondId := []
  addedAtoms : List Atom := []
  addedBonds : List Bond := []
deriving Repr, DecidableEq, BEq

def applyGraphRewrite
    (reference : MoleculeSnapshot)
    (rewrite : GraphRewrite) : MoleculeSnapshot := {
  atoms := reference.atoms.filter
      (fun atom => !rewrite.removedAtomIds.contains atom.atomId) ++ rewrite.addedAtoms
  bonds := reference.bonds.filter
      (fun bond => !rewrite.removedBondIds.contains bond.bondId) ++ rewrite.addedBonds
}

private def removedAtomHasAllIncidentBondsDeclared
    (reference : MoleculeSnapshot)
    (rewrite : GraphRewrite)
    (atomId : AtomId) : Bool :=
  reference.bonds.all fun bond =>
    (bond.atomId1 != atomId && bond.atomId2 != atomId) ||
      rewrite.removedBondIds.contains bond.bondId

/--
The first rewrite contract is intentionally strict: new IDs may not reuse any
reference ID, even one removed by the same rewrite. This keeps command evidence
unambiguous and prevents accidental identity aliasing.
-/
def graphRewriteIsWellFormed
    (reference : MoleculeSnapshot)
    (rewrite : GraphRewrite) : Bool :=
  topologyIsWellFormed reference &&
    allUnique rewrite.removedAtomIds &&
    allUnique rewrite.removedBondIds &&
    rewrite.removedAtomIds.all (fun atomId => (findAtom reference atomId).isSome) &&
    rewrite.removedBondIds.all (fun bondId => (findBond reference bondId).isSome) &&
    rewrite.removedAtomIds.all
      (removedAtomHasAllIncidentBondsDeclared reference rewrite) &&
    allUnique (rewrite.addedAtoms.map (·.atomId)) &&
    allUnique (rewrite.addedBonds.map (·.bondId)) &&
    rewrite.addedAtoms.all
      (fun atom => (findAtom reference atom.atomId).isNone) &&
    rewrite.addedBonds.all
      (fun bond => (findBond reference bond.bondId).isNone) &&
    topologyIsWellFormed (applyGraphRewrite reference rewrite)

def graphRewriteIsSatisfied
    (reference candidate : MoleculeSnapshot)
    (rewrite : GraphRewrite) : Bool :=
  graphRewriteIsWellFormed reference rewrite &&
    topologyIsWellFormed candidate &&
    molecularGraphIsPreserved (applyGraphRewrite reference rewrite) candidate

def GraphRewriteSemantics
    (reference candidate : MoleculeSnapshot)
    (rewrite : GraphRewrite) : Prop :=
  graphRewriteIsWellFormed reference rewrite = true ∧
    topologyIsWellFormed candidate = true ∧
    molecularGraphIsPreserved (applyGraphRewrite reference rewrite) candidate = true

theorem graphRewriteIsSatisfied_sound
    (reference candidate : MoleculeSnapshot)
    (rewrite : GraphRewrite)
    (h : graphRewriteIsSatisfied reference candidate rewrite = true) :
    GraphRewriteSemantics reference candidate rewrite := by
  simp only [graphRewriteIsSatisfied, Bool.and_eq_true] at h
  exact ⟨h.1.1, h.1.2, h.2⟩

end RetainMol.Geometry
