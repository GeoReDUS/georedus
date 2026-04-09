import React from 'react'
import { Flex } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { ExportImage } from '../ExportImage'

import { Dialog } from '@radix-ui/themes'

export function SharePanel({ resolvedLayout, commitedViewState }) {
  return (
    <>
      <Dialog.Title>Compartilhar</Dialog.Title>
      <Flex direction="column" gap="4">
        <ShareButtonBar />
        <ExportImage
          resolvedLayout={resolvedLayout}
          commitedViewState={commitedViewState}
        />
      </Flex>
    </>
  )
}
