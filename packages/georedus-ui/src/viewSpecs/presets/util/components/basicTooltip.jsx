// title: 'local',
// entries: {
//   financial_value: {
//     label: 'Valor financeiro',
//     format: {
//       number: ['pt-BR', { style: 'currency', currency: 'BRL' }],
//     },
//   },

import { resolve } from '@orioro/resolve'
import { humanize } from '../string'
import { cast } from '@orioro/cast'
import { interpolate } from '@orioro/util'

//
// `extraEntries` allows a preset to append computed rows after the
// configured ones — e.g. a value that depends on the view conf and
// therefore cannot be declared in the spreadsheet.
//
export function basicTooltip({ title, entries } = {}, { extraEntries } = {}) {
  const titleKey = title || 'name'

  //
  // `title` may either be the name of a single feature property
  // or a template combining multiple ones, e.g.
  // '${route_short_name} - ${route_long_name}'
  //
  const titleIsTemplate =
    typeof titleKey === 'string' && titleKey.includes('${')

  return {
    title: [
      '$literal',
      resolve.fn((ctx) => {
        const properties = ctx?.feature?.properties

        return titleIsTemplate
          ? interpolate(titleKey, properties || {})
          : properties?.[titleKey]
      }),
    ],
    entries: [
      '$literal',
      resolve.fn((ctx) => {
        if (typeof ctx.feature?.properties !== 'object') {
          return []
        }

        const entrySpecs = Array.isArray(entries)
          ? Object.fromEntries(
              entries.map((spec) =>
                typeof spec === 'string'
                  ? [spec, { label: humanize(spec) }]
                  : [spec.key, spec],
              ),
            )
          : typeof entries === 'object'
            ? entries
            : Object.fromEntries(
                Object.keys(ctx.feature.properties)
                  .filter((key) => key !== titleKey)
                  .map((key) => [
                    key,
                    {
                      label: humanize(key),
                    },
                  ]),
              )

        const configuredEntries = Object.entries(entrySpecs).map(
          ([key, spec]) => {
            spec = typeof spec === 'string' ? { label: spec } : spec

            const { label, format } = spec

            return [
              label,
              cast(
                {
                  type: 'string',
                  ...format,
                },
                ctx.feature?.properties[key],
              ),
            ]
          },
        )

        return typeof extraEntries === 'function'
          ? [...configuredEntries, ...extraEntries(ctx)]
          : configuredEntries
      }),
    ],
  }
}
