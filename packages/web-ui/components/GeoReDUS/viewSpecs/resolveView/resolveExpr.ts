import {
  makeResolve,
  withExpressionResolvers,
  expressions,
  ALL_EXPR,
  fetchExpr,
  $$literal,
} from '@orioro/resolve'

import { $naturalBreaks } from '@orioro/react-maplibre-util'
import { METADATA_API_ENDPOINT } from '../constants'
import * as CUSTOM_EXPR from './customExpr'

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
          isFetchAllowed: fetchExpr.allowOrigins({
            [METADATA_API_ENDPOINT]: ['GET', 'POST'],
          }),
        }),
        $naturalBreaks,
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

export { resolveExpr, resolveExprAsync }
