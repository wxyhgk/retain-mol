/** Ignore the writer timestamp, retaining dimensionality and every structure field. */
export function molfileSyncKey(molfile: string): string {
  const lines = molfile.replace(/\r\n?/g, '\n').split('\n')
  // MOL header line 2: writer (10 columns), MMDDYYHHmm (10), then 2D/3D etc.
  // Indigo refreshes this timestamp on every export, even without an edit.
  if (lines.length >= 4) lines[1] = lines[1]!.replace(/^(.{10})\d{10}/, '$1          ')
  return lines.join('\n')
}
