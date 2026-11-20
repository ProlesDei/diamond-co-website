import type { CollectionBeforeChangeHook, CollectionConfig, Condition } from 'payload'

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
    privacyConsentAt: data.form === 'book' ? now.toISOString() : null,
  }
}

const submitted = { access: { update: neverUpdated } }

const fromBook: Condition = (data) => data?.form === 'book'

const fromHome: Condition = (data) => data?.form !== 'book'

const homeOnly = { ...submitted, admin: { condition: fromHome } }

const bookOnly = { ...submitted, admin: { condition: fromBook } }

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'form', 'name', 'contact', 'pieceType', 'interests', 'createdAt'],
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
    { name: 'name', type: 'text', required: true, maxLength: NAME_MAX_LENGTH, ...submitted },
    { name: 'contact', type: 'text', required: true, ...homeOnly },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: INTERESTS.map((value) => ({ label: INTEREST_LABELS[value], value })),
      ...homeOnly,
    },
    { name: 'piece', type: 'relationship', relationTo: 'pieces', ...bookOnly },
    { name: 'pieceType', label: 'Piece type', type: 'text', required: true, ...bookOnly },
    { name: 'budget', label: 'Budget range (CAD)', type: 'text', required: true, ...bookOnly },
    { name: 'description', type: 'textarea', required: true, maxLength: DESCRIPTION_MAX_LENGTH, ...bookOnly },
    { name: 'email', type: 'text', required: true, ...bookOnly },
    { name: 'phone', type: 'text', ...bookOnly },
    {
      name: 'contactWay',
      label: 'Reach them by',
      type: 'select',
      required: true,
      options: CONTACT_WAYS.map((value) => ({ label: CONTACT_WAY_LABELS[value], value })),
      ...bookOnly,
    },
    { name: 'needBy', label: 'Need by (YYYY-MM-DD)', type: 'text', ...submitted },
    { name: 'upload', label: 'Photo or sketch', type: 'upload', relationTo: 'inquiry-uploads', ...homeOnly },
    {
      name: 'uploads',
      label: 'Photos',
      type: 'upload',
      relationTo: 'inquiry-uploads',
      hasMany: true,
      maxRows: MAX_UPLOADS,
      ...bookOnly,
    },
    { name: 'newsOptIn', label: 'Wants news of new work', type: 'checkbox', defaultValue: false, ...submitted },
    {
      name: 'newsOptInAt',
      label: 'News opt-in time',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
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
