import type { MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl'
import { Merge } from 'type-fest'

type ClickableFeature = Merge<
  MapGeoJSONFeature,
  {
    layer: {
      id: string
      onClick: (
        feature: MapGeoJSONFeature,
        event: AugmentedMouseEvent,
        context: Record<string, any>,
      ) => any
    }
  }
>

type AugmentedMouseEvent = Merge<
  MapMouseEvent,
  {
    features: ClickableFeature[]
  }
>

type LayeredMapOnClickHandlerProps = {
  resolveTargetFeature?: (
    features: AugmentedMouseEvent['features'],
    event: AugmentedMouseEvent,
  ) => ClickableFeature | Promise<ClickableFeature>
  context?: Record<string, any>
}

function selectFirstClickableFeature(
  features: AugmentedMouseEvent['features'],
) {
  return features[0]
}

export function layeredMapOnClickHandler({
  resolveTargetFeature = selectFirstClickableFeature,
  context = {},
}: LayeredMapOnClickHandlerProps = {}) {
  return async function onClick(e: AugmentedMouseEvent) {
    const features = e.features || []

    const clickableFeatures = features.filter(
      (feature) => typeof feature.layer?.onClick === 'function',
    )

    if (clickableFeatures.length > 0) {
      const targetFeature =
        clickableFeatures.length === 1
          ? clickableFeatures[0]
          : await resolveTargetFeature(clickableFeatures, e)

      targetFeature.layer.onClick(targetFeature, e, context)
    }
  }
}
