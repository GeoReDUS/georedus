import React, { useRef } from 'react'
import { Flex, Button } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { ExportImage } from '../ExportImage'

import { Dialog } from '@radix-ui/themes'
import { Text } from '@radix-ui/themes'


export function SharePanel({
  resolvedLayout,
  commitedViewState,
  municipioId,
  METADATA_API_ENDPOINT,
  baseMapStyle,
  topViews,
}) {
  const exportImageRef = useRef()

  const handleExportClick = () => {
    exportImageRef.current?.createImg()
  }

  return (
    <>
      <Dialog.Title>Exportar como Imagem</Dialog.Title>
      <Text color="gray"> Preview da Imagem</Text>
      <Flex direction="row" gap="4" alignItems="end">
        <ExportImage
          ref={exportImageRef}
          resolvedLayout={resolvedLayout}
          commitedViewState={commitedViewState}
          municipioId={municipioId}
          METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
          baseMapStyle={baseMapStyle}
          topViews={topViews}
        />
        <Flex>
          <Button onClick={handleExportClick}>Salvar Como</Button>
          <ShareButtonBar />
        </Flex>
      </Flex>
    </>
  )
}
