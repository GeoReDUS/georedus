import React, { useEffect, useState } from 'react'
import {
  useControl,
  Marker,
  MarkerProps,
  ControlPosition,
} from 'react-map-gl/maplibre'
import MaplibreGeocoder, {
  MaplibreGeocoderApi,
  MaplibreGeocoderOptions,
} from '@maplibre/maplibre-gl-geocoder'
import { nominatimGeocoderApi } from './nominatimGeocoderApi'

type GeocoderCtrlProps = Omit<
  MaplibreGeocoderOptions,
  'maplibregl' | 'marker'
> & {
  api?: MaplibreGeocoderApi
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
  (ctrl: MaplibreGeocoder) => any,
  (ctrl: MaplibreGeocoder, value: any) => any,
]
function _effectFns(key: string): EffectFns {
  return [
    (ctrl: MaplibreGeocoder) => ctrl[`get${_capitalizeFirstLetter(key)}`](),
    (ctrl: MaplibreGeocoder, value: any) =>
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
export function GeocoderCtrl({
  api = nominatimGeocoderApi(),
  position = 'top-left',
  types,
  onClear,
  onLoading,
  onResults,
  onResult,
  onError,
  ...props
}: GeocoderCtrlProps) {
  const [marker, setMarker] = useState(null)

  const geocoderCtrl = useControl<MaplibreGeocoder>(
    () =>
      new MaplibreGeocoder(api, {
        ...props,
        showResultsWhileTyping: true,
        // types: _types,
        marker: false,
      }),
    {
      position,
    },
  )

  geocoderCtrl.on('error', err => {
    console.warn(err)
  })

  useEffect(() => {
    const EVENT_HANDLERS = {
      loading: onLoading,
      error: onError,
      results: onResults,
      result: (evt) => {
        if (typeof onResult === 'function') {
          onResult(evt)
        }

        const { result } = evt
        const location =
          result &&
          (result.center ||
            (result.geometry?.type === 'Point' && result.geometry.coordinates))

        if (location && props.marker) {
          const markerProps =
            typeof props.marker === 'object' ? props.marker : {}
          setMarker(
            <Marker
              {...markerProps}
              longitude={location[0]}
              latitude={location[1]}
            />,
          )
        } else {
          setMarker(null)
        }
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

  return <>{marker}</>

  // const geocoder = useControl<MaplibreGeocoder>(
  //   ({ mapLib }) => {
  //     const ctrl = new MaplibreGeocoder(geocoderApi, {
  //       ...props,
  //       marker: false,
  //       maplibregl: mapLib,
  //     })
  //     ctrl.on('loading', props.onLoading)
  //     ctrl.on('results', props.onResults)
  //     ctrl.on('result', (evt) => {
  //       props.onResult(evt)

  //       const { result } = evt
  //       const location =
  //         result &&
  //         (result.center ||
  //           (result.geometry?.type === 'Point' && result.geometry.coordinates))
  //       if (location && props.marker) {
  //         const markerProps =
  //           typeof props.marker === 'object' ? props.marker : {}
  //         setMarker(
  //           <Marker
  //             {...markerProps}
  //             longitude={location[0]}
  //             latitude={location[1]}
  //           />,
  //         )
  //       } else {
  //         setMarker(null)
  //       }
  //     })
  //     ctrl.on('error', props.onError)
  //     return ctrl
  //   },
  //   {
  //     position: props.position,
  //   },
  // )

  // // @ts-ignore (TS2339) private member
  // if (geocoder._map) {
  //   if (
  //     geocoder.getProximity() !== props.proximity &&
  //     props.proximity !== undefined
  //   ) {
  //     geocoder.setProximity(props.proximity)
  //   }
  //   if (
  //     geocoder.getRenderFunction() !== props.render &&
  //     props.render !== undefined
  //   ) {
  //     geocoder.setRenderFunction(props.render)
  //   }
  //   if (
  //     geocoder.getLanguage() !== props.language &&
  //     props.language !== undefined
  //   ) {
  //     geocoder.setLanguage(props.language)
  //   }
  //   if (geocoder.getZoom() !== props.zoom && props.zoom !== undefined) {
  //     geocoder.setZoom(props.zoom)
  //   }
  //   if (geocoder.getFlyTo() !== props.flyTo && props.flyTo !== undefined) {
  //     geocoder.setFlyTo(props.flyTo)
  //   }
  //   if (
  //     geocoder.getPlaceholder() !== props.placeholder &&
  //     props.placeholder !== undefined
  //   ) {
  //     geocoder.setPlaceholder(props.placeholder)
  //   }
  //   if (
  //     geocoder.getCountries() !== props.countries &&
  //     props.countries !== undefined
  //   ) {
  //     geocoder.setCountries(props.countries)
  //   }
  //   if (geocoder.getTypes() !== props.types && props.types !== undefined) {
  //     geocoder.setTypes(props.types)
  //   }
  //   if (
  //     geocoder.getMinLength() !== props.minLength &&
  //     props.minLength !== undefined
  //   ) {
  //     geocoder.setMinLength(props.minLength)
  //   }
  //   if (geocoder.getLimit() !== props.limit && props.limit !== undefined) {
  //     geocoder.setLimit(props.limit)
  //   }
  //   if (geocoder.getFilter() !== props.filter && props.filter !== undefined) {
  //     geocoder.setFilter(props.filter)
  //   }
  //   // if (geocoder.getOrigin() !== props.origin && props.origin !== undefined) {
  //   //   geocoder.setOrigin(props.origin);
  //   // }
  //   // if (geocoder.getAutocomplete() !== props.autocomplete && props.autocomplete !== undefined) {
  //   //   geocoder.setAutocomplete(props.autocomplete);
  //   // }
  //   // if (geocoder.getFuzzyMatch() !== props.fuzzyMatch && props.fuzzyMatch !== undefined) {
  //   //   geocoder.setFuzzyMatch(props.fuzzyMatch);
  //   // }
  //   // if (geocoder.getRouting() !== props.routing && props.routing !== undefined) {
  //   //   geocoder.setRouting(props.routing);
  //   // }
  //   // if (geocoder.getWorldview() !== props.worldview && props.worldview !== undefined) {
  //   //   geocoder.setWorldview(props.worldview);
  //   // }
  // }
  // return marker
}

// const noop = () => {}

// GeocoderCtrl.defaultProps = {
//   marker: true,
//   onLoading: noop,
//   onResults: noop,
//   onResult: noop,
//   onError: noop,
// }
