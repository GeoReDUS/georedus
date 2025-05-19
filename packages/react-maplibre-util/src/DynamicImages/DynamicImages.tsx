import { useEffect } from 'react'
import { Map, MapStyleImageMissingEvent, StyleImageMetadata } from 'maplibre-gl'
import { useMap } from 'react-map-gl/maplibre'

type OnGenerateImageRes =
  | Parameters<Map['addImage']>[1]
  | [Parameters<Map['addImage']>[1], Partial<StyleImageMetadata>]

type DynamicImagesProps = {
  onGenerateImage: (
    imageId: string,
    event: MapStyleImageMissingEvent,
  ) => OnGenerateImageRes | Promise<OnGenerateImageRes>
}

export function DynamicImages({ onGenerateImage }: DynamicImagesProps) {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map) return () => {}

    const handler = async (event: MapStyleImageMissingEvent) => {
      const imageId = event.id

      if (map.hasImage(imageId)) return

      try {
        const result = await onGenerateImage(imageId, event)
        if (!map.hasImage(imageId)) {
          if (Array.isArray(result)) {
            map.addImage(imageId, result[0], result[1])
          } else {
            map.addImage(imageId, result)
          }
        }
      } catch (err) {
        console.error(`Failed to generate image for "${imageId}"`, err)
      }
    }

    map.on('styleimagemissing', handler)
    return () => map.off('styleimagemissing', handler)
  }, [map, onGenerateImage])

  return null
}
