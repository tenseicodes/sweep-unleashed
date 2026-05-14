import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { base44 } from '@/api/base44Client';
import { createBoard, placeMines, floodReveal, checkWin, getSafeCells, revealArea, detonateArea, judgementCutEnd, janeJuliet } from '@/lib/gameLogic';
import { FIELD_SIZES, ABILITIES, CHARGE_SCALE } from '@/lib/gameConstants';
import { usePlayerProfile } from '@/lib/usePlayerProfile';
import { SFX } from '@/lib/sounds';
import { useSkin } from '@/lib/SkinContext';

import MineBoard from '@/components/game/MineBoard';
import GameHUD from '@/components/game/GameHUD';
import GameOverModal from '@/components/game/GameOverModal';
import JCEOverlay from '@/components/game/JCEOverlay';
import JJOverlay from '@/components/game/JJOverlay';
import CoinPopup from '@/components/game/CoinPopup';
import ShopModal from '@/components/shop/ShopModal';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, X } from 'lucide-react';
import { ScanIcon, ShieldIcon, DetonateIcon, RevealZoneIcon, YamatoIcon, JaneBeamIcon } from '@/components/game/AbilityIcons';

const COIN_SINGLE    = 3;
const COIN_CHUNK     = 10;
const COIN_WIN_BONUS = 1000;
const CHARGE_SINGLE  = 1;
const CHARGE_CHUNK   = 3;
const CHUNK_THRESHOLD = 3;

// Streak multiplier: streak 1→1x, 2→1.5x, 3→2x, 4→2.5x, 5+→3x
function streakMultiplier(streak) {
  if (streak <= 1) return 1;
  return Math.min(1 + (streak - 1) * 0.5, 3);
}

// Field size coin multiplier
const FIELD_COIN_MULT = { small: 1, medium: 1.25, large: 1.5 };

export default function Game() {
  const navigate = useNavigate();
  const { profile, loading, updateProfile, addCoins, spendCoins, incrementQuestStat, claimQuest } = usePlayerProfile();

  // Read loadout from URL
  const params = new URLSearchParams(window.location.search);
  const fieldSize    = params.get('size')    || 'small';
  const lockedAbility = params.get('ability') || 'scan';

  const cfg  = FIELD_SIZES[fieldSize] || FIELD_SIZES.small;
  const skin = useSkin();
  const ab = ABILITIES[lockedAbility];
  const scaledCharges = ab ? Math.round(ab.charges * (CHARGE_SCALE[fieldSize] || 1)) : 0;

  // Board
  const [cells, setCells]       = useState([]);
  const [gameState, setGameState] = useState('idle');

  // Economy
  const [charges, setCharges]       = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [coinTrigger, setCoinTrigger]   = useState(0);

  // Ability state
  const [activeAbility, setActiveAbility] = useState(null); // targeting mode
  const [shieldActive, setShieldActive]   = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(null);
  const [jceActive, setJceActive]         = useState(false);
  const [pendingJceCells, setPendingJceCells] = useState(null);
  const [jjActive, setJjActive]           = useState(false);
  const [pendingJjCells, setPendingJjCells]   = useState(null);

  // UI
  const [shopOpen, setShopOpen]       = useState(false);
  const [gameOverModal, setGameOverModal] = useState(null);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [time, setTime]               = useState(0);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

  const timerRef        = useRef(null);
  const coinTriggerRef  = useRef(0);
  const coinsEarnedRef  = useRef(0);

  // ── Init board ──
  const initBoard = useCallback(() => {
    setCells(createBoard(cfg.rows, cfg.cols));
    setGameState('idle');
    setCharges(0);
    setSessionCoins(0);
    setActiveAbility(null);
    setShieldActive(false);
    setHighlightedIdx(null);
    setFlagsPlaced(0);
    setTime(0);
    coinsEarnedRef.current = 0;
    clearInterval(timerRef.current);
  }, [cfg]);

  useEffect(() => {
    initBoard();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // ── Shield auto-charge (reusable — recharges every time) ──
  useEffect(() => {
    if (lockedAbility === 'shield' && !shieldActive
      && charges >= scaledCharges) {
      setCharges(c => c - scaledCharges);
      setShieldActive(true);
      SFX.shield?.();
      toast('🛡️ Shield activated!');
    }
  }, [charges, shieldActive, lockedAbility]);

  // ── Award coins ──
  const fieldMult = FIELD_COIN_MULT[fieldSize] || 1;
  const awardCoins = useCallback((amount) => {
    const scaled = Math.round(amount * fieldMult);
    setSessionCoins(sc => sc + scaled);
    coinsEarnedRef.current += scaled;
    coinTriggerRef.current += 1;
    setCoinTrigger(coinTriggerRef.current);
  }, [fieldMult]);

  // ── Win handler ──
  const handleWin = useCallback(async (finalCells) => {
    SFX.win?.();
    setGameState('won');
    const newStreak = (profile?.win_streak || 0) + 1;
    const mult = streakMultiplier(newStreak);
    const bonus = Math.round(COIN_WIN_BONUS * mult);
    awardCoins(bonus);
    const totalCoins = coinsEarnedRef.current + bonus;
    await addCoins(totalCoins);
    const isLarge   = fieldSize === 'large';
    const isMedPlus = fieldSize === 'medium' || fieldSize === 'large';
    await updateProfile({
      total_wins:  (profile?.total_wins  || 0) + 1,
      total_games: (profile?.total_games || 0) + 1,
      win_streak: newStreak,
      ...(isLarge ? { large_field_games: (profile?.large_field_games || 0) + 1 } : {}),
    });
    await base44.entities.GameHistory.create({
      result: 'win', field_size: fieldSize, ability_used: lockedAbility,
      coins_earned: totalCoins, time_seconds: time, win_streak: newStreak, multiplier: mult,
    });
    await incrementQuestStat('wins_today');
    if (isMedPlus) await incrementQuestStat('win_med_today');
    if (isLarge)   await incrementQuestStat('large_today');
    setGameOverModal({ won: true, coins: totalCoins, streak: newStreak, multiplier: mult });
  }, [addCoins, fieldSize, profile, updateProfile, incrementQuestStat, awardCoins, lockedAbility, time]);

  // ── Cell click ──
  const handleCellClick = useCallback(async (cell) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (cell.isFlagged) return;
    let currentCells = cells;
    if (gameState === 'idle') {
      // Place mines on first click, guaranteeing a safe zone around the clicked cell
      currentCells = placeMines(cells, cfg.rows, cfg.cols, cfg.mines, cell.id);
      setCells(currentCells);
      setGameState('playing');
    }
    if (cell.isRevealed) return;

    // Targeting abilities
    if (activeAbility === 'detonate') {
      SFX.detonate?.();
      const { cells: newCells } = detonateArea(currentCells, cell.row, cell.col, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - scaledCharges);
      setActiveAbility(null);
      toast('💥 Detonated!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }
    if (activeAbility === 'reveal_zone') {
      SFX.revealZone?.();
      const newCells = revealArea(currentCells, cell.row, cell.col, 2, cfg.rows, cfg.cols);
      setCells(newCells);
      setCharges(c => c - scaledCharges);
      setActiveAbility(null);
      toast('🌐 Zone revealed!');
      if (checkWin(newCells)) handleWin(newCells);
      return;
    }

    // Check the cell from currentCells (may differ from cells on first click)
    const currentCell = currentCells[cell.id];

    // Mine hit
    if (currentCell.isMine) {
      if (shieldActive) {
        SFX.shieldBlock?.();
        setShieldActive(false);
        toast('🛡️ Shield saved you!');
        return;
      }
      SFX.lose?.();
      const newCells = currentCells.map(c => c.isMine ? { ...c, isRevealed: true } : c);
      setCells(newCells);
      setGameState('lost');
      const lossCoins = coinsEarnedRef.current;
      if (lossCoins > 0) await addCoins(lossCoins);
      await updateProfile({ total_games: (profile?.total_games || 0) + 1, win_streak: 0 });
      await base44.entities.GameHistory.create({
        result: 'loss', field_size: fieldSize, ability_used: lockedAbility,
        coins_earned: lossCoins, time_seconds: time, win_streak: 0, multiplier: 1,
      });
      // Delay loss modal so players can see where mines were
      setTimeout(() => {
        setGameOverModal({ won: false, coins: lossCoins, streak: 0, multiplier: 1 });
      }, 1500);
      return;
    }

    // Safe flood reveal
    const revealed = floodReveal(currentCells, cell.id, cfg.rows, cfg.cols);
    const newlyRevealed = revealed.filter((nc, i) => nc.isRevealed && !cells[i].isRevealed);
    const count   = newlyRevealed.length;
    const isFirstClick = gameState === 'idle';
    const isChunk = !isFirstClick && count >= CHUNK_THRESHOLD;

    if (isChunk) SFX.revealChunk?.(); else SFX.reveal?.();
    setCharges(c => c + (isFirstClick ? 1 : isChunk ? CHARGE_CHUNK : CHARGE_SINGLE));
    awardCoins(isChunk ? count * COIN_CHUNK : count * COIN_SINGLE);
    setCells(revealed);
    if (checkWin(revealed)) handleWin(revealed);
  }, [gameState, cells, activeAbility, cfg, shieldActive, profile, awardCoins, handleWin, updateProfile]);

  // ── Right click (flag) ──
  const handleRightClick = useCallback(async (cell) => {
    if (gameState === 'won' || gameState === 'lost' || cell.isRevealed) return;
    SFX.flag?.();
    const newCells = cells.map(c => c.id === cell.id ? { ...c, isFlagged: !c.isFlagged } : c);
    setCells(newCells);
    setFlagsPlaced(newCells.filter(c => c.isFlagged).length);
    if (!cell.isFlagged) await incrementQuestStat('flags_today');
  }, [gameState, cells, incrementQuestStat]);

  // ── Ability use (the locked one) ──
  const handleUseAbility = useCallback(async () => {
    const id = lockedAbility;
    const abi = ABILITIES[id];
    if (!abi || charges < scaledCharges) return;
    if (activeAbility === id) { setActiveAbility(null); return; }

    if (id === 'scan') {
      SFX.scan?.();
      const safe = getSafeCells(cells);
      if (safe.length === 0) return;
      const pick = safe[Math.floor(Math.random() * safe.length)];
      setCharges(c => c - scaledCharges);
      setHighlightedIdx(pick.id);
      await updateProfile({ scan_uses: (profile?.scan_uses || 0) + 1 });
      await incrementQuestStat('scan_today');
      toast('🔍 Safe cell found!');
      setTimeout(() => setHighlightedIdx(null), 3000);
      return;
    }

    if (id === 'jce') {
      SFX.jce?.();
      setCharges(c => c - scaledCharges);
      const newCells = judgementCutEnd(cells, cfg.rows, cfg.cols);
      setPendingJceCells(newCells);
      setJceActive(true);
      return;
    }

    if (id === 'jj') {
      SFX.jj?.();
      setCharges(c => c - scaledCharges);
      const newCells = janeJuliet(cells, cfg.rows, cfg.cols);
      setPendingJjCells(newCells);
      setJjActive(true);
      return;
    }

    // detonate / reveal_zone: targeting mode
    setActiveAbility(id);
    toast(`🎯 Click a cell to use ${abi.name}`);
  }, [lockedAbility, charges, scaledCharges, cells, cfg, activeAbility, profile, updateProfile, incrementQuestStat]);

  const handleJCEComplete = useCallback(() => {
    setJceActive(false);
    if (pendingJceCells) {
      setCells(pendingJceCells);
      setPendingJceCells(null);
      toast('⚔️ Judgement Cut End! Mines obliterated.');
      if (checkWin(pendingJceCells)) handleWin(pendingJceCells);
    }
  }, [pendingJceCells, handleWin]);

  const handleJJComplete = useCallback(() => {
    setJjActive(false);
    if (pendingJjCells) {
      setCells(pendingJjCells);
      setPendingJjCells(null);
      toast('✨ Jane Juliet! Half the mines cleared.');
      if (checkWin(pendingJjCells)) handleWin(pendingJjCells);
    }
  }, [pendingJjCells, handleWin]);

  // ── Shop purchase ──
  const handlePurchase = useCallback(async (type, id, price) => {
    if (type === 'ability') {
      if (!spendCoins(price)) { toast.error('Not enough coins!'); return; }
      const newAbilities = [...(profile?.owned_abilities || []), id];
      await updateProfile({ owned_abilities: newAbilities });
      toast(`✅ ${ABILITIES[id]?.name} unlocked!`);
    } else if (type === 'jce') {
      await updateProfile({ jce_owned: true });
    } else if (type === 'jj') {
      await updateProfile({ jj_owned: true });
    } else if (type === 'skin') {
      if (price > 0 && !spendCoins(price)) { toast.error('Not enough coins!'); return; }
      await updateProfile({ owned_skins: [...(profile?.owned_skins || []), id], active_skin: id });
    } else if (type === 'skin_equip') {
      await updateProfile({ active_skin: id });
    }
  }, [profile, spendCoins, updateProfile]);

  const handleRestart = () => { setGameOverModal(null); initBoard(); };
  const handleMainMenu = () => navigate('/');

  const ABILITY_ICON_MAP = { scan: ScanIcon, shield: ShieldIcon, detonate: DetonateIcon, reveal_zone: RevealZoneIcon, jce: YamatoIcon, jj: JaneBeamIcon };
  const AbilityIcon = ab ? (ABILITY_ICON_MAP[ab.id] || null) : null;

  const flagsLeft = cfg.mines - flagsPlaced;
  const canUseAbility = ab && charges >= scaledCharges;
  const isTargeting   = activeAbility === lockedAbility;
  const isShieldOn    = lockedAbility === 'shield' && shieldActive;

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <p className="font-arcade text-[10px] text-primary animate-pulse tracking-widest">LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <JCEOverlay active={jceActive} onComplete={handleJCEComplete} />
      <JJOverlay active={jjActive} onComplete={handleJJComplete} />
      <CoinPopup amount={COIN_SINGLE} trigger={coinTrigger} />
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} profile={profile} onPurchase={handlePurchase} />

      <AnimatePresence>
        {gameOverModal && (
          <GameOverModal
            won={gameOverModal.won}
            time={time}
            coinsEarned={gameOverModal.coins}
            streak={gameOverModal.streak}
            multiplier={gameOverModal.multiplier}
            onRestart={handleRestart}
            onShop={() => { setGameOverModal(null); setShopOpen(true); }}
            onMainMenu={handleMainMenu}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center min-h-screen py-2 px-2 gap-2">

        {/* ── Top bar ── */}
        <div className="w-full max-w-4xl flex items-center justify-between">
          <button
            onClick={handleMainMenu}
            onTouchEnd={(e) => { e.preventDefault(); handleMainMenu(); }}
            className="flex items-center gap-1.5 font-arcade text-[8px] text-muted-foreground active:text-foreground min-w-[44px] min-h-[44px] px-2"
          >
            <Home className="w-3.5 h-3.5" /> MENU
          </button>

          <h1 className="font-arcade text-[9px] sm:text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SWEEP UNLEASHED
          </h1>

          <button
            onClick={handleRestart}
            onTouchEnd={(e) => { e.preventDefault(); handleRestart(); }}
            className="flex items-center gap-1.5 font-arcade text-[8px] text-muted-foreground active:text-foreground min-w-[44px] min-h-[44px] px-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> NEW
          </button>
        </div>

        {/* ── HUD ── */}
        <div className="w-full max-w-4xl">
          <GameHUD
            flagsLeft={flagsLeft} time={time} charges={charges}
            coins={profile?.coins || 0} sessionCoins={sessionCoins}
          />
        </div>

        {/* ── Ability HUD (single locked ability) ── */}
        {ab && (
          <div className="w-full max-w-4xl">
            <motion.div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isShieldOn ? 'animate-shield-pulse' : ''}`}
              style={{ background: 'var(--skin-accent-soft)', borderColor: 'var(--skin-border)' }}
              layout
            >
              {AbilityIcon && <AbilityIcon className={`w-5 h-5 shrink-0 ${ab.color}`} />}
              <div className="flex-1 min-w-0">
                <p className={`font-arcade text-[8px] ${ab.color} tracking-wider truncate`}>{ab.name.toUpperCase()}</p>
                <p className="text-[9px] text-muted-foreground line-clamp-1">{ab.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-arcade text-[8px] text-muted-foreground">{charges}/{scaledCharges} ⚡</span>
                {lockedAbility !== 'shield' && (
                  <motion.button
                    whileHover={canUseAbility ? { scale: 1.06 } : {}}
                    whileTap={canUseAbility ? { scale: 0.94 } : {}}
                    onClick={handleUseAbility}
                    onTouchEnd={(e) => { e.preventDefault(); handleUseAbility(); }}
                    disabled={!canUseAbility}
                    className={`
                      px-3 py-2 rounded-lg font-arcade text-[8px] border transition-all tracking-wider min-h-[44px]
                      ${isTargeting
                        ? 'bg-primary text-primary-foreground border-primary animate-pulse-glow'
                        : canUseAbility
                          ? `${ab.bgColor} ${ab.borderColor} ${ab.color} hover:brightness-125`
                          : 'opacity-30 cursor-not-allowed bg-card border-border text-muted-foreground'}
                    `}
                  >
                    {isTargeting ? '🎯 PICK CELL' : canUseAbility ? 'USE' : 'CHARGING...'}
                  </motion.button>
                )}
                {lockedAbility === 'shield' && (
                  <span className={`font-arcade text-[8px] ${shieldActive ? 'text-cyan-400' : 'text-muted-foreground'}`}>
                    {shieldActive ? '✓ ACTIVE' : 'CHARGING...'}
                  </span>
                )}
              </div>
              {isShieldOn && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
              )}
            </motion.div>

            {/* Targeting hint */}
            <AnimatePresence>
              {activeAbility && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 font-arcade text-[9px] text-primary"
                >
                  <span>🎯</span>
                  <span>CLICK A CELL TO TARGET</span>
                  <button
                    onClick={() => setActiveAbility(null)}
                    onTouchEnd={(e) => { e.preventDefault(); setActiveAbility(null); }}
                    className="ml-auto text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Board ── */}
        <div className="w-full max-w-4xl pb-2">
          <MineBoard
            cells={cells} rows={cfg.rows} cols={cfg.cols}
            onCellClick={handleCellClick} onCellRightClick={handleRightClick}
            highlightedIdx={highlightedIdx} targetingAbility={activeAbility}
            onTargetClick={handleCellClick} gameOver={gameState === 'won' || gameState === 'lost'}
          />
        </div>

        <p className="font-arcade text-[8px] text-muted-foreground tracking-widest pb-4">
          {isMobile ? 'TAP TO REVEAL · HOLD TO PLACE FLAG' : 'LEFT CLICK REVEAL · RIGHT CLICK FLAG'}
        </p>
      </div>
    </div>
  );
}