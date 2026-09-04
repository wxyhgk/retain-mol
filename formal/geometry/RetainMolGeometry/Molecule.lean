import RetainMolGeometry.Vec3

namespace RetainMol.Geometry

abbrev AtomId := String
abbrev BondId := String

inductive BondOrder where
  | single
  | double
  | triple
  | aromatic
deriving Repr, DecidableEq, BEq

structure Atom where
  atomId : AtomId
  symbol : String
  position : Vec3
  formalCharge : Int := 0
  radicalElectrons : Nat := 0
  aromatic : Bool := false
deriving Repr, DecidableEq, BEq

structure Bond where
  bondId : BondId
  atomId1 : AtomId
  atomId2 : AtomId
  order : BondOrder
deriving Repr, DecidableEq, BEq

structure MoleculeSnapshot where
  atoms : List Atom
  bonds : List Bond
deriving Repr, DecidableEq, BEq

def findAtom (molecule : MoleculeSnapshot) (atomId : AtomId) : Option Atom :=
  molecule.atoms.find? fun atom => atom.atomId == atomId

def findBond (molecule : MoleculeSnapshot) (bondId : BondId) : Option Bond :=
  molecule.bonds.find? fun bond => bond.bondId == bondId

def allUnique [BEq α] : List α → Bool
  | [] => true
  | value :: rest => !rest.contains value && allUnique rest

def bondIsWellFormed (molecule : MoleculeSnapshot) (bond : Bond) : Bool :=
  !bond.bondId.isEmpty &&
    bond.atomId1 != bond.atomId2 &&
    (findAtom molecule bond.atomId1).isSome &&
    (findAtom molecule bond.atomId2).isSome

def sameUndirectedEndpoints (left right : Bond) : Bool :=
  (left.atomId1 == right.atomId1 && left.atomId2 == right.atomId2) ||
    (left.atomId1 == right.atomId2 && left.atomId2 == right.atomId1)

def noParallelBonds : List Bond → Bool
  | [] => true
  | bond :: rest =>
      !rest.any (sameUndirectedEndpoints bond) && noParallelBonds rest

def atomIdentityMatches (expected actual : Atom) : Bool :=
  expected.atomId == actual.atomId &&
    expected.symbol == actual.symbol &&
    expected.formalCharge == actual.formalCharge &&
    expected.radicalElectrons == actual.radicalElectrons &&
    expected.aromatic == actual.aromatic

def bondIdentityMatches (expected actual : Bond) : Bool :=
  expected.bondId == actual.bondId &&
    sameUndirectedEndpoints expected actual &&
    expected.order == actual.order

/--
Checks only universal graph invariants. Element-specific valence and editing
semantics remain the responsibility of the production builder commands.
-/
def topologyIsWellFormed (molecule : MoleculeSnapshot) : Bool :=
  molecule.atoms.all (fun atom => !atom.atomId.isEmpty && !atom.symbol.isEmpty) &&
    allUnique (molecule.atoms.map (·.atomId)) &&
    allUnique (molecule.bonds.map (·.bondId)) &&
    molecule.bonds.all (bondIsWellFormed molecule) &&
    noParallelBonds molecule.bonds

/--
Compares the complete builder-approved chemical graph while deliberately
ignoring coordinates and list order. Stable IDs are part of the identity.
-/
def molecularGraphIsPreserved
    (expected candidate : MoleculeSnapshot) : Bool :=
  expected.atoms.length == candidate.atoms.length &&
    expected.bonds.length == candidate.bonds.length &&
    expected.atoms.all (fun atom =>
      match findAtom candidate atom.atomId with
      | some actual => atomIdentityMatches atom actual
      | none => false) &&
    expected.bonds.all (fun bond =>
      match findBond candidate bond.bondId with
      | some actual => bondIdentityMatches bond actual
      | none => false)

end RetainMol.Geometry
