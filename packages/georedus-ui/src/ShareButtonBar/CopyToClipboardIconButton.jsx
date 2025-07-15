import { Button, IconButton, Popover, Tooltip } from '@radix-ui/themes'
import { Icon } from '@mdi/react'
import { mdiContentCopy } from '@mdi/js'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

export function CopyToClipboardButton({ text, label, ...props }) {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <CopyToClipboard text={text}>
        <Button asChild {...props}>
          <button
            onClick={() => {
              setCopied(true)
              setTimeout(() => {
                setCopied(() => false)
              }, 3000)
            }}
          >
            {label} <Icon path={mdiContentCopy} size="18px" />
          </button>
        </Button>
      </CopyToClipboard>

      {copied && <div style={{ marginTop: 10 }}>Copiado!</div>}
    </>
  )
}

const DEFAULT_ICON = <Icon path={mdiContentCopy} size="18px" />

export function CopyToClipboardIconButton({
  text,
  label = 'Copiar',
  children = DEFAULT_ICON,
  copiedMessage = 'Copiado!',
  ...props
}) {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <Popover.Root open={copied}>
        <CopyToClipboard text={text}>
          <Popover.Trigger>
            <IconButton asChild radius="full" {...props}>
              <button
                onClick={() => {
                  setCopied(true)
                  setTimeout(() => {
                    setCopied(() => false)
                  }, 2500)
                }}
              >
                <Tooltip content={label} sideOffset={10}>
                  {children}
                </Tooltip>
              </button>
            </IconButton>
          </Popover.Trigger>
        </CopyToClipboard>
        <Popover.Content
          align="center"
          size="1"
          style={{
            fontSize: '.8rem',
            padding: 8,
          }}
          maxWidth={60}
        >
          {copiedMessage}
        </Popover.Content>
      </Popover.Root>
    </>
  )
}
