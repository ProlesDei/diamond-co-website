import { BookingForm } from './BookingForm'
import styles from './booking.module.css'

export function Booking() {
  return (
    <section className={styles.book} id="book" aria-labelledby="book-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            Your free consultation<span className={styles.confirm}>[confirm]</span>
          </p>
          <h2 className={styles.heading} id="book-heading">
            Sit down with <em>[GOLDSMITH].</em>
          </h2>
          <p className={styles.lead}>
            Thirty minutes across the table in White Rock
            <span className={styles.confirm}>[confirm]</span>. You leave with a sketch, a price
            range and a timeline, whether or not you go ahead.
          </p>
          <dl className={styles.visit}>
            <dt>Where</dt>
            <dd>
              [Street address]<span className={styles.confirm}>[confirm]</span>
              <br />
              White Rock, BC
            </dd>
            <dt>When</dt>
            <dd>
              Tuesday to Saturday, 10 am to 5 pm<span className={styles.confirm}>[confirm]</span>
              <br />
              By appointment
            </dd>
            <dt>Lead time</dt>
            <dd>
              About [X] weeks to your hand<span className={styles.confirm}>[confirm]</span>
            </dd>
          </dl>
        </div>
        <div className={styles.panel}>
          <BookingForm />
        </div>
      </div>
    </section>
  )
}
