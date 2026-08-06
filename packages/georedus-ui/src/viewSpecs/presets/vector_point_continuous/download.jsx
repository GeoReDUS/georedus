import { slugify } from '@orioro/util'
import { basicDownload, parseUrl } from '../util'

export function download(viewSpec, allViewSpecs, context) {
  return basicDownload({
    fileName: slugify(viewSpec.label),
    downloadUrl: parseUrl(viewSpec.download_url || '', context),
  })
}
