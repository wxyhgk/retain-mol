import RetainMolGeometry.PortTorsion

open RetainMol.Geometry

private def exactZeroRatio : RatioBand := {
  loNum := 0
  loDen := 1
  hiNum := 0
  hiDen := 1
}

private def exactOneRatio : RatioBand := {
  loNum := 1
  loDen := 1
  hiNum := 1
  hiDen := 1
}

private def zeroPortTurn : TurnBand := {
  cosineSign := .positive
  sineSign := .nearZero
  cosineSquared := exactOneRatio
  sineSquared := exactZeroRatio
}

private def positiveQuarterTurn : TurnBand := {
  cosineSign := .nearZero
  sineSign := .positive
  cosineSquared := exactZeroRatio
  sineSquared := exactOneRatio
}

private def negativeQuarterTurn : TurnBand := {
  cosineSign := .nearZero
  sineSign := .negative
  cosineSquared := exactZeroRatio
  sineSquared := exactOneRatio
}

private def portTorsion : PortTorsion := {
  hostAtomId := "host"
  guestAtomId := "guest"
  hostFrame := {
    originAtomId := "host"
    axisAtomId := "guest"
    radialAtomId := "host:radial"
  }
  guestFrame := {
    originAtomId := "guest"
    axisAtomId := "host"
    radialAtomId := "guest:radial"
  }
  turn := zeroPortTurn
}

private def candidateWithGuestRadial (guestRadial : Vec3) : MoleculeSnapshot := {
  atoms := [
    { atomId := "host", symbol := "C", position := { x := 0, y := 0, z := 0 } },
    { atomId := "guest", symbol := "C", position := { x := 1000, y := 0, z := 0 } },
    { atomId := "host:radial", symbol := "H",
      position := { x := 0, y := 1000, z := 0 } },
    { atomId := "guest:radial", symbol := "H", position := guestRadial }
  ]
  bonds := [
    { bondId := "host-guest", atomId1 := "host", atomId2 := "guest", order := .single },
    { bondId := "host-radial", atomId1 := "host", atomId2 := "host:radial",
      order := .single },
    { bondId := "guest-radial", atomId1 := "guest", atomId2 := "guest:radial",
      order := .single }
  ]
}

private def zeroDegreeCandidate : MoleculeSnapshot :=
  candidateWithGuestRadial { x := 1000, y := 1000, z := 0 }

/-- Integer-quantized coordinates for a 30 degree wrong torsion. -/
private def thirtyDegreeCandidate : MoleculeSnapshot :=
  candidateWithGuestRadial { x := 1000, y := 866, z := 500 }

private def ninetyDegreeCandidate : MoleculeSnapshot :=
  candidateWithGuestRadial { x := 1000, y := 0, z := 1000 }

private def oneEightyDegreeCandidate : MoleculeSnapshot :=
  candidateWithGuestRadial { x := 1000, y := -1000, z := 0 }

private def negativeNinetyDegreeCandidate : MoleculeSnapshot :=
  candidateWithGuestRadial { x := 1000, y := 0, z := -1000 }

private def duplicateAtomIdCandidate : MoleculeSnapshot := {
  zeroDegreeCandidate with
  atoms := zeroDegreeCandidate.atoms ++ [
    { atomId := "host", symbol := "C", position := { x := 9, y := 9, z := 9 } }
  ]
}

example : portTorsionIsWellFormed zeroDegreeCandidate portTorsion = true := by
  decide

example : portTorsionIsSatisfied zeroDegreeCandidate portTorsion = true := by
  decide

example : PortTorsionSemantics zeroDegreeCandidate portTorsion := by
  apply portTorsionIsSatisfied_sound
  decide

example : portTorsionIsWellFormed thirtyDegreeCandidate portTorsion = true := by
  decide

example : portTorsionIsSatisfied thirtyDegreeCandidate portTorsion = false := by
  decide

example : portTorsionIsWellFormed ninetyDegreeCandidate portTorsion = true := by
  decide

example : portTorsionIsSatisfied ninetyDegreeCandidate portTorsion = false := by
  decide

example : portTorsionIsWellFormed oneEightyDegreeCandidate portTorsion = true := by
  decide

example : portTorsionIsSatisfied oneEightyDegreeCandidate portTorsion = false := by
  decide

example : topologyIsWellFormed duplicateAtomIdCandidate = false := by
  decide

example : portTorsionIsSatisfied duplicateAtomIdCandidate portTorsion = false := by
  decide

example : portTorsionIsSatisfied ninetyDegreeCandidate
    { portTorsion with turn := positiveQuarterTurn } = true := by
  decide

example : portTorsionIsSatisfied negativeNinetyDegreeCandidate
    { portTorsion with turn := positiveQuarterTurn } = false := by
  decide

example : portTorsionIsSatisfied negativeNinetyDegreeCandidate
    { portTorsion with turn := negativeQuarterTurn } = true := by
  decide

example : portTorsionIsSatisfied ninetyDegreeCandidate
    { portTorsion with turn := negativeQuarterTurn } = false := by
  decide

example : portTorsionIsWellFormed ninetyDegreeCandidate
    { portTorsion with turn := { positiveQuarterTurn with signMargin := 1 } } = false := by
  decide
