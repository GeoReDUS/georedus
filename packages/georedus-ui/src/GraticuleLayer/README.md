# GraticuleLayer Component

A dynamic React component that displays coordinate grids and rulers on MapLibre GL maps with automatically adjusting intervals based on zoom level.

## Features

- ✨ **Dynamic grid intervals** - Automatically adjusts label density based on zoom level
- 📍 **Coordinate labels** - Shows latitude/longitude with compass directions (N/S/E/W)
- 📏 **Ruler mode** - Display ruler-style borders with tick marks on map edges
- 📊 **Full grid mode** - Display complete grid across the entire map
- 🎨 **Fully customizable** - Control colors, sizes, visibility, and styles
- 🔄 **Auto-updating** - Automatically responds to map pan and zoom events

## Installation

The GraticuleLayer component is part of the `@redus/georedus-ui` package.

```bash
yarn add @redus/georedus-ui
```

## Basic Usage

```jsx
import { LayeredMap } from '@orioro/react-maplibre-util'
import { GraticuleLayer } from '@redus/georedus-ui'

export function MyMap() {
  return (
    <LayeredMap
      mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=YOUR_KEY"
      initialViewState={{
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 10,
      }}
    >
      <GraticuleLayer
        rulerStyle={true}
        showLabels={true}
        showBorders={true}
      />
    </LayeredMap>
  )
}
```

## Modes

### Ruler Style (Default)
Displays coordinate labels and tick marks on the map edges, creating a ruler-like effect. Ideal for export/print maps.

```jsx
<GraticuleLayer
  rulerStyle={true}
  showBorders={true}
  showLabels={true}
/>
```

### Full Grid Mode
Displays grid lines across the entire map with labels at all intersections.

```jsx
<GraticuleLayer
  rulerStyle={false}
  showLines={true}
  showLabels={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rulerStyle` | boolean | `true` | If true, shows only edges with tick marks; if false, shows full grid |
| `showLines` | boolean | `false` | Show full grid lines across the map |
| `showLabels` | boolean | `true` | Show coordinate labels (degrees and direction) |
| `showBorders` | boolean | `true` | Show border/ruler lines on map edges |
| `lineColor` | string | `'rgba(0, 0, 0, 0.1)'` | Color of grid lines (CSS color) |
| `lineWidth` | number | `1` | Width of grid lines in pixels |
| `borderColor` | string | `'rgba(0, 0, 0, 0.3)'` | Color of border/ruler lines (CSS color) |
| `borderWidth` | number | `2` | Width of border/ruler lines in pixels |
| `labelColor` | string | `'rgba(0, 0, 0, 0.8)'` | Color of coordinate labels (CSS color) |
| `labelSize` | number | `12` | Font size of labels in pixels |

## Grid Intervals by Zoom Level

The component automatically adjusts the graticule interval based on the current map zoom level:

| Zoom Level | Interval |
|-----------|----------|
| < 3 | 30° |
| 3 - 5 | 15° |
| 5 - 7 | 5° |
| 7 - 10 | 1° |
| 10 - 13 | 0.5° |
| ≥ 13 | 0.1° |

## Examples

### Export/Print Map with Ruler
```jsx
<GraticuleLayer
  rulerStyle={true}
  showBorders={true}
  showLabels={true}
  borderColor="rgba(0, 0, 0, 0.3)"
  borderWidth={1.5}
  labelColor="rgba(0, 0, 0, 0.8)"
  labelSize={10}
/>
```

### Minimal Labels Only
```jsx
<GraticuleLayer
  showLabels={true}
  showLines={false}
  showBorders={false}
/>
```

### Dark Theme
```jsx
<GraticuleLayer
  rulerStyle={true}
  showBorders={true}
  showLabels={true}
  borderColor="rgba(255, 255, 255, 0.4)"
  labelColor="rgba(255, 255, 255, 0.9)"
/>
```

### Highlighted Grid
```jsx
<GraticuleLayer
  rulerStyle={false}
  showLines={true}
  showLabels={true}
  lineColor="rgba(0, 0, 255, 0.3)"
  lineWidth={2}
  labelSize={14}
/>
```

## Requirements

This component must be rendered as a child of a `LayeredMap` component (from `@orioro/react-maplibre-util`) to access the map instance via the `useMap` hook.

```jsx
import { LayeredMap } from '@orioro/react-maplibre-util'
import { GraticuleLayer } from '@redus/georedus-ui'

// ✅ Correct
<LayeredMap>
  <GraticuleLayer />
</LayeredMap>

// ❌ Incorrect (not inside LayeredMap)
<GraticuleLayer />
```

## Performance

The GraticuleLayer component is optimized for performance:
- Updates only occur on map pan/zoom events
- Uses MapLibre GL's efficient layer rendering
- Minimal recomputation of graticule geometry

## Architecture

The component consists of:

1. **generateGraticuleData()** - Generates GeoJSON features for grid lines and labels based on map bounds and zoom level
2. **GraticuleLayer** - React component that manages the graticule layer, handles map events, and renders using react-map-gl

The graticule data includes:
- **Line features** - For grid lines and tick marks
- **Point features** - For coordinate labels

These are rendered using MapLibre GL's line and symbol layer types.

## Coordinates Format

Coordinate labels use the following format:
- **Latitude**: `23.5°N` or `23.5°S` (positive/north or negative/south)
- **Longitude**: `46.6°E` or `46.6°W` (positive/east or negative/west)

## License

ISC
