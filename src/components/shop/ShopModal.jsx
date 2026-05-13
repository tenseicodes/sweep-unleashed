import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Palette, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AbilityShop from './AbilityShop';
import SkinShop from './SkinShop';
import JCEPurchase from './JCEPurchase';

export default function ShopModal({ open, onClose, profile, onPurchase }) {
  const [tab, setTab] = useState('abilities');

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Shop</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-400 font-mono font-bold flex items-center gap-1">
                🪙 {profile?.coins || 0}
              </span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'abilities', label: 'Abilities', icon: Zap },
              { id: 'skins', label: 'Skins', icon: Palette },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2
                  ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-5">
            {tab === 'abilities' && (
              <AbilityShop profile={profile} onPurchase={onPurchase} />
            )}
            {tab === 'skins' && (
              <SkinShop profile={profile} onPurchase={onPurchase} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}