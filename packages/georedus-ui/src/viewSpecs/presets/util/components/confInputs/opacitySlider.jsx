import { DEFAULT_FILL_OPACITY } from '../../colorUtil'

export function opacitySlider({ defaultValue = DEFAULT_FILL_OPACITY }) {
  return {
    type: 'slider',
    label: 'Opacidade da camada',
    size: '1',
    min: 0.1,
    max: 1,
    step: 0.01,
    defaultValue,
  }
}
