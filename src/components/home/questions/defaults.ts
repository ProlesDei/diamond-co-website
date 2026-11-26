export const homeTimingQuestion = {
  key: 'timing',
  question: 'How long will it take?',
  answer: 'About 2–4 weeks in all. After your online consultation, the render takes 1–4 days, depending on how complex the piece is. Making takes about 1–2 weeks.',
}

export const keepStoneQuestion = {
  key: 'keep-stone',
  question: 'Will it still be my stone?',
  answer: 'Yes. We photograph and measure it with you before work starts, and you keep the record.',
}

export const approveDesignQuestion = {
  key: 'approve-design',
  question: 'How do I know it will be what I asked for?',
  answer: 'The Render-First Promise: you approve a drawing and a render before any metal is cut. Changes to the render are included.',
}

export const redrawDesignQuestion = {
  key: 'redraw-design',
  question: 'What if I don’t like the design?',
  answer: 'We redraw it. If it still isn’t right, you can decide whether to go ahead.',
}

export const homeQuestionDefaults = [
  keepStoneQuestion,
  approveDesignQuestion,
  redrawDesignQuestion,
  homeTimingQuestion,
  {
    key: 'no-pressure',
    question: 'Will I be pushed to go ahead?',
    answer: 'No. The online consultation is free and takes 15–30 minutes. You get a firm quote before you commit.',
  },
]
