import {
  approveDesignQuestion,
  homeTimingQuestion,
  keepStoneQuestion,
  redrawDesignQuestion,
} from '../../home/questions/defaults'

export const faqPageDefaults = {
  heading: 'Fair questions,',
  headingItalic: 'plain answers.',
  lede: "If yours isn't here, ask it in the form or call us. We'd rather you asked.",
}

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
      {
        ...approveDesignQuestion,
        answer: 'The Render-First Promise: you approve a drawing and a render before any metal is cut. You can ask for changes before you approve.',
      },
      {
        ...redrawDesignQuestion,
        answer: 'We redraw it. If it still isn’t right, you can walk away.',
      },
      {
        key: 'deposit',
        question: 'Do you take a deposit?',
        answer: 'Ask us at your consultation. You get a firm quote before you commit.',
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
        answer: 'Goldsmiths we work with make it from the design you approve.',
      },
    ],
  },
  {
    id: 'q-stones',
    title: 'Stones and metals',
    questions: [
      {
        ...keepStoneQuestion,
        answer: 'Yes. We photograph and measure it with you before work starts, and you keep the record.',
      },
      {
        key: 'natural-or-lab',
        question: 'Natural or lab-grown diamonds?',
        answer: 'Both. We’ll show you each side by side and explain the difference in price plainly.',
      },
      {
        key: 'metals',
        question: 'Which metals do you work in?',
        answer: '14k to 24k gold in yellow, white and rose, and platinum.',
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
        answer: 'Contact us and we’ll arrange a resize.',
      },
      {
        key: 'clean-and-check',
        question: 'Do you clean and check pieces?',
        answer: 'Yes. Contact us to arrange a cleaning and setting check.',
      },
    ],
  },
] as const
