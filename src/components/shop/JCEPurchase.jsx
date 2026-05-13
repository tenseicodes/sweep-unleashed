import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Sword } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JCEPurchase({ open, onClose, onSuccess, title = 'Judgement Cut End', price = '2.00', description = 'A legendary ability. Destroys 90% of all mines in a cinematic barrage.' }) {
  const [step, setStep] = useState('confirm'); // confirm | payment | processing | done
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => { onSuccess(); setStep('confirm'); }, 1500);
    }, 2000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-card border border-white/20 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-white" />
              <h3 className="font-black text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-white/70 text-sm">{description}</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-3xl font-black text-white">${price}</span>
                <p className="text-white/40 text-xs mt-1">One-time purchase · Demo mode</p>
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold" onClick={() => setStep('payment')}>
                <CreditCard className="w-4 h-4 mr-2" /> Continue to Payment
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <Shield className="w-3 h-3" /> Demo payment — no real charge
              </div>
              <Input
                placeholder="Card number (e.g. 4242 4242 4242 4242)"
                value={card.number}
                onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
                <Input
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold" onClick={handlePay}>
                Pay ${price}
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Processing payment…</p>
            </div>
          )}

          {step === 'done' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <span className="text-5xl">⚔️</span>
              <p className="text-white font-bold text-lg">Ability Unlocked!</p>
              <p className="text-white/50 text-xs">Judgement Cut End is now yours.</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}