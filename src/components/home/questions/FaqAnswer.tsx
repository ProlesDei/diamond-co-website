import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'

import type { Faq } from '@/payload-types'

// Older answers can hold a [confirm] note for the client; it never shows on the site. The note can sit
// in a text run of its own, so a run followed by one also drops its trailing space.
const CONFIRM_NOTE = /\s*\[confirm\]/g
const startsWithNote = (node: SerializedLexicalNode | undefined) =>
  node?.type === 'text' && 'text' in node && typeof node.text === 'string' && /^\s*\[confirm\]/.test(node.text)

const answerConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const renderText = defaultConverters.text
    if (typeof renderText !== 'function') return renderText
    const { node, parent, childIndex } = args
    const siblings = 'children' in parent && Array.isArray(parent.children) ? parent.children : []
    let text = node.text.replace(CONFIRM_NOTE, '')
    if (startsWithNote(siblings[childIndex + 1])) text = text.trimEnd()
    if (text === node.text) return renderText(args)
    return text ? renderText({ ...args, node: { ...node, text } }) : null
  },
  link: (args) => {
    const { node, nodesToJSX } = args
    const { doc, linkType, newTab } = node.fields
    if (linkType !== 'internal') {
      const renderLink = defaultConverters.link
      return typeof renderLink === 'function' ? renderLink(args) : renderLink
    }

    const children = nodesToJSX({ nodes: node.children })
    const piece = doc?.value
    if (
      doc?.relationTo !== 'pieces' || !piece || typeof piece !== 'object'
      || piece._status !== 'published' || typeof piece.slug !== 'string' || !piece.slug
    ) return children

    return (
      <a
        href={`/catalog/${encodeURIComponent(piece.slug)}`}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
  upload: (args) => {
    const { relationTo, value } = args.node
    if (relationTo !== 'media' || !value || typeof value !== 'object') return null
    if (!('url' in value && value.url && 'mimeType' in value && value.mimeType)) return null

    const renderUpload = defaultConverters.upload
    return typeof renderUpload === 'function' ? renderUpload(args) : renderUpload
  },
})

export function FaqAnswer({ answer }: Pick<Faq, 'answer'>) {
  return <RichText data={answer} converters={answerConverters} disableContainer />
}
