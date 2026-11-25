import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'

import type { Faq } from '@/payload-types'

// Older answers can hold a [confirm] note for the client; it never shows on the site.
const CONFIRM_MARKER = ' [confirm]'

const answerConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const renderText = defaultConverters.text
    if (typeof renderText !== 'function') return renderText
    const { node } = args
    return node.text.includes(CONFIRM_MARKER)
      ? renderText({ ...args, node: { ...node, text: node.text.replaceAll(CONFIRM_MARKER, '') } })
      : renderText(args)
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
