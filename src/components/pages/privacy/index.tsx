import type { ReactNode } from 'react'

import { Confirm } from '../Confirm'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Privacy.module.css'

type Section = {
  id: string
  title: string
  body: ReactNode
}

const sections: Section[] = [
  {
    id: 'p-who',
    title: 'Who we are',
    body: (
      <p>
        Diamond &amp; Co. is a private jeweller. Email us at [EMAIL]
        <Confirm note="client supplies" /> or call [PHONE]
        <Confirm note="client supplies" />. This policy explains what personal information we
        collect through this website, why, how long we keep it, and what you can ask of us. It follows
        British Columbia&rsquo;s Personal Information Protection Act (PIPA) and, where it applies,
        the federal Personal Information Protection and Electronic Documents Act (PIPEDA).
      </p>
    ),
  },
  {
    id: 'p-collect',
    title: 'What we collect',
    body: (
      <>
        <p>When you send the booking form, we collect:</p>
        <ul>
          <li>
            your name, email address and, if you give it, your phone number and how you&rsquo;d like
            us to reach you;
          </li>
          <li>
            what you tell us about the piece, your budget range and any date you need it by;
          </li>
          <li>
            any photos you add, with their location and camera data removed when they arrive;
          </li>
          <li>whether you asked for our news by email, and when.</li>
        </ul>
        <p>
          When you choose a consultation time on this site, the booking goes through Calendly, which
          keeps your name, email address, the answers you send it and the time you choose
          <Confirm />.
        </p>
        <p>
          We also keep basic, anonymous counts of visits to improve the site. We don&rsquo;t use
          advertising trackers.
        </p>
      </>
    ),
  },
  {
    id: 'p-why',
    title: 'Why we collect it',
    body: (
      <p>
        We use your details to reply to your request, to prepare for your consultation and, if you
        go ahead, to make and deliver your piece. We don&rsquo;t sell or rent your information, and
        we don&rsquo;t use it for anything you haven&rsquo;t asked for.
      </p>
    ),
  },
  {
    id: 'p-photos',
    title: 'Your photos',
    body: (
      <p>
        Photos you send are private. Only our staff can see them, through links that expire after a
        few minutes
        <Confirm />. We never post them anywhere without asking you first in writing.
      </p>
    ),
  },
  {
    id: 'p-keep',
    title: 'How long we keep it',
    body: (
      <p>
        If you don&rsquo;t go ahead, we delete or anonymise your request and photos 24 months after
        our last contact
        <Confirm />. If you commission a piece, we keep your record with your order for as long as
        the law requires for business records
        <Confirm />. Photos added to a form that was never sent are deleted within 24 hours.
      </p>
    ),
  },
  {
    id: 'p-news',
    title: 'Email news (CASL)',
    body: (
      <p>
        We send news only if you tick the box asking for it. The box is never ticked for you. Every
        email says who we are and has a link to unsubscribe, which takes effect within 10 business
        days. We keep a record of when you agreed.
      </p>
    ),
  },
  {
    id: 'p-where',
    title: 'Where it’s stored',
    body: (
      <p>
        Your information is stored with our hosting and email providers in [Canada / the United
        States]
        <Confirm />, protected by encryption in transit and access controls. Where it&rsquo;s
        stored outside Canada, it may be subject to the laws of that country.
      </p>
    ),
  },
  {
    id: 'p-rights',
    title: 'Your rights',
    body: (
      <p>
        You can ask to see the personal information we hold about you, to correct it, or to
        withdraw your consent to our using it. Write to our privacy contact below. We&rsquo;ll reply
        within 30 days.
      </p>
    ),
  },
  {
    id: 'p-contact',
    title: 'Contact',
    body: (
      <p>
        Contact [NAME]
        <Confirm note="client supplies" /> at Diamond &amp; Co. about your privacy. Email [EMAIL]
        <Confirm note="client supplies" /> or call [PHONE]
        <Confirm note="client supplies" />. If you&rsquo;re not satisfied with our answer, you can
        contact the Office of the Information and Privacy Commissioner for British Columbia.
      </p>
    ),
  },
  {
    id: 'p-changes',
    title: 'Changes',
    body: (
      <p>
        If we change this policy, we&rsquo;ll post the new version here with its date. Last updated
        [date]
        <Confirm />.
      </p>
    ),
  },
]

export function generateMetadata() {
  return pageMetadata('Privacy')
}

export default function PrivacyPage() {
  return (
    <>
      <div className={styles.head}>
        <PageHead
          eyebrow="Privacy"
          title={
            <>
              Your details, <em>kept plainly.</em>
            </>
          }
        />
      </div>
      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="On this page">
          <ol>
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.body}>
          <p className={styles.draft}>
            <b>Draft for review by Diamond &amp; Co.&rsquo;s counsel.</b> Not legal advice and not
            yet in force. Every fact marked [confirm] needs the client&rsquo;s answer before launch.
          </p>
          {sections.map(({ id, title, body }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id}>{title}</h2>
              {body}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
