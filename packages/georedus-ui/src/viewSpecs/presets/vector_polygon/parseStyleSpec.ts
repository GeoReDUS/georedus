import { resolveColor } from '../../util'
import { StyleSpec, StyleSpecInput } from './types'

export function parseStyleSpec(styleInput?: StyleSpecInput): StyleSpec | null {
  if (!styleInput) {
    return null
  }

  if (typeof styleInput === 'string') {
    return {
      dataType: 'categorical_single',
      color: resolveColor(styleInput),
    }
  } else {
    switch (styleInput.dataType) {
      case 'sequential': {
        return styleInput
      }
      case 'categorical_multiple': {
        return styleInput
      }
      case 'categorical_single':
      default: {
        return {
          ...styleInput,
          color: resolveColor(styleInput.color),
          dataType: 'categorical_single',
        }
      }
    }
  }
}
