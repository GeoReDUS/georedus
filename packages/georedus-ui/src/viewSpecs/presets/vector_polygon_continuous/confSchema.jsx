// import { fillPatternSelector } from '../util'

import { Flex } from '@orioro/react-ui-core'
import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      classificationMethodType: {
        label: 'Método de classificação',
        type: 'select',
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
      colorScheme: {
        label: 'Esquema de cores',
        type: 'select',
        defaultValue: viewSpec.style?.colorScheme || DEFAULT_COLOR_SCHEME_ID,
        options: [
          {
            value: 'test',
            label: (
              <div>
                <Flex direction="row" gap="0">
                  <div>1</div>
                  <div>1</div>
                  <div>1</div>
                  <div>1</div>
                  <div>1</div>
                </Flex>
              </div>
            ),
          },
        ],
      },
    },
  }
}
