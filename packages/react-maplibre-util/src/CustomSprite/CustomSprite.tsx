import { useEffect } from 'react'
import { useMap } from 'react-map-gl/maplibre'

type CustomSpriteProps = {
  url: string // base URL without extension, e.g. "/sprites/mysprite"
}

export function CustomSprite({ url }: CustomSpriteProps) {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map) return

    const loadSpriteFiles = async (suffix: string) => {
      const jsonRes = await fetch(`${url}${suffix}.json`)
      const pngRes = await fetch(`${url}${suffix}.png`)
      if (!jsonRes.ok || !pngRes.ok) {
        throw new Error('One or both resources failed')
      }
      return {
        spriteData: await jsonRes.json(),
        spriteBitmap: await createImageBitmap(await pngRes.blob()),
      }
    }

    const loadAndAddSprites = async () => {
      let spriteData: any
      let spriteBitmap: ImageBitmap
      let usedSuffix = ''

      const trySuffixes = window.devicePixelRatio >= 2 ? ['@2x', ''] : ['']
      for (const suffix of trySuffixes) {
        try {
          const result = await loadSpriteFiles(suffix)
          spriteData = result.spriteData
          spriteBitmap = result.spriteBitmap
          usedSuffix = suffix
          break
        } catch (e) {
          // try next fallback
        }
      }

      if (!spriteData || !spriteBitmap) {
        console.warn('CustomSprite: Failed to load any sprite')
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = spriteBitmap.width
      canvas.height = spriteBitmap.height
      ctx.drawImage(spriteBitmap, 0, 0)

      for (const [name, { x, y, width, height, pixelRatio }] of Object.entries(spriteData) as [string, any][]) {
        const subCanvas = document.createElement('canvas')
        subCanvas.width = width
        subCanvas.height = height
        const subCtx = subCanvas.getContext('2d')!
        subCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height)
        const iconBitmap = await createImageBitmap(subCanvas)

        if (!map.hasImage(name)) {
          map.addImage(name, iconBitmap, { pixelRatio })
        }
      }
    }

    map.on('style.load', loadAndAddSprites)
    if (map.isStyleLoaded()) loadAndAddSprites()

    return () => {
      map.off('style.load', loadAndAddSprites)
    }
  }, [map, url])

  return null
}
