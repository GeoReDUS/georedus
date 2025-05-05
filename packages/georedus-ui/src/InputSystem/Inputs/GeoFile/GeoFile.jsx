import React from 'react'

import { SingleFileInput, fileReadAs } from '@orioro/react-ui-core'
import { useDialogs } from '../../../DialogSystem'
import { uniq } from 'lodash'
import { setupGdal } from './setupGdal'

// TODO generalize for allow input types and output types

async function parseGeoFileMetadata(file) {
  const contents = await fileReadAs(file, 'text')

  const geoJson = JSON.parse(contents)

  const geometryTypes =
    geoJson.type === 'FeatureCollection'
      ? uniq(
          (geoJson.features || []).map((feature) => feature.geometry?.type),
        ).filter(Boolean)
      : []

  return {
    geometryTypes,
  }
}

export function GeoFile(props) {
  const dialogs = useDialogs()

  return (
    <SingleFileInput
      {...props}
      middleware={[
        async (file) => {
          // const workerData = await fetch(
          //   'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3.js',
          // )
          // const workerUrl = window.URL.createObjectURL(await workerData.blob())

          // //
          // // From:
          // // https://github.com/bugra9/gdal3.js/blob/master/apps/example-singlefile/index.html
          // //
          // // TODO: use own hosted files?
          // //
          // const paths = {
          //   wasm: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3WebAssembly.wasm',
          //   data: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3WebAssembly.data',
          //   js: workerUrl,
          // }
          // const Gdal = await initGdalJs({ paths })

          const Gdal = await setupGdal()

          //
          // TODO: convert to use ogr2ogr util at setupGdal.js
          //

          const { datasets, errors } = await Gdal.open(
            file,
            [],
            //
            // https://gdal3.js.org/docs/module-f_open.html
            // Opening a file using the virtual file system handler, ie. /vsicurl/ or /vsizip/.
            // One common scenario is a .zip shapefile
            // const result = await Gdal.open(file, [], ['vsizip']);
            //
            file.type === 'application/zip' ? ['vsizip'] : [],
          )

          if (Array.isArray(errors) && errors.length > 0) {
            console.error(errors.join(' | '))
            await dialogs.info(
              `Ocorreu um erro ao converter o arquivo: ${errors.join(' | ')}`,
            )

            return null
          }

          // TODO generalize for allow input types and output types
          const result = await Gdal.ogr2ogr(datasets[0], [
            '-f',
            'GeoJSON',
            '-t_srs',
            'EPSG:4326',
          ])

          const fileBytes = await Gdal.getFileBytes(result.real)
          const blob = new Blob([fileBytes], {
            type: 'application/geo+json',
          })

          //
          // https://gdal3.js.org/docs/module-f_close.html
          // Close the dataset. The memory associated to the dataset will be freed.
          // Datasets must be closed when you're finished with them, or the memory consumption will grow forever.
          //
          await Gdal.close(datasets[0])

          const outFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.geojson'),
            {
              type: 'application/geo+json',
            },
          )

          //
          // Set custom data info
          //
          outFile.GEO_FILE_GEOMETRY_TYPES = ['Point']
          outFile.GEO_FILE_METADATA = await parseGeoFileMetadata(outFile)

          return outFile
        },
      ]}
    />
  )
}
