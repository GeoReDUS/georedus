import { DEFAULT_FILL_OPACITY } from '../../colorUtil'

export function opacitySlider({ ...props } = {}) {
  return {
    type: 'slider',
    label: 'Opacidade da camada',
    size: '1',
    min: 0.1,
    max: 1,
    step: 0.05,
    defaultValue: DEFAULT_FILL_OPACITY,
    //
    // By default, opacity conf should
    // only notify layers stage
    //
    notify: 'layers',
    ...props,
  }
}
