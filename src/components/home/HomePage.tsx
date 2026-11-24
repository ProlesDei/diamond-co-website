import { Bench } from './bench'
import { Booking } from './booking'
import { BookingBar } from './booking-bar'
import { Commissions } from './commissions'
import { Facts } from './facts'
import { Goldsmith } from './goldsmith'
import { getHomeImages } from './homeImages'
import { Hero } from './hero'
import { HomeLoader } from './hero/HomeLoader'
import { Process } from './process'
import { Questions } from './questions'

type HomePageProps = {
  reduceMotion: boolean
}

export async function HomePage({ reduceMotion }: HomePageProps) {
  const { hero } = await getHomeImages()

  return (
    <>
      {hero ? <HomeLoader reduceMotion={reduceMotion} /> : null}
      <Hero hero={hero} reduceMotion={reduceMotion} />
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
