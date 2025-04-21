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

export function Markdown(props) {
  return (
    <Markdown_
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      {...props}
    />
  )
}
