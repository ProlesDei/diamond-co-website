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
        answer: 'Yes. Thirty minutes, no charge and no obligation [confirm]. Nothing is booked or charged until you agree.',
      },
      {
        key: 'what-to-bring',
        question: 'What should I bring?',
        answer: 'Anything that helps: a sketch, screenshots, a ring you like the feel of, or the stone you want to reuse. If you have nothing yet, come anyway.',
      },
      {
        key: 'walk-in',
        question: 'Can I come without an appointment?',
        answer: 'We work by appointment so the goldsmith can sit down with you [confirm]. Send the form or call and we’ll find a time that week.',
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
        answer: 'Engagement rings start from $[X] [confirm]. The price depends mostly on the stone and the metal. You get a firm quote at your consultation, before you commit.',
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
        answer: 'The goldsmith you sit down with, at our bench in White Rock [confirm]. Nothing is sent away to be made.',
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
    title: 'After you collect it',
    questions: [
      {
        key: 'resize',
        question: 'What if it doesn’t fit?',
        answer: 'We resize your piece free in the first [X] months [confirm].',
      },
      {
        key: 'clean-and-check',
        question: 'Do you clean and check pieces?',
        answer: 'Yes. Bring it in whenever you’re passing and we’ll clean it and check the setting [confirm].',
      },
    ],
  },
] as const
