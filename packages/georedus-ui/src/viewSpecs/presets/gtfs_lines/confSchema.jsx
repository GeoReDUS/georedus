import { resolve } from '@orioro/resolve'
import { colorSelector, opacitySlider } from '../util'
import { DEFAULT_LINE_OPACITY } from './consts'
import { formatHour } from '../util/hourUtil'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  const style = {
    classificationMethodType: {
      label: 'Método de classificação',
      type: 'select',
      clearable: false,
      defaultValue:
        viewSpec.style?.lineWidth?.classificationMethod?.type ||
        'naturalBreaks',
      options: [
        {
          value: 'naturalBreaks',
          label: 'Quebras naturais',
        },
        {
          value: 'quantile',
          label: 'Quantis',
        },
        {
          value: 'equalIntervals',
          label: 'Intervalos Iguais',
        },
      ],
    },
    color: colorSelector('customColor', true),
    opacity: opacitySlider({
      defaultValue: styleSpec.opacity || DEFAULT_LINE_OPACITY,
    }),
    periodHourSlider: {
      type: 'range',
      size: '24',
      min: 0,
      max: 24,
      step: 1,
      defaultValue: [0, 24],
      label: resolve.literal(
        resolve.fn((context) => {
          const [from, to] = context.value?.periodHourSlider || [0, 24]
          return `Frequência (${formatHour(from)} - ${formatHour(to)})`
        }),
      ),
    },
  }

  return {
    style,
  }
}
