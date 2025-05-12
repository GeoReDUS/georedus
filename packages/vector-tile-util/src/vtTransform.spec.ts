import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'node:fs'
import { transformAllLayers, vtTransform } from './vtTransform'
import { VectorTile } from '@mapbox/vector-tile'
import Protobuf from 'pbf'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

test('basic', async () => {
  const buffer = readFileSync(join(__dirname, 'test/9295.pbf'))

  const tile = new VectorTile(new Protobuf(buffer))

  console.log(tile.layers)

  const transformed = vtTransform(
    tile,
    transformAllLayers({
      features: (feat) => {
        return {
          ...feat,
        }
      },
    }),
  )
})
