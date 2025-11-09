//
// For all layers that have no z-index applied,
// they will be rendered according to sorting order
//
// We've got 3 base layers:
// - background from mapStyle
// - middle from data layers
// - top from basemaps topViews
//
export const Z_BASE_UNINDEXED = null

//
// Fot all layers that require overlaying over
// the base above, we've got 3 levels:
// - overlayBase - should be for polygons such as territorial
//   divisions that should always appear over data
// - overlayMiddle - should be for polygons that need to appear
//   above divisions, such as influence area
// - overlayTop - should be for stuff that needs to appear above all
//
// Always use the least possible
//
export const Z_OVERLAY_BASE_1000 = 1000
export const Z_OVERLAY_MIDDLE_2000 = 2000
export const Z_OVERLAY_TOP_3000 = 3000
