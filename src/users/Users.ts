import type { Access, CollectionConfig, FieldAccess, PayloadRequest } from 'payload'

const isAdmin = (req: PayloadRequest): boolean => req.user?.role === 'admin'

const adminOnly: Access = ({ req }) => isAdmin(req)

const adminOrSelf: Access = ({ req }) => {
  if (isAdmin(req)) return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    unlock: adminOnly,
    update: adminOrSelf,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          req,
          where: { id: { exists: true } },
        })
        return totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: ({ user }) => (user ? 'editor' : 'admin'),
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
    },
  ],
}
