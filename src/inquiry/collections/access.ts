import type { Access, FieldAccess } from 'payload'

export { adminOnly } from '../../content/access'

export const signedIn: Access = ({ req }) => Boolean(req.user)

export const nobody: Access = () => false

export const neverUpdated: FieldAccess = () => false
