import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { Fragment } from 'react'

import { Confirm } from '@/components/pages/Confirm'
import type { Faq } from '@/payload-types'

const answerConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
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

export function FaqConfirmText({ text }: { text: string }) {
  return text.split(' [confirm]').map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <Confirm />}
      {part}
    </Fragment>
  ))
}

const pageAnswerConverters: JSXConvertersFunction = (args) => ({
  ...answerConverters(args),
  text: (textArgs) => {
    const { text, format } = textArgs.node
    if (!format && text.includes(' [confirm]')) return <FaqConfirmText text={text} />

    const renderText = args.defaultConverters.text
    return typeof renderText === 'function' ? renderText(textArgs) : renderText
  },
})

export function FaqAnswer({ answer, showConfirmMarkers }: Pick<Faq, 'answer'> & { showConfirmMarkers?: boolean }) {
  const converters = showConfirmMarkers ? pageAnswerConverters : answerConverters
  return <RichText data={answer} converters={converters} disableContainer />
}
