'use client'

import { useRowLabel } from '@payloadcms/ui'

export function TopicRowLabel() {
  const { data, rowNumber = 0 } = useRowLabel<{ title?: string | null }>()
  return <>{data?.title?.trim() || `Topic ${String(rowNumber + 1).padStart(2, '0')}`}</>
}
