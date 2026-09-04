import {
  makeResolve,
  withExpressionResolvers,
  expressions,
  ALL_EXPR,
  fetchExpr,
  $$literal,
} from '@orioro/resolve'

import * as CUSTOM_EXPR from './customExpr'
import { vtx } from '../../vtxProtocol'

//
// TODO: set dynamic values
//
const ALLOW_FETCH_SOURCES: Parameters<typeof fetchExpr.allowOrigins>[0] = {
  ['https://dev-geoapi-metadata.orioro.design']: ['GET', 'POST'],
}

async function isFetchAllowed(resource, options) {
  return fetchExpr.allowOrigins(ALLOW_FETCH_SOURCES)(resource, options)
}

const { resolveAsync: resolveExprAsync, resolve: resolveExpr } = makeResolve({
  resolvers: withExpressionResolvers(
    expressions.syntaxArrayExpr({
      name: '$$logical',
      symbol: Symbol.for('$$logical'),
      // @ts-ignore
      exps: {
        ...ALL_EXPR,
        ...CUSTOM_EXPR,
        $fetch: fetchExpr({
          isFetchAllowed,

          //
          // memoFetchData already parses
          // response to json
          //
          // TODO: review integration techniques
          // for better API
          //
          fetchFn: vtx.memoFetchData,
          handleResponse: (data) => data,
        }),
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

export { resolveExpr, resolveExprAsync }
