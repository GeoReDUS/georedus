export const DEFAULT_FILL_OPACITY = 0.5

export function applyOpacity(color: string, alpha = 1) {
  if (color.startsWith('#')) {
    let hex = color
    if (hex.length === 4) {
      hex = '#' + hex.slice(1).replace(/./g, (c) => c + c)
    }
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  console.warn(
    `applyOpacity: unsupported color format "${color}", returning as-is`,
  )
  return color
}
