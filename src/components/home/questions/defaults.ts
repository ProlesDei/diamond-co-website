export const homeTimingQuestion = {
  key: 'timing',
  question: 'How long will it take?',
  answer: 'About 2-4 weeks from first sit-down to your hand. Planning a proposal? Tell us the date and we’ll say honestly whether we can make it.',
}

export const keepStoneQuestion = {
  key: 'keep-stone',
  question: 'Will it still be my stone?',
  answer: 'Yes. Your stone never leaves our bench. We photograph and measure it with you before work starts, and you keep the record [confirm].',
}

export const approveDesignQuestion = {
  key: 'approve-design',
  question: 'How do I know it will be what I asked for?',
  answer: 'The Render-First Promise: you approve a drawing and a render before any metal is cut. [N] rounds of changes are included [confirm].',
}

export const redrawDesignQuestion = {
  key: 'redraw-design',
  question: 'What if I don’t like the design?',
  answer: 'We redraw it. If it still isn’t right, you can walk away owing [nothing / only the $[X] design deposit] [confirm].',
}

export const homeQuestionDefaults = [
  keepStoneQuestion,
  approveDesignQuestion,
  redrawDesignQuestion,
  homeTimingQuestion,
  {
    key: 'no-pressure',
    question: 'Will I be pushed to go ahead?',
    answer: 'No. The consultation is free and there’s no obligation [confirm]. Nothing is booked or charged until you agree.',
  },
]
