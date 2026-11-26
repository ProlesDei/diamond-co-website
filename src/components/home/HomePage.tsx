import { Bench } from './bench'
import { Booking } from './booking'
import { BookingBar } from './booking-bar'
import { Commissions } from './commissions'
import { Facts } from './facts'
import { FinalConsultation } from './final-cta'
import { Goldsmith } from './goldsmith'
import { getHomeImages } from './homeImages'
import { Hero } from './hero'
import { HomeLoader } from './hero/HomeLoader'
import { Process } from './process'
import { Questions } from './questions'
import { Trust } from './trust'

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
      <Trust />
      <FinalConsultation />
      <BookingBar />
    </>
  )
}
