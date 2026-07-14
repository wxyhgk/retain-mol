export function didResetKeysChange(
  previous: readonly unknown[],
  next: readonly unknown[],
): boolean {
  return previous.length !== next.length
    || previous.some((value, index) => !Object.is(value, next[index]))
}
