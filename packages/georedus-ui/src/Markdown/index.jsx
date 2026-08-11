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

const CODE_INLINE_STYLE = {
  fontFamily: CODE_FONT_FAMILY,
  fontSize: '0.85em',
  background: 'var(--gray-a3)',
  border: 'none',
  borderRadius: '4px',
  padding: '0.1em 0.4em',
  margin: '0.1em',
}

const CODE_BLOCK_STYLE = {
  fontFamily: CODE_FONT_FAMILY,
  fontSize: '0.85em',
}

function MarkdownCode({ className, children, style, ...props }) {
  return (
    <code {...props} className={className} style={style ?? CODE_INLINE_STYLE}>
      {children}
    </code>
  )
}

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
      }}>
      {React.isValidElement(children) && children.type === MarkdownCode
        ? React.cloneElement(children, { style: CODE_BLOCK_STYLE })
        : children}
    </pre>
  ),
  code: MarkdownCode,
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
