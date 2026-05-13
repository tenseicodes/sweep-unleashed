import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { createBoard, floodReveal, checkWin, getSafeCells, revealArea, detonateArea, judgementCutEnd, getNeighborIndices } from '@/lib/gameLogic';
import { FIELD_SIZES, ABILITIES } from '@/lib/gameConstants';
import { usePlayerProfile } from '@/lib/usePlayerProfile';

import MineBoard from '@/components/game/MineBoard';
import AbilityBar from '@/components/game/AbilityBar';
import GameHUD from '@/components/game/GameHUD';
import GameOverModal from '@/components/game/GameOverModal';
import FieldSizeSelector from '@/components/game/FieldSizeSelector';
import JCEOverlay from '@/components/game/JCEOverlay';
import CoinPopup from '@/components/game/CoinPopup';
import ShopModal from '@/components/shop/ShopModal';
import DailyRewardModal from '@/components/ui/DailyRewardModal';
import GameSidebar from '@/components/layout/GameSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Menu, X } from 'lucide-react';

const COIN_PER_CELL = 5;
const COIN_WIN_BONUS = 100;

export default function Game() {
  const { profile, loading, dailyRewardAvailable, dailyRewardAmount, dismissDailyReward,
    updateProfile, addCoins, spendCoins, incrementQuestStat, claimQuest } = usePlayerProfile();

  // Board state
  const [fieldSize, setFieldSize] = useState('small');
  const [cells, setCells] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle | playing | won | lost
  const [firstClick, setFirstClick] = useState(true);

  // Economy
  const [charges, setCharges] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [coinTrigger, setCoinTrigger] = useState(0);

  // Abilities
  const [activeAbility, setActiveAbility] = useState(null);
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
    const board = createBoard(c.rows, c.cols, c.mines);
    setCells(board);
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
      toast('🛡️ Shield activated!', { description: 'You\'re protected from the next mine.' });
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

    // Start game on first click
    if (gameState === 'idle') {
      setGameState('playing');
    }

    if (cell.isRevealed) return;

    // Handle targeting abilities
    if (activeAbility === 'detonate') {
      const { cells: newCells } = detonateArea(cells, cell.row, cell.col, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - ABILITIES.detonate.charges);
      setActiveAbility(null);
      toast('💥 Detonated!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }
    if (activeAbility === 'reveal_zone') {
      const newCells = revealArea(cells, cell.row, cell.col, 2, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - ABILITIES.reveal_zone.charges);
      setActiveAbility(null);
      toast('🌐 Zone revealed!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }

    // Normal click: mine
    if (cell.isMine) {
      if (shieldActive) {
        // Shield saves the player
        setShieldActive(false);
        setShieldUsed(true);
        toast('🛡️ Shield saved you!', { description: 'Shield depleted.' });
        return;
      }
      // Reveal all mines
      const newCells = cells.map(c => c.isMine ? { ...c, isRevealed: true } : c);
      setCells(newCells);
      setGameState('lost');
      updateProfile({ total_games: (profile?.total_games || 0) + 1 });
      setGameOverModal({ won: false, coins: coinsEarnedRef.current });
      return;
    }

    // Safe cell
    const revealed = floodReveal(cells, cell.id, cfg.rows, cfg.cols);
    const newlyRevealed = revealed.filter((nc, i) => nc.isRevealed && !cells[i].isRevealed);
    const chargesEarned = newlyRevealed.length;
    setCharges(c => c + chargesEarned);
    awardCoins(chargesEarned * COIN_PER_CELL);
    setCells(revealed);

    if (checkWin(revealed)) { handleWin(revealed); return; }
  }, [gameState, cells, activeAbility, cfg, shieldActive, shieldUsed, profile, awardCoins]);

  const handleWin = useCallback(async (finalCells) => {
    setGameState('won');
    awardCoins(COIN_WIN_BONUS);
    const totalCoins = coinsEarnedRef.current + COIN_WIN_BONUS;
    await addCoins(totalCoins);

    // Quest tracking
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
    const newCells = cells.map(c => c.id === cell.id ? { ...c, isFlagged: !c.isFlagged } : c);
    setCells(newCells);
    const newFlagsPlaced = newCells.filter(c => c.isFlagged).length;
    setFlagsPlaced(newFlagsPlaced);
    if (!cell.isFlagged) {
      await incrementQuestStat('flags_today');
    }
  }, [gameState, cells, incrementQuestStat]);

  // ── Ability activation ──
  const handleAbilityActivate = useCallback(async (id) => {
    if (activeAbility === id) { setActiveAbility(null); return; }

    if (id === 'scan') {
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
      setCharges(c => c - ABILITIES.jce.charges);
      const newCells = judgementCutEnd(cells, cfg.rows, cfg.cols);
      setPendingJceCells(newCells);
      setJceActive(true);
      setActiveAbility(null);
      return;
    }

    // detonate / reveal_zone: enter targeting mode
    setActiveAbility(id);
    toast(`Select a cell to target with ${ABILITIES[id].name}`);
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
      await updateProfile({ owned_abilities: [...(profile?.owned_abilities || []), id] });
      toast(`✅ ${ABILITIES[id]?.name} unlocked!`);
    } else if (type === 'jce') {
      await updateProfile({ jce_owned: true });
      toast('⚔️ Judgement Cut End unlocked!');
    } else if (type === 'skin') {
      if (price > 0 && !spendCoins(price)) { toast.error('Not enough coins!'); return; }
      const newSkins = [...(profile?.owned_skins || []), id];
      await updateProfile({ owned_skins: newSkins, active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    } else if (type === 'skin_equip') {
      await updateProfile({ active_skin: id });
      toast(`🎨 ${id} skin equipped!`);
    }
  }, [profile, spendCoins, updateProfile]);

  // ── Quest claim ──
  const handleClaimQuest = useCallback(async (questId, reward) => {
    const ok = await claimQuest(questId, reward);
    if (ok) toast(`🎉 Quest completed! +${reward} coins`);
  }, [claimQuest]);

  // ── Restart ──
  const handleRestart = () => {
    setGameOverModal(null);
    initBoard(fieldSize);
  };

  const flagsLeft = cfg.mines - flagsPlaced;

  const skinBgMap = {
    default: '',
    neon: 'bg-[#050510]',
    cyberpunk: 'bg-[#0d050d]',
    city: 'bg-[#111827]',
    sakura: 'bg-[#fce4ec]/10',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${skinBgMap[skin]} transition-colors duration-500`}>
      {/* JCE cinematic */}
      <JCEOverlay active={jceActive} onComplete={handleJCEComplete} />
      <CoinPopup amount={COIN_PER_CELL} trigger={coinTrigger} />

      {/* Daily reward */}
      <DailyRewardModal
        open={dailyRewardAvailable}
        amount={dailyRewardAmount}
        streak={profile?.login_streak}
        onClose={dismissDailyReward}
      />

      {/* Shop */}
      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        profile={profile}
        onPurchase={handlePurchase}
      />

      {/* Game over */}
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

      {/* Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <div className="hidden lg:flex w-64 shrink-0 p-4">
          <div className="w-full">
            <GameSidebar
              profile={profile}
              onOpenShop={() => setShopOpen(true)}
              onClaim={handleClaimQuest}
            />
          </div>
        </div>

        {/* Sidebar mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
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
        <main className="flex-1 flex flex-col items-center py-6 px-4 gap-5">
          {/* Top bar */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg bg-card border border-border" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </button>
              <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Minesweeper ⚡
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> New Game
            </Button>
          </div>

          {/* Field size */}
          <FieldSizeSelector selected={fieldSize} onChange={(s) => { setFieldSize(s); }} />

          {/* HUD */}
          <div className="w-full max-w-4xl">
            <GameHUD
              flagsLeft={flagsLeft}
              time={time}
              charges={charges}
              coins={profile?.coins || 0}
              sessionCoins={sessionCoins}
            />
          </div>

          {/* Ability bar */}
          <div className="w-full max-w-4xl">
            <AbilityBar
              charges={charges}
              ownedAbilities={profile?.owned_abilities || ['scan']}
              jceOwned={profile?.jce_owned}
              activeAbility={activeAbility}
              shieldActive={shieldActive}
              onActivate={handleAbilityActivate}
            />
          </div>

          {activeAbility && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-primary bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 flex items-center gap-2"
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
              cells={cells}
              rows={cfg.rows}
              cols={cfg.cols}
              skin={skin}
              onCellClick={handleCellClick}
              onCellRightClick={handleRightClick}
              highlightedIdx={highlightedIdx}
              targetingAbility={activeAbility}
              onTargetClick={handleCellClick}
              gameOver={gameState === 'won' || gameState === 'lost'}
            />
          </div>

          {/* Legend */}
          <p className="text-xs text-muted-foreground">Left click to reveal · Right click to flag</p>
        </main>
      </div>
    </div>
  );
}