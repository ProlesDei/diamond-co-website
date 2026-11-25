import {
  approveDesignQuestion,
  homeTimingQuestion,
  keepStoneQuestion,
  redrawDesignQuestion,
} from '../../home/questions/defaults'

export const faqTopicDefaults = [
  {
    id: 'q-consult',
    title: 'The consultation',
    questions: [
      {
        key: 'free-consultation',
        question: 'Is the consultation really free?',
        answer: 'Yes. The consultation is online, takes 15–30 minutes and is free. You get a firm quote before you commit.',
      },
      {
        key: 'what-to-bring',
        question: 'What should I share for the consultation?',
        answer: 'Share a sketch, screenshots or photos of a ring you like. If you want to reuse a stone, tell us about it. It’s fine if you have nothing ready yet.',
      },
      {
        key: 'walk-in',
        question: 'How do I book a consultation?',
        answer: 'Send the form or call us to book a free online consultation. It takes 15–30 minutes.',
      },
    ],
  },
  {
    id: 'q-price',
    title: 'Design and price',
    questions: [
      {
        key: 'custom-ring-price',
        question: 'What does a custom ring cost?',
        answer: 'Engagement rings from $2,000, with a firm quote at your consultation, before you commit. The price depends mostly on the stone and the metal.',
      },
      approveDesignQuestion,
      redrawDesignQuestion,
      {
        key: 'deposit',
        question: 'Do you take a deposit?',
        answer: '[Yes, [X]% when you approve the render / No deposit until ...] [confirm].',
      },
    ],
  },
  {
    id: 'q-making',
    title: 'Making and timing',
    questions: [
      { ...homeTimingQuestion, question: 'How long does it take?' },
      {
        key: 'who-makes-it',
        question: 'Who makes it?',
        answer: 'The goldsmith you meet online makes your piece at our bench [confirm].',
      },
    ],
  },
  {
    id: 'q-stones',
    title: 'Stones and metals',
    questions: [
      keepStoneQuestion,
      {
        key: 'natural-or-lab',
        question: 'Natural or lab-grown diamonds?',
        answer: 'Both [confirm]. We’ll show you each side by side and explain the difference in price plainly.',
      },
      {
        key: 'metals',
        question: 'Which metals do you work in?',
        answer: '14k to 24k gold in yellow, white and rose, and platinum [confirm].',
      },
    ],
  },
  {
    id: 'q-after',
    title: 'Delivery and care',
    questions: [
      {
        key: 'delivery',
        question: 'How do I get my ring?',
        answer: 'Choose insured shipping, studio pickup by appointment, or a private handover appointment. We share the studio address after you book your pickup.',
      },
      {
        key: 'resize',
        question: 'What if it doesn’t fit?',
        answer: 'We resize your piece free in the first [X] months [confirm].',
      },
      {
        key: 'clean-and-check',
        question: 'Do you clean and check pieces?',
        answer: 'Yes. Contact us to arrange a cleaning and setting check [confirm].',
      },
    ],
  },
] as const
