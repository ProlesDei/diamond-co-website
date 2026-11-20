import { Bench } from './bench'
import { Booking } from './booking'
import { BookingBar } from './booking-bar'
import { Commissions } from './commissions'
import { Facts } from './facts'
import { Goldsmith } from './goldsmith'
import { Hero } from './hero'
import { Process } from './process'
import { Questions } from './questions'

type HomePageProps = {
  reduceMotion: boolean
}

export function HomePage({ reduceMotion }: HomePageProps) {
  return (
    <>
      <Hero reduceMotion={reduceMotion} />
      <Facts />
      <Commissions />
      <Bench />
      <Goldsmith />
      <Process />
      <Questions />
      <Booking />
      <BookingBar />
    </>
  )
}
