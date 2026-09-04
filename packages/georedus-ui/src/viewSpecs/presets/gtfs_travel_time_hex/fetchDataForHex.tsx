import { makeMemoFetch } from '@orioro/vector-tile-util'

import { cellToChildren, cellToParent } from 'h3-js'
import { dsvFormat } from 'd3'
import { hexRegistry } from '@orioro/react-maplibre-util'

// Keyed by registry hex index (uint32) instead of bigint.
type SourceEntry = { targets: Uint32Array; times: Float32Array }
type TileData = Map<number, SourceEntry>

const { registerHex, hexFromIdx } = hexRegistry()

const parseResponse = (
  rows: { s: string; i: string; t: number }[],
): TileData => {
  const n = rows.length

  // Pass 1: register every hex id once, count rows per source index.
  const sIdx = new Uint32Array(n)
  const iIdx = new Uint32Array(n)
  const counts = new Map<number, number>()

  for (let k = 0; k < n; k++) {
    const s = registerHex(rows[k].s)
    const i = registerHex(rows[k].i)
    sIdx[k] = s
    iIdx[k] = i
    counts.set(s, (counts.get(s) ?? 0) + 1)
  }

  // Pass 2: allocate exact-size typed arrays per source, fill via cursor.
  // Avoids ever materializing an intermediate {i, t}[] per source.
  const result: TileData = new Map()
  const cursors = new Map<number, number>()

  counts.forEach((count, s) => {
    result.set(s, {
      targets: new Uint32Array(count),
      times: new Float32Array(count),
    })
    cursors.set(s, 0)
  })

  for (let k = 0; k < n; k++) {
    const s = sIdx[k]
    const entry = result.get(s)!
    const c = cursors.get(s)!
    entry.targets[c] = iIdx[k]
    entry.times[c] = rows[k].t
    cursors.set(s, c + 1)
  }

  return result
}

//
// TODO: Evaluate async RAF version
//
// const buildStateByIdAsync = (
//   data: TileData,
//   featureId: string,
//   chunkSize = 2000,
// ): Promise<Record<string, { t: number }>> => {
//   const sourceIdx = registerHex(featureId)
//   const entry = data.get(sourceIdx)
//   if (!entry) return Promise.resolve({})

//   const total = entry.targets.length
//   const result: Record<string, { t: number }> = {}

//   return new Promise((resolve) => {
//     let k = 0

//     const step = () => {
//       const end = Math.min(k + chunkSize, total)
//       for (; k < end; k++) {
//         result[hexFromIdx(entry.targets[k])] = { t: entry.times[k] }
//       }

//       if (k < total) {
//         requestAnimationFrame(step)
//       } else {
//         resolve(result)
//       }
//     }

//     requestAnimationFrame(step)
//   })
// }

const buildStateById = (
  data: TileData,
  featureId: string,
): Record<string, { t: number }> => {
  // Look up by registry index. If this hex was never registry (e.g. it
  // wasn't returned by any prior response), there's nothing to build.
  const sourceIdx = registerHex(featureId)
  const entry = data.get(sourceIdx)
  if (!entry) return {}

  const result: Record<string, { t: number }> = {}
  for (let k = 0; k < entry.targets.length; k++) {
    result[hexFromIdx(entry.targets[k])] = { t: entry.times[k] }
  }
  return result
}

const memoFetch = makeMemoFetch(
  window.fetch,
  (res) =>
    res.text().then((text) => {
      return parseResponse(dsvFormat(',').parse(text))
    }),
  {
    max: 50,
  },
)

export async function fetchDataForHex({
  hexId,
  METADATA_API_ENDPOINT,
  signal,
}: {
  hexId: string
  METADATA_API_ENDPOINT: string
  signal?: AbortSignal
}) {
  const parent = cellToParent(hexId, 7)
  const siblings = cellToChildren(parent, 9)
  const url =
    `${METADATA_API_ENDPOINT}/` +
    `cem_gtfs_travel_time?` +
    `hex_from=in.(${siblings.sort().join(',')})` +
    `&select=s:hex_from,i:hex_to,t:time_min`

  const data = await memoFetch(url, {
    signal: signal,
    headers: {
      Accept: 'text/csv',
    },
  })

  const stateById = buildStateById(data, hexId)
  // const stateById = buildStateByIdAsync(data, hexId)
  return stateById
}
