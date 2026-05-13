import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { createBoard, floodReveal, checkWin, getSafeCells, revealArea, detonateArea, judgementCutEnd } from '@/lib/gameLogic';
import { FIELD_SIZES, ABILITIES } from '@/lib/gameConstants';
import { usePlayerProfile } from '@/lib/usePlayerProfile';
import { SFX } from '@/lib/sounds';

import MineBoard from '@/components/game/MineBoard';
import AbilityInventory from '@/components/game/AbilityInventory';
import GameHUD from '@/components/game/GameHUD';
import GameOverModal from '@/components/game/GameOverModal';
import FieldSizeSelector from '@/components/game/FieldSizeSelector';
import JCEOverlay from '@/components/game/JCEOverlay';
import CoinPopup from '@/components/game/CoinPopup';
import ShopModal from '@/components/shop/ShopModal';
import DailyRewardModal from '@/components/ui/DailyRewardModal';
import GameSidebar from '@/components/layout/GameSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Menu, X, Trophy } from 'lucide-react';

const COIN_SINGLE = 5;
const COIN_CHUNK  = 10;
const COIN_WIN_BONUS = 100;
const CHARGE_SINGLE = 1;
const CHARGE_CHUNK  = 3;
// If a reveal floods >= this many cells, treat it as a "chunk"
const CHUNK_THRESHOLD = 3;

export default function Game() {
  const { profile, loading, dailyRewardAvailable, dailyRewardAmount, dismissDailyReward,
    updateProfile, addCoins, spendCoins, incrementQuestStat, claimQuest } = usePlayerProfile();

  // Board state
  const [fieldSize, setFieldSize] = useState('small');
  const [cells, setCells] = useState([]);
  const [gameState, setGameState] = useState('idle');
  const [firstClick, setFirstClick] = useState(true);

  // Economy
  const [charges, setCharges] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [coinTrigger, setCoinTrigger] = useState(0);

  // Abilities
  const [equippedAbility, setEquippedAbility] = useState('scan'); // inventory selection
  const [activeAbility, setActiveAbility] = useState(null);       // targeting mode
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(null);
  const [jceActive, setJceActive] = useState(false);
  const [pendingJceCells, setPendingJceCells] = useState(null);

  // UI
  const [shopOpen, setShopOpen] = useState(false);
  const [gameOverModal, setGameOverModal] = useState(null);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [time, setTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const timerRef = useRef(null);
  const coinTriggerRef = useRef(0);
  const coinsEarnedRef = useRef(0);

  const cfg = FIELD_SIZES[fieldSize];
  const skin = profile?.active_skin || 'default';

  // ── Init board ──
  const initBoard = useCallback((size = fieldSize) => {
    const c = FIELD_SIZES[size];
    setCells(createBoard(c.rows, c.cols, c.mines));
    setGameState('idle');
    setFirstClick(true);
    setCharges(0);
    setSessionCoins(0);
    setActiveAbility(null);
    setShieldActive(false);
    setShieldUsed(false);
    setHighlightedIdx(null);
    setFlagsPlaced(0);
    setTime(0);
    coinsEarnedRef.current = 0;
    clearInterval(timerRef.current);
  }, [fieldSize]);

  useEffect(() => { initBoard(fieldSize); }, [fieldSize]);

  // ── Timer ──
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // ── Shield auto-charge detection ──
  useEffect(() => {
    if (!shieldUsed && !shieldActive && charges >= ABILITIES.shield.charges
      && profile?.owned_abilities?.includes('shield')) {
      setCharges(c => c - ABILITIES.shield.charges);
      setShieldActive(true);
      SFX.shield();
      toast('🛡️ Shield activated!', { description: 'Protected from next mine.' });
    }
  }, [charges, shieldUsed, shieldActive, profile]);

  // ── Award coins ──
  const awardCoins = useCallback((amount) => {
    setSessionCoins(sc => sc + amount);
    coinsEarnedRef.current += amount;
    coinTriggerRef.current += 1;
    setCoinTrigger(coinTriggerRef.current);
  }, []);

  // ── Cell click ──
  const handleCellClick = useCallback((cell) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (cell.isFlagged) return;
    if (gameState === 'idle') setGameState('playing');
    if (cell.isRevealed) return;

    // Targeting abilities
    if (activeAbility === 'detonate') {
      SFX.detonate();
      const { cells: newCells } = detonateArea(cells, cell.row, cell.col, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - ABILITIES.detonate.charges);
      setActiveAbility(null);
      toast('💥 Detonated!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }
    if (activeAbility === 'reveal_zone') {
      SFX.revealZone();
      const newCells = revealArea(cells, cell.row, cell.col, 2, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - ABILITIES.reveal_zone.charges);
      setActiveAbility(null);
      toast('🌐 Zone revealed!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }

    // Mine hit
    if (cell.isMine) {
      if (shieldActive) {
        SFX.shieldBlock();
        setShieldActive(false);
        setShieldUsed(true);
        toast('🛡️ Shield saved you!');
        return;
      }
      SFX.lose();
      const newCells = cells.map(c => c.isMine ? { ...c, isRevealed: true } : c);
      setCells(newCells);
      setGameState('lost');
      updateProfile({ total_games: (profile?.total_games || 0) + 1 });
      setGameOverModal({ won: false, coins: coinsEarnedRef.current });
      return;
    }

    // Safe cell — flood reveal
    const revealed = floodReveal(cells, cell.id, cfg.rows, cfg.cols);
    const newlyRevealed = revealed.filter((nc, i) => nc.isRevealed && !cells[i].isRevealed);
    const count = newlyRevealed.length;
    const isChunk = count >= CHUNK_THRESHOLD;

    const chargesEarned = isChunk ? CHARGE_CHUNK : CHARGE_SINGLE;
    const coinsEarned   = isChunk ? count * COIN_CHUNK : count * COIN_SINGLE;

    if (isChunk) SFX.revealChunk(); else SFX.reveal();

    setCharges(c => c + chargesEarned);
    awardCoins(coinsEarned);
    setCells(revealed);

    if (checkWin(revealed)) { handleWin(revealed); return; }
  }, [gameState, cells, activeAbility, cfg, shieldActive, shieldUsed, profile, awardCoins]);

  const handleWin = useCallback(async (finalCells) => {
    SFX.win();
    setGameState('won');
    awardCoins(COIN_WIN_BONUS);
    const totalCoins = coinsEarnedRef.current + COIN_WIN_BONUS;
    await addCoins(totalCoins);
    const isLarge = fieldSize === 'large';
    const isMedPlus = fieldSize === 'medium' || fieldSize === 'large';
    await updateProfile({
      total_wins: (profile?.total_wins || 0) + 1,
      total_games: (profile?.total_games || 0) + 1,
      ...(isLarge ? { large_field_games: (profile?.large_field_games || 0) + 1 } : {}),
    });
    await incrementQuestStat('wins_today');
    if (isMedPlus) await incrementQuestStat('win_med_today');
    if (isLarge) await incrementQuestStat('large_today');
    setGameOverModal({ won: true, coins: totalCoins });
  }, [addCoins, fieldSize, profile, updateProfile, incrementQuestStat, awardCoins]);

  // ── Right click (flag) ──
  const handleRightClick = useCallback(async (cell) => {
    if (gameState === 'won' || gameState === 'lost' || cell.isRevealed) return;
    SFX.flag();
    const newCells = cells.map(c => c.id === cell.id ? { ...c, isFlagged: !c.isFlagged } : c);
    setCells(newCells);
    setFlagsPlaced(newCells.filter(c => c.isFlagged).length);
    if (!cell.isFlagged) await incrementQuestStat('flags_today');
  }, [gameState, cells, incrementQuestStat]);

  // ── Ability equip (inventory) ──
  const handleEquip = useCallback((id) => {
    setEquippedAbility(id);
    setActiveAbility(null); // cancel targeting if switching
  }, []);

  // ── Ability activate (fire) ──
  const handleAbilityActivate = useCallback(async (id) => {
    if (activeAbility === id) { setActiveAbility(null); return; }

    if (id === 'scan') {
      SFX.scan();
      const safe = getSafeCells(cells);
      if (safe.length === 0) return;
      const pick = safe[Math.floor(Math.random() * safe.length)];
      setCharges(c => c - ABILITIES.scan.charges);
      setHighlightedIdx(pick.id);
      setActiveAbility(null);
      await updateProfile({ scan_uses: (profile?.scan_uses || 0) + 1 });
      await incrementQuestStat('scan_today');
      toast('🔍 Safe cell found!');
      setTimeout(() => setHighlightedIdx(null), 3000);
      return;
    }

    if (id === 'jce') {
      SFX.jce();
      setCharges(c => c - ABILITIES.jce.charges);
      const newCells = judgementCutEnd(cells, cfg.rows, cfg.cols);
      setPendingJceCells(newCells);
      setJceActive(true);
      setActiveAbility(null);
      return;
    }

    // detonate / reveal_zone: enter targeting mode
    setActiveAbility(id);
    toast(`🎯 Select a cell to target with ${ABILITIES[id].name}`);
  }, [cells, activeAbility, cfg, profile, updateProfile, incrementQuestStat]);

  const handleJCEComplete = useCallback(() => {
    setJceActive(false);
    if (pendingJceCells) {
      setCells(pendingJceCells);
      setPendingJceCells(null);
      toast('⚔️ Judgement Cut End! 90% of mines destroyed.');
      if (checkWin(pendingJceCells)) handleWin(pendingJceCells);
    }
  }, [pendingJceCells, handleWin]);

  // ── Shop purchase ──
  const handlePurchase = useCallback(async (type, id, price) => {
    if (type === 'ability') {
      if (!spendCoins(price)) { toast.error('Not enough coins!'); return; }
      const newAbilities = [...(profile?.owned_abilities || []), id];
      await updateProfile({ owned_abilities: newAbilities });
      toast(`✅ ${ABILITIES[id]?.name} unlocked!`);
    } else if (type === 'jce') {
      await updateProfile({ jce_owned: true });
      toast('⚔️ Judgement Cut End unlocked!');
    } else if (type === 'skin') {
      if (price > 0 && !spendCoins(price)) { toast.error('Not enough coins!'); return; }
      await updateProfile({ owned_skins: [...(profile?.owned_skins || []), id], active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    } else if (type === 'skin_equip') {
      await updateProfile({ active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    }
  }, [profile, spendCoins, updateProfile]);

  const handleClaimQuest = useCallback(async (questId, reward) => {
    const ok = await claimQuest(questId, reward);
    if (ok) toast(`🎉 Quest complete! +${reward} coins`);
  }, [claimQuest]);

  const handleRestart = () => { setGameOverModal(null); initBoard(fieldSize); };

  const flagsLeft = cfg.mines - flagsPlaced;

  const skinBgMap = {
    default: '',
    neon: 'bg-[#050510]',
    cyberpunk: 'bg-[#0d050d]',
    city: 'bg-[#111827]',
    sakura: 'bg-[#fce4ec]/10',
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-arcade text-[10px] tracking-widest">LOADING...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${skinBgMap[skin]} transition-colors duration-500`}>
      <JCEOverlay active={jceActive} onComplete={handleJCEComplete} />
      <CoinPopup amount={COIN_SINGLE} trigger={coinTrigger} />

      <DailyRewardModal
        open={dailyRewardAvailable}
        amount={dailyRewardAmount}
        streak={profile?.login_streak}
        onClose={dismissDailyReward}
      />
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} profile={profile} onPurchase={handlePurchase} />

      <AnimatePresence>
        {gameOverModal && (
          <GameOverModal
            won={gameOverModal.won}
            time={time}
            coinsEarned={gameOverModal.coins}
            onRestart={handleRestart}
            onShop={() => { setGameOverModal(null); setShopOpen(true); }}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <div className="hidden lg:flex w-64 shrink-0 p-4">
          <GameSidebar profile={profile} onOpenShop={() => setShopOpen(true)} onClaim={handleClaimQuest} />
        </div>

        {/* Sidebar mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-border p-4 lg:hidden"
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <GameSidebar
                profile={profile}
                onOpenShop={() => { setShopOpen(true); setSidebarOpen(false); }}
                onClaim={handleClaimQuest}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center py-6 px-4 gap-4">
          {/* Top bar */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg bg-card border border-border" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </button>
              <h1 className="font-arcade text-sm sm:text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-none">
                SWEEP<br className="hidden sm:block" /><span className="sm:hidden"> </span>UNLEASHED
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/leaderboard">
                <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                  <Trophy className="w-3.5 h-3.5" /> Board
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleRestart} className="gap-1.5 font-mono text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> New
              </Button>
            </div>
          </div>

          {/* Field size */}
          <FieldSizeSelector selected={fieldSize} onChange={setFieldSize} />

          {/* HUD */}
          <div className="w-full max-w-4xl">
            <GameHUD flagsLeft={flagsLeft} time={time} charges={charges} coins={profile?.coins || 0} sessionCoins={sessionCoins} />
          </div>

          {/* Ability Inventory */}
          <div className="w-full max-w-4xl">
            <AbilityInventory
              charges={charges}
              ownedAbilities={profile?.owned_abilities || ['scan']}
              jceOwned={profile?.jce_owned}
              equippedAbility={equippedAbility}
              activeAbility={activeAbility}
              shieldActive={shieldActive}
              onEquip={handleEquip}
              onActivate={handleAbilityActivate}
            />
          </div>

          {/* Targeting hint */}
          {activeAbility && (
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 flex items-center gap-2 font-mono"
            >
              <span>🎯</span>
              <span>Click a cell to use <strong>{ABILITIES[activeAbility]?.name}</strong></span>
              <button onClick={() => setActiveAbility(null)} className="ml-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Board */}
          <div className="overflow-auto max-w-full pb-4">
            <MineBoard
              cells={cells} rows={cfg.rows} cols={cfg.cols} skin={skin}
              onCellClick={handleCellClick} onCellRightClick={handleRightClick}
              highlightedIdx={highlightedIdx} targetingAbility={activeAbility}
              onTargetClick={handleCellClick} gameOver={gameState === 'won' || gameState === 'lost'}
            />
          </div>

          <p className="text-[10px] text-muted-foreground font-mono tracking-wider">LEFT CLICK REVEAL · RIGHT CLICK FLAG</p>
        </main>
      </div>
    </div>
  );
}