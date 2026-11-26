import type { GlobalConfig, UploadField } from 'payload'
import { upload } from 'payload/shared'

import { adminOnly } from './access'
import { faqPage } from './faqPage'
import { revalidateGlobalAfterChange } from './revalidate'

const isHttpsUrl = (value: string | null | undefined): true | string => {
  try {
    return new URL(value ?? '').protocol === 'https:' || 'Use a link that starts with https://'
  } catch {
    return 'Use a full link that starts with https://'
  }
}

const idOf = (value: unknown) =>
  typeof value === 'object' && value !== null && 'id' in value ? value.id : value

const homeSources = (): string[] =>
  process.env.SITE_ENV === 'production' ? ['client-photo'] : ['client-photo', 'placeholder']

const homeImage = (name: string, label: string, description: string): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  admin: { description },
  filterOptions: () => ({ source: { in: homeSources() } }),
  validate: async (value, options) => {
    if ((await upload(value, options)) === true) return true
    // An image saved earlier and later moved to another source just stops showing; it must not block other edits.
    if (value && idOf(value) === idOf(options.previousValue)) return true
    return process.env.SITE_ENV === 'production'
      ? `${label}: choose a client photo that is in the Media library. Atmosphere (generated) and placeholder (sample) images can’t show on the site.`
      : `${label}: choose a client photo or a placeholder that is in the Media library. Atmosphere (generated) images can’t show on the site.`
  },
})

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
    homeImage(
      'logo',
      'Logo',
      'Shown in the navigation bar, fitted inside the space of the “Diamond & Co.” wordmark. Leave empty to show the wordmark. Its alt text is read out in place of the logo.',
    ),
    {
      name: 'goldsmith',
      label: 'Designer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'credential', label: 'Credential line', type: 'text' },
        homeImage('portrait', 'Portrait', 'The designer’s portrait on the home page and The Bench.'),
        {
          name: 'team',
          label: 'More people on The Bench',
          type: 'array',
          labels: { singular: 'Person', plural: 'People' },
          admin: { description: 'Cards shown after the designer on The Bench, in this order.' },
          fields: [
            homeImage('portrait', 'Portrait', 'Shown in a 4:5 frame, cropped from the centre.'),
            { name: 'name', type: 'text', required: true },
            { name: 'role', type: 'text', admin: { description: 'For example, stone setter.' } },
          ],
        },
      ],
    },
    {
      name: 'homeFaqs',
      label: 'Home questions',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: {
        description: 'Drag questions into display order. Only published questions show. Clear the list to hide the section.',
      },
      hooks: {
        beforeChange: [({ value }) => value === null ? [] : value],
      },
    },
    faqPage,
    {
      name: 'home',
      label: 'Home page images',
      type: 'group',
      fields: [
        homeImage('heroImage', 'Hero image', 'The large photo beside the headline at the top of the home page.'),
        homeImage(
          'benchDaylightImage',
          'Bench daylight image',
          'The “Your idea, in daylight” photo, on the home page and The Bench.',
        ),
        homeImage(
          'benchStudioImage',
          'Bench studio image',
          'The studio photo, on the home page and The Bench.',
        ),
      ],
    },
  ],
}
