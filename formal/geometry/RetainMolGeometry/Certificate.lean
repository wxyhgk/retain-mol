import RetainMolGeometry.Molecule

namespace RetainMol.Geometry

structure DistanceBound where
  atomId1 : AtomId
  atomId2 : AtomId
  minSquared : Int
  maxSquared : Int
deriving Repr, DecidableEq, BEq

structure OrientationCheck where
  atomId1 : AtomId
  atomId2 : AtomId
  atomId3 : AtomId
  atomId4 : AtomId
deriving Repr, DecidableEq, BEq

structure GeometryCertificate where
  fixedAtomIds : List AtomId := []
  distanceBounds : List DistanceBound := []
  orientationChecks : List OrientationCheck := []
deriving Repr, DecidableEq, BEq

private def withTwoPositions
    (molecule : MoleculeSnapshot)
    (atomId1 atomId2 : AtomId)
    (check : Vec3 → Vec3 → Bool) : Bool :=
  match findAtom molecule atomId1, findAtom molecule atomId2 with
  | some atom1, some atom2 => check atom1.position atom2.position
  | _, _ => false

def fixedAtomIsPreserved
    (reference candidate : MoleculeSnapshot)
    (atomId : AtomId) : Bool :=
  match findAtom reference atomId, findAtom candidate atomId with
  | some expected, some actual => expected.symbol == actual.symbol &&
      expected.position == actual.position
  | _, _ => false

def distanceBoundIsSatisfied
    (candidate : MoleculeSnapshot)
    (bound : DistanceBound) : Bool :=
  withTwoPositions candidate bound.atomId1 bound.atomId2 fun position1 position2 =>
    let squared := Vec3.squaredDistance position1 position2
    decide (bound.minSquared ≤ squared ∧ squared ≤ bound.maxSquared)

private def orientationSignAgrees (expected actual : Int) : Bool :=
  decide ((expected > 0 ∧ actual > 0) ∨ (expected < 0 ∧ actual < 0))

def orientationIsPreserved
    (reference candidate : MoleculeSnapshot)
    (check : OrientationCheck) : Bool :=
  let positions (molecule : MoleculeSnapshot) : Option (Vec3 × Vec3 × Vec3 × Vec3) := do
    let atom1 ← findAtom molecule check.atomId1
    let atom2 ← findAtom molecule check.atomId2
    let atom3 ← findAtom molecule check.atomId3
    let atom4 ← findAtom molecule check.atomId4
    pure (atom1.position, atom2.position, atom3.position, atom4.position)
  match positions reference, positions candidate with
  | some (a, b, c, d), some (a', b', c', d') =>
      orientationSignAgrees
        (Vec3.signedVolume6 a b c d)
        (Vec3.signedVolume6 a' b' c' d')
  | _, _ => false

/--
The small trusted decision boundary used after an EditPlan dry-run. A valid
certificate proves graph identity, exact anchors, bounded distances and
orientation preservation for every explicitly declared check.
-/
def validateGeometryCertificate
    (reference candidate : MoleculeSnapshot)
    (certificate : GeometryCertificate) : Bool :=
  topologyIsWellFormed reference &&
    topologyIsWellFormed candidate &&
    certificate.fixedAtomIds.all (fixedAtomIsPreserved reference candidate) &&
    certificate.distanceBounds.all (distanceBoundIsSatisfied candidate) &&
    certificate.orientationChecks.all
      (orientationIsPreserved reference candidate)

end RetainMol.Geometry
