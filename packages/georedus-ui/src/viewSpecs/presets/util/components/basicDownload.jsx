import { resolve } from '@orioro/resolve'
import { ogr2ogr } from '../../../../InputSystem/Inputs/GeoFile/setupGdal'
import { omit } from 'lodash'

const GEOMETRY_KEY = 'geom'

const EXTENSIONS_BY_FORMAT = {
  GeoJSON: 'geojson',
  GPKG: 'gpkg',
  CSV: 'csv',
  KML: 'kml',
}

const OPTIONS_SCHEMA = {
  format: {
    label: 'Selecione o formato do arquivo',
    type: 'radioSelect',
    required: true,
    options: [
      // {
      //   value: 'CSV',
      //   label: 'Planilha CSV (dados tabulares separados por vírgulas)',
      // },
      {
        value: 'GPKG',
        label: 'GeoPackage (banco de dados geoespacial compacto)',
      },
      {
        value: 'GeoJSON',
        label: 'GeoJSON (dados geográficos em JSON)',
      },
      {
        value: 'KML',
        label: 'KML (Keyhole Markup Language - mapas em XML)',
      },
    ],
  },
}

export function basicDownload({ fileName, downloadUrl }) {
  return resolve.fn((ctx) => async ({ dialogs }) => {
    const options = await dialogs.prompt({
      title: 'Baixar dados',
      submit: 'Baixar',
      input: {
        type: 'object',
        properties: OPTIONS_SCHEMA,
      },
      defaultValue: {
        format: 'GPKG',
      },
    })

    await dialogs.loading(async ({ setMessage }) => {
      const data = await fetch(downloadUrl).then((res) => res.json())

      //
      // Build a geoJson data object
      //
      const geoJsonData = {
        type: 'FeatureCollection',
        features: data.map((entry) => {
          const geometry = entry[GEOMETRY_KEY]

          return {
            type: 'Feature',
            properties: omit(entry, [GEOMETRY_KEY]),
            geometry,
          }
        }),
      }

      try {
        setMessage('Preparando arquivo')
        //
        // Convert to requested format using ogr2ogr
        //
        const blob = await ogr2ogr({
          src: geoJsonData,
          format: options.format,
        })

        saveAs(blob, `${fileName}.${EXTENSIONS_BY_FORMAT[options.format]}`)
      } catch (err) {
        console.error(err.message)
        await dialogs.info(`Ocorreu um erro ao gerar o arquivo: ${err.message}`)
      }
    }, 'Carregando dados')
  })
}
