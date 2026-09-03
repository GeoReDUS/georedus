import { interpolate, slugify } from '@orioro/util'
import { rawFileDownload } from '../util'

export function download(viewSpec, allViewSpecs, context) {
  return viewSpec.download_url
    ? rawFileDownload({
        fileName: `${slugify(viewSpec.label)}.zip`,
        downloadUrl: interpolate(viewSpec.download_url, {
          METADATA_API_ENDPOINT: context.METADATA_API_ENDPOINT,
        }),
      })
    : null
}
