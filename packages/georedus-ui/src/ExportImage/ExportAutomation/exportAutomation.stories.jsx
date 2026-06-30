// ExportImage.stories.jsx

import React, { useMemo, useRef, useReducer, useEffect, useState } from 'react'
import { Button } from '@orioro/react-ui-core'
import { BrowserRouter, useSearchParams } from 'react-router-dom'
import { ExportImageAutomation } from './ExportImageAutomation'
import { Icon } from '@mdi/react'
import { mdiDownload } from '@mdi/js'
import { useQuery } from '@tanstack/react-query'
import { dataviz } from '../../viewSpecs/basemaps'
import * as turf from '@turf/turf'
import {
  fetchViewSpecs,
  resolveViewSpecs,
  temperatura_superficie,
} from '../../viewSpecs'
import {
  viewConfReducer,
  viewConfReducerInitialState,
} from '../../GeoReDUS/viewConfReducer'
import { useViews } from '../../viewSpecs/useViews'
import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'

export default {
  title: 'GeoReDUS / ExportImage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

const API = {
  METADATA_API_ENDPOINT: (
    process.env.STORYBOOK_METADATA_API_ENDPOINT || ''
  ).replace(/\/$/, ''),
  VECTOR_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_VECTOR_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
  RASTER_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_RASTER_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
  RASTER_TILE_ROOT_PATH: (
    process.env.STORYBOOK_RASTER_TILE_ROOT_PATH ||
    `file:///devtools-data/raster-server`
  ).replace(/\/$/, ''),
}

const {
  METADATA_API_ENDPOINT,
  VECTOR_TILE_SERVER_ENDPOINT,
  RASTER_TILE_SERVER_ENDPOINT,
  RASTER_TILE_ROOT_PATH,
} = API

const GOOGLE_EMERGENCIAS_CLIMATICAS =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=874932999&single=true&output=csv'

const VERSION_SPECS = [
  {
    id: 'v0',
    fromPrev: (prev) => ({ baseMapStyle: 'dataviz', ...(prev || {}) }),
    fromNext: (next) => next || {},
  },
]

const useVersionedSearchParamsState = versionedSearchParamsStateHook(
  VERSION_SPECS,
  useSearchParams,
)

export const Basic = (props) => {
  const [stateStorage] = useVersionedSearchParamsState(
    {},
    {
      schema: {
        baseMapStyle: 'string',
        municipioId: 'string',
        regional: 'boolean',
        viewConf: 'object',
        env: 'string',
      },
    },
  )

  const baseMapStyle = stateStorage?.baseMapStyle || 'dataviz'
  const municipioId = Number(stateStorage?.municipioId) || 3550308 // default: São Paulo //2704302
  const viewConf = stateStorage?.viewConf || null

  // Replicate GeoReDUS viewConf reducer
  const [viewConfState] = useReducer(
    viewConfReducer,
    viewConf,
    viewConfReducerInitialState,
  )

  const munDataQuery = useQuery({
    queryKey: ['munData', municipioId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 15000))
      const res = await fetch(
        `${METADATA_API_ENDPOINT}/ibge_malha_br_municipio_2024?id=eq.${municipioId}&select=geom`,
      ).then((res) => res.json())

      return res[0]
    },
    enabled: !!municipioId && municipioId > 0,
    throwOnError: true,
  })

  const coords =
    munDataQuery.data?.geom &&
    munDataQuery.data.geom.coordinates?.[0]?.[0]?.length >= 2
      ? {
          type: 'Feature',
          geometry: munDataQuery.data.geom,
          properties: {},
        }
      : null
  const bbox = coords ? turf.bbox(coords) : null
  const bboxPolygon = bbox ? turf.bboxPolygon(bbox) : null

  const APP_CONTEXT = useMemo(
    () => ({
      municipioId: String(municipioId),
      baseMapStyle,
      zoomLevel: 'intramun', // hardcode since you're zoomed in at zoom ~10
      regional: false,
      mapBounds: null,
    }),
    [municipioId, baseMapStyle],
  )

  const EXPORT_VIEW_SPECS = {
    all: [
      GOOGLE_EMERGENCIAS_CLIMATICAS,
      [
        temperatura_superficie({
          ...API,
          mosaicJsonUrl: `${RASTER_TILE_ROOT_PATH}/cem/temperatura_superficie_2021_2025_v2/mosaic.json`,
          minzoom: 5, //HOTFIX
        }),
      ],
    ],
  }

  const viewSpecsQuery = useQuery({
    queryKey: ['ViewSpecs', municipioId],
    queryFn: async () => {
      const SPEC_SRCS = EXPORT_VIEW_SPECS.all

      return [
        ...resolveViewSpecs(await fetchViewSpecs(SPEC_SRCS), {
          municipioId,
          METADATA_API_ENDPOINT,
          VECTOR_TILE_SERVER_ENDPOINT,
          RASTER_TILE_SERVER_ENDPOINT,
          RASTER_TILE_ROOT_PATH,
          MAP_TILER_API_KEY: process.env.NEXT_PUBLIC_MAP_TILER_API_KEY,
        }),
      ].filter(Boolean)
    },
    enabled: !!municipioId && municipioId > 0,
    throwOnError: true,
  })

  const { resolvedViews } = useViews({
    viewSpecs: viewSpecsQuery.data,
    viewConfState,
    app: APP_CONTEXT,
  })

  const resolvedLayout = useMemo(() => {
    const resolvedViewsById = Object.fromEntries(
      resolvedViews.map((view) => [view.id, view]),
    )

    const hasActiveViews = Object.keys(viewConfState.byId).length > 0

    return (
      hasActiveViews
        ? viewConfState.layout.filter((list) => list.items.length > 0)
        : [viewConfState.layout[0]]
    ).map((list) => {
      const views = list.items
        .map((item) => resolvedViewsById[item.id])
        .filter(Boolean)

      return {
        id: list.id,
        views,
        legends: views.flatMap((view) => view?.controls?.legends || []),
      }
    })
  }, [viewConfState.layout, viewConfState.byId, resolvedViews])

  const initialViewState = useMemo(() => {
    if (!bbox) {
      return {
        longitude: -53.0736,
        latitude: -10.7798,
        zoom: 3.5,
      }
    }

    const [minLng, minLat, maxLng, maxLat] = bbox
    const lng = (minLng + maxLng) / 2
    const lat = (minLat + maxLat) / 2

    // Calculate zoom to fit bounds
    const lngDelta = maxLng - minLng
    const latDelta = maxLat - minLat
    const maxDelta = Math.max(lngDelta, latDelta)

    // This ensures municipality takes up most of the viewport
    const zoom = Math.min(20, Math.log2(450 / maxDelta))
    return {
      longitude: lng,
      latitude: lat,
      zoom,
    }
  }, [bbox])

  const baseMapStyleObj = dataviz.baseMapStyle()

  const TOP_VIEWS = useMemo(
    () =>
      dataviz.topViews({
        api: API,
        app: APP_CONTEXT,
      }),
    [APP_CONTEXT],
  )

  const exportImageRef = useRef()

  const handleExportClick = async () => {
    await exportImageRef.current?.createImg()
  }

  return (
    <>
      <ExportImageAutomation
        ref={exportImageRef}
        resolvedLayout={resolvedLayout}
        initialViewState={initialViewState}
        municipioId={municipioId}
        METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
        baseMapStyle={baseMapStyleObj}
        topViews={TOP_VIEWS}
        onlyMap={true}
        bbox={bboxPolygon}
      />
      <Button
        id="export-image-button"
        onClick={handleExportClick}
        style={{ marginRight: '30px' }}
        size="2">
        <Icon path={mdiDownload} size="18px" />
        Baixar imagem manualmente
      </Button>
    </>
  )
}
