import { GeoReDUS } from './GeoReDUS'

export default {
  title: 'GeoReDUS / GeoReDUS',
  parameters: {
    layout: 'fullscreen',
  },
}

export const Basic = () => {
  return (
    <GeoReDUS
      api={{
        METADATA_API_ENDPOINT: process.env.STORYBOOK_GEO_METADATA_API_ENDPOINT,
        VECTOR_TILE_SERVER_ENDPOINT:
          process.env.STORYBOOK_GEO_VECTOR_TILE_SERVER_ENDPOINT,
      }}
    />
  )
}
