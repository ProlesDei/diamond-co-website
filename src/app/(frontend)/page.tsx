import { HomePage } from '@/components/home/HomePage'

export default async function Page({ searchParams }: PageProps<'/'>) {
  const { motion } = await searchParams
  return <HomePage reduceMotion={motion === 'reduce'} />
}
