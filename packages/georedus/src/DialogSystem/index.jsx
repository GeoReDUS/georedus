import { CANCELLED } from '@orioro/react-ui-core'
import { DIALOGS, createDialogSystem } from '@orioro/react-dialogs'
import { CsvImportDialog } from '@orioro/react-csv'

const [DialogsProvider_, useDialogs] = createDialogSystem({
  dialogs: {
    ...DIALOGS,
    importCsv: [
      CsvImportDialog,
      {
        getProps: ({ resolve }, props = {}) => ({
          ...props,
          agGridTheme: 'ag-theme-quartz',
          onCancel: () => resolve(CANCELLED),
          onSubmit: (data) => resolve(data),
        }),
      },
    ],
  },
})

export function DialogsProvider({ children }) {
  return (
    <DialogsProvider_
      prompt={{
        restore: 'Restaurar',
        cancel: 'Cancelar',
        submit: 'Enviar',
      }}
    >
      {children}
    </DialogsProvider_>
  )
}

export { useDialogs }
