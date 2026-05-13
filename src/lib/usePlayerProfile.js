import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { DAILY_REWARDS, QUESTS } from './gameConstants';

const TODAY = () => new Date().toISOString().split('T')[0];

export function usePlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const profiles = await base44.entities.PlayerProfile.filter({ created_by: user.email });
    let p = profiles[0];

    const today = TODAY();

    if (!p) {
      p = await base44.entities.PlayerProfile.create({
        coins: 0,
        total_wins: 0,
        total_games: 0,
        owned_abilities: ['scan'],
        owned_skins: ['default'],
        active_skin: 'default',
        jce_owned: false,
        scan_uses: 0,
        large_field_games: 0,
        last_login_date: today,
        login_streak: 1,
        quest_last_reset: today,
        quest_progress: {},
        quest_claimed: [],
      });
    }

    // daily login check
    if (p.last_login_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const streak = p.last_login_date === yesterdayStr ? (p.login_streak || 0) + 1 : 1;
      const rewardIdx = Math.min(streak - 1, DAILY_REWARDS.length - 1);
      const reward = DAILY_REWARDS[rewardIdx];

      p = await base44.entities.PlayerProfile.update(p.id, {
        last_login_date: today,
        login_streak: streak,
        coins: (p.coins || 0) + reward,
        quest_last_reset: today,
        quest_progress: {},
        quest_claimed: [],
      });
      setDailyRewardAvailable(true);
      setDailyRewardAmount(reward);
    } else if (p.quest_last_reset !== today) {
      // reset quests for today
      p = await base44.entities.PlayerProfile.update(p.id, {
        quest_last_reset: today,
        quest_progress: {},
        quest_claimed: [],
      });
    }

    setProfile(p);
    setLoading(false);
    return p;
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateProfile = useCallback(async (updates) => {
    if (!profile) return;
    const updated = await base44.entities.PlayerProfile.update(profile.id, updates);
    setProfile(updated);
    return updated;
  }, [profile]);

  const addCoins = useCallback(async (amount) => {
    if (!profile) return;
    const updated = await base44.entities.PlayerProfile.update(profile.id, {
      coins: (profile.coins || 0) + amount,
    });
    setProfile(updated);
    return updated;
  }, [profile]);

  const spendCoins = useCallback(async (amount) => {
    if (!profile || (profile.coins || 0) < amount) return false;
    const updated = await base44.entities.PlayerProfile.update(profile.id, {
      coins: (profile.coins || 0) - amount,
    });
    setProfile(updated);
    return updated;
  }, [profile]);

  const incrementQuestStat = useCallback(async (stat, amount = 1) => {
    if (!profile) return;
    const progress = { ...(profile.quest_progress || {}) };
    progress[stat] = (progress[stat] || 0) + amount;
    const updated = await base44.entities.PlayerProfile.update(profile.id, { quest_progress: progress });
    setProfile(updated);
    return updated;
  }, [profile]);

  const claimQuest = useCallback(async (questId, reward) => {
    if (!profile) return false;
    const claimed = [...(profile.quest_claimed || [])];
    if (claimed.includes(questId)) return false;
    claimed.push(questId);
    const updated = await base44.entities.PlayerProfile.update(profile.id, {
      quest_claimed: claimed,
      coins: (profile.coins || 0) + reward,
    });
    setProfile(updated);
    return true;
  }, [profile]);

  const dismissDailyReward = useCallback(() => setDailyRewardAvailable(false), []);

  return {
    profile,
    loading,
    dailyRewardAvailable,
    dailyRewardAmount,
    dismissDailyReward,
    updateProfile,
    addCoins,
    spendCoins,
    incrementQuestStat,
    claimQuest,
    reload: load,
  };
}