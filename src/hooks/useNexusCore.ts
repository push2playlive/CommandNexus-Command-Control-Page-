import { useState, useEffect } from 'react';
import { nexus } from '../shared/nexus-client';

/**
 * useNexusCore Hook
 * This is the "Joint" that pulls the live data down at startup.
 * Replaces static .env file with live server-side DNA.
 */
export function useNexusCore() {
  const [core, setCore] = useState({ 
    name: '', 
    env: 'production', 
    gId: '', 
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    async function injectDNA() {
      try {
        const { data, error } = await nexus
          .from('nexus_identities')
          .select('shell_name, nexus_env, google_id')
          .eq('domain_url', window.location.hostname)
          .single();

        if (error) {
          // Fallback to local env if DB entry doesn't exist yet
          console.warn("Nexus DNA not found in vault, falling back to local environment.");
          setCore(prev => ({
            ...prev,
            name: import.meta.env.VITE_NEXUS_SHELL_NAME || 'CommandNexus Shell',
            env: import.meta.env.VITE_NEXUS_ENVIRONMENT || 'development',
            gId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            loading: false
          }));
          return;
        }

        if (data) {
          setCore({
            name: data.shell_name,
            env: data.nexus_env,
            gId: data.google_id,
            loading: false,
            error: null
          });
          
          // Articulate in memory for global access
          (window as any).NEXUS_CONFIG = data;
        }
      } catch (err: any) {
        console.error("Nexus DNA Injection Failed:", err.message);
        setCore(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
    
    injectDNA();
  }, []);

  return core;
}
