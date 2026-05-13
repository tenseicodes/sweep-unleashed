export const FIELD_SIZES = {
  small:  { rows: 9,  cols: 9,  mines: 10, label: 'Small'  },
  medium: { rows: 16, cols: 16, mines: 40, label: 'Medium' },
  large:  { rows: 16, cols: 30, mines: 99, label: 'Large'  },
};

export const ABILITIES = {
  scan: {
    id: 'scan',
    name: 'Scan',
    description: 'Reveals 1 safe cell nearby',
    charges: 3,
    iconType: 'scan',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    shopPrice: null,
    shopCurrency: null,
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Auto-activates on mine hit — recharges each time',
    charges: 6,
    iconType: 'shield',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    shopPrice: 1200,
    shopCurrency: 'coins',
  },
  detonate: {
    id: 'detonate',
    name: 'Detonate',
    description: 'Destroys all mines in a 3×3 area of your choice',
    charges: 10,
    iconType: 'detonate',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    shopPrice: 3000,
    shopCurrency: 'coins',
  },
  reveal_zone: {
    id: 'reveal_zone',
    name: 'Reveal Zone',
    description: 'Reveals a 5×5 area of your choice',
    charges: 12,
    iconType: 'reveal_zone',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/40',
    shopPrice: 5000,
    shopCurrency: 'coins',
  },
  jce: {
    id: 'jce',
    name: 'Judgement Cut End',
    description: 'Destroys ~65% of mines in a cinematic barrage',
    charges: 8,
    iconType: 'jce',
    color: 'text-white',
    bgColor: 'bg-white/10',
    borderColor: 'border-white/30',
    shopPrice: 2,
    shopCurrency: 'usd',
  },
};

export const SKINS = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'The classic dark look',
    price: 0,
    bgHint: 'bg-background',
    preview: ['#1e2235', '#161b2c'],
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Electric cyan glow on dark',
    price: 5000,
    bgHint: 'bg-[#050510]',
    preview: ['#0a0a1a', '#0ff'],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Hot pink & yellow on dark violet',
    price: 5000,
    bgHint: 'bg-[#0d050d]',
    preview: ['#1a0a1a', '#ff0066'],
  },
  city: {
    id: 'city',
    name: 'City',
    description: 'Night cityscape blues & steel',
    price: 5000,
    bgHint: 'bg-[#111827]',
    preview: ['#2a3042', '#90cdf4'],
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    description: 'Soft pink cherry blossoms',
    price: 5000,
    bgHint: 'bg-[#fce4ec]',
    preview: ['#fce4ec', '#e91e63'],
  },
};

export const QUESTS = [
  { id: 'win3',     label: 'Win 3 games',            target: 3,  reward: 1200, stat: 'wins_today'         },
  { id: 'scan5',    label: 'Use Scan 5 times',        target: 5,  reward: 800,  stat: 'scan_today'         },
  { id: 'large1',   label: 'Play on Large field',     target: 1,  reward: 1500, stat: 'large_today'        },
  { id: 'win1med',  label: 'Win on Medium or larger', target: 1,  reward: 1000, stat: 'win_med_today'      },
  { id: 'flag10',   label: 'Place 10 flags',          target: 10, reward: 600,  stat: 'flags_today'        },
];

export const DAILY_REWARDS = [100, 150, 200, 250, 300, 400, 500];

export const NUMBER_COLORS = [
  '', 'text-blue-400', 'text-green-400', 'text-red-400',
  'text-purple-400', 'text-red-600', 'text-cyan-400',
  'text-foreground', 'text-muted-foreground',
];