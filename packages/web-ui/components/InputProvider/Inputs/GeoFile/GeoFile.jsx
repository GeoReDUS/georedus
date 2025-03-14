import initGdalJs from 'gdal3.js'
import { SingleFileInput } from '@orioro/react-ui-core'
import { useDialogs } from '@/components/DialogSystem'

// TODO generalize for allow input types and output types

export function GeoFile(props) {
  const dialogs = useDialogs()

  return (
    <SingleFileInput
      {...props}
      middleware={[
        async (file) => {
          const workerData = await fetch(
            'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3.js',
          )
          const workerUrl = window.URL.createObjectURL(await workerData.blob())

          //
          // From:
          // https://github.com/bugra9/gdal3.js/blob/master/apps/example-singlefile/index.html
          //
          // TODO: use own hosted files?
          //
          const paths = {
            wasm: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3WebAssembly.wasm',
            data: 'https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3WebAssembly.data',
            js: workerUrl,
          }
          const Gdal = await initGdalJs({ paths })

          const { datasets, errors } = await Gdal.open(file)

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

          return new File([blob], file.name.replace(/\.[^/.]+$/, '.geojson'), {
            type: 'application/geo+json',
          })
        },
      ]}
    />
  )
}
