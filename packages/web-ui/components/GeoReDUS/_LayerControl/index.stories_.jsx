import { useState } from 'react'
import { LayerControl } from '.'

export default {
  title: 'GeoReDUS / LayerControl',
}

export const Basic = () => {
  const [layer, setLayer] = useState({
    name: 'Alfabetização',
    active: false,
  })

  return <LayerControl layer={layer} onSetLayer={setLayer} />
}
