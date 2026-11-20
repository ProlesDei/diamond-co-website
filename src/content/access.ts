import type { Access, PayloadRequest } from 'payload'

export const isAdmin = (req: PayloadRequest): boolean => req.user?.role === 'admin'

export const adminOnly: Access = ({ req }) => isAdmin(req)

export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
