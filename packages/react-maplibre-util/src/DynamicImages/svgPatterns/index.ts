import { interpolate } from '@orioro/util'

function _pattern(strTemplate: string) {
  return (data: Record<string, any>) => interpolate(strTemplate, data)
}

function _svgViewBox({ height, width }: { height: number; width: number }) {
  return `viewBox="0 0 ${width} ${height}" height="${height}" width="${width}"`
}

function _bgRect() {
  return `<rect
    width="100%"
    height="100%"
    fill="\${ fill = transparent }"
  />`
}

// Source:
// https://pattern.monster/cross-section
export const squares_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({ height: 20, width: 20 })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="20"
      height="20"
      patternUnits="userSpaceOnUse"
    >
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="2"
        d="M10 0v20ZM0 10h20Z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

// Source:
// https://pattern.monster/triangles-4
export const triangles_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    height: 40,
    width: 20,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="20"
      height="40"
      patternUnits="userSpaceOnUse"
    >
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M0 30h20L10 50zm-10-20h20L0 30zm20 0h20L20 30zM0-10h20L10 10z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

// Source:
// https://pattern.monster/diamonds-1
export const diamonds_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    height: 50,
    width: 50,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="50"
      height="50"
      patternUnits="userSpaceOnUse"
    >
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M50 25 37.5 50 25 25 37.5 0zm-25 0L12.5 50 0 25 12.5 0z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

export const cross_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    height: 20,
    width: 20,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="20"
      height="20"
      patternUnits="userSpaceOnUse"
    >
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        stroke-linecap="square"
        d="M3.25 10h13.5M10 3.25v13.5"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

// https://pattern.monster/cubes-1
export const mosaic_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    width: 60,
    height: 60,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="60"
      height="60"
      patternUnits="userSpaceOnUse">
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M15 30v30m-7.5 0V30h15v30m7.5 0H0V30h30M45 0v30m7.5-30v30m-15 0V0M30 0h30v30M30 45h30m-30-7.5h30m0 15H30M30 30h30v30H30zM0 15h30M0 7.5h30m0 15H0M0 0h30v30H0z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

export const waves_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    width: 120,
    height: 80,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="120"
      height="80"
      patternUnits="userSpaceOnUse">
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M-50.129 12.685C-33.346 12.358-16.786 4.918 0 5c16.787.082 43.213 10 60 10s43.213-9.918 60-10 33.346 7.358 50.129 7.685"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M-50.129 32.685C-33.346 32.358-16.786 24.918 0 25c16.787.082 43.213 10 60 10s43.213-9.918 60-10 33.346 7.358 50.129 7.685"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M-50.129 52.685C-33.346 52.358-16.786 44.918 0 45c16.787.082 43.213 10 60 10s43.213-9.918 60-10 33.346 7.358 50.129 7.685"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M-50.129 72.685C-33.346 72.358-16.786 64.918 0 65c16.787.082 43.213 10 60 10s43.213-9.918 60-10 33.346 7.358 50.129 7.685"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

export const circles_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    width: 20,
    height: 20,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="20"
      height="20"
      patternUnits="userSpaceOnUse">
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)

export const lines_1 = _pattern(`<svg
  xmlns="http://www.w3.org/2000/svg"
  ${_svgViewBox({
    width: 20,
    height: 80,
  })}>
  <defs>
    <pattern
      patternTransform="scale(\${ scale = 1 })"
      id="a"
      width="20"
      height="80"
      patternUnits="userSpaceOnUse">
      ${_bgRect()}
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M0 10h20z"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M0 30h20z"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M0 50h20z"
      />
      <path
        fill="transparent"
        stroke="\${ stroke = #000000 }"
        stroke-width="\${ strokeWidth = 2 }"
        d="M0 70h20z"
      />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`)
