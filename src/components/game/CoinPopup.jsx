import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let popupId = 0;

export default function CoinPopup({ amount, trigger }) {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    if (!amount || !trigger) return;
    const id = ++popupId;
    setPopups(prev => [...prev, { id, amount }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1200);
  }, [trigger]);

  return (
    <AnimatePresence>
      {popups.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -50, scale: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed pointer-events-none z-50 text-yellow-400 font-bold text-lg font-mono"
          style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}
        >
          +{p.amount} 🪙
        </motion.div>
      ))}
    </AnimatePresence>
  );
}