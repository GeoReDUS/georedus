import { dataJoin, syntheticJson } from '@orioro/util'
import { RequestParameters } from 'maplibre-gl'
import memoize from 'memoizee'
import stableHash from 'stable-hash'
import { transformAllLayers, vtTransform } from './vtTransform'

type DataSourcesInput = string | (string | [string, string, string?])[]

type MergeProtocolOptions = {
  fetch?: typeof fetch
  memoFetchData?: (
    ...args: Parameters<typeof fetch>
  ) => Promise<Record<string, any>[]>
}

function stripProtocol(url: string): string {
  const idx = url.indexOf('://')
  return idx >= 0 ? url.slice(idx + 3) : url
}

export function makeMemoFetchData(fetchFn: typeof fetch = fetch) {
  return memoize(
    (...args: Parameters<typeof fetch>) =>
      fetchFn(...args).then((res) => res.json()),
    {
      promise: true,
      normalizer: stableHash,
    },
  )
}

export function dataMergeProtocol({
  fetch: _fetchFn = fetch,
  memoFetchData: _memoFetchData = makeMemoFetchData(_fetchFn),
}: MergeProtocolOptions) {
  //
  // Utility function to resolve data sources
  //
  async function _resolveDataSources(
    dataSourcesInput: DataSourcesInput,
    requestParams: Omit<RequestParameters, 'url'>,
    abortController: AbortController,
  ) {
    const dataSources = Array.isArray(dataSourcesInput)
      ? dataSourcesInput
      : [dataSourcesInput]

    return Promise.all(
      dataSources.map(async (source) => {
        if (typeof source === 'string') {
          const data = await _memoFetchData(source, {
            ...requestParams,
            signal: abortController.signal,
          })

          return ['properties.id:id', data, 'properties']
        } else if (Array.isArray(source)) {
          const onKeyInput = source[0].split(':')
          const onKey =
            onKeyInput.length > 1
              ? `properties.${onKeyInput[0]}:${onKeyInput[1]}`
              : `properties.${onKeyInput[0]}:${onKeyInput[0]}`

          const data = await _memoFetchData(source[1], {
            signal: abortController.signal,
          })

          return [onKey, data, 'properties']
        }
      }),
    )
  }

  //
  // Function that may be used with
  // `maplibregl.addProtocol('protocol', protocolHandler)`
  //
  async function protocolHandler(
    { url: protocolUrl, ...requestParams }: RequestParameters,
    abortController: AbortController,
  ) {
    const signal = abortController.signal

    const { t: tileSrc, d: dataSourcesInput } = syntheticJson(
      stripProtocol(protocolUrl),
    ) as { t: string; d: DataSourcesInput }

    const [tileBuffer, dataSources] = await Promise.all([
      //
      // Fetch tile data
      //
      _fetchFn(tileSrc, {
        ...requestParams,
        signal,
      }).then((res) => res.arrayBuffer()),

      //
      // Fetch data sources data
      //
      _resolveDataSources(dataSourcesInput, requestParams, abortController),
    ])

    // console.time(`tiles: ${tileSrc}`)

    const transformed = vtTransform(
      tileBuffer,
      transformAllLayers((layer) => {
        const updatedFeats = dataJoin([layer.features, ...dataSources])

        return {
          ...layer,
          features: updatedFeats,
        }
      }),
    )
    // console.timeEnd(`tiles: ${tileSrc}`)

    return { data: transformed }
  }

  return {
    protocolHandler,
    memoFetchData: _memoFetchData,
  }
}
