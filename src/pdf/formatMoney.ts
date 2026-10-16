// Pinned to en-US so browser and Node renders produce identical output.
export function formatMoney(value: number): string {
  return value.toLocaleString('en-US')
}
