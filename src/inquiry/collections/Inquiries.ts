import type { CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig, Condition } from 'payload'

import type { Inquiry } from '@/payload-types'

import { nextReference } from '../reference'
import {
  CONTACT_WAY_LABELS,
  CONTACT_WAYS,
  DESCRIPTION_MAX_LENGTH,
  INTEREST_LABELS,
  INTERESTS,
  MAX_UPLOADS,
  NAME_MAX_LENGTH,
} from '../schema'
import { releaseUploadLinks, uploadIdsOf } from '../submit'
import { adminOnly, neverUpdated, nobody, signedIn } from './access'

const stampOnCreate: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const now = new Date()
  const newsOptIn = data.newsOptIn === true
  return {
    ...data,
    reference: await nextReference(req.payload, now),
    newsOptIn,
    newsOptInAt: newsOptIn ? now.toISOString() : null,
  }
}

const releaseLinksOnDelete: CollectionAfterDeleteHook<Inquiry> = async ({ doc, req }) => {
  await releaseUploadLinks(req.payload, uploadIdsOf(doc))
}

const submitted = { access: { update: neverUpdated } }

const fromBook: Condition = (data) => data?.form === 'book'

const fromHome: Condition = (data) => data?.form !== 'book'

const homeOnly = { ...submitted, admin: { condition: fromHome } }

const bookOnly = { ...submitted, admin: { condition: fromBook } }

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)

// A form no longer asks some of these, so the edit view shows each one only on the inquiries that hold a value.
const whenSet =
  (name: keyof Inquiry, also: Condition = () => true): Condition =>
  (data, siblingData, context) =>
    hasValue(data?.[name]) && also(data, siblingData, context)

const keptOnly = (name: keyof Inquiry, also?: Condition) => ({
  ...submitted,
  admin: { condition: whenSet(name, also) },
})

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'name', 'email', 'createdAt'],
    listSearchableFields: ['reference', 'name', 'email', 'contact'],
  },
  defaultSort: '-createdAt',
  access: {
    create: nobody,
    read: signedIn,
    update: signedIn,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [stampOnCreate],
    afterDelete: [releaseLinksOnDelete],
  },
  fields: [
    { name: 'reference', type: 'text', unique: true, index: true, ...submitted },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Consult booked', value: 'consult-booked' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    {
      name: 'form',
      label: 'Sent from',
      type: 'select',
      defaultValue: 'home',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Book', value: 'book' },
      ],
      ...submitted,
    },
    { name: 'name', type: 'text', maxLength: NAME_MAX_LENGTH, ...keptOnly('name') },
    { name: 'contact', type: 'text', required: true, ...homeOnly },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: INTERESTS.map((value) => ({ label: INTEREST_LABELS[value], value })),
      ...homeOnly,
    },
    { name: 'piece', type: 'relationship', relationTo: 'pieces', ...bookOnly },
    { name: 'pieceType', label: 'Piece type', type: 'text', ...keptOnly('pieceType', fromBook) },
    { name: 'budget', label: 'Budget range (CAD)', type: 'text', ...keptOnly('budget', fromBook) },
    { name: 'description', type: 'textarea', maxLength: DESCRIPTION_MAX_LENGTH, ...keptOnly('description', fromBook) },
    { name: 'email', type: 'text', ...keptOnly('email', fromBook) },
    { name: 'phone', type: 'text', ...keptOnly('phone', fromBook) },
    {
      name: 'contactWay',
      label: 'Reach them by',
      type: 'select',
      options: CONTACT_WAYS.map((value) => ({ label: CONTACT_WAY_LABELS[value], value })),
      ...keptOnly('contactWay', fromBook),
    },
    { name: 'needBy', label: 'Need by (YYYY-MM-DD)', type: 'text', ...keptOnly('needBy') },
    { name: 'upload', label: 'Photo or sketch', type: 'upload', relationTo: 'inquiry-uploads', ...homeOnly },
    {
      name: 'uploads',
      label: 'Reference photos',
      type: 'upload',
      relationTo: 'inquiry-uploads',
      hasMany: true,
      maxRows: MAX_UPLOADS,
      ...keptOnly('uploads', fromBook),
    },
    { name: 'newsOptIn', label: 'Wants news of new work', type: 'checkbox', defaultValue: false, ...keptOnly('newsOptIn') },
    {
      name: 'newsOptInAt',
      label: 'News opt-in time',
      type: 'date',
      admin: { condition: whenSet('newsOptInAt'), date: { pickerAppearance: 'dayAndTime' } },
      ...submitted,
    },
    {
      name: 'privacyConsentAt',
      label: 'Privacy agreed at',
      type: 'date',
      admin: { condition: fromBook, date: { pickerAppearance: 'dayAndTime' } },
      ...submitted,
    },
    { name: 'assignee', type: 'relationship', relationTo: 'users' },
    { name: 'notes', label: 'Internal notes', type: 'textarea' },
  ],
}
