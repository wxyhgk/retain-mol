import RetainMolGeometry

open RetainMol.Geometry

private def referenceCore : MoleculeSnapshot := {
  atoms := [
    { atomId := "B:core", symbol := "B", position := { x := 0, y := 0, z := 0 } },
    { atomId := "N:left", symbol := "N", position := { x := -1400, y := 0, z := 300 } },
    { atomId := "N:right", symbol := "N", position := { x := 1400, y := 0, z := 300 } },
    { atomId := "C:center", symbol := "C", position := { x := 0, y := 1200, z := -300 } }
  ]
  bonds := [
    { bondId := "B-N:left", atomId1 := "B:core", atomId2 := "N:left",
      order := .single },
    { bondId := "B-N:right", atomId1 := "B:core", atomId2 := "N:right",
      order := .single },
    { bondId := "B-C:center", atomId1 := "B:core", atomId2 := "C:center",
      order := .single }
  ]
}

private def validCandidate : MoleculeSnapshot := {
  atoms := referenceCore.atoms ++ [
    { atomId := "C:tail", symbol := "C", position := { x := 0, y := 2600, z := -600 } }
  ]
  bonds := referenceCore.bonds ++ [
    { bondId := "C:center-C:tail", atomId1 := "C:center", atomId2 := "C:tail",
      order := .single }
  ]
}

private def coreCertificate : GeometryCertificate := {
  fixedAtomIds := ["B:core", "N:left", "N:right"]
  distanceBounds := [
    { atomId1 := "C:center", atomId2 := "C:tail",
      minSquared := 2000000, maxSquared := 2300000 }
  ]
  orientationChecks := [
    { atomId1 := "B:core", atomId2 := "N:left", atomId3 := "N:right",
      atomId4 := "C:center" }
  ]
}

example : validateGeometryCertificate referenceCore validCandidate coreCertificate = true := by
  decide

private def movedAnchor : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "B:core" then
      { atom with position := { x := 1, y := 0, z := 0 } }
    else atom
}

example : validateGeometryCertificate referenceCore movedAnchor coreCertificate = false := by
  decide

private def invertedCenter : MoleculeSnapshot := {
  validCandidate with
  atoms := validCandidate.atoms.map fun atom =>
    if atom.atomId == "C:center" then
      { atom with position := { x := 0, y := -1200, z := -300 } }
    else atom
}

example : validateGeometryCertificate referenceCore invertedCenter coreCertificate = false := by
  decide
