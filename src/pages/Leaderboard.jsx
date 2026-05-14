import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const tabs = [
  { id: 'wins',   label: 'Top Wins',   icon: '🏆' },
  { id: 'coins',  label: 'Most Coins', icon: '🪙' },
  { id: 'speed',  label: 'Fastest',    icon: '⚡' },
];

const medals = ['🥇', '🥈', '🥉'];

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('wins');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'speed') {
      // Fastest wins from GameHistory — filter wins with time > 0, sort by time asc
      base44.entities.GameHistory.filter({ result: 'win' }, 'time_seconds', 20)
        .then(data => {
          // deduplicate: keep best time per player
          const best = {};
          data.forEach(r => {
            if (!r.time_seconds || r.time_seconds <= 0) return;
            const key = r.created_by;
            if (!best[key] || r.time_seconds < best[key].time_seconds) best[key] = r;
          });
          const sorted = Object.values(best).sort((a, b) => a.time_seconds - b.time_seconds).slice(0, 20);
          setEntries(sorted);
        })
        .finally(() => setLoading(false));
    } else {
      const field = activeTab === 'coins' ? 'coins' : 'total_wins';
      base44.entities.PlayerProfile.list(`-${field}`, 20)
        .then(setEntries)
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4" style={{ background: 'transparent' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-arcade text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
            LEADERBOARD
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-arcade text-[8px] transition-all duration-150
                ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* List */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--skin-hud-bg)', border: '1px solid var(--skin-border)' }} />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 font-mono">No data yet. Be the first!</div>
        ) : (
          entries.map((entry, i) => {
            const isSelf = me && entry.created_by === me.email;
            const rank = i + 1;

            let scoreEl;
            if (activeTab === 'speed') {
              scoreEl = (
                <div className="text-right shrink-0">
                  <p className="font-black text-lg font-mono text-accent">{fmt(entry.time_seconds)}</p>
                  <p className="text-[10px] text-muted-foreground font-mono capitalize">{entry.field_size} field</p>
                </div>
              );
            } else {
              const value = activeTab === 'coins' ? (entry.coins || 0) : (entry.total_wins || 0);
              scoreEl = (
                <div className="text-right shrink-0">
                  <p className={`font-black text-lg font-mono ${activeTab === 'coins' ? 'text-yellow-400' : 'text-primary'}`}>
                    {value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {activeTab === 'coins' ? 'coins' : 'wins'}
                  </p>
                </div>
              );
            }

            return (
              <motion.div
                key={entry.id ?? i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                style={{
                  background: isSelf ? 'var(--skin-accent-soft)' : 'var(--skin-hud-bg)',
                  borderColor: isSelf ? 'var(--skin-accent)' : 'var(--skin-border)',
                }}
              >
                {/* Rank */}
                <div className="w-8 text-center text-lg font-black font-mono shrink-0">
                  {rank <= 3 ? medals[rank - 1] : <span className="text-muted-foreground text-sm">#{rank}</span>}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                  ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    : rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                    : rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-secondary text-muted-foreground border border-border/50'}`}
                >
                  {((entry.display_name || entry.created_by || '?')[0]).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate font-mono ${isSelf ? 'text-primary' : 'text-foreground'}`}>
                    {entry.display_name || entry.created_by?.split('@')[0] || 'Player'}
                    {isSelf && <span className="ml-1.5 font-arcade text-[7px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">YOU</span>}
                  </p>
                  <p className="font-arcade text-[8px] text-muted-foreground">
                    {activeTab === 'speed'
                      ? `${entry.ability_used || '—'} ability`
                      : `${entry.total_games || 0} games played`}
                  </p>
                </div>

                {scoreEl}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}