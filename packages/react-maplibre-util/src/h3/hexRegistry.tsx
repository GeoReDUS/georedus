/**
 * Global interning table for H3 cell ids.
 *
 * Problem: every row of every API response carries full 15-char hex H3 ids.
 * Parsing each into a BigInt (`h3ToBigInt`) allocates a heap object per row,
 * and using bigint as a Map key is slow + heavy. But the *set* of distinct
 * hexes in play (a city, at a fixed resolution) is small and highly
 * recurring across mousemoves/tiles — so we intern each hex string to a
 * small uint32 index exactly once, and every downstream structure
 * (TileData, feature-state ids, caches) works with that index instead.
 *
 * This module is a singleton by design: it must persist for the lifetime
 * of the app so the same hex always maps to the same index, and so the
 * dedup benefit compounds across requests instead of resetting per fetch.
 */

export function hexRegistry() {
  const hexToIdx = new Map<string, number>()
  const idxToHex: string[] = []

  /** Intern a 15-char H3 hex string, returning a stable uint32 index. */
  const registerHex = (hex: string): number => {
    let idx = hexToIdx.get(hex)
    if (idx === undefined) {
      idx = idxToHex.length
      hexToIdx.set(hex, idx)
      idxToHex.push(hex)
    }
    return idx
  }

  /** Reverse lookup: index -> original hex string (e.g. for feature ids). */
  const hexFromIdx = (idx: number): string => {
    const hex = idxToHex[idx]
    if (hex === undefined) {
      throw new Error(`hexRegistry: no hex interned for index ${idx}`)
    }
    return hex
  }

  const idxFromHex = (hex: string): number | undefined => hexToIdx.get(hex)

  const registrySize = (): number => idxToHex.length

  return {
    registerHex,
    hexFromIdx,
    idxFromHex,
    registrySize,
  }
}
