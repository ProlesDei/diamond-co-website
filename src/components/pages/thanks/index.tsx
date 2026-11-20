import { pageMetadata } from '../metadata'
import { Thanks } from './Thanks'

export function generateMetadata() {
  return pageMetadata('Request sent')
}

export default function ThanksPage() {
  return <Thanks />
}
