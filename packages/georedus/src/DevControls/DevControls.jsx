import { useDialogs } from '../DialogSystem'
import { mdiUpload } from '@mdi/js'
import { Icon } from '@mdi/react'
import { IconButton } from '@radix-ui/themes'
import { importViewSpecsFromCsv } from './importViewSpecsFromCsv'
import { CANCELLED } from '@orioro/react-ui-core'

export function DevControls({ viewSpecSources, onSetViewSpecSources }) {
  const dialogs = useDialogs()

  return (
    process.env.NODE_ENV !== 'production' && (
      <IconButton
        type="button"
        onClick={async () => {
          const viewSpecSources = await importViewSpecsFromCsv(dialogs)

          if (viewSpecSources !== CANCELLED) {
            console.log('will set viewSpecSources', viewSpecSources)
            onSetViewSpecSources(viewSpecSources)
          }
        }}
      >
        <Icon path={mdiUpload} />
      </IconButton>
    )
  )
}
