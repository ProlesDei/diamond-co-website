'use client'

import { VercelBlobClientUploadHandler } from '@payloadcms/storage-vercel-blob/client'
import { toast, useUploadHandlers } from '@payloadcms/ui'
import { useEffect, type ComponentProps } from 'react'

export function MediaBlobUploads(props: ComponentProps<typeof VercelBlobClientUploadHandler>) {
  const { getUploadHandler, setUploadHandler } = useUploadHandlers()
  const { collectionSlug } = props

  useEffect(() => {
    // The child registers Payload's Blob handler before this effect runs.
    const handler = getUploadHandler({ collectionSlug })
    if (!handler) return

    setUploadHandler({
      collectionSlug,
      handler: async (args) => {
        const id = `media-upload:${args.file.name}`
        toast.dismiss(id)
        try {
          return await handler(args)
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'The file transfer failed.'
          toast.error(`Could not upload ${args.file.name}. ${reason}`, { closeButton: true, duration: Infinity, id })
          throw error
        }
      },
    })
    return () => {
      setUploadHandler({ collectionSlug, handler })
    }
  }, [collectionSlug, getUploadHandler, setUploadHandler])

  return <VercelBlobClientUploadHandler {...props} />
}
