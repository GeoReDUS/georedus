import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import queryString, { StringifyOptions } from 'query-string'
import { GeoReDUSWorker } from '../../GeoReDUSWorker'

import { ScaleNaturalBreaksProps } from '@orioro/react-maplibre-util'
import { isPlainObject, pick } from 'lodash'

type SearchParams = Record<string, any>

// export const $workerGet: ExpressionSpec<[any, any?]> = {
//   parseArgs: ([arg1, arg2], { parseNodeInput }) =>
//     typeof arg2 === 'undefined'
//       ? [parseNodeInput(arg1)]
//       : [parseNodeInput(arg1), parseNodeInput(arg2)],
//   fn: (args, context) => {
//     const path = args[0]
//     const src = args.length === 1 ? context : args[1]

//     return path === '' ? src : GeoReDUSWorker.get(src, path)
//   },
// }

export const $naturalBreaks: ExpressionFn<
  [number[], opt?: Pick<ScaleNaturalBreaksProps, 'k' | 'scalesByK'>]
> = ([values, opt]) => {

  const breaks = GeoReDUSWorker.scaleNaturalBreaks({
    values,
    ...(isPlainObject(opt)
      ? pick(opt, ['scalesByK', 'k', 'minK', 'maxK', 'defaultColor'])
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
