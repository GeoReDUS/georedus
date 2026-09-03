import { resolve } from '@orioro/resolve'
import { saveAs } from 'file-saver'

export function rawFileDownload({ fileName, downloadUrl }) {
  return resolve.fn(() => async () => {
    saveAs(downloadUrl, fileName)
  })
}
