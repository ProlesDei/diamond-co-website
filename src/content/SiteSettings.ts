import type { GlobalConfig } from 'payload'

import { adminOnly } from './access'
import { revalidateGlobalAfterChange } from './revalidate'

const isHttpsUrl = (value: string | null | undefined): true | string => {
  try {
    return new URL(value ?? '').protocol === 'https:' || 'Use a link that starts with https://'
  } catch {
    return 'Use a full link that starts with https://'
  }
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange('site-settings')],
  },
  fields: [
    { name: 'storeName', type: 'text', required: true },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'hours',
      type: 'array',
      fields: [
        { name: 'days', type: 'text', required: true },
        { name: 'hours', type: 'text', required: true },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'YouTube', value: 'youtube' },
          ],
        },
        { name: 'url', type: 'text', required: true, validate: isHttpsUrl },
      ],
    },
    { name: 'defaultShareImage', type: 'upload', relationTo: 'media' },
  ],
}
