import {
  $$literal,
  expressions,
  fetchExpr,
  makeResolve,
  withExpressionResolvers,
  ALL_EXPR,
} from '@orioro/resolve'
import { $naturalBreaks } from '@orioro/react-maplibre-util'
import { METADATA_API_ENDPOINT } from '../viewSpecs/constants'
import { VIEW_SPECS_BY_ID } from '../viewSpecs'

const { resolveAsync, resolve } = makeResolve({
  resolvers: withExpressionResolvers(
    expressions.syntaxArrayExpr({
      name: '$$logical',
      symbol: Symbol.for('$$logical'),
      // @ts-ignore
      exps: {
        ...ALL_EXPR,
        $fetch: fetchExpr({
          isFetchAllowed: fetchExpr.allowOrigins({
            [METADATA_API_ENDPOINT]: ['GET'],
          }),
        }),
        $naturalBreaks,
      },
    }).resolver,
  ),
  defaultResolver: $$literal,
})

export { resolve, resolveAsync }

export async function resolveView(viewId, context) {
  return resolveAsync(VIEW_SPECS_BY_ID[viewId], context)
}
