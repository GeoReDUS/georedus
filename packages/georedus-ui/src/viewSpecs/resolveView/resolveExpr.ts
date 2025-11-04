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
const HARD_CODED_ALLOW_FETCH_SOURCES: Parameters<
  typeof fetchExpr.allowOrigins
>[0] = {
  ['https://dev-geoapi-metadata.orioro.design']: ['GET', 'POST'],
  ['http://localhost:8001']: ['GET', 'POST'],
  ['https://staging-redus-geo-metadata-api-dfcce6e16f5f.herokuapp.com']: [
    'GET',
    'POST',
  ],
}

console.warn('TODO: remove HARD_CODED_ALLOW_FETCH_SOURCES')

async function isFetchAllowed(resource, options) {
  return fetchExpr.allowOrigins(HARD_CODED_ALLOW_FETCH_SOURCES)(
    resource,
    options,
  )
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
