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

    // Subscribe to live updates
    const unsubscribe = base44.entities.PlayerProfile.subscribe((event) => {
      if (event.data?.active_skin) setSkin(event.data.active_skin);
    });

    return () => unsubscribe();
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