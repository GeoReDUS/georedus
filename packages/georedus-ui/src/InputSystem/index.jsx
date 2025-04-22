import {
  INPUTS,
  InputProvider as InputProvider_,
  rendererSpecList,
  TextInput,
  withLabeledLayout,
  withDefaults,
} from '@orioro/react-ui-core'
// import {
//   CFormBlockInput,
//   CFormBlockListInput,
//   CFormDataInput,
// } from '@/components/CForm'
// import { EntitySelectInput } from '@/components/EntityComponents/EntitySelectInput'
// import { EntityRelationshipInput } from '../EntityComponents'
// import { MapboxGeocoderInput } from '@orioro/react-mapbox-util'

// import { BrEstadosInput } from './Inputs/BrEstadosInput'
// import { BrMunicipiosInput } from './Inputs/BrMunicipiosInput'
import { GeoFile } from './Inputs/GeoFile/GeoFile'

function NumberInput(props) {
  return <TextInput {...props} type="text" mask={Number} />
}

export function InputProvider(props) {
  return (
    <InputProvider_
      renderers={{
        ...INPUTS,
        ...rendererSpecList(
          {
            date: TextInput,
            number: NumberInput,
            geoFile: GeoFile,
          },
          {
            labeled: withLabeledLayout,
          },
        ),
      }}
      {...props}
    />
  )
}
