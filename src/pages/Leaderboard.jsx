import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trophy, Coins, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const tabs = [
  { id: 'wins', label: 'Top Wins', icon: '🏆', field: 'total_wins' },
  { id: 'coins', label: 'Most Coins', icon: '🪙', field: 'coins' },
];

const medals = ['🥇', '🥈', '🥉'];

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
    const field = tabs.find(t => t.id === activeTab)?.field || 'total_wins';
    base44.entities.PlayerProfile.list(`-${field}`, 20)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const field = tabs.find(t => t.id === activeTab)?.field;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="p-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-arcade text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
            LEADERBOARD
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-card border border-border/50 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-arcade text-[8px] transition-all duration-150
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
            <div key={i} className="h-14 bg-card border border-border/30 rounded-xl animate-pulse" />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 font-mono">No players yet. Be the first!</div>
        ) : (
          entries.map((entry, i) => {
            const isSelf = me && entry.created_by === me.email;
            const value = entry[field] || 0;
            const rank = i + 1;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${isSelf
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                    : rank <= 3
                      ? 'bg-card border-border/60'
                      : 'bg-card/60 border-border/30'}`}
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
                  {(entry.created_by?.[0] || '?').toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate font-mono ${isSelf ? 'text-primary' : 'text-foreground'}`}>
                    {entry.created_by?.split('@')[0] || 'Player'}
                    {isSelf && <span className="ml-1.5 font-arcade text-[7px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">YOU</span>}
                  </p>
                  <p className="font-arcade text-[8px] text-muted-foreground">
                    {entry.total_games || 0} games played
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-lg font-mono ${activeTab === 'coins' ? 'text-yellow-400' : 'text-primary'}`}>
                    {value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {activeTab === 'coins' ? 'coins' : 'wins'}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}