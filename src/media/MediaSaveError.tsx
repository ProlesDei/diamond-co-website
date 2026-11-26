'use client'

import { useFormFields, useFormSubmitted } from '@payloadcms/ui'

export function MediaSaveError({ errorPath = 'file' }: { errorPath?: string }) {
  const submitted = useFormSubmitted()
  const message = useFormFields(([fields]) => fields[errorPath]?.errorMessage)

  if (!submitted || !message) return null
  return <p role="alert">{message}</p>
}
