import { Flex } from '@orioro/react-ui-core'
import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'
import { D3_DIVERGING, D3_SEQUENTIAL } from '../../util'
import { schemeSelector } from '../util/components/confInputs'

const getLargestColorArray = (scheme) => {
  return scheme[scheme.length - 1]
}

const D3_SCHEMES = {
  ...D3_SEQUENTIAL,
  ...D3_DIVERGING,
}

const COLOR_SCHEME_OPTIONS = Object.entries(D3_SCHEMES).map(
  ([name, scheme]) => {
    const colors = getLargestColorArray(scheme)

    return {
      value: name,
      label: (
        <Flex direction="row" gap="2" alignItems="center">
          <div style={{ display: 'flex', gap: '2px' }}>
            {colors.map((color, idx) => (
              <div
                key={idx}
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: color,
                  border: 'none',
                }}
              />
            ))}
          </div>
        </Flex>
      ),
    }
  },
)

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      classificationMethodType: {
        label: 'Método de classificação',
        type: 'select',
        clearable: false,
        defaultValue:
          viewSpec.style?.classificationMethod?.type || 'naturalBreaks',
        options: [
          {
            value: 'naturalBreaks',
            label: 'Quebras naturais',
          },
          {
            value: 'quantile',
            label: 'Quantis',
          },
        ],
      },
      colorScheme: schemeSelector({
        defaultValue: viewSpec.style?.colorScheme || DEFAULT_COLOR_SCHEME_ID,
        schemeType: 'continuous',
      }),
    },
  }
}
