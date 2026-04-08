import { useEffect, useState } from 'react';
import { nexus, syncWithNexus } from '../shared/nexus-client';

export function useNexusHeartbeat() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [nexusData, setNexusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for bypass session
    const bypassUser = localStorage.getItem('nexus_bypass_user');
    if (bypassUser) {
      const parsed = JSON.parse(bypassUser);
      setUser(parsed);
      setNexusData({ status: 'online', nexusId: 'NX-BYPASS', rank: 'ARCHITECT' });
      setIsLoading(false);
      return;
    }

    // Initial session check
    nexus.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        syncWithNexus(window.location.hostname).then(setNexusData);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = nexus.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session) {
        console.log("Heartbeat: SIGNED_IN. Syncing with Nexus...");
        const data = await syncWithNexus(window.location.hostname);
        setNexusData(data);
      } else if (event === 'SIGNED_OUT') {
        setNexusData(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    user, 
    session, 
    nexusData, 
    isAuthenticated: !!user,
    isLoading
  };
}
