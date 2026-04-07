import React, { useState, useCallback, useEffect } from 'react'
import Papa from 'papaparse'
import { Flex, Button } from '@orioro/react-ui-core'
import { Progress } from '@radix-ui/themes'
import * as Dialog from '@radix-ui/react-dialog'
import styled from 'styled-components'
import maplibregl from 'maplibre-gl'

const DialogContent = styled(Flex)`
  padding: 20px;
  gap: 16px;
  max-width: 500px;
`

const ResultsContainer = styled(Flex)`
  max-height: 400px;
  overflow-y: auto;
  gap: 8px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`

const ResultItem = styled(Flex)`
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border-left: 4px solid ${(props) => {
    if (props.success === 'success') return '#4caf50'
    if (props.success === 'warning') return '#ff9800'
    return '#f44336'
  }};
  font-size: 12px;
`

const ColumnSelector = ({ label, value, options, onChange, disabled, required }) => (
  <Flex direction="column" gap="8px">
    <label style={{ fontSize: '12px', fontWeight: 500 }}>
      {label} {required && '(obrigatório)'}
    </label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {!required && <option value="">-- sem seleção --</option>}
      {options.map((header) => (
        <option key={header} value={header}>
          {header}
        </option>
      ))}
    </select>
  </Flex>
)

const COLUMN_CONFIGS = [
  {
    key: 'logradouro',
    label: '📍 Coluna Logradouro',
    patterns: ['logradouro', 'rua', 'avenida', 'street'],
    required: true,
  },
  {
    key: 'numero',
    label: '🏢 Coluna Número',
    patterns: ['numero', 'number', 'num'],
    required: false,
  },
  {
    key: 'cep',
    label: '📮 Coluna CEP',
    patterns: ['cep', 'postal', 'zip'],
    required: false,
  },
  {
    key: 'localidade',
    label: '🏘️ Coluna Localidade/Bairro',
    patterns: ['localidade', 'bairro', 'neighborhood'],
    required: false,
  },
  {
    key: 'municipio',
    label: '🏙️ Coluna Município',
    patterns: ['municipio', 'cidade', 'city'],
    required: true,
  },
  {
    key: 'estado',
    label: '🗺️ Coluna Estado/UF',
    patterns: ['estado', 'uf', 'state'],
    required: true,
  },
]

const BUTTON_STYLES = {
  base: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  primary: { background: '#4caf50' },
  secondary: { background: '#ff9800' },
}

const detectColumn = (headers, patterns) => {
  const lowerHeaders = headers.map((h) => h.toLowerCase())
  const index = lowerHeaders.findIndex((h) =>
    patterns.some((pattern) => h.includes(pattern))
  )
  return index >= 0 ? headers[index] : null
}

const detectColumns = (headers) => {
  const columns = {}
  COLUMN_CONFIGS.forEach(({ key, patterns, required }) => {
    columns[key] = detectColumn(headers, patterns) || (required ? headers[0] : null)
  })
  return columns
}

const removeMapLayers = (map, mapLayers) => {
  if (!map) return
  mapLayers.forEach(({ sourceId, layerId }) => {
    try {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    } catch (error) {
      console.error(`Error removing layer ${layerId} or source ${sourceId}:`, error)
    }
  })
}

const getMapInstance = (syncedMapsRef) => {
  let map = syncedMapsRef?.current?.mapInstances?.[0]?.map
  return map && typeof map.getMap === 'function' ? map.getMap() : map
}

const STORAGE_KEY = 'geocode_csv_results'
const STORAGE_KEY_LAYERS = 'geocode_csv_layers'

export function GeocodeCSVUploader({ syncedMapsRef, geocodeApiEndpoint = process.env.NEXT_PUBLIC_GEOCODE_API_ENDPOINT}) {
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [fileHeaders, setFileHeaders] = useState([])
  const [progress, setProgress] = useState(0)
  const [mapLayers, setMapLayers] = useState([])

  // Load results and map layers from localStorage on mount
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem(STORAGE_KEY)
      if (savedResults) {
        setResults(JSON.parse(savedResults))
      }
      // Don't load mapLayers from storage - they have stale layer IDs
      // We'll recreate them when results are added to the map
      localStorage.removeItem(STORAGE_KEY_LAYERS)
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [])

  // Persist results to localStorage whenever they change
  useEffect(() => {
    try {
      if (results.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
      }
    } catch (error) {
      console.error('Error saving results to localStorage:', error)
    }
  }, [results])

  // Persist map layers to localStorage whenever they change
  useEffect(() => {
    try {
      if (mapLayers.length > 0) {
        localStorage.setItem(STORAGE_KEY_LAYERS, JSON.stringify(mapLayers))
      }
    } catch (error) {
      console.error('Error saving map layers to localStorage:', error)
    }
  }, [mapLayers])

  // Re-add stored geocoded points to map when it becomes available (after page refresh)
  useEffect(() => {
    const map = getMapInstance(syncedMapsRef)
    if (!map) return

    const successfulResults = results.filter((r) => r.status === 'success' && r.lat && r.lon)
    if (successfulResults.length === 0) return

    // Check if layers are already on map (avoid re-adding on every render)
    if (mapLayers.length > 0 && mapLayers.every(({ layerId }) => map.getLayer(layerId))) {
      return
    }

    // Recreate GeoJSON features from stored results
    const geoJsonFeatures = successfulResults.map((result) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [result.lon, result.lat] },
      properties: { endereco: result.endereco },
    }))

    if (geoJsonFeatures.length > 0) {
      addToMap(geoJsonFeatures)
    }
  }, [syncedMapsRef, results])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.data.length > 0) {
          const headers = Object.keys(res.data[0])
          setFileHeaders(headers)
          setFile(res.data)
          setColumns(detectColumns(headers))
          setResults([])
          setMapLayers([])
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_KEY_LAYERS)
        }
      },
      error: (error) => {
        setResults([{
          endereco: 'Erro',
          status: 'error',
          message: `Erro ao ler CSV: ${error.message}`,
        }])
      },
    })
  }

  const buildAddress = (row, cols) => {
    const parts = [
      row[cols.logradouro],
      cols.numero && row[cols.numero] ? `nº ${row[cols.numero]}` : '',
      row[cols.municipio],
      row[cols.estado],
    ]
    return parts.filter(Boolean).join(', ')
  }

  const isAddressValid = (row, cols) => {
    return (
      row[cols.logradouro]?.trim() &&
      row[cols.municipio]?.trim() &&
      row[cols.estado]?.trim()
    )
  }

  const geocodeAddress = async (row, endereco, cols) => {
    try {
      const response = await fetch(`${geocodeApiEndpoint}/v1/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: row[cols.logradouro]?.trim() || '',
          number: row[cols.numero]?.trim() || '',
          postalcode: row[cols.cep]?.trim() || '',
          neighborhood: row[cols.localidade]?.trim() || '',
          city: row[cols.municipio]?.trim() || '',
          state: row[cols.estado]?.trim() || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          endereco,
          status: 'error',
          message: `HTTP ${response.status}: ${errorData.detail || response.statusText}`,
        }
      }

      const data = await response.json()
      if (data.latitude && data.longitude) {
        return {
          endereco,
          status: 'success',
          message: `✓ ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
          lat: data.latitude,
          lon: data.longitude,
          row,
        }
      }
      return { endereco, status: 'error', message: 'Endereço inválido' }
    } catch (error) {
      return { endereco, status: 'error', message: `Erro: ${error.message}` }
    }
  }

  const addToMap = (features) => {
    try {
      const map = getMapInstance(syncedMapsRef)
      if (!map) {
        setResults((prev) => [...prev, {
          endereco: 'Erro',
          status: 'error',
          message: 'Mapa não disponível',
        }])
        return
      }

      const sourceId = `geocode_csv_${Date.now()}`
      const layerId = `geocode_csv_layer_${Date.now()}`

      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      })

      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': '#4caf50',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8,
        },
      })

      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('click', layerId, (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice()
        const { endereco } = e.features[0].properties

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="font-size: 12px; max-width: 200px;">
              <strong>${endereco}</strong><br/>
              LAT: ${coordinates[1].toFixed(6)}<br/>
              LON: ${coordinates[0].toFixed(6)}
            </div>
          `)
          .addTo(map)
      })

      if (features.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        features.forEach((feature) => bounds.extend(feature.geometry.coordinates))
        map.fitBounds(bounds, { padding: 50 })
      }

      setMapLayers((prev) => [...prev, { sourceId, layerId }])
    } catch (error) {
      setResults((prev) => [...prev, {
        endereco: 'Erro',
        status: 'error',
        message: `Erro ao adicionar ao mapa: ${error.message}`,
      }])
    }
  }

  const geocodeAddresses = useCallback(async () => {
    if (!file?.length || !isAddressValid(file[0], columns)) return

    setIsLoading(true)
    setProgress(0)
    setResults([])

    // Remove old map layers before starting new geocoding batch
    try {
      const map = getMapInstance(syncedMapsRef)
      if (map) {
        removeMapLayers(map, mapLayers)
      }
    } catch (error) {
      console.error('Error removing old map layers:', error)
    }
    setMapLayers([])

    const tempResults = []
    const geoJsonFeatures = []

    for (let i = 0; i < file.length; i++) {
      const row = file[i]
      const endereco = buildAddress(row, columns)

      setProgress(((i + 1) / file.length) * 100)

      if (!isAddressValid(row, columns)) {
        tempResults.push({
          endereco,
          status: 'error',
          message: 'Campos (logradouro, municipio, estado) incompletos',
        })
        continue
      }

      const result = await geocodeAddress(row, endereco, columns)
      tempResults.push(result)

      if (result.lat && result.lon) {
        geoJsonFeatures.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [result.lon, result.lat] },
          properties: { endereco },
        })
      }
    }

    setResults(tempResults)
    setIsLoading(false)

    if (geoJsonFeatures.length > 0) {
      addToMap(geoJsonFeatures)
    }
  }, [file, columns, geocodeApiEndpoint])

  const clearResults = () => {
  try {
    const map = getMapInstance(syncedMapsRef)
    if (map && mapLayers && mapLayers.length > 0) {
      console.log(`Removing ${mapLayers.length} map layers`)
      mapLayers.forEach(({ sourceId, layerId }) => {
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId)
            console.log(`✅ Removed layer: ${layerId}`)
          }
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId)
            console.log(`✅ Removed source: ${sourceId}`)
          }
        } catch (err) {
          console.error(`Error removing layer ${layerId}/source ${sourceId}:`, err)
        }
      })
      // Force map canvas to refresh
      try {
        if (map.repaint && typeof map.repaint === 'function') {
          map.repaint()
          console.log('🔄 Map repainted')
        } else if (map._canvas) {
          // Alternative: trigger canvas redraw by updating map transform
          map.triggerRepaint()
          console.log('🔄 Triggered repaint')
        }
      } catch (err) {
        console.error('Error repainting map:', err)
      }
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY_LAYERS)
    setMapLayers([])
    setResults([])
  } catch (error) {
    console.error('Error clearing results:', error)
  }
}

  const saveResultsAsCSV = () => {
    // Get successful results only
    const successfulResults = results.filter((r) => r.status === 'success' && r.row && r.lat && r.lon)
    
    if (successfulResults.length === 0) {
      alert('Nenhum resultado geocodificado para salvar')
      return
    }

    // Get all original column names from the first result's row (works even after reload)
    const originalColumns = successfulResults[0].row
      ? Object.keys(successfulResults[0].row)
      : file && file.length > 0 
        ? Object.keys(file[0])
        : []

    const headers = [...originalColumns, 'lat', 'lon']

    // Build CSV rows
    const csvRows = [headers.map((h) => `"${h}"`).join(',')]
    
    successfulResults.forEach((result) => {
      const row = result.row
      const values = [
        ...originalColumns.map((col) => {
          const value = row[col] || ''
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`
        }),
        result.lat.toFixed(6),
        result.lon.toFixed(6),
      ]
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `geocodificacao_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const mapAvailable = !!syncedMapsRef?.current?.mapInstances?.[0]?.map
  const successCount = results.filter((r) => r.status === 'success').length
  const isValid = file?.length && Object.values(columns).every(Boolean)

  return (
    <DialogContent direction="column">
      <Dialog.Title asChild>
        <h2 style={{ margin: '0 0 16px 0' }}>📍 Geocodificar CSV</h2>
      </Dialog.Title>
      <Dialog.Description asChild>
        <div style={{ display: 'none' }}>
          Carregue um arquivo CSV para geocodificar endereços
        </div>
      </Dialog.Description>

      {!mapAvailable && (
        <div style={{ fontSize: '12px', padding: '12px', borderRadius: '4px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#856404' }}>
          ⚠️ <strong>Nenhum mapa em aberto</strong> — Os resultados serão exibidos, mas não visualizados no mapa.
        </div>
      )}

      {/* File Input */}
      <Flex direction="column" gap="8px">
        <label style={{ fontSize: '12px', fontWeight: 500 }}>Selecione arquivo CSV</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </Flex>

      {/* Column Selection */}
      {fileHeaders.length > 0 && (
        <>
          {COLUMN_CONFIGS.map(({ key, label, required }) => (
            <ColumnSelector
              key={key}
              label={label}
              value={columns[key]}
              options={fileHeaders}
              onChange={(value) => setColumns((prev) => ({ ...prev, [key]: value }))}
              disabled={isLoading}
              required={required}
            />
          ))}
          <small style={{ color: '#666' }}>Encontrados {file?.length || 0} endereços</small>
        </>
      )}

      {/* Progress Bar */}
      {isLoading && (
        <Flex direction="column" gap="8px">
          <Progress value={progress} max={100} />
          <small style={{ textAlign: 'center' }}>{Math.round(progress)}%</small>
        </Flex>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Flex direction="column" gap="8px">
          <label style={{ fontSize: '12px', fontWeight: 500 }}>
            Resultados ({successCount}/{results.length})
          </label>
          <ResultsContainer direction="column">
            {results.map((result, idx) => (
              <ResultItem key={idx} direction="column" success={result.status}>
                <strong>{result.endereco}</strong>
                <span>{result.message}</span>
              </ResultItem>
            ))}
          </ResultsContainer>
        </Flex>
      )}

      {/* Buttons */}
      <Flex direction="row" gap="8px" justifyContent="flex-end">
        {results.length > 0 && (
          <>
            <Button
              onClick={saveResultsAsCSV}
              disabled={isLoading || successCount === 0}
              style={{
                ...BUTTON_STYLES.base,
                background: '#2196F3',
              }}
              title={successCount === 0 ? 'Nenhum resultado para salvar' : 'Salvar resultados como CSV'}
            >
              💾 Salvar
            </Button>
            <Button
              onClick={clearResults}
              disabled={isLoading}
              style={{
                ...BUTTON_STYLES.base,
                ...BUTTON_STYLES.secondary,
              }}
            >
              🗑️ Limpar
            </Button>
          </>
        )}
        <Button
          onClick={geocodeAddresses}
          disabled={!isValid || isLoading}
          style={{
            ...BUTTON_STYLES.base,
            ...BUTTON_STYLES.primary,
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          {isLoading ? '⏳ Geocodificando...' : '🚀 Geocodificar'}
        </Button>
      </Flex>
    </DialogContent>
  )
}
