import MaplibreInspect, {
  MaplibreInspectOptions,
} from '@maplibre/maplibre-gl-inspect'

import { useControl } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'

export function InspectControl(props: MaplibreInspectOptions) {
  useControl(
    () =>
      new MaplibreInspect({
        ...props,
        popup: new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        }),
      }),
    {
      // position: props.position,
    },
  )

  return null
}
