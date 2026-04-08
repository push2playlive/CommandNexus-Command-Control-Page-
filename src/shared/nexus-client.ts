import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// The Central Brain Connection
export const nexus = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Global Login - "Join one, join all"
 * This triggers the Google OAuth flow.
 * Note: In AI Studio, we use popup mode to avoid iframe redirect issues.
 */
export const loginToNetwork = async () => {
  const { data, error } = await nexus.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      skipBrowserRedirect: true // Critical for AI Studio popup flow
    }
  });

  if (error) {
    console.error("Bridge Connection Failed:", error.message);
    return null;
  }

  if (data?.url) {
    const authWindow = window.open(
      data.url,
      'nexus_auth_popup',
      'width=600,height=700'
    );
    if (!authWindow) {
      alert('Please allow popups for this site to connect your Nexus account.');
    }
  }

  return data;
};

/**
 * Email Login - "Direct Uplink"
 */
export const loginWithEmail = async (email: string, password: string) => {
  const { data, error } = await nexus.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Email Login Failed:", error.message);
    throw error;
  }

  return data;
};

/**
 * Email Signup - "Forge New Identity"
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await nexus.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup Failed:", error.message);
    throw error;
  }

  return data;
};

/**
 * Handshake with the Nexus Brain
 */
export const syncWithNexus = async (domain: string) => {
  try {
    const { data, error } = await nexus.functions.invoke('nexus-swap', {
      body: { domain }
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Nexus Sync Warning (Function might not be deployed):", err);
    return { status: 'offline', nexusId: 'NX-LOCAL', rank: 'ARCHITECT' };
  }
};
