// Customer IDs follow the sheet: "SUP0" + running number (SUP01 … SUP0320). Never renumber existing ones.
export function supNumber(id: string | null | undefined): number {
  const m = /^SUP0*(\d+)$/i.exec(id || "");
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

export function nextSupId(existingIds: string[]): string {
  let max = 0;
  for (const id of existingIds) {
    const n = supNumber(id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `SUP0${max + 1}`;
}

export function bySupId<T extends { id: string }>(a: T, b: T): number {
  const d = supNumber(a.id) - supNumber(b.id);
  return Number.isNaN(d) || d === 0 ? a.id.localeCompare(b.id) : d;
}
