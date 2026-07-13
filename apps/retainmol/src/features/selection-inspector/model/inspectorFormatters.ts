export function formatCharge(value: number) {
  return value > 0 ? `+${value}` : String(value)
}

export function bondOrderLabel(order: 1 | 2 | 3) {
  return order === 1 ? '单键' : order === 2 ? '双键' : '三键'
}
