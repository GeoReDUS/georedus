/**
 * Calculate all paper layout dimensions based on a given paper width
 * Uses A4 aspect ratio (1:√2) and derives all other constants
 * 
 * @param {number} paperWidth - The width of the paper in pixels
 * @returns {Object} Object containing all calculated dimensions
 */
export function getPaperDimensions(paperWidth) {
  const PAPER_WIDTH = paperWidth
  const PAPER_HEIGHT = Math.round(PAPER_WIDTH / Math.sqrt(2))
  const MARGIN = Math.round(PAPER_HEIGHT * 0.05)
  const PIXELRATIO = 4

  const INSIDE_WIDTH = Math.round(PAPER_WIDTH - MARGIN * 2)
  const INSIDE_HEIGHT = Math.round(PAPER_HEIGHT - MARGIN * 2)
  const MAP_WIDTH = Math.round(INSIDE_WIDTH)
  const MAP_HEIGHT = Math.round(INSIDE_HEIGHT * 0.7 - MARGIN / 2)
  const BOTTOM_HEIGHT = Math.round(INSIDE_HEIGHT - MAP_HEIGHT - MARGIN / 2)
  const DESCRIPTION_WIDTH = Math.round(INSIDE_WIDTH * 0.25)
  const QRCODE_SIZE = Math.round(BOTTOM_HEIGHT)

  const MAPINFO_PADDING = Math.round(MARGIN * 0.4)
  const LOGO_HEIGHT = Math.round(MAP_HEIGHT * 0.15)
  const PROJECTION_HEIGHT = Math.round(MAP_HEIGHT * 0.1)
  const NORTH_SIZE = Math.round(PROJECTION_HEIGHT * 0.8)

  return {
    PAPER_WIDTH,
    PAPER_HEIGHT,
    MARGIN,
    PIXELRATIO,
    INSIDE_WIDTH,
    INSIDE_HEIGHT,
    MAP_WIDTH,
    MAP_HEIGHT,
    BOTTOM_HEIGHT,
    DESCRIPTION_WIDTH,
    QRCODE_SIZE,
    LOGO_HEIGHT,
    PROJECTION_HEIGHT,
    MAPINFO_PADDING,
    NORTH_SIZE,
  }
}
