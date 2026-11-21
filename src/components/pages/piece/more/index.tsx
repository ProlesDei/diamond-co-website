import { getMorePieces } from './getMorePieces'
import { MoreCommissions } from './MoreCommissions'

export async function More() {
  return <MoreCommissions pieces={await getMorePieces()} />
}
