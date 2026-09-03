import React, { useCallback, useEffect, useRef, useState } from 'react'
import { makeMemoFetch } from '@orioro/vector-tile-util'
import { Layer } from 'react-map-gl/maplibre'
import { Source } from './Source'
import { DebugMap } from '../StorybookUtil'
import { cellToChildren, cellToParent } from 'h3-js'
import { hexRegistry } from '../h3'
import { dsvFormat } from 'd3'

export default {
  title: 'Source / Vector Feature State',
  parameters: {
    layout: 'fullscreen',
  },
}

const { registerHex, hexFromIdx } = hexRegistry()

const STORYBOOK_METADATA_API_ENDPOINT =
  'https://dev-geoapi-metadata.orioro.design'

const SOURCE_ID = 'cem_malha_hex_res9.geom'

// Keyed by interned hex index (uint32) instead of bigint.
type SourceEntry = { targets: Uint32Array; times: Float32Array }
type TileData = Map<number, SourceEntry>

const parseResponse = (
  rows: { s: string; i: string; t: number }[],
): TileData => {
  const n = rows.length

  // Pass 1: intern every hex id once, count rows per source index.
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
  for (const [s, count] of counts) {
    result.set(s, {
      targets: new Uint32Array(count),
      times: new Float32Array(count),
    })
    cursors.set(s, 0)
  }

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

const buildStateById = (
  data: TileData,
  featureId: string,
): Record<string, { t: number }> => {
  // Look up by interned index. If this hex was never interned (e.g. it
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

const memoFetch = makeMemoFetch(window.fetch, (res) =>
  res.text().then((text) => {
    return parseResponse(dsvFormat(',').parse(text))
  }),
)

async function fetchDataForHex(
  hexId: string,
  {
    signal,
  }: {
    signal?: AbortSignal
  } = {},
) {
  const parent = cellToParent(hexId, 7)
  const siblings = cellToChildren(parent, 9)
  const url =
    `${STORYBOOK_METADATA_API_ENDPOINT}/` +
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
  return stateById
}

export const Basic = () => {
  const [featureState, setFeatureState] = useState({
    sourceLayer: SOURCE_ID,
    stateById: {},
  })
  const requestIdRef = useRef(0)

  const [fromHexId, setFromHexId] = useState<string | null>(null)

  const onMouseMove = useCallback(async (e) => {
    const feature = e.features?.[0]

    setFromHexId(feature ? feature.id || null : null)
  }, [])

  useEffect(() => {
    if (!fromHexId) {
      setFeatureState((curr) => ({ ...curr, stateById: {} }))

      return
    }

    // const controller: AbortController = new AbortController()

    async function _load() {
      const requestId = ++requestIdRef.current

      try {
        const nextStateById = await fetchDataForHex(fromHexId as string, {
          // signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        setFeatureState((curr) => ({ ...curr, stateById: nextStateById }))
      } catch (err) {
        console.warn('err', err)
      }
    }

    _load()

    return () => {
      // controller.abort()
    }
  }, [fromHexId])

  return (
    <DebugMap
      initialViewState={{
        longitude: -43.1729,
        latitude: -22.9068,
        zoom: 11,
        pitch: 0,
        bearing: 0,
      }}
      interactiveLayerIds={[`${SOURCE_ID}_fill`]}
      onMouseMove={onMouseMove}
    >
      <Source
        id={SOURCE_ID}
        promoteId="id"
        type="vector"
        tiles={[
          `https://dev-geoapi-vector-tile.orioro.design/${SOURCE_ID}/{z}/{x}/{y}`,
        ]}
        minzoom={9}
        featureState={featureState}
      />
      <Layer
        id={`${SOURCE_ID}_fill`}
        source={SOURCE_ID}
        source-layer={SOURCE_ID}
        type="fill"
        paint={{
          'fill-color': [
            'case',
            ['==', ['feature-state', 't'], null],
            'transparent',
            [
              'step',
              ['feature-state', 't'],
              '#1a9850',
              15,
              '#66bd63',
              30,
              '#fee08b',
              45,
              '#fdae61',
              60,
              '#f46d43',
              90,
              '#d73027',
              120,
              '#a50026',
            ],
          ],
          'fill-opacity': 0.7,
        }}
      />
    </DebugMap>
  )
}
