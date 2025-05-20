import React, { useEffect, useMemo } from 'react'
import { DropdownMenu, useLocalState } from '@orioro/react-ui-core'
import { ControlContainer, ControlContainerProps } from '../ControlContainer'
import { mdiCheck, mdiTerrain, mdiVideo3d } from '@mdi/js'
import { Icon } from '@mdi/react'
import { Tooltip } from '@radix-ui/themes'
import { useMap } from 'react-map-gl/maplibre'

import maplibregl from 'maplibre-gl'
import mlcontour from 'maplibre-contour'
import {
  ensureAddLayer,
  ensureAddSource,
  ensureRemoveLayer,
  ensureRemoveSource,
} from '../../util'
import type { GlobalContourTileOptions } from 'maplibre-contour/dist/types'
import { omit } from 'lodash-es'

type TerrainSettings = {
  hillshade?: boolean
  enable3d?: boolean
  contours?: boolean
}

type SourceSpecInput = Omit<
  maplibregl.RasterDEMSourceSpecification,
  'type' | 'tiles' | 'url'
> & {
  url: string
}

const DEFAULT_DEM_SOURCE_ID = 'dem'
const DEFAULT_DEM_SOURCE_SPEC: SourceSpecInput = {
  url: 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
  encoding: 'terrarium',
  attribution: 'TEST',
  tileSize: 256,
}

type TerrainControlProps = Omit<ControlContainerProps, 'children'> & {
  value?: TerrainSettings | false
  onSetValue?: (v: TerrainSettings | false) => any

  demSourceId?: string
  demSource?: SourceSpecInput

  contourTileOptions?: Partial<GlobalContourTileOptions>
}

function _parseSettings(
  nextSettings: TerrainSettings | false,
): TerrainSettings | false {
  if (
    typeof nextSettings === 'object' &&
    nextSettings !== null &&
    Object.values(nextSettings).every((v) => !v)
  ) {
    return false
  }

  return nextSettings
}

function _toggleSetting(
  setSettings: (
    setFn: (curr: TerrainSettings | false) => TerrainSettings | false,
  ) => any,
  key: keyof TerrainSettings,
) {
  return setSettings((curr) =>
    _parseSettings({
      ...(curr || {}),
      [key]: !(curr && curr[key]),
    }),
  )
}

const DEFAULT_CONTOUR_TILE_OPTIONS: GlobalContourTileOptions = {
  // convert meters to feet, default=1 for meters
  // multiplier: 3.28084,
  thresholds: {
    // zoom: [minor, major]
    // 3: [200, 1000],
    // 8: [200, 1000],
    // 9: [200, 1000],
    7: [300, 1000],
    11: [200, 400],
    12: [100, 300],
    13: [50, 200],
    14: [20, 100],
    15: [10, 50],
  },
  // optional, override vector tile parameters:
  contourLayer: 'contours',
  elevationKey: 'ele',
  levelKey: 'level',
  extent: 4096,
  buffer: 1,
}

export function TerrainControl({
  value: externalValue = false,
  onSetValue: onSetExternalValue,

  demSourceId: DEM_SOURCE_ID = DEFAULT_DEM_SOURCE_ID,
  demSource: DEM_SOURCE_SPEC = DEFAULT_DEM_SOURCE_SPEC,

  contourTileOptions: contourTileOptionsInput = DEFAULT_CONTOUR_TILE_OPTIONS,

  ...controlContainerProps
}: TerrainControlProps) {
  const _contourTileOptions: GlobalContourTileOptions = useMemo(
    () => ({
      ...contourTileOptionsInput,
      ...DEFAULT_CONTOUR_TILE_OPTIONS,
    }),
    [contourTileOptionsInput],
  )

  const [settings, setSettings] = useLocalState(
    externalValue,
    onSetExternalValue,
  )

  const mapRef = useMap()

  const demSrcInstance = useMemo(() => {
    const source = new mlcontour.DemSource({
      ...DEM_SOURCE_SPEC,
      url: DEM_SOURCE_SPEC.url,
      encoding: DEM_SOURCE_SPEC.encoding,
      maxzoom: 13,
    })

    // calls maplibregl.addProtocol for the shared cache and contour protocols
    source.setupMaplibre(maplibregl)

    return source
  }, [DEM_SOURCE_SPEC])

  function _applySettings() {
    const map = mapRef?.current?.getMap()
    if (!map || !map.isStyleLoaded()) {
      return
    }

    if (!settings) {
      // Remove terrain and hillshade
      map.setTerrain(null)

      ensureRemoveLayer(map, 'hillshade')
      ensureRemoveSource(map, DEM_SOURCE_ID)

      ensureRemoveLayer(map, 'contour-lines')
      ensureRemoveLayer(map, 'contour-labels')
      ensureRemoveSource(map, 'contour-source')

      // Reset pitch if desired
      if (map.getPitch() > 0) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 500 })
      }
      return
    }

    // Add DEM source if not present
    if (!map.getSource(DEM_SOURCE_ID)) {
      map.addSource(DEM_SOURCE_ID, {
        maxzoom: 13,
        tileSize: 256,
        ...omit(DEM_SOURCE_SPEC, ['url', 'tiles']),
        type: 'raster-dem',
        encoding: DEM_SOURCE_SPEC.encoding,
        tiles: [demSrcInstance.sharedDemProtocolUrl],
      })
    }

    // Add hillshade layer if not present
    if (settings.hillshade || settings.enable3d) {
      ensureAddLayer(map, 'hillshade', {
        id: 'hillshade',
        type: 'hillshade',
        source: DEM_SOURCE_ID,
      })
    } else {
      ensureRemoveLayer(map, 'hillshade')
    }

    if (settings?.enable3d) {
      ensureAddSource(map, `${DEM_SOURCE_ID}_terrain`, {
        type: 'raster-dem',
        // url: DEM_SOURCE_URL,
        encoding: DEM_SOURCE_SPEC.encoding,
        tiles: [demSrcInstance.sharedDemProtocolUrl],
        maxzoom: 13,
        tileSize: 256,
      })

      map.setTerrain({ source: `${DEM_SOURCE_ID}_terrain`, exaggeration: 1.5 })

      // Optional: only tilt if pitch is low
      if (map.getPitch() < 40) {
        map.easeTo({
          pitch: 60,
          bearing: -20,
          duration: 1000,
        })
      }
    } else {
      map.setTerrain(null)

      // Reset pitch if desired
      if (map.getPitch() > 0) {
        map.easeTo({ pitch: 0, bearing: 0, duration: 500 })
      }
    }

    //
    // Add contour
    //
    if (settings.contours) {
      ensureAddSource(map, 'contour-source', {
        type: 'vector',
        tiles: [demSrcInstance.contourProtocolUrl(_contourTileOptions)],
        maxzoom: 15,
      })

      ensureAddLayer(map, 'contour-lines', {
        id: 'contour-lines',
        type: 'line',
        source: 'contour-source',
        'source-layer': 'contours',
        paint: {
          // 'line-color': 'rgba(0,0,0, 50%)',
          // 'line-color': 'rgb(229, 77, 46, 80%)',
          // 'line-color': 'rgb(46, 77, 229, 80%)',
          'line-color': '#FF4500',
          // level = highest index in thresholds array the elevation is a multiple of
          'line-width': ['match', ['get', 'level'], 1, 1, 0.5],
        },
      })

      ensureAddLayer(map, 'contour-labels', {
        id: 'contour-labels',
        type: 'symbol',
        source: 'contour-source',
        'source-layer': 'contours',
        filter: ['>', ['get', 'level'], 0],
        layout: {
          // 'symbol-placement': 'point',
          'symbol-placement': 'line-center',
          // 'symbol-placement': ['step', ['zoom'], 'point', 14, 'line'],
          'text-max-angle': 80,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-size': 10,
          // 'text-field': 'test',
          'text-field': [
            'concat',
            [
              'number-format',
              ['get', 'ele'],
              {
                locale: 'pt-BR',
              },
            ],
            'm',
          ],
          'text-font': ['Noto Sans Bold'],
        },
        paint: {
          'text-halo-color': 'white',
          'text-halo-width': 1,
          'text-color': '#E54D2E',
        },
      })

      const CONTOURS_MIN_ZOOM = Object.keys(_contourTileOptions.thresholds)
        .map((k) => parseInt(k))
        .sort((a, b) => a - b)[0]

      if (map.getZoom() < CONTOURS_MIN_ZOOM) {
        map.easeTo({ zoom: CONTOURS_MIN_ZOOM, duration: 500 })
      }
    } else {
      ensureRemoveLayer(map, 'contour-lines')
      ensureRemoveLayer(map, 'contour-labels')
      ensureRemoveSource(map, 'contour-source')
    }
  }

  useEffect(() => {
    _applySettings()
  }, [mapRef.current?.getMap(), settings])

  useEffect(() => {
    const map = mapRef.current?.getMap()

    if (!map) {
      return () => {}
    }

    const handleStyleLoad = () => {
      map.once('idle', _applySettings)
      // setTimeout(_applySettings, 1000)
      // ()
      // if (settings && settings.enable3d) {
      //   const terrainDemSourceId = `${DEM_SOURCE_ID}_terrain`
      //   ensureAddSource(map, terrainDemSourceId, {
      //     type: 'raster-dem',
      //     // url: DEM_SOURCE_URL,
      //     encoding: DEM_SOURCE_ENCODING,
      //     tiles: [demSrcInstance.sharedDemProtocolUrl],
      //     maxzoom: 13,
      //     tileSize: 256,
      //   })

      //   map.setTerrain({ source: terrainDemSourceId, exaggeration: 1.5 })
      // }
    }

    map.on('style.load', handleStyleLoad)
    return () => map.off('style.load', handleStyleLoad)
  }, [mapRef.current?.getMap(), settings && settings.enable3d])

  return (
    <ControlContainer {...controlContainerProps}>
      <DropdownMenu
        size="1"
        options={[
          {
            label: (
              <>
                Relevo
                {settings && (settings.hillshade || settings.enable3d) && (
                  <Icon path={mdiCheck} size="12px" />
                )}
              </>
            ),
            disabled: settings && settings.enable3d,
            onClick: () => _toggleSetting(setSettings, 'hillshade'),
          },
          {
            label: (
              <>
                3D
                {settings && settings.enable3d && (
                  <Icon path={mdiCheck} size="12px" />
                )}
              </>
            ),
            onClick: () => _toggleSetting(setSettings, 'enable3d'),
          },
          {
            label: (
              <>
                Curvas de nível
                {settings && settings.contours && (
                  <Icon path={mdiCheck} size="12px" />
                )}
              </>
            ),
            onClick: () => _toggleSetting(setSettings, 'contours'),
          },
        ]}
      >
        <button
          type="button"
          aria-label="Relevo"
          style={{
            position: 'relative',
          }}
        >
          <Tooltip content="Relevo">
            <Icon
              color={settings ? 'var(--accent-9)' : 'inherit'}
              path={mdiTerrain}
              size="24px"
            />
          </Tooltip>

          {settings && settings.enable3d && (
            <div
              style={{
                width: 14,
                height: 14,
                background: 'var(--accent-9)',
                color: 'var(--accent-contrast)',
                borderRadius: '50%',
                position: 'absolute',
                top: '100%',
                left: '100%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Icon path={mdiVideo3d} size="14px" />
            </div>
          )}
        </button>
      </DropdownMenu>
    </ControlContainer>
  )
}
