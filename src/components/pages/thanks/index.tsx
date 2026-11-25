import { getStudioContact } from '@/components/site/studio'
import { getGoldsmithName } from '@/lib/content'

import { pageMetadata } from '../metadata'
import { Thanks } from './Thanks'

export function generateMetadata() {
  return pageMetadata('Request sent')
}

export default async function ThanksPage() {
  const [goldsmithName, contact] = await Promise.all([getGoldsmithName(), getStudioContact()])
  return <Thanks goldsmithName={goldsmithName} contact={contact} />
}
