const DEFAULT_BANDS = [
  { value: 15, label: '0 - 15 min', color: '#2ECC71' },
  { value: 30, label: '15 - 30 min', color: '#A9D93B' },
  { value: 60, label: '30 - 60 min', color: '#F1C40F' },
  { value: 90, label: '60 - 90 min', color: '#E67E22' },
  { value: 120, label: '90 - 120 min', color: '#E74C3C' },
]

export function parseStyleSpec(style: Record<string, any> = {}) {
  return {
    bands: style.bands || DEFAULT_BANDS,
    minzoom: style.minzoom ?? 9,
    dvtView: style.dvtView || 'cem_gtfs_travel_time',
    originIdKey: style.originIdKey || 'id_hex',
    originKey: style.originKey || 'hex_from',
    destKey: style.destKey || 'hex_to',
    valueKey: style.valueKey || 'time_min',
    baseFillColor: style.baseFillColor || '#CCCCCC',
    baseFillOpacity: style.baseFillOpacity ?? 0.3,
    outlineColor: style.outlineColor || '#000000',
    outlineWidth: style.outlineWidth ?? 3,
  }
}
