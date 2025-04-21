import React from 'react'
import { Flex } from '@orioro/react-ui-core'
// TODO: restore share button
// import { ShareButtonBar } from '@/components/ShareButtonBar'

import { Dialog } from '@radix-ui/themes'

//
// html2canvas does not support color functions
// radix uses: oklch and color(...)
//
// https://github.com/niklasvh/html2canvas/issues/2700
//
// import html2canvas from 'html2canvas-pro'
// import { useQuery } from '@tanstack/react-query'

export function SharePanel({ syncedMapsRef, mapContainerRef }) {
  //
  // Experimental image exporting
  //
  // const imageBlobQuery = useQuery({
  //   queryKey: ['a'],
  //   queryFn: async () => {
  //     // const canvas = await html2canvas(mapContainerRef.current)
  //     // const canvas = document.querySelector('canvas.maplibregl-canvas')
  //     const canvas = syncedMapsRef.current?.mapInstances?.[0].map.getCanvas()

  //     return new Promise((resolve, reject) => {
  //       canvas.toBlob((blob) => {
  //         if (blob) {
  //           resolve(blob)
  //         } else {
  //           reject()
  //         }
  //       })
  //     })
  //   },
  //   retry: false,
  //   throwOnError: process.env.NODE_ENV !== 'production',
  // })

  return (
    <>
      <Dialog.Title>Compartilhar</Dialog.Title>
      <Flex direction="row" gap="4">
        {/*<Flex direction="column">
        {imageBlobQuery.data && (
          <img src={URL.createObjectURL(imageBlobQuery.data)} />
        )}
      </Flex>*/}
        ShareButtonBar
        {/*<ShareButtonBar />*/}
      </Flex>
    </>
  )
}
