import { resolve } from '@orioro/resolve'

const DEFAULT_TT_BOUNDARY = 30

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    data: {
      travelTimeBoundary: {
        type: 'slider',
        label: resolve.literal(
          resolve.fn((context) => {
            return `Tempo de viagem (${context.value?.travelTimeBoundary || DEFAULT_TT_BOUNDARY}min)`
          }),
        ),
        size: '1',
        min: 5,
        max: 120,
        step: 5,
        defaultValue: DEFAULT_TT_BOUNDARY,
        //
        // By default, opacity conf should
        // only notify layers stage
        //
        notify: 'sources',
      },
    },
  }
}
