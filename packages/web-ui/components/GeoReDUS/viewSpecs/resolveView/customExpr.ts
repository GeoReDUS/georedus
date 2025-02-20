import { ExpressionFn } from '@orioro/resolve/dist/resolvers/expressions/types'
import queryString, { StringifyOptions } from 'query-string'

type SearchParams = Record<string, any>

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
