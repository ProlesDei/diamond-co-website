import Link from 'next/link'
import type { ReactNode } from 'react'

import { getStudioContact, type StudioContact } from '@/components/site/studio'

import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Privacy.module.css'

type Section = {
  id: string
  title: string
  body: ReactNode
}

const privacySections = ({ phone, email }: StudioContact): Section[] => [
  {
    id: 'p-who',
    title: 'Who we are',
    body: (
      <p>
        Diamond &amp; Co. is a private jeweller. This policy explains what personal information we
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
          <li>your name and email address;</li>
          <li>the reference photo, if you add one;</li>
          <li>the catalog piece you asked about, if any.</li>
        </ul>
        <p>
          After you send the form, you choose a time on Calendly, which keeps your name, email
          address, the answers you send it and the time you choose.
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
        few minutes. We never post them anywhere without asking you first in writing.
      </p>
    ),
  },
  {
    id: 'p-keep',
    title: 'How long we keep it',
    body: (
      <p>
        If you don&rsquo;t go ahead, we delete or anonymise your request and photos 24 months after
        our last contact. If you commission a piece, we keep your record with your order for as long as
        the law requires for business records. Photos added to a form that was never sent are
        deleted within 24 hours.
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
        Our hosting and email providers store your information. Encryption in transit and access
        controls protect it. Where it&rsquo;s stored outside Canada, it may be subject to the laws
        of that country.
      </p>
    ),
  },
  {
    id: 'p-rights',
    title: 'Your rights',
    body: (
      <p>
        You can ask to see the personal information we hold about you, to correct it, or to
        withdraw your consent to our using it. Use the contact details below. We&rsquo;ll reply
        within 30 days.
      </p>
    ),
  },
  {
    id: 'p-contact',
    title: 'Contact',
    body: (
      <p>
        Contact Diamond &amp; Co. about your privacy.{' '}
        {email && <>Email <a href={email.href}>{email.text}</a>{phone ? ' or call ' : '. '}</>}
        {phone && <>{email ? '' : 'Call '}<a href={phone.href}>{phone.text}</a>. </>}
        {!email && !phone && <>See our <Link href="/contact">contact page</Link>. </>}
        If you&rsquo;re not satisfied with our answer, you can contact the Office of the Information
        and Privacy Commissioner for British Columbia.
      </p>
    ),
  },
  {
    id: 'p-changes',
    title: 'Changes',
    body: (
      <p>
        If we change this policy, we&rsquo;ll post the new version here with its date.
      </p>
    ),
  },
]

export function generateMetadata() {
  return pageMetadata('Privacy')
}

export default async function PrivacyPage() {
  const sections = privacySections(await getStudioContact())

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
          <p className={styles.draft}>This policy is a draft and is not yet in effect.</p>
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
