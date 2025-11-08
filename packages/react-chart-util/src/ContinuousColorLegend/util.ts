type ColorInterpolatorFn = (value: number) => string

type GradientFromColorsProps = {
  colors: string[]
  direction?: string
}

export function gradientFromColors({
  colors,
  direction = 'to top',
}: GradientFromColorsProps) {
  const steps = colors.length
  const parts = colors.map((color, i) => {
    const progress = i / (steps - 1)
    return `${color} ${progress * 100}%`
  })

  return `linear-gradient(${direction}, ${parts.join(',')})`
}

type ColorsFromInterpolatorProps = {
  interpolator: ColorInterpolatorFn
  steps?: number
}

export function colorsFromInterpolator({
  interpolator,
  steps = 100,
}: ColorsFromInterpolatorProps) {
  return Array.from({ length: steps }, (_, i) => {
    const progress = i / (steps - 1)
    return interpolator(progress)
  })
}
