/** 判断滚动位置是否贴近底部（阈值内视为在底部，日志跟随据此启停）。 */
export function isNearBottom(scrollTop: number, clientHeight: number, scrollHeight: number, threshold = 24): boolean {
  return scrollHeight - scrollTop - clientHeight < threshold
}
