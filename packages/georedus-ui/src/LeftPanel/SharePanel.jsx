import React from 'react'
import { Flex } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { ExportImage } from '../ExportImage'

import { Dialog } from '@radix-ui/themes'

export function SharePanel({
  resolvedLayout,
  commitedViewState,
  municipioId,
  METADATA_API_ENDPOINT,
  baseMapStyle,
}) {
  return (
    <>
      <Dialog.Title>Compartilhar</Dialog.Title>
      <Flex direction="column" gap="4">
        <ShareButtonBar />
        <ExportImage
          resolvedLayout={resolvedLayout}
          commitedViewState={commitedViewState}
          municipioId={municipioId}
          METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
          baseMapStyle={baseMapStyle}
        />
      </Flex>
    </>
  )
}
