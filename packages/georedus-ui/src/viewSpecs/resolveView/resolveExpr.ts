import {
  makeResolve,
  withExpressionResolvers,
  expressions,
  ALL_EXPR,
  fetchExpr,
  $$literal,
} from '@orioro/resolve'

import * as CUSTOM_EXPR from './customExpr'

//
// TODO: set dynamic values
//
const HARD_CODED_ALLOW_FETCH_SOURCES: Parameters<
  typeof fetchExpr.allowOrigins
>[0] = {
  ['https://dev-geoapi-metadata.orioro.design']: ['GET', 'POST'],
  ['http://localhost:6001']: ['GET', 'POST'],
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
        }),
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

export { resolveExpr, resolveExprAsync }
