// Habit pack content. Weed is the launch pack; others plug in with the same shape.
window.PACKS = {
  weed: {
    id: 'weed',
    name: 'Weed',
    verb: 'smoke',
    stash: 'weed',
    gear: 'Grinder, papers, pipe, the lot',
    defaultWeeklySpend: 40,
    frequency: [
      { id: 'several-daily', label: 'Several times a day' },
      { id: 'daily', label: 'Most days' },
      { id: 'weekly', label: 'A few times a week' },
      { id: 'weekends', label: 'Weekends mostly' },
    ],
    timeline: [
      { day: 0, kind: 'sleep', title: 'The first night', body: "Your body is used to THC at bedtime, so falling asleep may take longer tonight. That's normal and it's temporary." },
      { day: 1, kind: 'mind', title: 'Edges', body: "Irritability and restlessness usually show up in the first one to three days as THC leaves your system. Name it: it's withdrawal, not you." },
      { day: 2, kind: 'body', title: 'The peak', body: "For most people withdrawal peaks somewhere between days two and six. If today is hard, that's your body adjusting." },
      { day: 4, kind: 'body', title: 'Appetite', body: "Low appetite is common in the first week. Small, regular meals help, even when you're not hungry." },
      { day: 6, kind: 'milestone', title: 'One whole week', body: 'The worst physical symptoms usually ease from here. Cravings now are more about habit and cues than your body.' },
      { day: 8, kind: 'sleep', title: 'Wild dreams', body: "Vivid dreams are REM sleep rebounding. THC suppresses REM, and without it your brain is catching up. It settles." },
      { day: 13, kind: 'milestone', title: 'Sleep steadies', body: "Most withdrawal symptoms fade within one to two weeks. Sleep can lag a little behind, but you're over the hump." },
      { day: 20, kind: 'mind', title: 'Rewiring', body: 'Old cues like after work, gaming or certain friends can still spark cravings. Each one you ride out weakens the link.' },
      { day: 27, kind: 'milestone', title: 'Brain reset', body: 'Brain imaging research shows the cannabinoid receptors that regular use dials down return to normal after around four weeks off.' },
      { day: 59, kind: 'mind', title: 'Clearer', body: "Many people notice sharper memory and focus by now. Take a moment to notice what you've got back." },
      { day: 89, kind: 'milestone', title: 'New normal', body: "Three months. This isn't a break any more. It's just how you live now." },
    ],
    triggers: ['After work', 'Boredom', 'Stress', "Can't sleep", 'Friends', 'Gaming', 'Music', 'Anxiety', 'Loneliness', 'Weekend', 'After eating', 'Celebrating'],
    tapeForward: [
      'You smoke now. The craving goes quiet, for a bit.',
      'Tonight: same sofa, same scroll, same flat feeling.',
      "Tomorrow: a foggy start, and your sleep's recovery takes a step back.",
      'Or you ride this out, and wake up tomorrow with a clearer head and more money in your pocket.',
    ],
    distractions: [
      'Walk around the block, phone in your pocket', 'Splash cold water on your face', 'Text someone you like',
      'Make yourself a proper snack', 'Have a shower', 'Put on one album, eyes closed', 'Tidy one small thing', 'Ten slow press-ups',
    ],
    nightArticle: {
      title: 'Why sleep is hard right now',
      paragraphs: [
        'THC changes how you sleep. It can make it easier to drift off and it suppresses REM, the dreaming stage.',
        'When you stop, your brain has to find its own way to sleep again. For the first week or two that often means taking longer to fall asleep, waking in the night, and very vivid dreams as REM rebounds.',
        "This is one of the most common reasons people go back to weed, so you're not alone if nights feel like the hardest part.",
        "It does get better. Most people find their sleep steadies within a few weeks. Keep a regular wake-up time, get daylight in the morning, go easy on caffeine after midday, and if you can't sleep, get up and do something calm rather than lying there fighting it.",
      ],
    },
    safetyNote: "Stopping weed isn't medically dangerous, but withdrawal can be uncomfortable. If you also drink heavily every day or take benzodiazepines, speak to your GP before cutting those down.",
  },
};

window.MILESTONES = [
  { d: 1, t: '1 day' }, { d: 3, t: '3 days' }, { d: 7, t: '1 week' }, { d: 14, t: '2 weeks' }, { d: 21, t: '3 weeks' },
  { d: 30, t: '1 month' }, { d: 60, t: '2 months' }, { d: 90, t: '3 months' }, { d: 180, t: '6 months' },
  { d: 270, t: '9 months' }, { d: 365, t: '1 year' }, { d: 730, t: '2 years' }, { d: 1095, t: '3 years' },
];

window.MILESTONE_LINES = {
  1: 'Day one done. That was the first step.',
  3: 'Through the toughest stretch of withdrawal for most people.',
  7: 'A whole week. The physical side eases from here.',
  14: 'Your first bloom is complete. The hardest part is behind you.',
  21: 'Three weeks of rewiring old habits.',
  30: 'A month. Your brain chemistry is close to its own normal again.',
  60: 'Two months. Summer in the meadow.',
  90: "Three months. This is just how you live now.",
};

window.SUPPORT = [
  { name: 'Emergency', detail: "If you or someone else is in immediate danger", tel: '999' },
  { name: 'Samaritans', detail: 'Free, 24/7, to talk about anything', tel: '116123' },
  { name: 'Shout', detail: 'Free 24/7 text support. Text SHOUT to 85258', sms: '85258' },
  { name: 'FRANK', detail: 'Honest information and advice about drugs', tel: '03001236600' },
  { name: 'NHS 111', detail: "Medical help that isn't an emergency", tel: '111' },
];

window.JOURNAL_PROMPTS = [
  "What's one thing that felt easier today?",
  'When did you want to use today, and what was going on?',
  'What are you looking forward to tomorrow?',
  'What has stopping given you back so far?',
  'What would you tell a friend on day one?',
];

window.TRIGGER_TIPS = {
  'Boredom': 'Make a list of five quick things you enjoy and keep it handy.',
  'Stress': 'Try two minutes of slow breathing before deciding anything.',
  'After work': 'Plan the first 30 minutes after work so there\'s no gap to fill.',
  "Can't sleep": 'Open Tonight before bed. The first two weeks are the hardest for sleep.',
  'Friends': 'Have a line ready, like "I\'m taking a break". You don\'t owe anyone more.',
  'Anxiety': 'Anxiety often spikes in early withdrawal. It passes, and breathing helps.',
  'Loneliness': 'A quick message to someone can take the edge off.',
};

window.CRISIS_TERMS = ['kill myself', 'suicide', 'suicidal', 'end it all', 'want to die', 'self harm', 'self-harm', 'hurt myself', 'no point living', 'better off dead'];
