import type { Metadata } from 'next'

export function pageMetadata(name: string): Metadata {
  return { title: name }
}
