//
// Inspired on:
// https://github.com/visgl/react-map-gl/blob/31ea1b649ce0c5fad32e186a75db0c60e048f733/examples/geocoder/src/geocoder-control.tsx
//

import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useControl, MarkerProps, ControlPosition } from 'react-map-gl/maplibre'
import MapboxGeocoder, { GeocoderOptions } from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { ResultMarker } from './ResultMarker'
// import { MapboxGeocoderResultMarker } from './MapboxGeocoderResultMarker'

const VALID_PLACE_TYPES = [
  'country',
  'region',
  'postcode',
  'district',
  'place',
  'locality',
  'neighborhood',
  'address',
  'poi',
  'poi.landmark',
]

//
// For full options reference:
// https://github.com/mapbox/mapbox-gl-geocoder/blob/66c236f1f52d69bc2e2b5b8fb3ecc5255fc46acf/API.md#mapboxgeocoder
//
type MapboxGeocoderControlProps = Omit<
  GeocoderOptions,
  'accessToken' | 'mapboxgl' | 'marker'
> & {
  marker?: boolean | Omit<MarkerProps, 'longitude' | 'latitude'>

  position: ControlPosition

  onClear?: (e: object) => void
  onLoading?: (e: object) => void
  onResults?: (e: object) => void
  onResult?: (e: object) => void
  onError?: (e: object) => void

  [key: string]: any
}

function _capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

type EffectFns = [
  (ctrl: MapboxGeocoder) => any,
  (ctrl: MapboxGeocoder, value: any) => any,
]
function _effectFns(key: string): EffectFns {
  return [
    (ctrl: MapboxGeocoder) => ctrl[`get${_capitalizeFirstLetter(key)}`](),
    (ctrl: MapboxGeocoder, value: any) =>
      ctrl[`set${_capitalizeFirstLetter(key)}`](value),
  ]
}

const EFFECT_PROPS: {
  [key: string]: EffectFns
} = {
  query: [
    (ctrl) => '',
    (ctrl, value) => {
      if (value) {
        ctrl.query(value)
      }
    },
  ],
  input: [(ctrl) => '', (ctrl, value) => ctrl.setInput(value || '')],
  ...Object.fromEntries(
    [
      'proximity',
      'zoom',
      'flyTo',
      'placeholder',
      'bbox',
      'countries',
      'types',
      'minLength',
      'limit',
      'filter',
      'origin',
    ].map((key) => [key, _effectFns(key)]),
  ),
}

/* eslint-disable complexity,max-statements */
export function MapboxGeocoderControl({
  position = 'top-left',
  types,
  onClear,
  onLoading,
  onResults,
  onResult,
  onError,
  accessToken,
  ...props
}: MapboxGeocoderControlProps) {
  const [marker, setMarker] = useState<React.ReactNode | null>(null)

  const _types = Array.isArray(types)
    ? types
        .map((type) => {
          if (!VALID_PLACE_TYPES.includes(type)) {
            throw new Error(`Invalid mapbox type ${type}`)
          }

          return type
        })
        .join(',')
    : undefined

  //
  // Reference to the control
  //
  const ctrlRef = useRef(null)

  const geocoderCtrl = useControl<MapboxGeocoder>(
    () => {
      const ctrl = new MapboxGeocoder({
        ...props,
        types: _types,
        marker: false,
        accessToken: accessToken,
      })

      ctrlRef.current = ctrl

      return ctrl
    },
    function onAdd() {
      //
      // This is a hack to allow us to
      // use mapbox geocoder inside maplibre layout
      //
      ctrlRef.current.container.classList.add('maplibregl-ctrl')
    },
    function onRemove() {},
    {
      position,
    },
  )

  useEffect(() => {
    const EVENT_HANDLERS = {
      loading: onLoading,
      error: onError,
      results: onResults,
      result: (evt) => {
        if (typeof onResult === 'function') {
          onResult(evt)
        }

        setMarker(
          props.marker ? (
            <ResultMarker
              result={evt.result}
              {...(typeof props.marker === 'object' ? props.marker : {})}
            />
          ) : null,
        )
      },
      clear: (evt) => {
        if (typeof onClear === 'function') {
          onClear(evt)
        }

        setMarker(null)
      },
    }

    Object.entries(EVENT_HANDLERS).forEach(([eventName, eventHandler]) => {
      if (typeof eventHandler === 'function') {
        geocoderCtrl.on(eventName, eventHandler)
      }
    })

    return () => {
      Object.entries(EVENT_HANDLERS).forEach(([eventName, eventHandler]) => {
        if (typeof eventHandler === 'function') {
          geocoderCtrl.off(eventName, eventHandler)
        }
      })
    }
  }, [onResult])

  Object.entries(EFFECT_PROPS).forEach(([propKey, [get, set]]) => {
    const propValue = props[propKey]

    useEffect(() => {
      if (typeof propValue !== 'undefined' && get(geocoderCtrl) !== propValue) {
        set(geocoderCtrl, propValue)
      }
    }, [propValue])
  })

  return marker
}
