type ZoomSensitiveLinearSizesProps = {
  variable: any
  minValue?: any
  maxValue?: any
  minSize: number
  maxSize: number
  zoomBreakpoint?: number
}

export function zoomSensitiveLinearSizes({
  variable,
  minValue,
  maxValue,
  minSize,
  maxSize,
  zoomBreakpoint = 12,
}: ZoomSensitiveLinearSizesProps) {
  const hasMinAndMaxValues =
    //
    // Accept minValue expressions or actual numbers,
    // must check for 0 explicitly
    //
    (minValue || minValue === 0) && (maxValue || maxValue === 0)

  const defaultSize = hasMinAndMaxValues
    ? [
        'interpolate',
        ['linear'],
        variable,
        minValue,
        minSize / 2,
        maxValue,
        maxSize / 2,
      ]
    : minSize

  const largerSize = hasMinAndMaxValues
    ? [
        'interpolate',
        ['linear'],
        variable,
        minValue,
        minSize,
        maxValue,
        maxSize,
      ]
    : maxSize

  return ['step', ['zoom'], defaultSize, zoomBreakpoint, largerSize]
}
