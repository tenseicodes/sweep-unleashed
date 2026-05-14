import { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const SkinContext = createContext('default');

export function SkinProvider({ children }) {
  const [skin, setSkin] = useState('default');

  useEffect(() => {
    // Initial load
    base44.entities.PlayerProfile.list('-created_date', 1)
      .then(profiles => {
        if (profiles?.[0]?.active_skin) setSkin(profiles[0].active_skin);
      })
      .catch(() => {});

    // Instant update from updateProfile dispatch
    const handleInstant = (e) => setSkin(e.detail);
    window.addEventListener('skin-change', handleInstant);

    return () => window.removeEventListener('skin-change', handleInstant);
  }, []);

  return (
    <SkinContext.Provider value={skin}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  return useContext(SkinContext);
}