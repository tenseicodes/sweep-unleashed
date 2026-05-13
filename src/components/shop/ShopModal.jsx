import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Palette } from 'lucide-react';
import AbilityShop from './AbilityShop';
import SkinShop from './SkinShop';

export default function ShopModal({ open, onClose, profile, onPurchase }) {
  const [tab, setTab] = useState('abilities');

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-primary/40 bg-black shadow-2xl shadow-primary/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="font-arcade text-sm text-primary tracking-widest">SHOP</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-arcade text-[10px] text-yellow-400 flex items-center gap-1.5">
                ⚡ {profile?.coins || 0}
              </span>
              <button
                onClick={onClose}
                onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-primary/20">
            {[
              { id: 'abilities', label: 'ABILITIES', icon: Zap },
              { id: 'skins', label: 'SKINS', icon: Palette },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                onTouchEnd={(e) => { e.preventDefault(); setTab(t.id); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-arcade text-[9px] tracking-widest transition-all border-b-2 min-h-[44px]
                  ${tab === t.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4">
            {tab === 'abilities' && <AbilityShop profile={profile} onPurchase={onPurchase} />}
            {tab === 'skins'     && <SkinShop    profile={profile} onPurchase={onPurchase} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}