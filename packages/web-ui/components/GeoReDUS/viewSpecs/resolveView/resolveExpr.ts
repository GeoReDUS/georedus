import {
  makeResolve,
  withExpressionResolvers,
  expressions,
  ALL_EXPR,
  fetchExpr,
  $$literal,
} from '@orioro/resolve'

import { apiConf } from '@/api'

import { $naturalBreaks } from '@orioro/react-maplibre-util'
import * as CUSTOM_EXPR from './customExpr'

async function isFetchAllowed(resource, options) {
  const conf = await apiConf()

  return fetchExpr.allowOrigins({
    [conf.GEO_METADATA_API_ENDPOINT]: ['GET', 'POST'],
  })(resource, options)
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
        $naturalBreaks,
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

export { resolveExpr, resolveExprAsync }
