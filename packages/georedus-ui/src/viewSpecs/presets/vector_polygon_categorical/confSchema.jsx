import { fillPatternSelector } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      fillPattern: fillPatternSelector(),
    },
  }
}
