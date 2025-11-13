import styled from 'styled-components'
import { AspectRatio } from '@orioro/react-ui-core'

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  height: 100%;
`

export function DocumentIframe({ src }) {
  return (
    <AspectRatio ratio={210 / 297}>
      <StyledIframe src={src} />
    </AspectRatio>
  )
}
