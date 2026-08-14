import Init.Omega

namespace RetainMol.Geometry

/--
Exact three-dimensional coordinates. RetainMol uses scaled integers in formal
certificates so that validation never depends on floating-point rounding.
-/
structure Vec3 where
  x : Int
  y : Int
  z : Int
deriving Repr, DecidableEq, BEq

namespace Vec3

def add (a b : Vec3) : Vec3 :=
  { x := a.x + b.x, y := a.y + b.y, z := a.z + b.z }

def sub (a b : Vec3) : Vec3 :=
  { x := a.x - b.x, y := a.y - b.y, z := a.z - b.z }

def scale (factor : Int) (v : Vec3) : Vec3 :=
  { x := factor * v.x, y := factor * v.y, z := factor * v.z }

def dot (a b : Vec3) : Int :=
  a.x * b.x + a.y * b.y + a.z * b.z

def cross (a b : Vec3) : Vec3 :=
  {
    x := a.y * b.z - a.z * b.y
    y := a.z * b.x - a.x * b.z
    z := a.x * b.y - a.y * b.x
  }

def squaredNorm (v : Vec3) : Int := dot v v

def squaredDistance (a b : Vec3) : Int := squaredNorm (sub a b)

/-- Six times the signed tetrahedron volume. Its sign records orientation. -/
def signedVolume6 (a b c d : Vec3) : Int :=
  dot (sub b a) (cross (sub c a) (sub d a))

/--
The numerator of the component of `relative` perpendicular to `axis`.
It is scaled by `squaredNorm axis`, so no division or square root is needed.
-/
def radialNumerator (axis relative : Vec3) : Vec3 :=
  sub (scale (squaredNorm axis) relative) (scale (dot axis relative) axis)

theorem sub_translate (a b t : Vec3) :
    sub (add a t) (add b t) = sub a b := by
  cases a
  cases b
  cases t
  simp [add, sub]
  omega

/-- Translation cannot change an internal distance of a rigid fragment. -/
theorem squaredDistance_translate (a b t : Vec3) :
    squaredDistance (add a t) (add b t) = squaredDistance a b := by
  simp [squaredDistance, sub_translate]

/-- Translation cannot invert a tetrahedral orientation. -/
theorem signedVolume6_translate (a b c d t : Vec3) :
    signedVolume6 (add a t) (add b t) (add c t) (add d t) =
      signedVolume6 a b c d := by
  simp [signedVolume6, sub_translate]

end Vec3
end RetainMol.Geometry
