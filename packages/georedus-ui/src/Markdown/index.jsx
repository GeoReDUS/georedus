import React from 'react'

import {
  Markdown as Markdown_,
  MARKDOWN_DEFAULT_REHYPE_PLUGINS,
  MARKDOWN_DEFAULT_REMARK_PLUGINS,
} from '@orioro/react-ui-core'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // Import KaTeX CSS for styling

const REMARK_PLUGINS = [...MARKDOWN_DEFAULT_REMARK_PLUGINS, remarkMath]
const REHYPE_PLUGINS = [...MARKDOWN_DEFAULT_REHYPE_PLUGINS, rehypeKatex]

const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

const MARKDOWN_COMPONENTS = {
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      style={{
        background: 'var(--gray-a3)',
        border: 'none',
        borderRadius: '6px',
        padding: '12px',
        overflowX: 'auto',
      }}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => (
    <code
      {...props}
      className={className}
      style={
        className
          ? { fontFamily: CODE_FONT_FAMILY, fontSize: '0.85em' }
          : {
              fontFamily: CODE_FONT_FAMILY,
              fontSize: '0.85em',
              background: 'var(--gray-a3)',
              border: '1px solid var(--gray-6)',
              borderRadius: '4px',
              padding: '0.1em 0.4em',
            }
      }
    >
      {children}
    </code>
  ),
}

export function Markdown({ components, ...props }) {
  return (
    <Markdown_
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={{ ...MARKDOWN_COMPONENTS, ...components }}
      {...props}
    />
  )
}
