//
// Taken from react-map-gl/maplibre
// https://github.com/visgl/react-map-gl/blob/c7112cf50d6985e8427d6b187d23a4d957791bb7/modules/react-maplibre/src/utils/apply-react-style.ts
//

import * as React from 'react'
// This is a simplified version of
// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSPropertyOperations.js#L62
const unitlessNumber =
  /box|flex|grid|column|lineHeight|fontWeight|opacity|order|tabSize|zIndex/

export function applyReactStyle(
  element: HTMLElement,
  styles: React.CSSProperties,
) {
  if (!element || !styles) {
    return
  }
  const style = element.style

  for (const key in styles) {
    const value = styles[key]
    if (Number.isFinite(value) && !unitlessNumber.test(key)) {
      style[key] = `${value}px`
    } else {
      style[key] = value
    }
  }
}
