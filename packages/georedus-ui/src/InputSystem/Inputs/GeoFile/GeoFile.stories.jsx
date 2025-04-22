import { useState } from 'react'
import { GeoFile } from './GeoFile'

export default {
  title: 'GeoFile',
}

export const Basic = () => {
  const [value, setValue] = useState(null)

  return <GeoFile value={value} onSetValue={setValue} />
}
