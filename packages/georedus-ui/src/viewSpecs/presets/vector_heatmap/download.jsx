import { interpolate, slugify } from '@orioro/util'
import { basicDownload } from '../util'

export function download(viewSpec, allViewSpecs, context) {
  return viewSpec.download_url
    ? basicDownload({
        fileName: slugify(viewSpec.label),
        downloadUrl: interpolate(viewSpec.download_url, {
          METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
        }),
      })
    : null
}
