import { motion } from 'framer-motion';
import { FIELD_SIZES } from '@/lib/gameConstants';

const sizeIcons = { small: '🟦', medium: '🟩', large: '🟥' };
const sizeDesc = {
  small: '9×9 · 10 mines',
  medium: '16×16 · 40 mines',
  large: '16×30 · 99 mines',
};

export default function FieldSizeSelector({ selected, onChange }) {
  return (
    <div className="flex gap-2">
      {Object.entries(FIELD_SIZES).map(([key, cfg]) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all
            ${selected === key
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-card border-border/50 text-muted-foreground hover:border-border'
            }`}
        >
          <span className="text-base">{sizeIcons[key]}</span>
          <span className="font-bold">{cfg.label}</span>
          <span className="text-[10px] opacity-70">{sizeDesc[key]}</span>
        </motion.button>
      ))}
    </div>
  );
}