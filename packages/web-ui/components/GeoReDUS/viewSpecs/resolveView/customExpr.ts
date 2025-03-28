import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import queryString, { StringifyOptions } from 'query-string'
import { GeoReDUSWorker } from '../../GeoReDUSWorker'

import { ScaleNaturalBreaksProps } from '@orioro/react-maplibre-util'
import { isPlainObject, pick } from 'lodash'

type SearchParams = Record<string, any>

// GeoReDUSWorker.double(6).then((res) => {
//   console.log('WORKER RESPONSE!', res)
// })

export const $naturalBreaks: ExpressionFn<
  [number[], opt?: Pick<ScaleNaturalBreaksProps, 'k' | 'scalesByK'>]
> = ([values, opt]) => {
  console.log('will run $naturalBreaks in worker')

  const breaks = GeoReDUSWorker.scaleNaturalBreaks({
    values,
    ...(isPlainObject(opt)
      ? pick(opt, ['scalesByK', 'k', 'minK', 'maxK'])
      : {}),
  })

  return breaks
}

// export const $test = ()

export const $urlSearch: ExpressionFn<
  [SearchParams | [SearchParams, StringifyOptions]]
> = ([searchParams]) => {
  return Array.isArray(searchParams)
    ? queryString.stringify(searchParams[0], searchParams[1])
    : queryString.stringify(
        //
        // By default, stringify non primitive values using
        // JSON.stringify before passing on to queryString,
        // as by default queryString ignores non-primitive values.
        //
        // This still allows for custom formatting, throgh the array
        // searchParams input, w/ second arg as options passed
        // to queryString
        //
        Object.fromEntries(
          Object.entries(searchParams).map(([key, value]) => [
            key,
            typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : value,
          ]),
        ),
      )
}
