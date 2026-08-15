/** Locale-independent ordering matching UTF-8 lexicographic order for valid Unicode strings. */
export function compareUnicodeCodePoints(left: string, right: string): number {
  const leftPoints = left[Symbol.iterator]()
  const rightPoints = right[Symbol.iterator]()

  while (true) {
    const leftPoint = leftPoints.next()
    const rightPoint = rightPoints.next()
    if (leftPoint.done || rightPoint.done) {
      if (leftPoint.done && rightPoint.done) return 0
      return leftPoint.done ? -1 : 1
    }

    const leftValue = leftPoint.value.codePointAt(0)!
    const rightValue = rightPoint.value.codePointAt(0)!
    if (leftValue !== rightValue) return leftValue < rightValue ? -1 : 1
  }
}

export function sortedStrings(values: Iterable<string>): string[] {
  return [...values].sort(compareUnicodeCodePoints)
}
