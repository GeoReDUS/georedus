import { dataJoin, syntheticJson } from '@orioro/util'
import { RequestParameters } from 'maplibre-gl'
import memoize, { type Options as MemoizeeOptions } from 'memoizee'
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

function _extractUrlAndInit(
  input: Request | URL | string,
  init?: RequestInit,
): [string, RequestInit] {
  if (typeof input === 'string') return [input, init ?? {}]
  if (input instanceof URL) return [input.href, init ?? {}]

  return [input.url, init ?? {}]
}

export function makeMemoFetch<T = any>(
  fetchFn: typeof fetch = fetch,
  parser: (res: Response) => Promise<T> = (res) => res.json(),
  memoizeeOptions: MemoizeeOptions<typeof fetch> = {},
) {
  return memoize(
    (...args: Parameters<typeof fetch>) =>
      fetchFn(...args).then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Fetch error ${res.status}: ${text}`)
        }

        return parser(res)
      }),
    {
      max: 200,
      promise: true,
      normalizer: ([arg0, arg1]) => {
        const [rawUrl, options] = _extractUrlAndInit(arg0, arg1)
        const url = new URL(rawUrl, 'https://placeholder') // base needed for relative URLs

        //
        // Isolate search params so that caching
        // does not change upon query key order changing
        //
        const searchParams: Record<string, string> = {}
        for (const key of Array.from(url.searchParams.keys())) {
          searchParams[key] = url.searchParams.get(key)!
        }

        const { method = 'GET', headers = {}, body } = options

        return stableHash([
          url.origin + url.pathname,
          searchParams,
          {
            method: method.toLowerCase(),
            headers,
            body,
          },
        ])
      },
      ...memoizeeOptions,
    },
  )
}

export function dataMergeProtocol({
  fetch: _fetchFn = fetch,
  memoFetchData: _memoFetchData = makeMemoFetch(_fetchFn),
}: MergeProtocolOptions = {}) {
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

    const resolved = await Promise.all(
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
        } else {
          throw new TypeError(`Invalid dataSource: ${source}`)
        }
      }),
    )

    // Previous behavior prevented errors from being propagated
    // up to the map instance, thus resulting in the map
    // instance caching incorrectly aborted responses

    // const resolved = settled
    //   .filter(
    //     (result): result is PromiseFulfilledResult<[string, any[], string]> =>
    //       result.status === 'fulfilled',
    //   )
    //   .map((result) => result.value)

    // const rejected = settled.filter((r) => r.status === 'rejected')
    // if (rejected.length) {
    //   console.warn(
    //     `[dataMergeProtocol] ${rejected.length} data sources failed`,
    //     rejected,
    //   )
    // }

    return resolved
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

    const { t: tileSrc, d: dataSourcesInput = [] } = syntheticJson(
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

    if (dataSources.length > 0) {
      try {
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
      } catch (err) {
        throw new Error(
          `Tile transformation failed for ${tileSrc}: ${err.message}`,
        )
      }
    } else {
      return {
        data: tileBuffer,
      }
    }
  }

  return {
    protocolHandler,
    memoFetchData: _memoFetchData,
  }
}
