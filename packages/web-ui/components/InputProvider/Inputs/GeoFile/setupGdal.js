import initGdalJs from 'gdal3.js'
import { isPlainObject } from 'lodash'

export async function setupGdal() {
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

  return Gdal
}

function _srcFile(src) {
  if (src instanceof Blob) {
    return new File([src])
  } else if (src instanceof File) {
    return src
  } else if (isPlainObject(src)) {
    const geoJsonBlob = new Blob([JSON.stringify(src)], {
      type: 'application/geo+json',
    })

    const geoJsonFile = new File([geoJsonBlob], 'data.geojson', {
      type: 'application/geo+json',
    })

    return geoJsonFile
  } else {
    throw new TypeError(`Unsupported src ${typeof src}`)
  }
}

export async function ogr2ogr({ src, format }) {
  const Gdal = await setupGdal()

  const srcFile = _srcFile(src)

  const { datasets, errors } = await Gdal.open(srcFile, [])

  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.join(' | '))
  }

  const result = await Gdal.ogr2ogr(datasets[0], ['-f', format])

  const fileBytes = await Gdal.getFileBytes(result.real)
  const blob = new Blob([fileBytes])

  //
  // https://gdal3.js.org/docs/module-f_close.html
  // Close the dataset. The memory associated to the dataset will be freed.
  // Datasets must be closed when you're finished with them, or the memory consumption will grow forever.
  //
  await Gdal.close(datasets[0])

  return blob
}
