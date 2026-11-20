import type { Faq } from '../payload-types'

export type RichText = Faq['answer']

// Lexical rich text with one plain paragraph per string.
export const paragraphs = (...texts: string[]): RichText => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: texts.map((text) => ({
      type: 'paragraph',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
      children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})
