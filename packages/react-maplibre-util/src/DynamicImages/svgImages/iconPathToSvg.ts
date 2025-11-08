export type IconPathToSvgOptions = {
  size?: number
  fill?: string
  stroke?: string
  strokeWidth?: string | number
  viewBox?: string
  style?: string
}

export function iconPathToSvg(
  path: string,
  {
    size = 24,
    fill = 'black',
    stroke,
    strokeWidth,
    viewBox = '0 0 24 24',
    style,
  }: IconPathToSvgOptions = {},
): string {
  if (path.startsWith('<svg')) {
    return path
  }

  const svgAttrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    `width="${size}"`,
    `height="${size}"`,
    `viewBox="${viewBox}"`,
    stroke ? `stroke="${stroke}"` : '',
    strokeWidth ? `stroke-width="${strokeWidth}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const pathAttrs = [`fill="${fill}"`, style ? `style="${style}"` : '']
    .filter(Boolean)
    .join(' ')

  return `<svg ${svgAttrs}><path ${pathAttrs} d="${path}" /></svg>`
}
