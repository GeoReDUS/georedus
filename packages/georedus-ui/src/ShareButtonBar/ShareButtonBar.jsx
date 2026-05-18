import React from 'react'
import { useLocation } from 'react-use'

import {
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share'
import { Flex } from '@orioro/react-ui-core'
import styled from 'styled-components'
import { CopyToClipboardIconButton } from './CopyToClipboardIconButton'
import { Icon } from '@mdi/react'
import { mdiLinkVariant } from '@mdi/js'
import { Text } from '@radix-ui/themes'

const Container = styled(Flex)`
  > * {
    height: 32px;
  }
`

export const ShareButtonBar = ({ url, ...props }) => {
  const { href } = useLocation()

  const shareUrl = url ? url : href

  return (
    <Flex direction="column">
      <Text>Compartilhar</Text>
      <Container direction="row" gap="3" {...props}>
        <CopyToClipboardIconButton
          label="Copiar link de compartilhamento"
          copiedMessage="Link copiado para área de transferência"
          text={shareUrl}>
          <Icon path={mdiLinkVariant} size="18px" />
        </CopyToClipboardIconButton>
        <LinkedinShareButton url={shareUrl}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareUrl}>
          <EmailIcon size={32} round />
        </EmailShareButton>
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <WhatsappShareButton url={shareUrl}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </Container>
    </Flex>
  )
}
