import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function PremiumAbilityCard({ ability, owned, onPurchaseSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      toast.error('Checkout only works from published app');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('stripeCheckout', {
        abilityId: ability.id,
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all"
    >
      <h3 className="font-arcade text-sm text-primary mb-2">{ability.name}</h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{ability.description}</p>

      <div className="flex items-center justify-between">
        <span className="font-arcade text-lg text-primary">${ability.shopPrice}</span>
        {owned ? (
          <span className="text-xs text-green-400 font-arcade">✓ OWNED</span>
        ) : (
          <Button
            onClick={handleCheckout}
            disabled={loading}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
            <span className="text-xs font-arcade">BUY</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}