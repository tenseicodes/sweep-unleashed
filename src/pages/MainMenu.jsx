import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerProfile } from '@/lib/usePlayerProfile';
import { FIELD_SIZES, ABILITIES, CHARGE_SCALE } from '@/lib/gameConstants';
import { Trophy, ShoppingBag, Scroll, User, ChevronRight, Play, LayoutGrid, Zap, Flame } from 'lucide-react';
import { ScanIcon, ShieldIcon, DetonateIcon, RevealZoneIcon, YamatoIcon, JaneBeamIcon } from '@/components/game/AbilityIcons';

const ABILITY_ICON_MAP = { scan: ScanIcon, shield: ShieldIcon, detonate: DetonateIcon, reveal_zone: RevealZoneIcon, jce: YamatoIcon, jj: JaneBeamIcon };

// ── Sub-screens ──
import ShopModal from '@/components/shop/ShopModal';
import DailyRewardModal from '@/components/ui/DailyRewardModal';
import QuestPanel from '@/components/ui/QuestPanel';
import GameHistoryPanel from '@/components/game/GameHistoryPanel';
import { toast } from 'sonner';

const MENU = [
  { id: 'play',        label: 'PLAY',        Icon: Play },
  { id: 'shop',        label: 'SHOP',        Icon: ShoppingBag },
  { id: 'quests',      label: 'QUESTS',      Icon: Scroll },
  { id: 'profile',     label: 'PROFILE',     Icon: User },
  { id: 'leaderboard', label: 'LEADERBOARD', Icon: Trophy },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const { profile, loading, dailyRewardAvailable, dailyRewardAmount,
    dismissDailyReward, updateProfile, addCoins, spendCoins, claimQuest } = usePlayerProfile();

  const [screen, setScreen] = useState('main'); // main | play | quests | profile
  const [shopOpen, setShopOpen] = useState(false);

  // Play setup state
  const [selectedSize, setSelectedSize] = useState('small');
  const [selectedAbility, setSelectedAbility] = useState(null);

  // Auto-select first owned ability
  useEffect(() => {
    if (profile && !selectedAbility) {
      const first = profile.owned_abilities?.[0] || 'scan';
      setSelectedAbility(first);
    }
  }, [profile]);

  const handlePurchase = async (type, id, price) => {
    if (type === 'ability') {
      if ((profile?.coins || 0) < price) { toast.error('Not enough coins!'); return; }
      await spendCoins(price);
      const newAbilities = [...(profile?.owned_abilities || []), id];
      await updateProfile({ owned_abilities: newAbilities });
      toast(`✅ ${ABILITIES[id]?.name} unlocked!`);
    } else if (type === 'jce') {
      await updateProfile({ jce_owned: true });
      toast('⚔️ Judgement Cut End unlocked!');
    } else if (type === 'jj') {
      await updateProfile({ jj_owned: true });
      toast('✨ Jane Juliet unlocked!');
    } else if (type === 'skin') {
      if (price > 0 && (profile?.coins || 0) < price) { toast.error('Not enough coins!'); return; }
      if (price > 0) await spendCoins(price);
      await updateProfile({ owned_skins: [...(profile?.owned_skins || []), id], active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    } else if (type === 'skin_equip') {
      await updateProfile({ active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    }
  };

  const handleClaimQuest = async (questId, reward) => {
    const ok = await claimQuest(questId, reward);
    if (ok) toast(`🎉 Quest complete! +${reward} coins`);
  };

  const handlePlay = () => {
    if (!selectedAbility) { toast.error('Pick an ability first!'); return; }
    navigate(`/game?size=${selectedSize}&ability=${selectedAbility}`);
  };

  const handleMenuClick = (id) => {
    if (id === 'leaderboard') { navigate('/leaderboard'); return; }
    if (id === 'shop') { setShopOpen(true); return; }
    setScreen(id);
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <p className="font-arcade text-[10px] text-primary animate-pulse tracking-widest">LOADING...</p>
    </div>
  );

  const allOwned = [
    ...(profile?.owned_abilities || ['scan']),
    ...(profile?.jce_owned ? ['jce'] : []),
    ...(profile?.jj_owned ? ['jj'] : []),
  ].filter((id, i, a) => a.indexOf(id) === i);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* Animated BG grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(var(--skin-accent) 1px, transparent 1px), linear-gradient(90deg, var(--skin-accent) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

      <DailyRewardModal
        open={dailyRewardAvailable}
        amount={dailyRewardAmount}
        streak={profile?.login_streak}
        onClose={dismissDailyReward}
      />
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} profile={profile} onPurchase={handlePurchase} />

      <AnimatePresence mode="wait">

        {/* ── MAIN MENU ── */}
        {screen === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm px-6"
          >
            {/* Title */}
            <div className="flex flex-col items-center gap-2">
              <motion.p
                className="font-arcade text-[8px] text-primary/60 tracking-[0.4em] uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
              >
                ◆ INDIE ARCADE ◆
              </motion.p>
              <h1 className="font-arcade text-3xl sm:text-4xl text-center leading-tight"
                style={{ color: 'var(--skin-text)', textShadow: '0 0 30px var(--skin-accent), 0 0 60px color-mix(in srgb, var(--skin-accent) 50%, transparent)' }}
              >
                SWEEP<br />UNLEASHED
              </h1>
              <motion.div
                className="h-px w-48 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ scaleX: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Coins badge */}
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-arcade text-[10px] text-yellow-400">{profile?.coins || 0}</span>
            </div>

            {/* Menu buttons */}
            <div className="flex flex-col gap-3 w-full">
              {MENU.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    flex items-center gap-4 px-5 py-4 rounded-xl border
                    font-arcade text-[11px] tracking-wider text-left
                    transition-colors duration-150
                    ${item.id === 'play'
                      ? 'bg-primary/20 border-primary/60 text-primary hover:bg-primary/30'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'}
                  `}
                >
                  <item.Icon className={`w-4 h-4 shrink-0 ${item.id === 'play' ? 'text-primary' : 'text-white/60'}`} />
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                </motion.button>
              ))}
            </div>

            {/* Stats footer */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="font-arcade text-[8px] text-muted-foreground">WINS</p>
                <p className="font-arcade text-sm text-primary">{profile?.total_wins || 0}</p>
              </div>
              <div>
                <p className="font-arcade text-[8px] text-muted-foreground">GAMES</p>
                <p className="font-arcade text-sm text-foreground">{profile?.total_games || 0}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PLAY SETUP ── */}
        {screen === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="flex flex-col gap-6 relative z-10 w-full max-w-lg px-6"
          >
            <BackButton onClick={() => setScreen('main')} />
            <h2 className="font-arcade text-base text-primary text-center tracking-wider">SELECT LOADOUT</h2>

            {/* Field size */}
            <div>
              <p className="font-arcade text-[9px] text-muted-foreground mb-3 tracking-widest">FIELD SIZE</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(FIELD_SIZES).map(([key, cfg]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedSize(key)}
                    className={`
                      flex flex-col items-center gap-1.5 py-4 rounded-xl border
                      font-arcade text-[9px] transition-all
                      ${selectedSize === key
                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/30'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                    `}
                  >
                    <LayoutGrid className={`w-6 h-6 ${key === 'small' ? 'text-green-400' : key === 'medium' ? 'text-yellow-400' : 'text-red-400'}`} />
                    <span>{cfg.label.toUpperCase()}</span>
                    <span className="text-[7px] text-muted-foreground">{cfg.rows}×{cfg.cols} · {cfg.mines} mines</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Ability loadout */}
            <div>
              <p className="font-arcade text-[9px] text-muted-foreground mb-3 tracking-widest">CHOOSE ABILITY</p>
              <div className="grid grid-cols-2 gap-3">
                {allOwned.map(id => {
                  const ab = ABILITIES[id];
                  if (!ab) return null;
                  const isSelected = selectedAbility === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedAbility(id)}
                      className={`
                        flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left
                        transition-all
                        ${isSelected
                          ? `ring-2 ring-primary ${ab.bgColor} ${ab.borderColor} shadow-lg shadow-primary/20`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'}
                      `}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {(() => { const I = ABILITY_ICON_MAP[id]; return I ? <I className={`w-5 h-5 ${isSelected ? ab.color : 'text-white/50'}`} /> : null; })()}
                        <span className={`font-arcade text-[9px] ${isSelected ? ab.color : 'text-white/70'}`}>{ab.name.toUpperCase()}</span>
                        {isSelected && <span className="ml-auto text-[8px] font-arcade text-primary">✓</span>}
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">{ab.description}</p>
                      <span className="text-[8px] font-arcade text-yellow-400/70">{Math.round(ab.charges * (CHARGE_SCALE[selectedSize] || 1))} ⚡ COST</span>
                    </motion.button>
                  );
                })}
                {allOwned.length === 0 && (
                  <p className="col-span-2 font-arcade text-[9px] text-muted-foreground text-center py-4">
                    No abilities owned. Visit the shop!
                  </p>
                )}
              </div>
            </div>

            {/* Launch button */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-arcade text-sm tracking-widest
                shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-shadow"
            >
              ▶ LAUNCH
            </motion.button>
          </motion.div>
        )}

        {/* ── QUESTS ── */}
        {screen === 'quests' && (
          <motion.div
            key="quests"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="flex flex-col gap-4 relative z-10 w-full max-w-md px-6"
          >
            <BackButton onClick={() => setScreen('main')} />
            <h2 className="font-arcade text-base text-primary text-center tracking-wider">DAILY QUESTS</h2>
            <div className="rounded-2xl p-4" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
              <QuestPanel profile={profile} onClaim={handleClaimQuest} />
            </div>
          </motion.div>
        )}

        {/* ── PROFILE ── */}
        {screen === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="flex flex-col gap-4 relative z-10 w-full max-w-md px-6 max-h-screen overflow-y-auto pb-8"
          >
            <BackButton onClick={() => setScreen('main')} />
            <h2 className="font-arcade text-base text-primary text-center tracking-wider">PROFILE</h2>
            <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-arcade text-[10px] text-foreground">PLAYER</p>
                  <p className="font-arcade text-[8px] text-muted-foreground mt-1">
                    LOGIN STREAK: {profile?.login_streak || 0}D
                  </p>
                  {(profile?.win_streak || 0) > 0 && (
                    <p className="font-arcade text-[8px] text-orange-400 mt-0.5 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> WIN STREAK: {profile.win_streak}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'WINS', val: profile?.total_wins || 0, color: 'text-primary' },
                  { label: 'GAMES', val: profile?.total_games || 0, color: 'text-foreground' },
                  { label: 'COINS', val: profile?.coins || 0, color: 'text-yellow-400' },
                  { label: 'WIN STREAK', val: profile?.win_streak || 0, color: 'text-orange-400' },
                ].map(s => (
                  <div key={s.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className={`font-arcade text-lg ${s.color}`}>{s.val}</p>
                    <p className="font-arcade text-[8px] text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-arcade text-[9px] text-muted-foreground mb-2">OWNED ABILITIES</p>
                <div className="flex flex-wrap gap-2">
                  {allOwned.map(id => {
                    const ab = ABILITIES[id];
                    if (!ab) return null;
                    const I = ABILITY_ICON_MAP[id];
                    return (
                      <span key={id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${ab.bgColor} ${ab.borderColor} ${ab.color} font-mono`}>
                        {I && <I className="w-3.5 h-3.5" />} {ab.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="font-arcade text-[9px] text-muted-foreground mb-2">ACTIVE SKIN</p>
                <span className="font-arcade text-[10px] text-accent capitalize">{profile?.active_skin || 'default'}</span>
              </div>
            </div>

            {/* Game History */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
              <p className="font-arcade text-[9px] text-muted-foreground mb-3 tracking-widest">GAME HISTORY</p>
              <GameHistoryPanel />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-arcade text-[9px] tracking-wider self-start min-h-[44px] min-w-[44px] px-2"
    >
      ◀ BACK
    </motion.button>
  );
}