import type { MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl'
import { Merge } from 'type-fest'

type MouseEventHandlerFn = (
  feature: MapGeoJSONFeature,
  event: AugmentedMouseEvent,
  context: Record<string, any>,
) => any

type LayeredMouseInteractiveFeature = Merge<
  MapGeoJSONFeature,
  {
    layer: {
      id: string
      onClick: MouseEventHandlerFn
      onMouseMove: MouseEventHandlerFn
    }
  }
>

type AugmentedMouseEvent = Merge<
  MapMouseEvent,
  {
    features: LayeredMouseInteractiveFeature[]
  }
>

type LayeredMapMouseEventHandlerName = 'onClick' | 'onMouseMove'

type LayeredMapMouseEventHandlerProps = {
  resolveTargetFeature?: (
    features: AugmentedMouseEvent['features'],
    event: AugmentedMouseEvent,
  ) => LayeredMouseInteractiveFeature | Promise<LayeredMouseInteractiveFeature>
  context?: Record<string, any>
}

function selectFirstInteractiveFeature(
  features: AugmentedMouseEvent['features'],
) {
  return features[0]
}

type LayeredMapEventHandler = (e: AugmentedMouseEvent) => any
type LayeredMapEventHandlerList = Record<
  LayeredMapMouseEventHandlerName,
  LayeredMapEventHandler
>

export function layeredMapMouseEventHandler(
  handlerName: LayeredMapMouseEventHandlerName,
  props?: LayeredMapMouseEventHandlerProps,
): LayeredMapEventHandler
export function layeredMapMouseEventHandler(
  handlerName: LayeredMapMouseEventHandlerName[],
  props?: LayeredMapMouseEventHandlerProps,
): LayeredMapEventHandlerList
export function layeredMapMouseEventHandler(
  handlerName:
    | LayeredMapMouseEventHandlerName
    | LayeredMapMouseEventHandlerName[],
  props: LayeredMapMouseEventHandlerProps = {},
) {
  if (Array.isArray(handlerName)) {
    return Object.fromEntries(
      handlerName.map((_handlerName) => [
        _handlerName,
        layeredMapMouseEventHandler(_handlerName, props),
      ]),
    ) as LayeredMapEventHandlerList
  } else {
    const {
      resolveTargetFeature = selectFirstInteractiveFeature,
      context = {},
    } = props

    return async function layeredMapOnHandleMouseEvent(e: AugmentedMouseEvent) {
      const features = e.features || []

      const taregetableFeatures = features.filter(
        (feature) => typeof feature.layer?.[handlerName] === 'function',
      )

      if (taregetableFeatures.length > 0) {
        const targetFeature =
          taregetableFeatures.length === 1
            ? taregetableFeatures[0]
            : await resolveTargetFeature(taregetableFeatures, e)

        targetFeature.layer[handlerName](targetFeature, e, context)
      }
    }
  }
}

export function layeredMapOnClickHandler(
  props: LayeredMapMouseEventHandlerProps = {},
) {
  console.warn(
    'layeredMapOnClickHandler deprecated, prefer layeredMapMouseEventHandler(`onClick`, props)',
  )
  return layeredMapMouseEventHandler('onClick', props)
}
