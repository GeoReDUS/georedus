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

const MARKDOWN_PRE_STYLE = {
  background: 'var(--gray-3)',
  border: 'none',
  borderRadius: '6px',
  padding: '12px',
  overflowX: 'auto',
}

const MARKDOWN_CODE_BASE_STYLE = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.85em',
}

const MARKDOWN_CODE_INLINE_STYLE = {
  ...MARKDOWN_CODE_BASE_STYLE,
  background: 'var(--gray-a3)',
  border: 'none',
  borderRadius: '4px',
  padding: '0.1em 0.4em',
  margin: '0.1em',
}

const MARKDOWN_COMPONENTS = {
  pre: ({ children, ...props }) => (
    <pre {...props} style={MARKDOWN_PRE_STYLE}>
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => (
    <code
      {...props}
      className={className}
      style={
        className ? MARKDOWN_CODE_BASE_STYLE : MARKDOWN_CODE_INLINE_STYLE
      }>
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
