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

export function basicTooltip({ title, entries } = {}) {
  const titleKey = title || 'name'

  return {
    title: [
      '$literal',
      resolve.fn((ctx) => {
        return ctx?.feature?.properties?.[titleKey]
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

        return Object.entries(entrySpecs).map(([key, spec]) => {
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
        })
      }),
    ],
  }
}
