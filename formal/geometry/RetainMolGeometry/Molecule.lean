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
  bond.atomId1 != bond.atomId2 &&
    (findAtom molecule bond.atomId1).isSome &&
    (findAtom molecule bond.atomId2).isSome

/--
Checks only universal graph invariants. Element-specific valence and editing
semantics remain the responsibility of the production builder commands.
-/
def topologyIsWellFormed (molecule : MoleculeSnapshot) : Bool :=
  allUnique (molecule.atoms.map (·.atomId)) &&
    allUnique (molecule.bonds.map (·.bondId)) &&
    molecule.bonds.all (bondIsWellFormed molecule)

end RetainMol.Geometry
