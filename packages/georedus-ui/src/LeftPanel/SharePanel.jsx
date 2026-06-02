import React, { useRef } from 'react'
import { Flex, Button } from '@orioro/react-ui-core'
import { ShareButtonBar } from '../ShareButtonBar'
import { ExportImage } from '../ExportImage'

import { Dialog } from '@radix-ui/themes'
import { Text } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import { mdiDownload } from '@mdi/js'

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
      <Flex direction="column" gap="1" alignItems="center">
        <ExportImage
          ref={exportImageRef}
          resolvedLayout={resolvedLayout}
          commitedViewState={commitedViewState}
          municipioId={municipioId}
          METADATA_API_ENDPOINT={METADATA_API_ENDPOINT}
          baseMapStyle={baseMapStyle}
          topViews={topViews}
        />
        <Flex
          direction="row"
          alignItems="end"
          justifyContent="space-between"
          width="100%"
          pt="4">
          <ShareButtonBar />
          <Button
            id="export-image-button"
            onClick={handleExportClick}
            style={{ marginRight: '30px' }}
            size="2">
            <Icon path={mdiDownload} size="18px" />
            Baixar imagem
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
