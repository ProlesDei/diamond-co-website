import type { AfterErrorHook } from 'payload'
import { AuthenticationError, formatErrors, LockedAuth } from 'payload'

const isLockedAuth = (error: Error): boolean =>
  error instanceof LockedAuth || ('originalError' in error && error.originalError instanceof LockedAuth)

export const answerLockedLoginAsUnknown: AfterErrorHook = ({ error, graphqlResult, req }) => {
  if (!isLockedAuth(error)) return
  const plain = new AuthenticationError(req.t)
  if (graphqlResult) {
    return {
      graphqlResult: {
        ...graphqlResult,
        message: plain.message,
        extensions: { ...graphqlResult.extensions, name: plain.name },
      },
    }
  }
  return { response: formatErrors(plain), status: plain.status }
}
