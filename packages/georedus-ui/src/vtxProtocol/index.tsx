import { dataMergeProtocol } from '@orioro/vector-tile-util'
import maplibregl from 'maplibre-gl'

export const vtx = dataMergeProtocol()

export const { memoFetchData } = vtx

export const VTX_PROTOCOL = 'vtx'

export function vtxUrl({
  tiles,
  data,
}: {
  tiles: string
  data: string | (string | [string, string, string])[]
}) {
  return `${VTX_PROTOCOL}://${JSON.stringify({
    t: tiles,
    d: data,
  })}`
}

export function vtxSetup() {
  maplibregl.addProtocol('vtx', vtx.protocolHandler)
}
