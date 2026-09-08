import { interpolate, slugify } from '@orioro/util'
import { rawFileDownload } from '../util'

export function download(viewSpec, allViewSpecs, context) {
  return viewSpec.download_url
    ? rawFileDownload({
        fileName: `${slugify(viewSpec.label)}.zip`,
        downloadUrl: viewSpec.download_url,
      })
    : null
}
