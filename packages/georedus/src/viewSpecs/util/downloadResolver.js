import { resolve } from '@orioro/resolve'
import { saveAs } from 'file-saver'
import { CANCELLED } from '@orioro/react-ui-core'
import { omit } from 'lodash'
import { ogr2ogr } from '../../InputSystem/Inputs/GeoFile/setupGdal'
import { resolveExprAsync } from '../resolveView/resolveExpr'

const EXTENSIONS_BY_FORMAT = {
  GeoJSON: 'geojson',
  GPKG: 'gpkg',
  CSV: 'csv',
  KML: 'kml',
}

export function downloadResolver(downloadConf) {
  return resolve.fn((context) => async ({ dialogs }) => {
    const {
      geometryPropertyKey = 'geom',
      defaultOptions,
      fetchData,
      mainVariableId,
      availableVariableIds,
      fileNameBase = mainVariableId,
    } = await resolveExprAsync(downloadConf, context)

    const options = await dialogs.prompt({
      title: 'Baixar dados',
      submit: 'Baixar',
      input: {
        type: 'object',
        properties: {
          format: {
            label: 'Selecione o formato do arquivo',
            type: 'radioSelect',
            required: true,
            options: [
              {
                value: 'CSV',
                label: 'Planilha CSV (dados tabulares separados por vírgulas)',
              },
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
          variableIds:
            Array.isArray(availableVariableIds) &&
            availableVariableIds.length > 0
              ? {
                  label: 'Selecione os dados para download',
                  type: 'checkboxSelect',
                  required: true,
                  options: availableVariableIds
                    .map((opt) =>
                      typeof opt === 'string'
                        ? {
                            label: opt,
                            value: opt,
                          }
                        : opt,
                    )
                    .sort((optA, optB) =>
                      optA.value === mainVariableId
                        ? -1
                        : optB.value === mainVariableId
                          ? 1
                          : optA.label <= optB.label
                            ? -1
                            : 1,
                    ),
                }
              : null,
        },
      },
      defaultValue: defaultOptions || {
        format: 'CSV',
        variableIds: [mainVariableId],
      },
    })

    if (options === CANCELLED) {
      return
    }

    const variableIds =
      options.variableIds && options.variableIds.length > 0
        ? options.variableIds
        : [mainVariableId]

    // //
    // // Automatically include geometry in case the requested format
    // // is a geo format
    // //
    // const select = [...variableIds, geometryPropertyKey].join(',')

    await dialogs.loading(async ({ setMessage }) => {
      setMessage('Carregando dados')

      //
      // Fetch the data
      //
      const data = await fetchData({ variableIds, options })

      //
      // Build a geoJson data object
      //
      const geoJsonData = {
        type: 'FeatureCollection',
        features: data.map((entry) => {
          const geometry = entry[geometryPropertyKey]

          return {
            type: 'Feature',
            properties: omit(entry, [geometryPropertyKey]),
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

        saveAs(
          blob,
          `${typeof fileNameBase === 'function' ? fileNameBase({ options }) : fileNameBase}.${EXTENSIONS_BY_FORMAT[options.format]}`,
        )
      } catch (err) {
        console.error(err.message)
        await dialogs.info(`Ocorreu um erro ao gerar o arquivo: ${err.message}`)
      }
    }, 'Carregando dados')
  })
}
