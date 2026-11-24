import { getGoldsmithName } from '@/lib/content'

import { pageMetadata } from '../metadata'
import { Thanks } from './Thanks'

export function generateMetadata() {
  return pageMetadata('Request sent')
}

export default async function ThanksPage() {
  return <Thanks goldsmithName={await getGoldsmithName()} />
}
